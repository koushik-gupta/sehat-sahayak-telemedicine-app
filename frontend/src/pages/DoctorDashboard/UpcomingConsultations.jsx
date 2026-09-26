import React, { useEffect, useMemo, useState } from "react";
import { motion as Motion } from "framer-motion";
import {
  AlertCircle,
  Calendar,
  Check,
  Clock,
  FilePlus2,
  MessageSquareText,
  Settings,
  Stethoscope,
  TrendingUp,
  User,
  Users,
  Video,
  Wallet,
  X,
} from "lucide-react";
import { getGlassCardClass, getGlassPanelClass, useDashboardTheme } from "../Dashboard/DashboardThemeContext";

const cardMotion = {
  hidden: { opacity: 0, y: 16 },
  show: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: index * 0.06, duration: 0.32, ease: [0.22, 1, 0.36, 1] },
  }),
};

const UpcomingConsultations = ({ onStartCall, t, onNavigate }) => {
  const { isDark } = useDashboardTheme();
  const glassPanelClass = getGlassPanelClass(isDark);
  const glassCardClass = getGlassCardClass(isDark);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch("/api/v1/appointment/my-appointments", {
          credentials: "include",
        });
        if (!response.ok) {
          let errorMsg = t.schedule.fetchFailedDefault;
          try {
            const errData = await response.json();
            errorMsg = errData.error || errorMsg;
          } catch {
            errorMsg = t.schedule.fetchFailedDefault;
          }
          throw new Error(errorMsg);
        }
        const data = await response.json();
        setAppointments(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAppointments();
  }, []);
  const updateAppointmentStatus = async (appointmentId, status) => {
  try {
    setActionLoading(appointmentId);

    const response = await fetch(
      `/api/v1/appointment/${appointmentId}/${status}`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Failed to ${status} appointment.`);
    }

    setAppointments((prev) =>
      prev.map((appointment) =>
        appointment.id === appointmentId
          ? { ...appointment, status: status === "approve" ? "approved" : "rejected" }
          : appointment
      )
    );
  } catch (error) {
    console.error(`Failed to ${status} appointment:`, error);
    alert(error.message || `Failed to ${status} appointment.`);
  } finally {
    setActionLoading(null);
  }
};

  const normalizedAppointments = useMemo(
    () =>
      appointments
        .map((appointment) => ({
          ...appointment,
          dateValue: appointment.appointment_datetime ? new Date(appointment.appointment_datetime) : null,
        }))
        .filter((appointment) => appointment.dateValue && !Number.isNaN(appointment.dateValue.getTime()))
        .sort((a, b) => a.dateValue - b.dateValue),
    [appointments]
  );

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);

  const todayAppointments = normalizedAppointments.filter((apt) => apt.dateValue >= startOfToday && apt.dateValue < endOfToday);
  const weekAppointments = normalizedAppointments.filter((apt) => apt.dateValue >= startOfToday && apt.dateValue < endOfWeek);
  const completedCount = normalizedAppointments.filter((apt) => apt.status?.toLowerCase() === "completed").length;
  const estimatedRevenue = completedCount * 500;

  const stats = [
    { label: t.schedule.stats.todayAppointments, value: todayAppointments.length, detail: t.schedule.stats.consultationsScheduled, icon: Calendar, tone: "cyan" },
    { label: t.schedule.stats.upcomingThisWeek, value: weekAppointments.length, detail: t.schedule.stats.nextSevenDays, icon: Clock, tone: "blue" },
    { label: t.schedule.stats.patientsConsulted, value: completedCount, detail: t.schedule.stats.completedVisits, icon: Users, tone: "emerald" },
    { label: t.schedule.stats.revenue, value: `Rs ${estimatedRevenue}`, detail: t.schedule.stats.estimatedFromCompleted, icon: Wallet, tone: "amber" },
    { label: t.schedule.stats.onlineStatus, value: t.schedule.stats.live, detail: t.schedule.stats.readyForCalls, icon: TrendingUp, tone: "green" },
  ];

  const quickActions = [
    { label: t.schedule.actions.startInstantConsultation, icon: Video, onClick: () => normalizedAppointments[0] && onStartCall(normalizedAppointments[0]) },
    { label: t.schedule.actions.addPrescription, icon: FilePlus2, onClick: () => onNavigate?.("prescriptions") },
    { label: t.schedule.actions.viewPatients, icon: Users, onClick: () => onNavigate?.("patients") },
    { label: t.schedule.actions.availabilitySettings, icon: Settings, onClick: () => onNavigate?.("availability") },
    { label: t.schedule.actions.analytics, icon: TrendingUp, onClick: () => onNavigate?.("analytics") },
  ];

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatTime = (dateString) =>
    new Date(dateString).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });

  if (isLoading) {
    return (
      <div className={`flex min-h-[24rem] flex-col items-center justify-center rounded-[34px] ${glassPanelClass}`}>
        <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-cyan-500/25 border-t-cyan-500" />
        <p className={`font-medium ${isDark ? "text-slate-300" : "text-slate-500"}`}>{t.schedule.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center rounded-[34px] p-8 text-center ${glassPanelClass}`}>
        <AlertCircle className="mb-3 text-red-500" size={34} />
        <h3 className={`text-lg font-bold ${isDark ? "text-red-100" : "text-red-800"}`}>{t.schedule.failedTitle}</h3>
        <p className={`mt-1 max-w-md ${isDark ? "text-red-100/80" : "text-red-600"}`}>{error}</p>
        <button onClick={() => window.location.reload()} className="doctor-gradient-button mt-5 px-5 py-3 text-sm font-bold">
          <span className="relative">{t.schedule.retry}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="doctor-page space-y-7 pb-10">
      <Motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className={`hero-gradient-shell relative overflow-hidden rounded-[34px] p-6 md:p-8 ${glassPanelClass}`}>
        <div className="hero-grid-overlay absolute inset-0 opacity-45" />
        <div className="absolute -left-12 top-10 h-44 w-44 rounded-full bg-cyan-300/18 blur-3xl" />
        <div className="absolute right-4 top-0 h-40 w-40 rounded-full bg-indigo-400/16 blur-3xl" />

        <div className="relative grid gap-7 xl:grid-cols-[minmax(0,1.35fr)_360px]">
          <div>
            <div className={`mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] ${isDark ? "border-white/10 bg-white/8 text-slate-200" : "border-slate-200/90 bg-white/95 text-slate-600"}`}>
              <Stethoscope size={14} className="text-cyan-500" />
              {t.schedule.heroEyebrow}
            </div>
            <h2 className={`max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl ${isDark ? "text-slate-50" : "text-slate-900"}`}>
              {t.schedule.title}
            </h2>
            <p className={`mt-4 max-w-2xl text-base leading-7 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              {t.schedule.description}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {stats.map((stat, index) => (
                <Motion.div
                  key={stat.label}
                  custom={index}
                  variants={cardMotion}
                  initial="hidden"
                  animate="show"
                  whileHover={{ y: -4, scale: 1.01 }}
                  className={`rounded-[24px] p-4 ${glassCardClass}`}
                >
                  <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-[18px] bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-500 text-white shadow-[0_16px_36px_-22px_rgba(37,99,235,0.8)]`}>
                    <stat.icon size={18} />
                  </div>
                  <p className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${isDark ? "text-slate-400" : "text-slate-400"}`}>{stat.label}</p>
                  <p className={`mt-2 text-2xl font-semibold tracking-tight ${isDark ? "text-slate-50" : "text-slate-900"}`}>{stat.value}</p>
                  <p className={`mt-1 text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>{stat.detail}</p>
                </Motion.div>
              ))}
            </div>
          </div>

          <div className={`rounded-[30px] p-5 ${glassCardClass}`}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${isDark ? "text-slate-400" : "text-slate-400"}`}>{t.schedule.quickActions}</p>
                <h3 className={`mt-1 text-xl font-bold ${isDark ? "text-slate-50" : "text-slate-900"}`}>{t.schedule.clinicalTools}</h3>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isDark ? "bg-emerald-400/10 text-emerald-200" : "bg-emerald-50 text-emerald-700"}`}>{t.topbar.online}</span>
            </div>
            <div className="grid gap-3">
              {quickActions.map((action, index) => (
                <Motion.button
                  key={action.label}
                  custom={index}
                  variants={cardMotion}
                  initial="hidden"
                  animate="show"
                  whileHover={{ x: 4, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={action.onClick}
                  className="doctor-gradient-button flex items-center justify-between px-4 py-3 text-left text-sm font-bold"
                >
                  <span className="relative flex items-center gap-3">
                    <action.icon size={18} />
                    {action.label}
                  </span>
                </Motion.button>
              ))}
            </div>
          </div>
        </div>
      </Motion.section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_360px]">
        <section className={`rounded-[34px] p-5 md:p-6 ${glassPanelClass}`}>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className={`text-2xl font-bold ${isDark ? "text-slate-50" : "text-slate-900"}`}>{t.schedule.title}</h3>
              <p className={`mt-1 ${isDark ? "text-slate-300" : "text-slate-500"}`}>{t.schedule.premiumQueue}</p>
            </div>
            <div className={`w-fit rounded-2xl border px-4 py-2 text-sm font-bold ${isDark ? "border-white/10 bg-white/8 text-cyan-200" : "border-cyan-100 bg-cyan-50 text-cyan-700"}`}>
              {normalizedAppointments.length} {t.schedule.upcoming}
            </div>
          </div>

          {normalizedAppointments.length === 0 ? (
            <div className={`flex flex-col items-center justify-center rounded-[30px] border border-dashed p-12 text-center ${isDark ? "border-white/10 bg-white/6" : "border-slate-200 bg-white/78"}`}>
              <Calendar size={36} className={isDark ? "text-slate-500" : "text-slate-300"} />
              <h3 className={`mt-4 text-lg font-bold ${isDark ? "text-slate-100" : "text-slate-700"}`}>{t.schedule.noAppointmentsTitle}</h3>
              <p className={`mt-1 max-w-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{t.schedule.noAppointmentsText}</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {normalizedAppointments.map((apt, index) => (
                <AppointmentCard key={apt.id || `${apt.patient_name}-${apt.appointment_datetime}`} appointment={apt} index={index} onStartCall={onStartCall} onUpdateStatus={updateAppointmentStatus} actionLoading={actionLoading} formatDate={formatDate} formatTime={formatTime} t={t} />
              ))}
            </div>
          )}
        </section>

        <aside className={`doctor-schedule-rail relative rounded-[34px] p-5 ${glassPanelClass}`}>
          <div className="mb-5 pl-1">
            <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${isDark ? "text-slate-400" : "text-slate-400"}`}>{t.schedule.timeline}</p>
            <h3 className={`mt-1 text-xl font-bold ${isDark ? "text-slate-50" : "text-slate-900"}`}>{t.schedule.upcomingReminders}</h3>
          </div>
          <div className="space-y-4">
            {normalizedAppointments.slice(0, 5).map((apt, index) => (
              <Motion.div
                key={`${apt.id || apt.patient_name}-timeline`}
                custom={index}
                variants={cardMotion}
                initial="hidden"
                animate="show"
                className="relative flex gap-4 pl-11"
              >
                <span className="absolute left-[0.9rem] top-2 h-4 w-4 rounded-full border-4 border-white bg-cyan-500 shadow-[0_0_18px_rgba(34,211,238,0.75)]" />
                <div className={`flex-1 rounded-[24px] border p-4 ${isDark ? "border-white/10 bg-white/7" : "border-white/70 bg-white/80"}`}>
                  <p className={`text-sm font-bold ${isDark ? "text-slate-50" : "text-slate-900"}`}>{formatTime(apt.appointment_datetime)}</p>
                  <p className={`mt-1 text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>{apt.patient_name || t.schedule.patientConsultation}</p>
                </div>
              </Motion.div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};

const AppointmentCard = ({ appointment, index, onStartCall, onUpdateStatus, actionLoading, formatDate, formatTime, t }) => {
  const { isDark } = useDashboardTheme();
  const status = appointment.status || t.schedule.scheduled;
  const isUrgent = appointment.urgency?.toLowerCase?.().includes("urgent") || appointment.reason?.toLowerCase?.().includes("urgent");

  return (
    <Motion.div
      custom={index}
      variants={cardMotion}
      initial="hidden"
      animate="show"
      whileHover={{ y: -4, scale: 1.005 }}
      className={`group rounded-[28px] border p-4 shadow-[0_22px_55px_-34px_rgba(15,23,42,0.25)] transition-colors md:p-5 ${
        isDark ? "border-white/10 bg-slate-950/46 hover:border-cyan-300/20" : "border-slate-200/90 bg-white/92 hover:border-cyan-200"
      } backdrop-blur-2xl`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-500 text-white shadow-[0_18px_42px_-24px_rgba(37,99,235,0.9)]">
            <User size={24} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className={`truncate text-lg font-bold ${isDark ? "text-slate-50" : "text-slate-900"}`}>{appointment.patient_name || t.schedule.patient}</h3>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${isUrgent ? "bg-red-100 text-red-700" : isDark ? "bg-cyan-400/10 text-cyan-200" : "bg-cyan-50 text-cyan-700"}`}>
                {isUrgent ? t.schedule.urgent : t.schedule.routine}
              </span>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${isDark ? "bg-emerald-400/10 text-emerald-200" : "bg-emerald-50 text-emerald-700"}`}>{status}</span>
            </div>
            <div className={`mt-3 flex flex-wrap items-center gap-2 text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-500"}`}>
              <span className={`flex items-center gap-1 rounded-xl px-3 py-1.5 ${isDark ? "bg-white/8" : "bg-slate-50"}`}>
                <Calendar size={14} />
                {formatDate(appointment.appointment_datetime)}
              </span>
              <span className={`flex items-center gap-1 rounded-xl px-3 py-1.5 ${isDark ? "bg-white/8" : "bg-slate-50"}`}>
                <Clock size={14} />
                {formatTime(appointment.appointment_datetime)}
              </span>
              <span className={`flex items-center gap-1 rounded-xl px-3 py-1.5 ${isDark ? "bg-white/8" : "bg-slate-50"}`}>
                <Video size={14} />
                {appointment.consultation_type || t.schedule.video}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <button className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border ${isDark ? "border-white/10 bg-white/8 text-slate-200 hover:bg-white/12" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
            <MessageSquareText size={17} />
          </button>
          <button className={`rounded-2xl border px-4 py-2.5 text-sm font-bold ${isDark ? "border-white/10 bg-white/8 text-slate-200 hover:bg-white/12" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}>
            {t.schedule.viewDetails}
          </button>
          {appointment.status === "pending" && (
  <>
    <button
      type="button"
      onClick={() => onUpdateStatus(appointment.id, "approve")}
      disabled={actionLoading === appointment.id}
      className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
    >
      <Check size={17} />
      {actionLoading === appointment.id ? "Processing..." : "Approve"}
    </button>

    <button
      type="button"
      onClick={() => onUpdateStatus(appointment.id, "reject")}
      disabled={actionLoading === appointment.id}
      className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
    >
      <X size={17} />
      {actionLoading === appointment.id ? "Processing..." : "Reject"}
    </button>
  </>
)}
          {appointment.status === "approved" && (
  <button
    className="doctor-gradient-button inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold"
    onClick={() => onStartCall(appointment)}
  >
            <span className="relative flex items-center gap-2">
              <Video size={17} />
              {t.schedule.startCall}
            </span>
          </button>
          )}
        </div>
      </div>
    </Motion.div>
  );
};

export default UpcomingConsultations;
