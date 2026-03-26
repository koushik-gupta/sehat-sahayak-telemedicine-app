import React, { useState, useEffect } from 'react';
import { Clock, Save, RefreshCw } from 'lucide-react';

const AvailabilityScheduler = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const [schedule, setSchedule] = useState(
        days.map(day => ({ day, start: '09:00', end: '17:00', enabled: true }))
    );
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchAvailability();
    }, []);

    const fetchAvailability = async () => {
        try {
            const response = await fetch('/api/v1/doctor/availability');
            if (response.ok) {
                const data = await response.json();
                if (data.length > 0) {
                    // Merge fetched data with default structure
                    const newSchedule = days.map(day => {
                        const found = data.find(d => d.day_of_week === day);
                        if (found) {
                            return {
                                day,
                                start: found.start_time.slice(0, 5),
                                end: found.end_time.slice(0, 5),
                                enabled: !!found.is_available
                            };
                        }
                        return { day, start: '09:00', end: '17:00', enabled: false };
                    });
                    setSchedule(newSchedule);
                }
            }
        } catch (error) {
            console.error("Failed to fetch schedule", error);
        }
    };

    const handleChange = (index, field, value) => {
        const newSchedule = [...schedule];
        newSchedule[index][field] = value;
        setSchedule(newSchedule);
    };

    const handleSave = async () => {
        setLoading(true);
        setMessage('');
        try {
            const payload = schedule.filter(s => s.enabled);
            const response = await fetch('/api/v1/doctor/availability', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setMessage({ type: 'success', text: 'Schedule saved successfully!' });
            } else {
                setMessage({ type: 'error', text: 'Failed to save schedule.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error occurred.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 animation-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Availability Schedule</h2>
                    <p className="text-slate-500">Set your weekly recurring working hours.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all disabled:opacity-70"
                >
                    {loading ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                    Save Changes
                </button>
            </div>

            {message && (
                <div className={`p-4 mb-6 rounded-xl ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="space-y-4">
                {schedule.map((slot, index) => (
                    <div key={slot.day} className={`p-4 rounded-xl border transition-all ${slot.enabled ? 'bg-white border-slate-200' : 'bg-slate-50 border-transparent opacity-60'}`}>
                        <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
                            <div className="flex items-center gap-3 w-40">
                                <input
                                    type="checkbox"
                                    checked={slot.enabled}
                                    onChange={(e) => handleChange(index, 'enabled', e.target.checked)}
                                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                                <span className="font-bold text-slate-700">{slot.day}</span>
                            </div>

                            {slot.enabled && (
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                                        <Clock size={16} className="text-slate-400" />
                                        <input
                                            type="time"
                                            value={slot.start}
                                            onChange={(e) => handleChange(index, 'start', e.target.value)}
                                            className="bg-transparent outline-none font-medium text-slate-700"
                                        />
                                    </div>
                                    <span className="text-slate-400 font-medium">to</span>
                                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                                        <Clock size={16} className="text-slate-400" />
                                        <input
                                            type="time"
                                            value={slot.end}
                                            onChange={(e) => handleChange(index, 'end', e.target.value)}
                                            className="bg-transparent outline-none font-medium text-slate-700"
                                        />
                                    </div>
                                </div>
                            )}

                            {!slot.enabled && <span className="text-slate-400 italic text-sm">Unavailable</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AvailabilityScheduler;
