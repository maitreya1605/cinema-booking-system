const express = require('express');
const router = express.Router();
const theaterController = require('../controllers/theater');
const auth = require('../middlewares/auth');

// Public endpoints
router.get('/', theaterController.getAllTheaters);
router.get('/:id', theaterController.getTheaterById);

// Protected endpoints (Admin)
router.post('/', auth, theaterController.createTheater);
router.put('/:id', auth, theaterController.updateTheater);
router.delete('/:id', auth, theaterController.deleteTheater);

module.exports = router;

