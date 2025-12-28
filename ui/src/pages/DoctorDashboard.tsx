import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import { ThemeToggle } from '../components/ThemeToggle';
import { useToast } from '../context/ToastContext';
import { PageTransition } from '../components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';

interface Appointment {
    id: string;
    date: string;
    status: string;
    issue: string;
    patient: {
        name: string;
        email: string;
    };
}

export default function DoctorDashboard() {
    const { user, logout } = useAuth();
    const { success, error } = useToast();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [showPrescribeModal, setShowPrescribeModal] = useState(false);
    const [selectedAppt, setSelectedAppt] = useState<string | null>(null);
    const [meds, setMeds] = useState('');
    const [instructions, setInstructions] = useState('');

    const [specialization, setSpecialization] = useState('');
    const [bio, setBio] = useState('');
    const [editingProfile, setEditingProfile] = useState(false);

    useEffect(() => {
        if (user) {
            fetchAppointments();
            fetchProfile();
        }
    }, [user]);

    const fetchAppointments = async () => {
        try {
            const { data } = await api.get('/appointments');
            setAppointments(data);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchProfile = async () => {
        if (!user) return;
        try {
            const { data } = await api.get(`/doctors/${user.id}`);
            setSpecialization(data.specialization);
            setBio(data.bio || '');
        } catch (e) {
            console.error(e);
        }
    }

    const updateStatus = async (id: string, status: string) => {
        try {
            await api.patch(`/appointments/${id}/status`, { status });
            fetchAppointments();
            success('Status updated successfully');
        } catch (e) {
            console.error(e);
            error('Failed to update status');
        }
    };

    const handlePrescribe = (apptId: string) => {
        setSelectedAppt(apptId);
        setShowPrescribeModal(true);
    };

    const submitPrescription = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAppt) return;
        try {
            await api.post('/prescriptions', {
                appointmentId: selectedAppt,
                medications: meds,
                instructions
            });
            setShowPrescribeModal(false);
            setMeds('');
            setInstructions('');
            setMeds('');
            setInstructions('');
            fetchAppointments();
            success('Prescription sent successfully!');
        } catch (e) {
            console.error(e);
            error('Failed to send prescription');
        }
    };

    const saveProfile = async () => {
        try {
            await api.patch('/doctors/profile', { specialization, bio });
            setEditingProfile(false);
            success('Profile updated successfully');
        } catch (e) {
            console.error(e);
            error('Profile update failed');
        }
    }

    // Reschedule State
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [rescheduleDate, setRescheduleDate] = useState('');

    const handleRescheduleClick = (apptId: string) => {
        setSelectedAppt(apptId);
        setShowRescheduleModal(true);
    };

    const submitReschedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAppt) return;
        try {
            await api.patch(`/appointments/${selectedAppt}/status`, {
                status: 'RESCHEDULED',
                date: rescheduleDate
            });
            setShowRescheduleModal(false);
            setRescheduleDate('');
            fetchAppointments();
            success('Reschedule request sent successfully');
        } catch (e) {
            console.error(e);
            error('Failed to reschedule');
        }
    };

    return (
        <PageTransition>
            <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
                {/* ... existing header ... */}
                <div className="max-w-7xl mx-auto">
                    <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Medical Dashboard</h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">Hello, <span className="font-semibold text-blue-600 dark:text-blue-400">Dr. {user?.name}</span></p>
                        </div>
                        <div className="flex gap-3 items-center">
                            <ThemeToggle />
                            <button onClick={() => setEditingProfile(!editingProfile)} className="bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm">
                                {editingProfile ? 'Cancel Edit' : 'Edit Profile'}
                            </button>
                            <button onClick={logout} className="bg-red-500 text-white font-medium px-4 py-2 rounded-xl hover:bg-red-600 transition shadow-lg shadow-red-200 dark:shadow-none">Logout</button>
                        </div>
                    </header>

                    {/* ... existing profile edit ... */}
                    <AnimatePresence>
                        {editingProfile && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden mb-8"
                            >
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
                                    <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Professional Profile</h2>
                                    <div className="space-y-4 max-w-2xl">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">Specialization</label>
                                            <input value={specialization} onChange={e => setSpecialization(e.target.value)} className="w-full border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-white p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">Bio / Availability Notes</label>
                                            <textarea value={bio} onChange={e => setBio(e.target.value)} className="w-full border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-white p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" rows={3} />
                                        </div>
                                        <button onClick={saveProfile} className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-green-700 transition shadow-lg shadow-green-200 dark:shadow-none">Save Changes</button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors"
                    >
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Recent Appointments</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Patient</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Issue</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                                    {appointments.map(app => (
                                        <motion.tr
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            key={app.id}
                                            className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">{app.patient.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-300">{new Date(app.date).toLocaleString()}</td>
                                            <td className="px-6 py-4 text-gray-600 dark:text-gray-300 max-w-xs truncate" title={app.issue}>{app.issue}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full 
                                    ${app.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                                        app.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                            app.status === 'RESCHEDULED' ? 'bg-orange-100 text-orange-700' :
                                                                'bg-gray-100 text-gray-600'}`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                                                {app.status === 'PENDING' && (
                                                    <>
                                                        <button onClick={() => updateStatus(app.id, 'CONFIRMED')} className="text-green-600 hover:text-green-800 font-semibold">Accept</button>
                                                        <button onClick={() => updateStatus(app.id, 'REJECTED')} className="text-red-500 hover:text-red-700 font-semibold">Reject</button>
                                                        <button onClick={() => handleRescheduleClick(app.id)} className="text-orange-500 hover:text-orange-700 font-semibold">Reschedule</button>
                                                    </>
                                                )}
                                                {app.status === 'CONFIRMED' && (
                                                    <>
                                                        <button onClick={() => handleRescheduleClick(app.id)} className="text-orange-500 hover:text-orange-700 font-semibold">Reschedule</button>
                                                        <button onClick={() => handlePrescribe(app.id)} className="text-blue-600 hover:text-blue-800 font-semibold bg-blue-50 px-3 py-1 rounded-lg">Complete & Prescribe</button>
                                                    </>
                                                )}
                                                {app.status === 'RESCHEDULED' && (
                                                    <span className="text-gray-400 italic">Waiting for patient...</span>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                            {appointments.length === 0 && <p className="text-center p-8 text-gray-400 italic">No appointments found.</p>}
                        </div>
                    </motion.div>

                    {/* Reschedule Modal */}
                    <AnimatePresence>
                        {showRescheduleModal && (
                            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl max-w-sm w-full"
                                >
                                    <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Propose New Time</h3>
                                    <form onSubmit={submitReschedule} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">New Date & Time</label>
                                            <input
                                                type="datetime-local"
                                                min={new Date().toISOString().slice(0, 16)}
                                                value={rescheduleDate}
                                                onChange={e => setRescheduleDate(e.target.value)}
                                                className="w-full border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-white p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                                                required
                                            />
                                        </div>
                                        <div className="flex gap-3 justify-end pt-2">
                                            <button
                                                type="button"
                                                onClick={() => setShowRescheduleModal(false)}
                                                className="px-5 py-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-medium transition"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold shadow-lg shadow-blue-200"
                                            >
                                                Propose Time
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Prescription Modal */}
                    <AnimatePresence>
                        {showPrescribeModal && (
                            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl max-w-md w-full"
                                >
                                    <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Issue Prescription</h3>
                                    <form onSubmit={submitPrescription} className="space-y-4">
                                        {/* ... form fields same as before ... */}
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">Medications</label>
                                            <textarea
                                                value={meds}
                                                onChange={e => setMeds(e.target.value)}
                                                placeholder="List prescribed medications..."
                                                className="w-full border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-white p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                                                rows={3}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">Instructions / Dosage</label>
                                            <textarea
                                                value={instructions}
                                                onChange={e => setInstructions(e.target.value)}
                                                placeholder="e.g. Include frequency and duration"
                                                className="w-full border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-white p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                                                rows={3}
                                            />
                                        </div>
                                        <div className="flex gap-3 justify-end pt-2">
                                            <button
                                                type="button"
                                                onClick={() => setShowPrescribeModal(false)}
                                                className="px-5 py-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-medium transition"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold shadow-lg shadow-blue-200"
                                            >
                                                Submit & Complete
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </PageTransition>
    );
}
