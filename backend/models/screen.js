const mongoose = require('mongoose');

const screenSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, unique: true }, // e.g., "Screen 1"
    capacity: { type: Number, required: true },
    seatLayout: {
        // Defines the grid. E.g., Row A has 20 seats, Row B has 15 VIP seats.
        rows: [{
            rowId: { type: String, required: true }, // 'A', 'B', 'C'
            totalSeats: { type: Number, required: true }, // e.g., 20
            category: { 
                type: String, 
                enum: ['Standard', 'Premium', 'VIP'], 
                default: 'Standard' 
            }
        }]
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Screen', screenSchema);