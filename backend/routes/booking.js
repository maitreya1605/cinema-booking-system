const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const bookingController = require('../controllers/booking');

// All booking routes require authentication
router.post('/', auth, bookingController.reserveSeats);
router.post('/confirm', auth, bookingController.confirmPayment);
router.get('/my-tickets', auth, bookingController.getUserTickets);
router.get('/:id', auth, bookingController.getBookingById);
router.post('/:id/cancel', auth, bookingController.cancelBooking);

module.exports = router;
