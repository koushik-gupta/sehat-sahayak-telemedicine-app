import React, { useState, useEffect } from 'react';
import { ChevronLeft, Calendar, User, Clock, Video, AlertCircle, Search, Filter } from 'lucide-react';
import { getGlassCardClass, getGlassPanelClass, useDashboardTheme } from '../DashboardThemeContext';

const MyConsultationsScreen = ({ onSelectAppointment, onBack, t }) => {
    const { isDark } = useDashboardTheme();
    const glassPanelClass = getGlassPanelClass(isDark);
    const glassCardClass = getGlassCardClass(isDark);
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // all, scheduled, completed

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await fetch('/api/v1/appointment/my-appointments', {
                    credentials: 'include'
                });
                if (!response.ok) {
                    let errorMsg = 'Failed to fetch appointments.';
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
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const formatTime = (dateString) => {
        const options = { hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleTimeString(undefined, options);
    };

    const getStatusStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return "bg-emerald-100 text-emerald-700 border-emerald-200";
            case 'scheduled': return "bg-blue-100 text-blue-700 border-blue-200";
            case 'cancelled': return "bg-red-100 text-red-700 border-red-200";
            default: return "bg-slate-100 text-slate-700 border-slate-200";
        }
    };

    const filteredAppointments = appointments.filter(apt => {
        if (filter === 'all') return true;
        return apt.status?.toLowerCase() === filter;
    });

    return (
        <div className="p-6 max-w-6xl mx-auto animation-fade-in space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className={`p-2.5 rounded-xl transition-colors shadow-sm ${isDark ? "border border-white/10 bg-white/8 text-slate-300 hover:bg-white/12" : "bg-white border border-slate-200 hover:bg-slate-50 text-slate-600"}`}
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className={`text-2xl font-bold ${isDark ? "text-slate-50" : "text-slate-800"}`}>{t.myConsultations || "My Consultations"}</h1>
                        <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>Manage your upcoming and past appointments</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    {['all', 'scheduled', 'completed'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${filter === f
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                    : isDark ? 'bg-white/8 text-slate-300 border border-white/10 hover:bg-white/12' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${isDark ? "bg-rose-500/12 border border-rose-300/20 text-rose-100" : "bg-red-50 border border-red-100 text-red-600"}`}>
                    <AlertCircle size={20} />
                    <p>{error}</p>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`rounded-3xl p-6 border shadow-sm animate-pulse ${isDark ? "bg-slate-900/72 border-white/10" : "bg-white border-slate-100"}`}>
                            <div className="flex gap-4 mb-4">
                                <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                                <div className="space-y-2 flex-1">
                                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                                </div>
                            </div>
                            <div className="h-10 bg-slate-200 rounded-xl mt-4"></div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && filteredAppointments.length === 0 && (
                <div className={`text-center py-16 rounded-3xl border border-dashed ${isDark ? "bg-slate-900/55 border-white/10" : "bg-white border-slate-200"}`}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? "bg-white/8 text-slate-500" : "bg-slate-50 text-slate-300"}`}>
                        <Calendar size={32} />
                    </div>
                    <h3 className={`text-lg font-bold mb-1 ${isDark ? "text-slate-100" : "text-slate-800"}`}>No Appointments Found</h3>
                    <p className={isDark ? "text-slate-300" : "text-slate-500"}>
                        {filter === 'all'
                            ? (t.noAppointments || "You don't have any appointments yet.")
                            : `No ${filter} appointments found.`}
                    </p>
                </div>
            )}

            {/* Appointments Grid */}
            {!isLoading && !error && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAppointments.map(apt => (
                        <div key={apt.id} className={`rounded-3xl p-6 border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden ${isDark ? "bg-slate-900/72 border-white/10" : "bg-white border-slate-100"}`}>
                            {/* Status Badge */}
                            <div className="absolute top-6 right-6">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide ${getStatusStyle(apt.status)}`}>
                                    {apt.status}
                                </span>
                            </div>

                            <div className="flex items-start gap-4 mb-6">
                                <div className={`w-14 h-14 rounded-2xl text-blue-600 flex items-center justify-center text-xl font-bold shrink-0 ${isDark ? "bg-blue-500/10 border border-blue-300/20" : "bg-blue-50 border border-blue-100"}`}>
                                    Dr
                                </div>
                                <div className="pr-20">
                                    <h3 className={`font-bold text-lg line-clamp-1 ${isDark ? "text-slate-100" : "text-slate-800"}`}>Dr. {apt.doctor_name}</h3>
                                    <p className={`text-sm mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>General Physician</p>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className={`flex items-center gap-3 p-3 rounded-xl border ${isDark ? "text-slate-300 bg-white/8 border-white/10" : "text-slate-600 bg-slate-50 border-slate-100"}`}>
                                    <Calendar size={18} className="text-blue-500" />
                                    <span className="font-medium">{formatDate(apt.appointment_datetime)}</span>
                                </div>
                                <div className={`flex items-center gap-3 p-3 rounded-xl border ${isDark ? "text-slate-300 bg-white/8 border-white/10" : "text-slate-600 bg-slate-50 border-slate-100"}`}>
                                    <Clock size={18} className="text-indigo-500" />
                                    <span className="font-medium">{formatTime(apt.appointment_datetime)}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => onSelectAppointment(apt)}
                                disabled={apt.status === 'pending' || apt.status === 'completed' || apt.status === 'cancelled'}
                                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                                 apt.status === 'scheduled' || apt.status === 'approved'
                                 ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
                                 : isDark
                                 ? 'bg-white/8 text-slate-500 cursor-not-allowed'
                                 : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                 }`}
                            >
                                <Video size={18} />
                                {t.goToCall || "Join Consultation"}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyConsultationsScreen;
