const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const connectDB = require('./db');

// Route imports
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/booking');
const movieRoutes = require('./routes/movie');
const showRoutes = require('./routes/show');
const screenRoutes = require('./routes/screen');
const paymentRoutes = require('./routes/payment');
const theaterRoutes = require('./routes/theater');
const adminRoutes = require('./routes/admin');

const app = express();

// Connect to Database
connectDB();

// Core Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check & Root Endpoints
app.get('/', (req, res) => {
    res.json({ message: 'Cinema Ticket Booking API is running' });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/screens', screenRoutes);
app.use('/api/theaters', theaterRoutes);
app.use('/api/admin', adminRoutes);

// 404 Route Handler
app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err.stack || err.message);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error'
    });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running at port ${PORT}`));

module.exports = app;
