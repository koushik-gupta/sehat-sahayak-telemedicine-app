import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion as Motion } from "framer-motion";
import { Clock, Coffee, RefreshCw, Save, Wifi } from "lucide-react";
import { getGlassCardClass, getGlassPanelClass, useDashboardTheme } from "../Dashboard/DashboardThemeContext";

const AvailabilityScheduler = ({ t }) => {
  const { isDark } = useDashboardTheme();
  const glassPanelClass = getGlassPanelClass(isDark);
  const glassCardClass = getGlassCardClass(isDark);
  const days = useMemo(() => ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], []);
  const [schedule, setSchedule] = useState(days.map((day) => ({ day, start: "09:00", end: "17:00", enabled: true })));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchAvailability = useCallback(async () => {
    try {
      const response = await fetch("/api/v1/doctor/availability");
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          const newSchedule = days.map((day) => {
            const found = data.find((d) => d.day_of_week === day);
            if (found) {
              return {
                day,
                start: found.start_time.slice(0, 5),
                end: found.end_time.slice(0, 5),
                enabled: !!found.is_available,
              };
            }
            return { day, start: "09:00", end: "17:00", enabled: false };
          });
          setSchedule(newSchedule);
        }
      }
    } catch (error) {
      console.error(t.availability.fetchFailed, error);
    }
  }, [days]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const handleChange = (index, field, value) => {
    const newSchedule = [...schedule];
    newSchedule[index][field] = value;
    setSchedule(newSchedule);
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage("");
    try {
      const payload = schedule.filter((s) => s.enabled);
      const response = await fetch("/api/v1/doctor/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setMessage({ type: "success", text: t.availability.saved });
      } else {
        setMessage({ type: "error", text: t.availability.saveFailed });
      }
    } catch {
      setMessage({ type: "error", text: t.availability.networkError });
    } finally {
      setLoading(false);
    }
  };

  const enabledDays = useMemo(() => schedule.filter((slot) => slot.enabled).length, [schedule]);

  return (
    <div className="doctor-page space-y-6">
      <section className={`rounded-[34px] p-6 md:p-8 ${glassPanelClass}`}>
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${isDark ? "text-slate-400" : "text-slate-400"}`}>{t.availability.planner}</p>
            <h2 className={`mt-2 text-3xl font-bold ${isDark ? "text-slate-50" : "text-slate-900"}`}>{t.availability.weeklySchedule}</h2>
            <p className={`mt-2 ${isDark ? "text-slate-300" : "text-slate-500"}`}>{t.availability.description}</p>
          </div>
          <button onClick={handleSave} disabled={loading} className="doctor-gradient-button flex items-center gap-2 px-6 py-3 font-bold disabled:opacity-70">
            <span className="relative flex items-center gap-2">
              {loading ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
              {t.availability.saveChanges}
            </span>
          </button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {[
            { label: t.availability.activeDays, value: enabledDays, icon: Wifi },
            { label: t.availability.defaultStart, value: "09:00", icon: Clock },
            { label: t.availability.breakBuffer, value: "30 min", icon: Coffee },
          ].map((item, index) => (
            <Motion.div key={item.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className={`rounded-[26px] p-4 ${glassCardClass}`}>
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-[18px] bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-500 text-white">
                <item.icon size={18} />
              </div>
              <p className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${isDark ? "text-slate-400" : "text-slate-400"}`}>{item.label}</p>
              <p className={`mt-2 text-2xl font-bold ${isDark ? "text-slate-50" : "text-slate-900"}`}>{item.value}</p>
            </Motion.div>
          ))}
        </div>
      </section>

      {message && (
        <div className={`rounded-[24px] border p-4 font-semibold ${message.type === "success" ? (isDark ? "border-green-400/20 bg-green-400/10 text-green-100" : "border-green-100 bg-green-50 text-green-700") : (isDark ? "border-red-400/20 bg-red-400/10 text-red-100" : "border-red-100 bg-red-50 text-red-700")}`}>
          {message.text}
        </div>
      )}

      <div className="grid gap-4">
        {schedule.map((slot, index) => (
          <Motion.div
            key={slot.day}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            whileHover={{ y: -3 }}
            className={`rounded-[30px] border p-5 transition-all ${slot.enabled ? (isDark ? "border-white/10 bg-slate-950/48" : "border-slate-200/90 bg-white/92") : (isDark ? "border-white/8 bg-white/5 opacity-70" : "border-transparent bg-white/55 opacity-70")} backdrop-blur-2xl`}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className="flex min-w-[12rem] items-center gap-4">
                <button
                  type="button"
                  onClick={() => handleChange(index, "enabled", !slot.enabled)}
                  className={`doctor-switch ${slot.enabled ? "bg-gradient-to-r from-cyan-400 to-blue-600" : isDark ? "bg-white/12" : "bg-slate-200"}`}
                  data-checked={slot.enabled}
                >
                  <span />
                </button>
                <div>
                  <p className={`font-bold ${isDark ? "text-slate-50" : "text-slate-800"}`}>{t.availability.days[index] || slot.day}</p>
                  <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{slot.enabled ? t.availability.availableForConsultations : t.availability.unavailable}</p>
                </div>
              </div>

              {slot.enabled ? (
                <div className="flex flex-1 flex-wrap items-center gap-3">
                  <TimeInput value={slot.start} onChange={(value) => handleChange(index, "start", value)} />
                  <span className={isDark ? "text-slate-500" : "text-slate-400"}>{t.availability.to}</span>
                  <TimeInput value={slot.end} onChange={(value) => handleChange(index, "end", value)} />
                  <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${isDark ? "bg-cyan-400/10 text-cyan-200" : "bg-cyan-50 text-cyan-700"}`}>{t.availability.videoChat}</span>
                  <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${isDark ? "bg-amber-400/10 text-amber-200" : "bg-amber-50 text-amber-700"}`}>{t.availability.breaksAutoBuffered}</span>
                </div>
              ) : (
                <span className={`text-sm italic ${isDark ? "text-slate-500" : "text-slate-400"}`}>{t.availability.noBookings}</span>
              )}
            </div>
          </Motion.div>
        ))}
      </div>
    </div>
  );
};

const TimeInput = ({ value, onChange }) => {
  const { isDark } = useDashboardTheme();
  return (
    <div className={`doctor-glass-field flex items-center gap-2 rounded-2xl border px-3 py-2 ${isDark ? "border-white/10 bg-white/8 focus-within:border-cyan-400/35" : "border-slate-200 bg-white focus-within:border-cyan-300"}`}>
      <Clock size={16} className={isDark ? "text-slate-400" : "text-slate-400"} />
      <input type="time" value={value} onChange={(event) => onChange(event.target.value)} className={`bg-transparent font-medium outline-none ${isDark ? "text-slate-100" : "text-slate-700"}`} />
    </div>
  );
};

export default AvailabilityScheduler;
