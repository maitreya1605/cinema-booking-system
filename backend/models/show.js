const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
    movie: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Movie', 
        required: true 
    },
    screen: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Screen', 
        required: true 
    },
    showTime: { type: Date, required: true },
    price: { type: Number, required: true },
    
    // Denormalizing booked seats here is crucial. 
    // It prevents having to query the entire Booking collection just to render a seat map.
    bookedSeats: [{ type: String }] // e.g., ["A1", "A2", "B5"]
}, { 
    timestamps: true 
});

// Compound index: Prevents creating two shows on the exact same screen at the exact same time
showSchema.index({ screen: 1, showTime: 1 }, { unique: true });

// Optional: Virtual to check available seats against screen capacity (requires populating screen)
showSchema.virtual('availableSeats').get(function() {
    if (this.screen && this.screen.capacity) {
        return this.screen.capacity - this.bookedSeats.length;
    }
    return null;
});

module.exports = mongoose.model('Show', showSchema);