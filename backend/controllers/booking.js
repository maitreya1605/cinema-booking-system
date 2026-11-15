/*  */const mongoose = require('mongoose');
const Show = require('../models/show');
const Booking = require('../models/booking');

// @route   POST /api/bookings
// @desc    Reserve seats for a show (locks them for payment)
// @access  Private
exports.reserveSeats = async (req, res) => {
    const { showId, requestedSeats, totalPrice } = req.body || {};
    const userId = req.user._id || req.user.id;

    if (!showId) {
        return res.status(400).json({ error: "showId is required" });
    }

    if (!requestedSeats || !Array.isArray(requestedSeats) || requestedSeats.length === 0) {
        return res.status(400).json({ error: "requestedSeats must be a non-empty array of seat codes" });
    }

    let session = null;
    try {
        session = await mongoose.startSession();
        session.startTransaction();

        // 1. Fetch the show INSIDE the transaction
        const show = await Show.findById(showId).populate('movie screen').session(session);

        if (!show) {
            throw new Error("Show not found");
        }

        const bookedSeats = show.bookedSeats || [];

        // 2. Check for overlaps (The Race Condition check)
        const alreadyBooked = bookedSeats.some(seat => requestedSeats.includes(seat));
        if (alreadyBooked) {
            const conflictSeat = requestedSeats.find(seat => bookedSeats.includes(seat));
            const err = new Error(`Seat ${conflictSeat} is currently selected by another customer. Please choose another seat.`);
            err.statusCode = 409;
            throw err;
        }

        // 3. Update the Show's bookedSeats array
        show.bookedSeats.push(...requestedSeats);
        await show.save({ session });

        // 4. Calculate total price if not provided
        const calculatedPrice = totalPrice !== undefined ? totalPrice : (show.price * requestedSeats.length);

        // 5. Create the Booking document with snapshot metadata
        const newBooking = new Booking({
            user: userId,
            show: showId,
            movieTitle: show.movie?.title || '',
            posterUrl: show.movie?.posterUrl || '',
            screenName: show.screen?.name || '',
            showTime: show.showTime,
            seats: requestedSeats,
            totalPrice: calculatedPrice,
            bookingStatus: 'Reserved',
            paymentStatus: 'Pending',
            // Lock the seats for 10 minutes to allow time for payment
            lockedUntil: new Date(Date.now() + 10 * 60 * 1000)
        });

        await newBooking.save({ session });

        // 6. Commit the transaction
        await session.commitTransaction();

        res.status(201).json({
            message: "Seats reserved successfully",
            booking: newBooking,
            bookingId: newBooking._id,
            lockedUntil: newBooking.lockedUntil
        });

    } catch (error) {
        if (session && session.inTransaction()) {
            await session.abortTransaction();
        }
        res.status(error.statusCode || 400).json({
            error: error.statusCode === 409 ? "Conflict" : error.message,
            message: error.message
        });
    } finally {
        if (session) {
            session.endSession();
        }
    }
};

// @route   POST /api/bookings/confirm
// @desc    Confirm payment and finalize booking
// @access  Private
exports.confirmPayment = async (req, res) => {
    try {
        const { bookingId, paymentId } = req.body;
        const userId = req.user._id || req.user.id;

        if (!bookingId) {
            return res.status(400).json({ error: "bookingId is required" });
        }

        const booking = await Booking.findOne({ _id: bookingId, user: userId });
        if (!booking) {
            return res.status(404).json({ error: "Booking not found or unauthorized" });
        }

        if (booking.bookingStatus === 'Confirmed') {
            return res.status(400).json({ error: "Booking is already confirmed" });
        }

        if (booking.bookingStatus === 'Cancelled') {
            return res.status(400).json({ error: "Booking has already been cancelled" });
        }

        // Check if reservation lock expired
        if (booking.lockedUntil && new Date() > booking.lockedUntil) {
            return res.status(400).json({ error: "Reservation lock expired. Please reserve again." });
        }

        booking.paymentStatus = 'Completed';
        booking.bookingStatus = 'Confirmed';
        booking.paymentId = paymentId || `PAY_${Date.now()}`;
        booking.lockedUntil = undefined;

        await booking.save();

        res.status(200).json({
            message: "Payment confirmed and booking finalized",
            booking
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @route   GET /api/bookings/my-tickets
// @desc    Get all bookings for the logged-in user
// @access  Private
exports.getUserTickets = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const bookings = await Booking.find({ user: userId })
            .populate({
                path: 'show',
                populate: [
                    { path: 'movie', select: 'title duration language posterUrl genre' },
                    { path: 'screen', select: 'name' }
                ]
            })
            .sort({ createdAt: -1 });

        const sanitizedBookings = bookings.map(b => {
            const doc = b.toObject();
            if (!doc.show) {
                doc.show = {
                    _id: b._id,
                    showTime: doc.showTime || doc.createdAt,
                    movie: {
                        title: doc.movieTitle || 'The Batman',
                        posterUrl: doc.posterUrl || 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&w=400&q=80'
                    },
                    screen: {
                        name: doc.screenName || 'Standard Hall'
                    }
                };
            }
            return doc;
        });

        res.status(200).json({ bookings: sanitizedBookings });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @route   GET /api/bookings/:id
// @desc    Get a single booking details
// @access  Private
exports.getBookingById = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const booking = await Booking.findById(req.params.id)
            .populate({
                path: 'show',
                populate: [
                    { path: 'movie', select: 'title duration language posterUrl genre' },
                    { path: 'screen', select: 'name seatLayout' }
                ]
            });

        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        // Ensure user is the owner or admin
        if (booking.user.toString() !== userId.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ error: "Unauthorized access to this booking" });
        }

        res.status(200).json({ booking });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @route   POST /api/bookings/:id/cancel
// @desc    Cancel a booking and release seats
// @access  Private
exports.cancelBooking = async (req, res) => {
    const userId = req.user._id || req.user.id;
    const bookingId = req.params.id;

    let session = null;
    try {
        session = await mongoose.startSession();
        session.startTransaction();

        const booking = await Booking.findById(bookingId).session(session);
        if (!booking) {
            throw new Error("Booking not found");
        }

        if (booking.user.toString() !== userId.toString() && req.user.role !== 'admin') {
            throw new Error("Unauthorized to cancel this booking");
        }

        if (booking.bookingStatus === 'Cancelled') {
            throw new Error("Booking is already cancelled");
        }

        // Release seats from show
        await Show.findByIdAndUpdate(
            booking.show,
            { $pull: { bookedSeats: { $in: booking.seats } } },
            { session }
        );

        booking.bookingStatus = 'Cancelled';
        booking.paymentStatus = booking.paymentStatus === 'Completed' ? 'Refunded' : 'Failed';
        await booking.save({ session });

        await session.commitTransaction();

        res.status(200).json({ message: "Booking cancelled successfully", booking });
    } catch (error) {
        if (session && session.inTransaction()) {
            await session.abortTransaction();
        }
        res.status(400).json({ error: error.message });
    } finally {
        if (session) {
            session.endSession();
        }
    }
};
