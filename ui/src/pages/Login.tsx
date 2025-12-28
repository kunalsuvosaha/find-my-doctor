import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import { useNavigate, Link } from 'react-router-dom';
import { PageTransition } from '../components/PageTransition';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/auth/login', { email, password });
            login(data.token, data.user);
            navigate('/');
        } catch (error) {
            alert('Login failed');
        }
    };

    return (
        <PageTransition>
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-xl transition-all hover:shadow-2xl">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-extrabold text-blue-900 mb-2">Welcome Back</h1>
                        <p className="text-gray-500">Sign in to access your dashboard</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-gray-50 focus:bg-white"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-gray-50 focus:bg-white"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                        >
                            Sign In
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-800 hover:underline transition">
                            Create account
                        </Link>
                    </p>
                </div>
            </div>
        </PageTransition>
    );
}
