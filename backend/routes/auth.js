const express = require('express');
const { login, register, getMe } = require('../controllers/auth');
const auth = require('../middlewares/auth');

const router = express.Router();

// Public routes - use POST for authentication
router.post('/register', register);
router.post('/signup', register);
router.post('/login', login);

// Private route to get current user info
router.get('/me', auth, getMe);

module.exports = router;
