const mongoose = require('mongoose');

const theaterSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Theater name is required'], 
        trim: true 
    },
    city: { 
        type: String, 
        required: [true, 'City is required'], 
        trim: true 
    },
    location: { 
        type: String, 
        required: [true, 'Location address is required'],
        trim: true 
    },
    format: { 
        type: String, 
        default: 'IMAX 3D Laser' 
    },
    distance: { 
        type: String, 
        default: '2.0 km away' 
    },
    screensInfo: { 
        type: String 
    },
    tags: [{ 
        type: String 
    }],
    showtimes: [{ 
        type: String 
    }],
    shows: [{
        id: { type: String },
        movie: { type: String },
        time: { type: String },
        screen: { type: String },
        format: { type: String },
        price: { type: String }
    }],
    screens: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Screen' 
    }]
}, { 
    timestamps: true 
});

theaterSchema.index({ city: 1 });
theaterSchema.index({ name: 1 });

module.exports = mongoose.model('Theater', theaterSchema);
