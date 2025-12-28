import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import { ThemeToggle } from '../components/ThemeToggle';
import { useToast } from '../context/ToastContext';
import { PageTransition } from '../components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';

interface Doctor {
    id: string;
    userId: string;
    specialization: string;
    bio: string;
    user: {
        name: string;
        email: string;
    };
}

interface Prescription {
    id: string;
    medications: string;
    instructions: string;
}

interface Appointment {
    id: string;
    date: string;
    rescheduledDate?: string;
    status: string;
    issue: string;
    doctor: {
        name: string;
        email: string;
        doctorProfile?: {
            specialization: string;
        }
    };
    prescription?: Prescription;
}

export default function PatientDashboard() {
    const { user, logout } = useAuth();
    const { success, error } = useToast();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);

    const [selectedDoctor, setSelectedDoctor] = useState<string>('');
    const [date, setDate] = useState('');
    const [issue, setIssue] = useState('');
    const [showBookingModal, setShowBookingModal] = useState(false);

    useEffect(() => {
        if (user) {
            fetchDoctors();
            fetchAppointments();
        }
    }, [user]);

    const fetchDoctors = async () => {
        try {
            const { data } = await api.get('/doctors');
            setDoctors(data);
        } catch (e) {
            console.error("Failed to fetch doctors", e);
        }
    };

    const fetchAppointments = async () => {
        try {
            const { data } = await api.get('/appointments');
            setAppointments(data);
        } catch (e) {
            console.error("Failed to fetch appointments", e);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            await api.patch(`/appointments/${id}/status`, { status });
            fetchAppointments();
            success(`Appointment ${status.toLowerCase()} successfully`);
        } catch (e) {
            console.error(e);
            error('Failed to update status');
        }
    };

    const handleBookAppointment = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const doctorProfile = doctors.find(d => d.userId === selectedDoctor);
            if (!doctorProfile) return;

            await api.post('/appointments', {
                doctorId: selectedDoctor,
                date,
                issue
            });
            setShowBookingModal(false);
            setIssue('');
            setDate('');
            setSelectedDoctor('');
            fetchAppointments();
            success('Appointment booked successfully!');
        } catch (e: any) {
            console.error(e);
            error(e.response?.data?.error || 'Failed to book appointment');
        }
    };

    return (
        <PageTransition>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 transition-colors duration-200">
                <div className="max-w-6xl mx-auto">
                    <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Patient Dashboard</h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back, <span className="font-semibold text-blue-600 dark:text-blue-400">{user?.name}</span></p>
                        </div>
                        <div className="flex gap-3 items-center">
                            <ThemeToggle />
                            <button onClick={logout} className="bg-white dark:bg-gray-800 border border-red-100 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 px-5 py-2 rounded-xl transition shadow-sm">
                                Sign Out
                            </button>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Main Content Area */}
                        <div className="md:col-span-2 space-y-8">

                            {/* Available Doctors Section */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                        Find a Doctor
                                    </h2>
                                    <button
                                        onClick={() => setShowBookingModal(true)}
                                        className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200 dark:shadow-none"
                                    >
                                        Book Appointment
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {doctors.map(doc => (
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            key={doc.id}
                                            className="p-5 border border-gray-100 dark:border-gray-700 rounded-xl hover:shadow-md transition bg-gray-50/50 dark:bg-gray-700/50"
                                        >
                                            <div className="font-bold text-lg text-gray-900 dark:text-white">{doc.user.name}</div>
                                            <div className="text-blue-600 dark:text-blue-400 text-sm font-medium mb-2">{doc.specialization}</div>
                                            <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2">{doc.bio || 'Experienced specialist available for consultation.'}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Appointments History */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors"
                            >
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">My Appointments</h2>
                                <div className="space-y-4">
                                    <AnimatePresence>
                                        {appointments.map(appt => (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                key={appt.id}
                                                className="border border-gray-100 dark:border-gray-700 rounded-xl p-5 hover:border-blue-200 dark:hover:border-blue-500 transition bg-white dark:bg-gray-800/50"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="font-bold text-lg text-gray-900 dark:text-white">Dr. {appt.doctor.name}</div>
                                                        <div className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-2 mt-1">
                                                            📅 {new Date(appt.date).toLocaleString()}
                                                        </div>
                                                        <div className="mt-3 text-gray-700 dark:text-gray-300 text-sm bg-gray-50 dark:bg-gray-700 p-2 rounded-lg inline-block">
                                                            <span className="font-medium">Reason:</span> {appt.issue}
                                                        </div>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                                        ${appt.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                                            appt.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                                appt.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-gray-100 text-gray-600'}`}>
                                                        {appt.status}
                                                    </span>
                                                </div>

                                                {/* Reschedule Comparison & Actions */}
                                                {appt.status === 'RESCHEDULED' && appt.rescheduledDate && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        className="mt-4 bg-orange-50 border border-orange-100 rounded-lg p-4"
                                                    >
                                                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                                            <div>
                                                                <p className="text-orange-800 font-medium text-sm">📅 New Proposed Time:</p>
                                                                <p className="text-orange-900 font-bold text-lg">
                                                                    {new Date(appt.rescheduledDate).toLocaleString()}
                                                                </p>
                                                                <p className="text-orange-600 text-xs mt-1">
                                                                    Original: {new Date(appt.date).toLocaleString()}
                                                                </p>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => updateStatus(appt.id, 'CONFIRMED')}
                                                                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition shadow-sm"
                                                                >
                                                                    Accept New Time
                                                                </button>
                                                                <button
                                                                    onClick={() => updateStatus(appt.id, 'REJECTED')}
                                                                    className="bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-50 transition"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}

                                                {/* Prescription Display */}
                                                {appt.prescription && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        className="mt-4 bg-blue-50/50 p-4 rounded-lg border border-blue-100"
                                                    >
                                                        <h4 className="font-bold text-blue-900 text-sm mb-3 flex items-center gap-2">
                                                            💊 Prescription
                                                        </h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="bg-white p-3 rounded-md shadow-sm">
                                                                <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Medications</span>
                                                                <p className="text-gray-800 text-sm whitespace-pre-line leading-relaxed">{appt.prescription.medications}</p>
                                                            </div>
                                                            {appt.prescription.instructions && (
                                                                <div className="bg-white p-3 rounded-md shadow-sm">
                                                                    <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Instructions</span>
                                                                    <p className="text-gray-800 text-sm leading-relaxed">{appt.prescription.instructions}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                    {appointments.length === 0 && (
                                        <p className="text-center text-gray-400 py-8 italic">No appointment history found.</p>
                                    )}
                                </div>
                            </motion.div>
                        </div>

                        {/* Sidebar / Quick Actions */}
                        <div className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg"
                            >
                                <h3 className="text-lg font-bold mb-2">Health Tips</h3>
                                <p className="text-blue-100 text-sm leading-relaxed">
                                    Remember to stay hydrated and take short breaks if you work at a desk frequently. Regular check-ups are key to prevention!
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Booking Modal */}
                <AnimatePresence>
                    {showBookingModal && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 transition-colors"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">New Appointment</h2>
                                    <button onClick={() => setShowBookingModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>
                                </div>
                                <form onSubmit={handleBookAppointment} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Select Specialist</label>
                                        <select
                                            value={selectedDoctor}
                                            onChange={e => setSelectedDoctor(e.target.value)}
                                            className="w-full border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-white rounded-xl focus:border-blue-500 focus:ring-blue-500 p-3 transition"
                                            required
                                        >
                                            <option value="">-- Choose a Doctor --</option>
                                            {doctors.map(doc => (
                                                <option key={doc.id} value={doc.userId}>
                                                    {doc.user.name} ({doc.specialization})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Date & Time</label>
                                        <input
                                            type="datetime-local"
                                            min={new Date().toISOString().slice(0, 16)}
                                            value={date}
                                            onChange={e => setDate(e.target.value)}
                                            className="w-full border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-white rounded-xl focus:border-blue-500 focus:ring-blue-500 p-3 transition"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Reason for Visit</label>
                                        <textarea
                                            value={issue}
                                            onChange={e => setIssue(e.target.value)}
                                            className="w-full border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-white rounded-xl focus:border-blue-500 focus:ring-blue-500 p-3 transition resize-none"
                                            placeholder="Describe your symptoms..."
                                            rows={3}
                                            required
                                        />
                                    </div>

                                    <div className="flex gap-3 justify-end pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowBookingModal(false)}
                                            className="px-5 py-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition font-medium"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200"
                                        >
                                            Confirm Booking
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </PageTransition>
    );
}
