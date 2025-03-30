import { useNavigate } from 'react-router-dom';
import { HeroGeometric } from './ui/shape-landing-hero';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#030303]">
            <HeroGeometric
                badge="Stock Market Analytics"
                title1="Real-Time Stock"
                title2="Market Insights"
            >
                <button
                    onClick={() => navigate('/auth')}
                    className="px-8 py-3 text-lg font-semibold rounded-lg bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 transform hover:scale-105 transition-all duration-200 shadow-lg mt-8"
                >
                    Get Started
                </button>
            </HeroGeometric>

            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
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
    );
};

const FeatureCard = ({ title, description }) => (
    <div className="p-6 rounded-xl bg-gray-800 bg-opacity-50 backdrop-blur-lg border border-gray-700 hover:border-gray-600 transition-all duration-200">
        <h3 className="text-xl font-semibold mb-3 text-blue-400">{title}</h3>
        <p className="text-gray-400">{description}</p>
    </div>
);

export default LandingPage;