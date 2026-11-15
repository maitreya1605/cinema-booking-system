const express = require('express');
const router = express.Router();
const showController = require('../controllers/show');
const auth = require('../middlewares/auth');

// Public endpoints
router.get('/', showController.getAllShows);
router.get('/:id', showController.getShowById);

// Protected endpoints (Admin / Staff)
router.post('/', auth, showController.createShow);
router.delete('/:id', auth, showController.deleteShow);

module.exports = router;

