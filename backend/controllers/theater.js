const Theater = require('../models/theater');

// @route   GET /api/theaters
// @desc    Get all theaters (optionally filtered by city)
// @access  Public
exports.getAllTheaters = async (req, res) => {
    try {
        const { city } = req.query;
        const query = {};

        if (city && city.toLowerCase() !== 'all') {
            query.city = { $regex: new RegExp(`^${city.trim()}$`, 'i') };
        }

        const theaters = await Theater.find(query).populate('screens').sort({ name: 1 });
        res.status(200).json({
            count: theaters.length,
            theaters
        });
    } catch (error) {
        res.status(500).json({
            error: error.message || 'Failed to fetch theaters'
        });
    }
};

// @route   GET /api/theaters/:id
// @desc    Get single theater by ID
// @access  Public
exports.getTheaterById = async (req, res) => {
    try {
        const theater = await Theater.findById(req.params.id).populate('screens');
        if (!theater) {
            return res.status(404).json({ error: 'Theater not found' });
        }
        res.status(200).json({ theater });
    } catch (error) {
        res.status(500).json({
            error: error.message || 'Failed to fetch theater'
        });
    }
};

// @route   POST /api/theaters
// @desc    Create a new theater
// @access  Private (Admin)
exports.createTheater = async (req, res) => {
    try {
        const theater = await Theater.create(req.body);
        res.status(201).json({
            message: 'Theater created successfully',
            theater
        });
    } catch (error) {
        res.status(400).json({
            error: error.message || 'Failed to create theater'
        });
    }
};

// @route   PUT /api/theaters/:id
// @desc    Update a theater
// @access  Private (Admin)
exports.updateTheater = async (req, res) => {
    try {
        const theater = await Theater.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!theater) {
            return res.status(404).json({ error: 'Theater not found' });
        }
        res.status(200).json({
            message: 'Theater updated successfully',
            theater
        });
    } catch (error) {
        res.status(400).json({
            error: error.message || 'Failed to update theater'
        });
    }
};

// @route   DELETE /api/theaters/:id
// @desc    Delete a theater
// @access  Private (Admin)
exports.deleteTheater = async (req, res) => {
    try {
        const theater = await Theater.findByIdAndDelete(req.params.id);
        if (!theater) {
            return res.status(404).json({ error: 'Theater not found' });
        }
        res.status(200).json({
            message: 'Theater deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            error: error.message || 'Failed to delete theater'
        });
    }
};

