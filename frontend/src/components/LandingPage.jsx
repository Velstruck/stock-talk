import { useNavigate } from 'react-router-dom';
import { HeroGeometric } from './ui/shape-landing-hero';
import { HoverButton } from './ui/hover-button';
import { CardSpotlight } from './ui/card-spotlight';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#030303]">
            <HeroGeometric
                badge="Stock Market Analytics"
                title1="Real-Time Stock"
                title2="Market Insights"
            >
                <HoverButton
                    onClick={() => navigate('/auth')}
                    className="mt-8 text-lg font-semibold bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300 text-transparent bg-clip-text"
                >
                    Get Started
                </HoverButton>
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
    <CardSpotlight className="h-full">
        <h3 className="text-xl font-semibold mb-3 bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300 text-transparent bg-clip-text">{title}</h3>
        <p className="text-white">{description}</p>
    </CardSpotlight>
);

export default LandingPage;