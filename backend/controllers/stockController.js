const axios = require('axios');

// Alpha Vantage API base URL
const BASE_URL = 'https://www.alphavantage.co/query';
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

// Get stock quote
const getStockQuote = async (req, res) => {
    try {
        const { symbol } = req.params;
        const response = await axios.get(`${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`);
        res.json(response.data);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get stock intraday data
const getStockIntraday = async (req, res) => {
    try {
        const { symbol } = req.params;
        const response = await axios.get(`${BASE_URL}?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${API_KEY}`);
        res.json(response.data);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Search stocks
const searchStocks = async (req, res) => {
    try {
        const { keywords } = req.params;
        const response = await axios.get(`${BASE_URL}?function=SYMBOL_SEARCH&keywords=${keywords}&apikey=${API_KEY}`);
        res.json(response.data);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get company overview
const getCompanyOverview = async (req, res) => {
    try {
        const { symbol } = req.params;
        const response = await axios.get(`${BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`);
        res.json(response.data);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get stock news
const getStockNews = async (req, res) => {
    try {
        const { symbol } = req.params;
        const response = await axios.get(`${BASE_URL}?function=NEWS_SENTIMENT&tickers=${symbol}&apikey=${API_KEY}`);
        res.json(response.data);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getStockQuote,
    getStockIntraday,
    searchStocks,
    getCompanyOverview,
    getStockNews
};