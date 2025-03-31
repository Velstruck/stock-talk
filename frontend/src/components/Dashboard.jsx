import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { getUserProfile, searchStocks, getStockQuote, getStockIntraday, getStockNews, addToWatchlist } from '@/lib/api';
import { RippleButton } from './magicui/ripple-button';

import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { HeroPill } from './ui/hero-pill';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const Dashboard = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedStock, setSelectedStock] = useState(null);
    const [stockData, setStockData] = useState(null);
    const [watchlist, setWatchlist] = useState([]);
    const [news, setNews] = useState([]);
    const [chartData, setChartData] = useState(null);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('userToken');
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        setUserName(userData.name || 'User');
        
        if (!token) {
            navigate('/auth');
            return;
        }

        // Connect to WebSocket
        const socket = io(import.meta.env.VITE_API_BASE_URL);

        // Fetch user's watchlist
        fetchWatchlist();

        return () => socket.disconnect();
    }, []);

    const fetchWatchlist = async () => {
        try {
            const response = await getUserProfile();
            if (response.data && response.data.watchlist) {
                setWatchlist(response.data.watchlist);
            } else {
                setWatchlist([]);
                console.warn('Watchlist data not found in response');
            }
        } catch (error) {
            console.error('Error fetching watchlist:', error);
            setWatchlist([]);
            // Handle specific error cases
            if (error.response?.status === 401) {
                navigate('/auth');
            }
        }
    };

    const handleSearch = async () => {
        try {
            const token = localStorage.getItem('userToken');
            const response = await searchStocks(searchQuery);
            setSearchResults(response.data.bestMatches || []);
        } catch (error) {
            console.error('Error searching stocks:', error);
        }
    };

    const handleStockSelect = async (symbol) => {
        try {
            const token = localStorage.getItem('userToken');
            const [quoteResponse, intradayResponse, newsResponse] = await Promise.all([
                getStockQuote(symbol),
                getStockIntraday(symbol),
                getStockNews(symbol)
            ]);

            setSelectedStock(symbol);
            setStockData(quoteResponse.data);
            setNews(newsResponse.data.feed || []);

            // Prepare chart data
            const timeSeriesData = intradayResponse.data['Time Series (5min)'];
            if (timeSeriesData) {
                const labels = Object.keys(timeSeriesData).slice(0, 20).reverse();
                const prices = labels.map(time => timeSeriesData[time]['4. close']);

                setChartData({
                    labels,
                    datasets: [{
                        label: 'Stock Price',
                        data: prices,
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    }]
                });
            }
        } catch (error) {
            console.error('Error fetching stock details:', error);
        }
    };

    const handleWatchlist = async (symbol, action) => {
        try {
            const token = localStorage.getItem('userToken');
            await addToWatchlist({ symbol, action });
            fetchWatchlist();
        } catch (error) {
            console.error('Error updating watchlist:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
        navigate('/');
    };
    
    return (
        <div className="min-h-screen bg-[#030303] text-white">
            <nav className="bg-black/40 backdrop-blur-xl p-4 border-b border-white/[0.05]">
                <div className="container mx-auto flex justify-between items-center">
                    <div onClick={() => navigate('/dashboard')} className="flex items-center cursor-pointer">
                        <img src="/STOCK TALK-LOGO.png" alt="Stock Talk Logo" className="h-10 w-10" />
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300 bg-clip-text text-transparent">Stock Talk</h1>
                    </div>
                    <RippleButton
                        onClick={handleLogout}
                        className="px-6 py-2 text-slate-200 bg-red-500/20 border-2 border-red-500/50 rounded-lg hover:bg-red-500/30 transition"
                        rippleColor="#ef4444"
                    >
                        Logout
                    </RippleButton>
                </div>
            </nav>

            <div className="container mx-auto p-3 md:p-4 space-y-4 md:space-y-6">
                <HeroPill
                    announcement="👋 Welcome"
                    label={`Hi, ${userName}`}
                />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                {/* Search and Stock Info Section */}
                <div className="lg:col-span-2 space-y-4 md:space-y-6">
                    <div className="bg-black/40 backdrop-blur-xl p-4 md:p-6 rounded-lg border border-white/[0.05]">
                        <div className="flex gap-4 mb-4">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search stocks..."
                                className="flex-1 p-2 rounded bg-black/40 border border-white/[0.1] text-white placeholder:text-white/50 focus:border-indigo-500/50 outline-none"
                            />
                            <RippleButton
                                onClick={handleSearch}
                                className="px-6 py-2 bg-indigo-500/20 border-2 border-indigo-500/50 rounded-lg hover:bg-indigo-500/30 transition text-slate-200"
                                rippleColor="#6366f1"
                            >
                                Search
                            </RippleButton>
                        </div>

                        {searchResults.length > 0 && (
                            <div className="mt-4 space-y-2">
                                {searchResults.map((result) => (
                                    <div
                                        key={result['1. symbol']}
                                        className="p-4 bg-black/40 backdrop-blur-xl border border-white/[0.05] rounded-lg flex justify-between items-center cursor-pointer hover:bg-black/60 transition"
                                        onClick={() => handleStockSelect(result['1. symbol'])}
                                    >
                                        <div>
                                            <h3 className="font-semibold text-white">{result['2. name']}</h3>
                                            <p className="text-sm text-white/70">{result['1. symbol']}</p>
                                        </div>
                                        <RippleButton
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleWatchlist(result['1. symbol'], 'add');
                                            }}
                                            className="px-4 py-2 bg-green-500/20 border-2 border-green-500/50 rounded-lg hover:bg-green-500/30 transition text-slate-200"
                                            rippleColor="#22c55e"
                                        >
                                            Add to Watchlist
                                        </RippleButton>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {selectedStock && stockData && (
                        <div className="bg-black/40 backdrop-blur-xl p-4 md:p-6 rounded-lg border border-white/[0.05]">
                            <h2 className="text-xl md:text-2xl font-bold mb-4">{selectedStock}</h2>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="p-4 bg-black/40 backdrop-blur-xl border border-white/[0.05] rounded">
                                    <p className="text-white/70">Price</p>
                                    <p className="text-xl font-semibold text-white">
                                        ${stockData['Global Quote']?.['05. price'] || 'N/A'}
                                    </p>
                                </div>
                                <div className="p-4 bg-black/40 backdrop-blur-xl border border-white/[0.05] rounded">
                                    <p className="text-white/70">Change</p>
                                    <p className="text-xl font-semibold text-white">
                                        {stockData['Global Quote']?.['09. change'] || 'N/A'}
                                    </p>
                                </div>
                            </div>

                            {chartData && (
                                <div className="mt-4 md:mt-6 h-[250px] md:h-[300px]">
                                    <Line
                                        data={chartData}
                                        options={{
                                            maintainAspectRatio: false,
                                            responsive: true,
                                            plugins: {
                                                legend: {
                                                    position: 'top',
                                                },
                                                title: {
                                                    display: true,
                                                    text: 'Stock Price Chart'
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Watchlist and News Section */}
                <div className="space-y-4 md:space-y-6">
                    <div className="bg-black/40 backdrop-blur-xl p-4 md:p-6 rounded-lg border border-white/[0.05]">
                        <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300 bg-clip-text text-transparent">Watchlist</h2>
                        <div className="space-y-3">
                            {watchlist.map((item) => (
                                <div
                                    key={item.symbol}
                                    className="p-4 bg-black/40 backdrop-blur-xl border border-white/[0.05] rounded-lg flex justify-between items-center hover:bg-black/60 transition"
                                >
                                    <div
                                        className="cursor-pointer"
                                        onClick={() => handleStockSelect(item.symbol)}
                                    >
                                        <p className="font-semibold text-white">{item.symbol}</p>
                                    </div>
                                    <RippleButton
                                        onClick={() => handleWatchlist(item.symbol, 'remove')}
                                        className="text-slate-300 px-3 py-1 bg-red-500/20 border-2 border-red-500/50 rounded-lg hover:bg-red-500/30 transition"
                                        rippleColor="#ef4444"
                                    >
                                        Remove
                                    </RippleButton>
                                </div>
                            ))}
                        </div>
                    </div>

                    {news.length > 0 && (
                        <div className="bg-black/40 backdrop-blur-xl p-6 rounded-lg border border-white/[0.05]">
                            <h2 className="text-xl font-bold mb-4">Latest News</h2>
                            <div className="space-y-4">
                                {news.slice(0, 5).map((item, index) => (
                                    <a
                                        key={index}
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block p-4 bg-black/40 backdrop-blur-xl border border-white/[0.05] rounded-lg hover:bg-black/60 transition hover:brightness-75"
                                    >
                                        <h3 className="font-semibold mb-2 text-white hover:underline">{item.title}</h3>
                                        <p className="text-sm text-white/70">{item.summary}</p>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
    );
};

export default Dashboard;