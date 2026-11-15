const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'cinema_booking_app_super_secret_jwt_key_2026_xyz';

// @route   POST /api/auth/register or /api/auth/signup
// @desc    Register a new user
// @access  Public
exports.register = async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body || {};

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide name, email, and password' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        // 1. Check if user already exists
        let user = await User.findOne({ email: email.toLowerCase() });
        if (user) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // 2. Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Create the user
        user = new User({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: role === 'admin' ? 'admin' : 'user', // Default to 'user'
            phone: phone || ''
        });

        await user.save();

        // 4. Generate token on registration for convenience
        const payload = {
            user: {
                id: user._id.toString(),
                role: user.role
            }
        };

        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide both email and password' });
        }

        // 1. Check if user exists
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // 2. Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // 3. Create JWT Payload
        const payload = {
            user: {
                id: user._id.toString(),
                role: user.role
            }
        };

        // 4. Sign and return the token
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
};

// @route   GET /api/auth/me
// @desc    Get current authenticated user's profile
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ user });
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};
