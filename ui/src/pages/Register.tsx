import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import { useNavigate, Link } from 'react-router-dom';
import { PageTransition } from '../components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';

export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState<'PATIENT' | 'DOCTOR'>('PATIENT');
    const [specialization, setSpecialization] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/auth/register', {
                email, password, name, role, specialization
            });
            login(data.token, data.user);
            navigate('/');
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.error || error.message || 'Unknown error';
            alert(`Debug: ${msg}\nStatus: ${error.response?.status}\nURL: ${error.config?.url}`);
        }
    };

    return (
        <PageTransition>
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-xl transition-all hover:shadow-2xl">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-extrabold text-blue-900 mb-2">Create Account</h1>
                        <p className="text-gray-500">Join our healthcare platform today</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" required />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" required />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" required />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">I am a...</label>
                            <div className="flex p-1 bg-gray-100 rounded-lg">
                                {(['PATIENT', 'DOCTOR'] as const).map((r) => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setRole(r)}
                                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === r ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        {r.charAt(0) + r.slice(1).toLowerCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <AnimatePresence>
                            {role === 'DOCTOR' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Specialization</label>
                                    <input type="text" value={specialization} onChange={(e) => setSpecialization(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                                        placeholder="e.g. Cardiologist" />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
                            Sign Up
                        </button>
                    </form>
                    <p className="mt-6 text-center text-sm text-gray-600">
                        Already have an account? <Link to="/login" className="text-blue-600 font-semibold hover:underline">Login</Link>
                    </p>
                </div>
            </div>
        </PageTransition>
    );
}
