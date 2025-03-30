import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShineBorder } from './magicui/shine-border';
import { RippleButton } from './magicui/ripple-button';
import { IoArrowBack } from 'react-icons/io5';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const endpoint = isLogin ? '/api/users/login' : '/api/users/register';
            const response = await axios.post(`http://localhost:5000${endpoint}`, formData);

            if (response.data.token) {
                localStorage.setItem('userToken', response.data.token);
                localStorage.setItem('userData', JSON.stringify(response.data));
                navigate('/dashboard');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="min-h-screen bg-[#030303] flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] via-transparent to-rose-500/[0.03] blur-3xl" />
            <div className="max-w-md w-full space-y-8 bg-black/40 backdrop-blur-xl p-8 rounded-xl relative border border-white/[0.05]">
                <div className="absolute left-4 top-4">
                    <RippleButton
                        onClick={() => navigate('/')}
                        className="!bg-transparent hover:!bg-white/[0.05] !border-white/[0.1]"
                        rippleColor="rgba(255, 255, 255, 0.1)"
                    >
                        <IoArrowBack className="w-5 h-5 text-white/70" />
                    </RippleButton>
                </div>
                <ShineBorder className="opacity-20" borderWidth={1} duration={10} shineColor={["#4f46e5", "#e11d48"]} />
                <div className="text-center">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300 bg-clip-text text-transparent">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="mt-2 text-gray-400">
                        {isLogin ? 'Login to access your account' : 'Register to get started'}
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div>
                            <label htmlFor="name" className="text-white">Name</label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                required={!isLogin}
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full mt-2 p-3 rounded-lg bg-white/[0.05] text-white border border-white/[0.1] focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none transition placeholder:text-white/30"
                                placeholder="Enter your name"
                            />
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="text-white">Email</label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full mt-2 p-3 rounded-lg bg-white/[0.05] text-white border border-white/[0.1] focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none transition placeholder:text-white/30"
                            placeholder="Enter your email"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="text-white">Password</label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full mt-2 p-3 rounded-lg bg-white/[0.05] text-white border border-white/[0.1] focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none transition placeholder:text-white/30"
                            placeholder="Enter your password"
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white font-semibold shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                    >
                        {isLogin ? 'Login' : 'Register'}
                    </button>

                    <div className="text-center text-gray-400">
                        {isLogin ? "Don't have an account? " : 'Already have an account? '}
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                        >
                            {isLogin ? 'Register' : 'Login'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Auth;