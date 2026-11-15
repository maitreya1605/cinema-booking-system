const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'cinema_booking_app_super_secret_jwt_key_2026_xyz';

// Verify JWT token and attach user to req
const auth = (req, res, next) => {
    // 1. Get token from Authorization header
    const authHeader = req.header('Authorization') || req.headers.authorization;

    // Check if header is present and properly formatted
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    // Extract the token
    const token = authHeader.split(' ')[1];

    try {
        // 2. Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);

        // 3. Attach user payload and normalize id and _id
        const userObj = decoded.user || decoded;
        const userId = userObj.id || userObj._id;

        req.user = {
            ...userObj,
            id: userId,
            _id: userId
        };

        // 4. Continue to next middleware / route
        next();
    } catch (err) {
        console.error("Token verification failed:", err.message);
        return res.status(401).json({ message: 'Token is not valid or expired' });
    }
};

// Admin authorization check
const adminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Admin privileges required' });
    }
    next();
};

auth.adminOnly = adminOnly;

module.exports = auth;
module.exports.auth = auth;
module.exports.adminOnly = adminOnly;
