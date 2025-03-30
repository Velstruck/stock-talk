const express = require('express');
const router = express.Router();
const { getStockQuote, getStockIntraday, searchStocks, getCompanyOverview, getStockNews } = require('../controllers/stockController');
const { protect } = require('../middleware/authMiddleware');

// Protected routes
router.get('/quote/:symbol', protect, getStockQuote);
router.get('/intraday/:symbol', protect, getStockIntraday);
router.get('/search/:keywords', protect, searchStocks);
router.get('/overview/:symbol', protect, getCompanyOverview);
router.get('/news/:symbol', protect, getStockNews);

module.exports = router;