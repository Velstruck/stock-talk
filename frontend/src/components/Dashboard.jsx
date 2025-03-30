import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
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

    useEffect(() => {
        const token = localStorage.getItem('userToken');
        if (!token) {
            navigate('/auth');
            return;
        }

        // Connect to WebSocket
        const socket = io('http://localhost:5000');

        // Fetch user's watchlist
        fetchWatchlist();

        return () => socket.disconnect();
    }, []);

    const fetchWatchlist = async () => {
        try {
            const token = localStorage.getItem('userToken');
            const response = await axios.get('http://localhost:5000/api/users/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWatchlist(response.data.watchlist);
        } catch (error) {
            console.error('Error fetching watchlist:', error);
        }
    };

    const handleSearch = async () => {
        try {
            const token = localStorage.getItem('userToken');
            const response = await axios.get(`http://localhost:5000/api/stocks/search/${searchQuery}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSearchResults(response.data.bestMatches || []);
        } catch (error) {
            console.error('Error searching stocks:', error);
        }
    };

    const handleStockSelect = async (symbol) => {
        try {
            const token = localStorage.getItem('userToken');
            const [quoteResponse, intradayResponse, newsResponse] = await Promise.all([
                axios.get(`http://localhost:5000/api/stocks/quote/${symbol}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`http://localhost:5000/api/stocks/intraday/${symbol}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`http://localhost:5000/api/stocks/news/${symbol}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
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
            await axios.post('http://localhost:5000/api/users/watchlist', 
                { symbol, action },
                { headers: { Authorization: `Bearer ${token}` } }
            );
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
        <div className="min-h-screen bg-gray-900 text-white">
            <nav className="bg-gray-800 p-4">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 onClick={() => navigate('/auth')} className="text-2xl font-bold">Stock Talk</h1>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 transition"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <div className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Search and Stock Info Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <div className="flex gap-4 mb-4">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search stocks..."
                                className="flex-1 p-2 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 outline-none"
                            />
                            <button
                                onClick={handleSearch}
                                className="px-6 py-2 bg-blue-500 rounded hover:bg-blue-600 transition"
                            >
                                Search
                            </button>
                        </div>

                        {searchResults.length > 0 && (
                            <div className="mt-4 space-y-2">
                                {searchResults.map((result) => (
                                    <div
                                        key={result['1. symbol']}
                                        className="p-4 bg-gray-700 rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-600 transition"
                                        onClick={() => handleStockSelect(result['1. symbol'])}
                                    >
                                        <div>
                                            <h3 className="font-semibold">{result['2. name']}</h3>
                                            <p className="text-sm text-gray-400">{result['1. symbol']}</p>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleWatchlist(result['1. symbol'], 'add');
                                            }}
                                            className="px-4 py-2 bg-green-500 rounded hover:bg-green-600 transition"
                                        >
                                            Add to Watchlist
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {selectedStock && stockData && (
                        <div className="bg-gray-800 p-6 rounded-lg">
                            <h2 className="text-2xl font-bold mb-4">{selectedStock}</h2>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="p-4 bg-gray-700 rounded">
                                    <p className="text-gray-400">Price</p>
                                    <p className="text-xl font-semibold">
                                        ${stockData['Global Quote']?.['05. price'] || 'N/A'}
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-700 rounded">
                                    <p className="text-gray-400">Change</p>
                                    <p className="text-xl font-semibold">
                                        {stockData['Global Quote']?.['09. change'] || 'N/A'}
                                    </p>
                                </div>
                            </div>

                            {chartData && (
                                <div className="mt-6">
                                    <Line
                                        data={chartData}
                                        options={{
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
                <div className="space-y-6">
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <h2 className="text-xl font-bold mb-4">Watchlist</h2>
                        <div className="space-y-3">
                            {watchlist.map((item) => (
                                <div
                                    key={item.symbol}
                                    className="p-4 bg-gray-700 rounded-lg flex justify-between items-center"
                                >
                                    <div
                                        className="cursor-pointer"
                                        onClick={() => handleStockSelect(item.symbol)}
                                    >
                                        <p className="font-semibold">{item.symbol}</p>
                                    </div>
                                    <button
                                        onClick={() => handleWatchlist(item.symbol, 'remove')}
                                        className="px-3 py-1 bg-red-500 rounded hover:bg-red-600 transition"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {news.length > 0 && (
                        <div className="bg-gray-800 p-6 rounded-lg">
                            <h2 className="text-xl font-bold mb-4">Latest News</h2>
                            <div className="space-y-4">
                                {news.slice(0, 5).map((item, index) => (
                                    <a
                                        key={index}
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
                                    >
                                        <h3 className="font-semibold mb-2">{item.title}</h3>
                                        <p className="text-sm text-gray-400">{item.summary}</p>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;