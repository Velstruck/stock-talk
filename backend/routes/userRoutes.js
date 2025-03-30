const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, updateWatchlist } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.post('/watchlist', protect, updateWatchlist);

module.exports = router;