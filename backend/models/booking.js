const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    show: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Show', 
        required: true 
    },
    seats: [{ 
        type: String, 
        required: true 
    }], // e.g., ["A1", "A2"]
    totalPrice: { 
        type: Number, 
        required: true 
    },
    
    // Tracks the lifecycle of the ticket itself
    bookingStatus: { 
        type: String, 
        enum: ['Reserved', 'Confirmed', 'Cancelled'], 
        default: 'Reserved' 
    },
    
    // Tracks the actual money
    paymentStatus: { 
        type: String, 
        enum: ['Pending', 'Completed', 'Failed', 'Refunded'], 
        default: 'Pending' 
    },
    
    // Stripe, Razorpay, or PayPal transaction ID
    paymentId: { 
        type: String 
    },

    // Snapshot fields to preserve ticket metadata even across show modifications
    movieTitle: {
        type: String,
        default: ''
    },
    posterUrl: {
        type: String,
        default: ''
    },
    screenName: {
        type: String,
        default: ''
    },
    showTime: {
        type: Date
    },

    // CRITICAL: Used to release seats if the user abandons checkout
    lockedUntil: { 
        type: Date 
    },

    // Entry validation: Prevents double ticket reuse at cinema door
    isCheckedIn: {
        type: Boolean,
        default: false
    },
    checkedInAt: {
        type: Date
    }
}, { 
    timestamps: true 
});

// Indexes to speed up queries for a specific user's tickets or a show's capacity
bookingSchema.index({ user: 1 });
bookingSchema.index({ show: 1 });

module.exports = mongoose.model('Booking', bookingSchema);