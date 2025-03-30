import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <div className="container mx-auto px-4 py-16">
                <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                        Stock Talk
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 text-gray-300 max-w-2xl">
                        Your real-time stock market companion. Track stocks, analyze trends, and make informed decisions with our powerful tools.
                    </p>
                    <div className="space-y-4">
                        <button
                            onClick={() => navigate('/auth')}
                            className="px-8 py-3 text-lg font-semibold rounded-lg bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
                        >
                            Get Started
                        </button>
                    </div>
                    <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        <FeatureCard
                            title="Real-Time Data"
                            description="Get instant access to live stock prices, market trends, and trading volumes."
                        />
                        <FeatureCard
                            title="Smart Watchlist"
                            description="Create personalized watchlists and track your favorite stocks effortlessly."
                        />
                        <FeatureCard
                            title="Market Insights"
                            description="Stay informed with the latest market news and expert analysis."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const FeatureCard = ({ title, description }) => (
    <div className="p-6 rounded-xl bg-gray-800 bg-opacity-50 backdrop-blur-lg border border-gray-700 hover:border-gray-600 transition-all duration-200">
        <h3 className="text-xl font-semibold mb-3 text-blue-400">{title}</h3>
        <p className="text-gray-400">{description}</p>
    </div>
);

export default LandingPage;