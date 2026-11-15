const Show = require('../models/show');
const Movie = require('../models/movie');
const Screen = require('../models/screen');

// @route   GET /api/shows
// @desc    Get all shows (optional ?movie= or ?screen= or ?date=)
// @access  Public
exports.getAllShows = async (req, res) => {
    try {
        const { movie, screen, date } = req.query;
        let query = {};

        if (movie) query.movie = movie;
        if (screen) query.screen = screen;
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            query.showTime = { $gte: startOfDay, $lte: endOfDay };
        }

        const shows = await Show.find(query)
            .populate('movie', 'title duration language posterUrl')
            .populate('screen', 'name capacity')
            .sort({ showTime: 1 });

        res.status(200).json({ count: shows.length, shows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @route   GET /api/shows/:id
// @desc    Get show details including full seat layout and booked seats
// @access  Public
exports.getShowById = async (req, res) => {
    try {
        const show = await Show.findById(req.params.id)
            .populate('movie')
            .populate('screen');

        if (!show) {
            return res.status(404).json({ message: 'Show not found' });
        }

        res.status(200).json({ show });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @route   POST /api/shows
// @desc    Create a new show
// @access  Private (Admin)
exports.createShow = async (req, res) => {
    try {
        const { movie, screen, showTime, price } = req.body;

        if (!movie || !screen || !showTime || price === undefined) {
            return res.status(400).json({ message: 'Please provide movie, screen, showTime, and price' });
        }

        // Verify movie and screen exist
        const movieExists = await Movie.findById(movie);
        if (!movieExists) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        const screenExists = await Screen.findById(screen);
        if (!screenExists) {
            return res.status(404).json({ message: 'Screen not found' });
        }

        // Check if there is already a show on the same screen at the same time
        const conflict = await Show.findOne({ screen, showTime: new Date(showTime) });
        if (conflict) {
            return res.status(400).json({ message: 'A show is already scheduled on this screen at this time' });
        }

        const show = new Show({
            movie,
            screen,
            showTime: new Date(showTime),
            price,
            bookedSeats: []
        });

        await show.save();
        res.status(201).json({ message: 'Show created successfully', show });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// @route   DELETE /api/shows/:id
// @desc    Delete a show
// @access  Private (Admin)
exports.deleteShow = async (req, res) => {
    try {
        const show = await Show.findByIdAndDelete(req.params.id);
        if (!show) {
            return res.status(404).json({ message: 'Show not found' });
        }
        res.status(200).json({ message: 'Show deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

