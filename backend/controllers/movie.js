const Movie = require('../models/movie');

// @route   GET /api/movies
// @desc    Get all movies (optional ?search= or ?genre= filter)
// @access  Public
exports.getAllMovies = async (req, res) => {
    try {
        const { search, genre } = req.query;
        let query = {};

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }
        if (genre) {
            query.genre = { $in: [genre] };
        }

        let sortOption = { _id: 1 };
        if (req.query.sort === 'releaseDate') {
            sortOption = { releaseDate: -1 };
        } else if (req.query.sort === 'rating') {
            sortOption = { rating: -1 };
        }

        const movies = await Movie.find(query).sort(sortOption);
        res.status(200).json({ count: movies.length, movies });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @route   GET /api/movies/:id
// @desc    Get movie by ID
// @access  Public
exports.getMovieById = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }
        res.status(200).json({ movie });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// @route   POST /api/movies
// @desc    Add a new movie
// @access  Private (Admin or Authenticated)
exports.createMovie = async (req, res) => {
    try {
        const { title, description, genre, duration, language, posterUrl, backdropImage, rating, votes, trailerId, isBanner, censorshipRating, certificate, releaseDate } = req.body;

        if (!title || !description || !duration || !language || !releaseDate) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const movie = new Movie({
            title,
            description,
            genre: Array.isArray(genre) ? genre : (genre ? [genre] : []),
            duration,
            language,
            posterUrl,
            backdropImage: backdropImage || posterUrl,
            rating: rating || '4.8',
            votes: votes || '120K+ Votes',
            trailerId: trailerId || '',
            isBanner: Boolean(isBanner),
            censorshipRating: censorshipRating || certificate || 'UA 16+',
            certificate: certificate || censorshipRating || 'UA 16+',
            releaseDate
        });

        await movie.save();
        res.status(201).json({ message: 'Movie created successfully', movie });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// @route   PUT /api/movies/:id
// @desc    Update movie details
// @access  Private (Admin)
exports.updateMovie = async (req, res) => {
    try {
        const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }
        res.status(200).json({ message: 'Movie updated successfully', movie });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// @route   DELETE /api/movies/:id
// @desc    Delete movie
// @access  Private (Admin)
exports.deleteMovie = async (req, res) => {
    try {
        const movie = await Movie.findByIdAndDelete(req.params.id);
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }
        res.status(200).json({ message: 'Movie deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

