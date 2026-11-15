const Screen = require('../models/screen');

// @route   GET /api/screens
// @desc    Get all screens
// @access  Public
exports.getAllScreens = async (req, res) => {
    try {
        const screens = await Screen.find().sort({ name: 1 });
        res.status(200).json({ count: screens.length, screens });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @route   GET /api/screens/:id
// @desc    Get screen details
// @access  Public
exports.getScreenById = async (req, res) => {
    try {
        const screen = await Screen.findById(req.params.id);
        if (!screen) {
            return res.status(404).json({ message: 'Screen not found' });
        }
        res.status(200).json({ screen });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @route   POST /api/screens
// @desc    Create a new screen
// @access  Private (Admin)
exports.createScreen = async (req, res) => {
    try {
        const { name, capacity, seatLayout } = req.body;

        if (!name || !capacity) {
            return res.status(400).json({ message: 'Please provide screen name and capacity' });
        }

        const existing = await Screen.findOne({ name });
        if (existing) {
            return res.status(400).json({ message: 'A screen with this name already exists' });
        }

        const screen = new Screen({
            name,
            capacity,
            seatLayout: seatLayout || { rows: [] }
        });

        await screen.save();
        res.status(201).json({ message: 'Screen created successfully', screen });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// @route   PUT /api/screens/:id
// @desc    Update a screen
// @access  Private (Admin)
exports.updateScreen = async (req, res) => {
    try {
        const screen = await Screen.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!screen) {
            return res.status(404).json({ message: 'Screen not found' });
        }
        res.status(200).json({ message: 'Screen updated successfully', screen });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// @route   DELETE /api/screens/:id
// @desc    Delete a screen
// @access  Private (Admin)
exports.deleteScreen = async (req, res) => {
    try {
        const screen = await Screen.findByIdAndDelete(req.params.id);
        if (!screen) {
            return res.status(404).json({ message: 'Screen not found' });
        }
        res.status(200).json({ message: 'Screen deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

