import React, { useState, useEffect } from 'react';
import { Users, Calendar, DollarSign, Star } from 'lucide-react';

const AnalyticsDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/v1/doctor/stats');
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="p-8 text-center text-slate-500">Loading analytics...</div>;
    if (!stats) return <div className="p-8 text-center text-red-500">Failed to load analytics.</div>;

    const trends = stats.charts?.trends || [];
    const demographics = stats.charts?.demographics || [];

    return (
        <div className="space-y-6 animation-fade-in pb-10">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Practice Analytics</h2>
                <p className="text-slate-500">Insights into your consultations and earnings.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<Users size={24} />}
                    label="Total Patients"
                    value={stats.total_patients}
                    color="blue"
                />
                <StatCard
                    icon={<Calendar size={24} />}
                    label="Appointments (This Month)"
                    value={stats.appointments_this_month}
                    color="indigo"
                />
                <StatCard
                    icon={<DollarSign size={24} />}
                    label="Estimated Earnings"
                    value={`Rs ${stats.total_earnings}`}
                    color="emerald"
                />
                <StatCard
                    icon={<Star size={24} />}
                    label="Patient Rating"
                    value={stats.rating}
                    color="amber"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {/* Appointment Trends Chart */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Appointment Trends</h3>
                    <div className="flex-1 min-h-[250px] flex items-end justify-center">
                        <SimpleBarChart data={trends} />
                    </div>
                </div>

                {/* Patient Demographics Chart */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Patient Gender Demographics</h3>
                    <div className="flex-1 min-h-[250px] flex items-center justify-center">
                        <SimpleDonutChart data={demographics} />
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Helper Components ---

const StatCard = ({ icon, label, value, color }) => {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600",
        indigo: "bg-indigo-50 text-indigo-600",
        emerald: "bg-emerald-50 text-emerald-600",
        amber: "bg-amber-50 text-amber-600",
    };

    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${colorClasses[color]}`}>
                    {icon}
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-400 uppercase">{label}</p>
                    <h3 className="text-2xl font-extrabold text-slate-800">{value}</h3>
                </div>
            </div>
        </div>
    );
};

const SimpleBarChart = ({ data }) => {
    if (!data || data.length === 0) return <div className="text-slate-400">No data available</div>;

    const maxVal = Math.max(...data.map(d => d.value), 10); // Ensure at least scale of 10
    const height = 200;
    const width = 300;
    const barWidth = 30;
    const gap = (width - (data.length * barWidth)) / (data.length + 1);

    return (
        <svg viewBox={`0 0 ${width} ${height + 30}`} className="w-full h-full max-h-[250px]">
            {/* Grid lines */}
            <line x1="0" y1={height} x2={width} y2={height} stroke="#e2e8f0" strokeWidth="1" />
            <line x1="0" y1={0} x2={width} y2={0} stroke="#f1f5f9" strokeDasharray="4" />
            <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#f1f5f9" strokeDasharray="4" />

            {data.map((d, i) => {
                const barHeight = (d.value / maxVal) * height;
                const x = gap + (i * (barWidth + gap));
                const y = height - barHeight;
                return (
                    <g key={i} className="group cursor-pointer">
                        <rect
                            x={x}
                            y={y}
                            width={barWidth}
                            height={barHeight}
                            fill="#3b82f6"
                            rx="4"
                            className="transition-all hover:opacity-80"
                        />
                        <text
                            x={x + barWidth / 2}
                            y={height + 20}
                            textAnchor="middle"
                            fontSize="12"
                            fill="#64748b"
                            className="font-medium"
                        >
                            {d.label}
                        </text>
                        {/* Tooltip value on hover (simplified as text above bar) */}
                        <text
                            x={x + barWidth / 2}
                            y={y - 5}
                            textAnchor="middle"
                            fontSize="12"
                            fill="#1e293b"
                            className="font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            {d.value}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
};

const SimpleDonutChart = ({ data }) => {
    if (!data || data.length === 0) return <div className="text-slate-400">No data available</div>;

    const total = data.reduce((sum, d) => sum + d.value, 0);
    let cumulativePercent = 0;

    const getCoordinatesForPercent = (percent) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    const colors = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

    return (
        <div className="flex items-center gap-8">
            <div className="relative w-40 h-40">
                <svg viewBox="-1 -1 2 2" className="transform -rotate-90 w-full h-full">
                    {data.map((d, i) => {
                        const startPercent = cumulativePercent;
                        const slicePercent = d.value / total;
                        cumulativePercent += slicePercent;

                        const [startX, startY] = getCoordinatesForPercent(startPercent);
                        const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
                        const largeArcFlag = slicePercent > 0.5 ? 1 : 0;

                        // Don't draw if 0
                        if (slicePercent === 0) return null;

                        // Full circle case
                        if (slicePercent === 1) {
                            return <circle key={i} cx="0" cy="0" r="0.8" fill="transparent" stroke={colors[i % colors.length]} strokeWidth="0.4" />;
                        }

                        const pathData = [
                            `M ${startX} ${startY}`,
                            `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                            `L 0 0`,
                        ].join(' ');

                        return (
                            <path
                                key={i}
                                d={pathData}
                                fill={colors[i % colors.length]}
                                className="transition-all hover:scale-105 origin-center"
                            />
                        );
                    })}
                    {/* Inner circle for Donut effect */}
                    <circle cx="0" cy="0" r="0.6" fill="white" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-2xl font-bold text-slate-800">{total}</span>
                    <span className="text-xs text-slate-500 font-bold uppercase">Patients</span>
                </div>
            </div>

            {/* Legend */}
            <div className="space-y-3">
                {data.map((d, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[i % colors.length] }}></span>
                        <div>
                            <p className="text-sm font-bold text-slate-700">{d.label}</p>
                            <p className="text-xs text-slate-500">{((d.value / total) * 100).toFixed(1)}%</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
