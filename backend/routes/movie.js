const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movie');
const auth = require('../middlewares/auth');

// Public endpoints
router.get('/', movieController.getAllMovies);
router.get('/:id', movieController.getMovieById);

// Protected endpoints (Admin / Staff)
router.post('/', auth, movieController.createMovie);
router.put('/:id', auth, movieController.updateMovie);
router.delete('/:id', auth, movieController.deleteMovie);

module.exports = router;

