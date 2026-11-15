const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    genre: [{ type: String }], 
    duration: { type: Number, required: true }, // in minutes
    language: { type: String, required: true },
    posterUrl: { type: String },
    backdropImage: { type: String },
    rating: { type: String, default: '4.8' },
    votes: { type: String, default: '120K+ Votes' },
    trailerId: { type: String },
    isBanner: { type: Boolean, default: false },
    censorshipRating: { type: String, default: 'UA 16+', trim: true },
    certificate: { type: String, default: 'UA 16+', trim: true },
    releaseDate: { type: Date, required: true }
}, { 
    timestamps: true 
});

// Indexing title for faster search queries
movieSchema.index({ title: 1 });

module.exports = mongoose.model('Movie', movieSchema);