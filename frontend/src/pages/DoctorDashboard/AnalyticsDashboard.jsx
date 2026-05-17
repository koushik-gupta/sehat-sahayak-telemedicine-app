import React, { useEffect, useState } from "react";
import { motion as Motion } from "framer-motion";
import { Calendar, DollarSign, Star, TrendingUp, Users } from "lucide-react";
import { getGlassCardClass, getGlassPanelClass, useDashboardTheme } from "../Dashboard/DashboardThemeContext";

const AnalyticsDashboard = ({ t }) => {
  const { isDark } = useDashboardTheme();
  const glassPanelClass = getGlassPanelClass(isDark);
  const glassCardClass = getGlassCardClass(isDark);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/v1/doctor/stats");
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

  if (loading) return <div className={`rounded-[34px] p-10 text-center ${glassPanelClass}`}>{t.analytics.loading}</div>;
  if (!stats) return <div className={`rounded-[34px] p-10 text-center text-red-500 ${glassPanelClass}`}>{t.analytics.failed}</div>;

  const trends = stats.charts?.trends || [];
  const demographics = stats.charts?.demographics || [];
  const statCards = [
    { icon: Users, label: t.analytics.totalPatients, value: stats.total_patients, detail: t.analytics.lifetimeReach },
    { icon: Calendar, label: t.analytics.completed, value: stats.appointments_this_month, detail: t.analytics.thisMonth },
    { icon: DollarSign, label: t.analytics.revenue, value: `Rs ${stats.total_earnings}`, detail: t.analytics.estimatedEarnings },
    { icon: Star, label: t.analytics.satisfaction, value: stats.rating, detail: t.analytics.patientRating },
  ];

  return (
    <div className="doctor-page space-y-6 pb-10">
      <section className={`rounded-[34px] p-6 md:p-8 ${glassPanelClass}`}>
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${isDark ? "text-slate-400" : "text-slate-400"}`}>{t.analytics.intelligence}</p>
            <h2 className={`mt-2 text-3xl font-bold ${isDark ? "text-slate-50" : "text-slate-900"}`}>{t.analytics.title}</h2>
            <p className={`mt-2 max-w-2xl ${isDark ? "text-slate-300" : "text-slate-500"}`}>{t.analytics.description}</p>
          </div>
          <div className={`rounded-2xl border px-4 py-2 text-sm font-bold ${isDark ? "border-emerald-400/15 bg-emerald-400/10 text-emerald-200" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
            {t.analytics.weeklyTrend}
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card, index) => (
          <Motion.div key={card.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} whileHover={{ y: -4, scale: 1.01 }} className={`rounded-[30px] p-5 ${glassCardClass}`}>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[20px] bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-500 text-white shadow-[0_18px_42px_-24px_rgba(37,99,235,0.9)]">
              <card.icon size={22} />
            </div>
            <p className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${isDark ? "text-slate-400" : "text-slate-400"}`}>{card.label}</p>
            <h3 className={`mt-2 text-3xl font-extrabold ${isDark ? "text-slate-50" : "text-slate-900"}`}>{card.value}</h3>
            <p className={`mt-1 text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>{card.detail}</p>
          </Motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className={`rounded-[34px] p-6 ${glassPanelClass}`}>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className={`text-xl font-bold ${isDark ? "text-slate-50" : "text-slate-900"}`}>{t.analytics.consultationGrowth}</h3>
              <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{t.analytics.weeklyAppointmentTrend}</p>
            </div>
            <TrendingUp className="text-cyan-500" />
          </div>
          <div className="min-h-[280px]">
            <SimpleBarChart data={trends} isDark={isDark} t={t} />
          </div>
        </div>

        <div className={`rounded-[34px] p-6 ${glassPanelClass}`}>
          <div className="mb-6">
            <h3 className={`text-xl font-bold ${isDark ? "text-slate-50" : "text-slate-900"}`}>{t.analytics.patientMix}</h3>
            <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{t.analytics.demographicDistribution}</p>
          </div>
          <div className="min-h-[280px]">
            <SimpleDonutChart data={demographics} isDark={isDark} t={t} />
          </div>
        </div>
      </div>
    </div>
  );
};

const SimpleBarChart = ({ data, isDark, t }) => {
  if (!data || data.length === 0) return <div className={isDark ? "text-slate-400" : "text-slate-500"}>{t.analytics.noData}</div>;

  const maxVal = Math.max(...data.map((d) => d.value), 10);
  const height = 210;
  const width = 360;
  const barWidth = 34;
  const gap = (width - data.length * barWidth) / (data.length + 1);

  return (
    <svg viewBox={`0 0 ${width} ${height + 34}`} className="h-full max-h-[300px] w-full">
      <defs>
        <linearGradient id="doctorBars" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="55%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      <line x1="0" y1={height} x2={width} y2={height} stroke={isDark ? "#334155" : "#e2e8f0"} strokeWidth="1" />
      <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke={isDark ? "#1e293b" : "#f1f5f9"} strokeDasharray="4" />

      {data.map((d, i) => {
        const barHeight = (d.value / maxVal) * height;
        const x = gap + i * (barWidth + gap);
        const y = height - barHeight;
        return (
          <g key={d.label || i} className="group cursor-pointer">
            <rect x={x} y={y} width={barWidth} height={barHeight} fill="url(#doctorBars)" rx="10" className="transition-all group-hover:opacity-80" />
            <text x={x + barWidth / 2} y={height + 23} textAnchor="middle" fontSize="12" fill={isDark ? "#94a3b8" : "#64748b"} className="font-medium">
              {d.label}
            </text>
            <text x={x + barWidth / 2} y={y - 8} textAnchor="middle" fontSize="12" fill={isDark ? "#e2e8f0" : "#1e293b"} className="font-bold opacity-0 transition-opacity group-hover:opacity-100">
              {d.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const SimpleDonutChart = ({ data, isDark, t }) => {
  if (!data || data.length === 0) return <div className={isDark ? "text-slate-400" : "text-slate-500"}>{t.analytics.noData}</div>;

  const total = data.reduce((sum, d) => sum + d.value, 0);
  let cumulativePercent = 0;
  const colors = ["#22d3ee", "#6366f1", "#f59e0b", "#10b981", "#3b82f6"];

  const getCoordinatesForPercent = (percent) => [Math.cos(2 * Math.PI * percent), Math.sin(2 * Math.PI * percent)];

  return (
    <div className="flex flex-col items-center gap-8 sm:flex-row">
      <div className="relative h-44 w-44">
        <svg viewBox="-1 -1 2 2" className="h-full w-full -rotate-90">
          {data.map((d, i) => {
            const startPercent = cumulativePercent;
            const slicePercent = total > 0 ? d.value / total : 0;
            cumulativePercent += slicePercent;
            if (slicePercent === 0) return null;
            if (slicePercent === 1) return <circle key={d.label || i} cx="0" cy="0" r="0.8" fill="transparent" stroke={colors[i % colors.length]} strokeWidth="0.4" />;

            const [startX, startY] = getCoordinatesForPercent(startPercent);
            const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
            const largeArcFlag = slicePercent > 0.5 ? 1 : 0;
            const pathData = [`M ${startX} ${startY}`, `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`, "L 0 0"].join(" ");

            return <path key={d.label || i} d={pathData} fill={colors[i % colors.length]} className="origin-center transition-all hover:scale-105" />;
          })}
          <circle cx="0" cy="0" r="0.58" fill={isDark ? "#0f172a" : "white"} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${isDark ? "text-slate-50" : "text-slate-800"}`}>{total}</span>
          <span className={`text-xs font-bold uppercase ${isDark ? "text-slate-400" : "text-slate-500"}`}>{t.analytics.patients}</span>
        </div>
      </div>

      <div className="space-y-3">
        {data.map((d, i) => (
          <div key={d.label || i} className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
            <div>
              <p className={`text-sm font-bold ${isDark ? "text-slate-200" : "text-slate-700"}`}>{d.label}</p>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{total ? ((d.value / total) * 100).toFixed(1) : 0}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
