import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, User, AlertCircle } from 'lucide-react';

const UpcomingConsultations = ({ onStartCall, t }) => {
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await fetch('/api/v1/appointment/my-appointments', {
                    credentials: 'include'
                });
                if (!response.ok) {
                    let errorMsg = 'Failed to fetch schedule.';
                    try {
                        const errData = await response.json();
                        errorMsg = errData.error || errorMsg;
                    } catch (_) { }
                    throw new Error(errorMsg);
                }
                const data = await response.json();
                setAppointments(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAppointments();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString(undefined, {
            hour: '2-digit', minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                <p className="font-medium animate-pulse">Loading schedule...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 border border-red-200 rounded-2xl flex flex-col items-center text-center">
                <AlertCircle className="text-red-500 mb-2" size={32} />
                <h3 className="text-red-800 font-bold text-lg">Failed to load schedule</h3>
                <p className="text-red-600 max-w-md">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-lg transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animation-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">{t.todaySchedule || "Today's Schedule"}</h2>
                    <p className="text-slate-500">Manage your upcoming appointments and consultations.</p>
                </div>
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-bold text-sm">
                    {appointments.length} Upcoming
                </div>
            </div>

            {appointments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Calendar size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700">No appointments today</h3>
                    <p className="text-slate-500 max-w-sm text-center mt-1">You don't have any consultations scheduled for today. Enjoy your free time!</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {appointments.map(apt => (
                        <div key={apt.id} className="group bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <User size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">{apt.patient_name}</h3>
                                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm font-medium text-slate-500">
                                        <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
                                            <Calendar size={14} className="text-slate-400" />
                                            {formatDate(apt.appointment_datetime)}
                                        </span>
                                        <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
                                            <Clock size={14} className="text-slate-400" />
                                            {formatTime(apt.appointment_datetime)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all whitespace-nowrap"
                                onClick={() => onStartCall(apt)}
                            >
                                <Video size={18} />
                                {t.startCall || "Start Call"}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UpcomingConsultations;