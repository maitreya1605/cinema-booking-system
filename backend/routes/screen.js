const express = require('express');
const router = express.Router();
const screenController = require('../controllers/screen');
const auth = require('../middlewares/auth');

// Public endpoints
router.get('/', screenController.getAllScreens);
router.get('/:id', screenController.getScreenById);

// Protected endpoints (Admin / Staff)
router.post('/', auth, screenController.createScreen);
router.put('/:id', auth, screenController.updateScreen);
router.delete('/:id', auth, screenController.deleteScreen);

module.exports = router;

