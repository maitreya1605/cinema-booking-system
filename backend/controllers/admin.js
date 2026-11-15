const mongoose = require('mongoose');
const Booking = require('../models/booking');
const Show = require('../models/show');
const Movie = require('../models/movie');
const Screen = require('../models/screen');
const AuditLog = require('../models/auditLog');

// @route   GET /api/admin/overview
// @desc    Get dashboard KPIs, occupancy report, and recent transactions
// @access  Private (Admin)
exports.getAdminOverview = async (req, res) => {
    try {
        const bookings = await Booking.find({}).populate('user', 'name email').populate({
            path: 'show',
            populate: [{ path: 'movie', select: 'title posterUrl' }, { path: 'screen', select: 'name' }]
        }).sort({ createdAt: -1 });

        const shows = await Show.find({}).populate('movie', 'title posterUrl duration').populate('screen', 'name capacity').sort({ showTime: 1 });

        // Calculate KPIs
        const confirmedBookings = bookings.filter(b => b.bookingStatus === 'Confirmed');
        const cancelledBookings = bookings.filter(b => b.bookingStatus === 'Cancelled');
        const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
        const totalTicketsSold = confirmedBookings.reduce((sum, b) => sum + (b.seats ? b.seats.length : 0), 0);
        const checkedInTickets = confirmedBookings.filter(b => b.isCheckedIn).length;

        // Calculate Show-by-Show Occupancy & Sales Report matching bookings and cancellations
        const occupancyReport = shows.map(show => {
            const showBookings = bookings.filter(b => {
                const bShowId = b.show?._id ? b.show._id.toString() : (b.show ? b.show.toString() : null);
                return bShowId === show._id.toString();
            });

            const showConfirmed = showBookings.filter(b => b.bookingStatus === 'Confirmed');
            const showCancelled = showBookings.filter(b => b.bookingStatus === 'Cancelled');

            const bookedSeatsCount = showConfirmed.reduce((sum, b) => sum + (b.seats ? b.seats.length : 0), 0);
            const capacity = show.screen?.capacity || 48;
            const occupancyPercent = capacity > 0 ? Math.min(100, Math.round((bookedSeatsCount / capacity) * 100)) : 0;
            const grossSales = showConfirmed.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

            return {
                showId: show._id,
                movieTitle: show.movie?.title || 'Untitled Movie',
                moviePoster: show.movie?.posterUrl || '',
                screenName: show.screen?.name || 'Standard Screen',
                showTime: show.showTime,
                ticketPrice: show.price || 0,
                capacity,
                bookedSeatsCount,
                cancellationsCount: showCancelled.length,
                occupancyPercent,
                grossSales
            };
        });

        const totalCapacityAllShows = occupancyReport.reduce((sum, r) => sum + r.capacity, 0);
        const totalBookedSeatsAllShows = occupancyReport.reduce((sum, r) => sum + r.bookedSeatsCount, 0);
        const averageOccupancy = totalCapacityAllShows > 0 ? Math.round((totalBookedSeatsAllShows / totalCapacityAllShows) * 100) : 0;

        res.status(200).json({
            kpis: {
                totalRevenue,
                totalBookings: bookings.length,
                confirmedBookingsCount: confirmedBookings.length,
                cancelledBookingsCount: cancelledBookings.length,
                totalTicketsSold,
                checkedInTickets,
                totalShows: shows.length,
                averageOccupancy
            },
            occupancyReport,
            recentBookings: bookings.slice(0, 15)
        });
    } catch (error) {
        console.error("Admin overview error:", error);
        res.status(500).json({ error: error.message });
    }
};

// @route   GET /api/admin/shows
// @desc    Get all shows with occupancy details
// @access  Private (Admin)
exports.getAdminShows = async (req, res) => {
    try {
        const shows = await Show.find({}).populate('movie').populate('screen').sort({ showTime: 1 });
        const bookings = await Booking.find({});

        const detailedShows = shows.map(show => {
            const showBookings = bookings.filter(b => {
                const bShowId = b.show ? (b.show._id ? b.show._id.toString() : b.show.toString()) : null;
                return bShowId === show._id.toString() && b.bookingStatus === 'Confirmed';
            });
            const bookedCount = showBookings.reduce((sum, b) => sum + (b.seats ? b.seats.length : 0), 0);
            const capacity = show.screen?.capacity || 48;

            return {
                ...show.toObject(),
                bookedSeatsCount: bookedCount,
                occupancyPercent: capacity > 0 ? Math.min(100, Math.round((bookedCount / capacity) * 100)) : 0
            };
        });

        res.status(200).json({ count: detailedShows.length, shows: detailedShows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @route   POST /api/admin/shows
// @desc    Schedule a new show
// @access  Private (Admin)
exports.createAdminShow = async (req, res) => {
    try {
        const { movie, screen, showTime, price } = req.body;

        if (!movie || !screen || !showTime || price === undefined) {
            return res.status(400).json({ error: "Movie, screen, showTime, and price are required." });
        }

        const movieDoc = await Movie.findById(movie);
        if (!movieDoc) return res.status(404).json({ error: "Selected movie not found." });

        const screenDoc = await Screen.findById(screen);
        if (!screenDoc) return res.status(404).json({ error: "Selected screen not found." });

        // Conflict check
        const conflict = await Show.findOne({ screen, showTime: new Date(showTime) });
        if (conflict) {
            return res.status(409).json({ error: "A show is already scheduled on this screen at this exact time." });
        }

        const newShow = new Show({
            movie,
            screen,
            showTime: new Date(showTime),
            price: Number(price),
            bookedSeats: []
        });

        await newShow.save();

        // Audit Trail
        await AuditLog.create({
            user: req.user._id,
            userEmail: req.user.email || 'admin@cinema.com',
            action: 'SHOW_CREATED',
            details: `Scheduled ${movieDoc.title} on ${screenDoc.name} for ${new Date(showTime).toLocaleString()}`,
            entityType: 'Show',
            entityId: newShow._id.toString(),
            metadata: { movie: movieDoc.title, screen: screenDoc.name, price }
        });

        const populatedShow = await Show.findById(newShow._id).populate('movie').populate('screen');
        res.status(201).json({ message: "Show scheduled successfully", show: populatedShow });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// @route   DELETE /api/admin/shows/:id
// @desc    Cancel/Delete a show
// @access  Private (Admin)
exports.deleteAdminShow = async (req, res) => {
    try {
        const show = await Show.findById(req.params.id).populate('movie screen');
        if (!show) {
            return res.status(404).json({ error: "Show not found" });
        }

        // Check if there are confirmed bookings
        const activeBookings = await Booking.countDocuments({ show: show._id, bookingStatus: 'Confirmed' });
        if (activeBookings > 0) {
            return res.status(400).json({
                error: `Cannot delete show: There are ${activeBookings} confirmed customer bookings for this show.`
            });
        }

        await Show.findByIdAndDelete(req.params.id);

        // Audit Trail
        await AuditLog.create({
            user: req.user._id,
            userEmail: req.user.email || 'admin@cinema.com',
            action: 'SHOW_DELETED',
            details: `Deleted show for ${show.movie?.title || 'Movie'} at ${new Date(show.showTime).toLocaleString()}`,
            entityType: 'Show',
            entityId: req.params.id
        });

        res.status(200).json({ message: "Show deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @route   POST /api/admin/validate-ticket
// @desc    Validate a ticket reference / QR code once in simulated entry flow
// @access  Private (Admin/Staff)
exports.validateTicket = async (req, res) => {
    try {
        const { ticketCode } = req.body;
        if (!ticketCode || !ticketCode.trim()) {
            return res.status(400).json({ error: "Please enter or scan a ticket booking reference." });
        }

        const cleanCode = ticketCode.trim();

        // 1. Locate booking by full ID, or 8-character uppercase reference
        let booking = null;
        if (mongoose.Types.ObjectId.isValid(cleanCode)) {
            booking = await Booking.findById(cleanCode);
        }

        if (!booking) {
            const allBookings = await Booking.find({});
            booking = allBookings.find(b => {
                const full = b._id.toString().toLowerCase();
                const target = cleanCode.toLowerCase();
                return full === target || full.endsWith(target);
            });
        }

        if (!booking) {
            return res.status(404).json({ error: `Ticket '${cleanCode}' not found. Please verify the code.` });
        }

        // Populate details
        await booking.populate('user', 'name email');
        await booking.populate({
            path: 'show',
            populate: [{ path: 'movie' }, { path: 'screen' }]
        });

        // 2. Acceptance Test Check: Is booking cancelled?
        if (booking.bookingStatus === 'Cancelled') {
            return res.status(400).json({
                error: `ACCESS DENIED: Booking ${cleanCode} has been CANCELLED and refunded. Entry not permitted.`,
                booking
            });
        }

        // 3. Acceptance Test Check: Is booking confirmed?
        if (booking.bookingStatus !== 'Confirmed') {
            return res.status(400).json({
                error: `ACCESS DENIED: Booking ${cleanCode} is currently in '${booking.bookingStatus}' status (payment pending).`,
                booking
            });
        }

        // 4. Acceptance Test Check: Single-use check (duplicate entry rejection)
        if (booking.isCheckedIn) {
            const checkInTime = booking.checkedInAt ? new Date(booking.checkedInAt).toLocaleTimeString('en-US') : 'Earlier';
            return res.status(409).json({
                error: `DUPLICATE ENTRY DETECTED! Ticket was ALREADY ADMITTED at ${checkInTime}. Single-entry pass cannot be reused.`,
                booking
            });
        }

        // 5. Valid Entry Flow: mark as checked in
        booking.isCheckedIn = true;
        booking.checkedInAt = new Date();
        await booking.save();

        // Audit Trail
        await AuditLog.create({
            user: req.user._id,
            userEmail: req.user.email || 'admin@cinema.com',
            action: 'TICKET_VALIDATED',
            details: `Admitted customer ${booking.user?.name || 'Guest'} (${booking.user?.email || 'N/A'}) for ${booking.show?.movie?.title || booking.movieTitle} (Seats: ${booking.seats.join(', ')})`,
            entityType: 'Booking',
            entityId: booking._id.toString(),
            metadata: {
                ticketCode: cleanCode,
                seats: booking.seats,
                movie: booking.show?.movie?.title || booking.movieTitle
            }
        });

        res.status(200).json({
            success: true,
            message: "Ticket verified successfully! Customer admitted.",
            ticket: {
                bookingId: booking._id,
                referenceCode: booking._id.toString().slice(-8).toUpperCase(),
                movieTitle: booking.show?.movie?.title || booking.movieTitle || 'Movie Ticket',
                screenName: booking.show?.screen?.name || booking.screenName || 'Hall',
                showTime: booking.show?.showTime || booking.showTime,
                seats: booking.seats,
                customerName: booking.user?.name || 'Guest',
                customerEmail: booking.user?.email || 'N/A',
                checkedInAt: booking.checkedInAt
            }
        });

    } catch (error) {
        console.error("Ticket validation error:", error);
        res.status(500).json({ error: error.message });
    }
};

// @route   GET /api/admin/audit-logs
// @desc    Get chronological audit trail of business actions
// @access  Private (Admin)
exports.getAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(50);
        res.status(200).json({ count: logs.length, logs });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @route   GET /api/admin/metadata
// @desc    Get movies and screens for scheduling forms
// @access  Private (Admin)
exports.getAdminMetadata = async (req, res) => {
    try {
        const movies = await Movie.find({}, 'title posterUrl duration language');
        const screens = await Screen.find({}, 'name capacity');
        res.status(200).json({ movies, screens });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

