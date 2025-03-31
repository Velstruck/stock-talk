import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});


api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('userToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


export const login = (data) => api.post('/api/users/login', data);
export const register = (data) => api.post('/api/users/register', data);


export const getUserProfile = () => api.get('/api/users/profile');
export const addToWatchlist = (data) => api.post('/api/users/watchlist', data);


export const searchStocks = (query) => api.get(`/api/stocks/search/${query}`);
export const getStockQuote = (symbol) => api.get(`/api/stocks/quote/${symbol}`);
export const getStockIntraday = (symbol) => api.get(`/api/stocks/intraday/${symbol}`);
export const getStockNews = (symbol) => api.get(`/api/stocks/news/${symbol}`);

export default api;