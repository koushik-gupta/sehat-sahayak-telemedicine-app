import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock3,
  Copy,
  LoaderCircle,
  RefreshCw,
  Search,
  Video,
  XCircle,
} from "lucide-react";
import { getGlassCardClass, getGlassPanelClass, useDashboardTheme } from "../DashboardThemeContext";

const statusTabs = [
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
  { id: "cancelled", label: "Cancelled" },
  { id: "all", label: "All" },
];

const Appointments = ({
  t,
  refreshKey = 0,
  onBrowseDoctors,
  recommendedDoctors = [],
  onOpenConsult,
}) => {
  const { isDark } = useDashboardTheme();
  const glassPanelClass = getGlassPanelClass(isDark);
  const glassCardClass = getGlassCardClass(isDark);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [success, setSuccess] = useState("");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, [refreshKey]);

  useEffect(() => {
    if (!success) {
      return undefined;
    }

    const timer = window.setTimeout(() => setSuccess(""), 3000);
    return () => window.clearTimeout(timer);
  }, [success]);

  const normalizedAppointments = useMemo(() => {
    const now = new Date();
    const graceWindowMs = 30 * 60 * 1000;

    return appointments.map((appointment) => {
      const appointmentDate = appointment.appointment_datetime
        ? new Date(appointment.appointment_datetime)
        : null;
      const status = (appointment.status || "scheduled").toLowerCase();
      const isPast = appointmentDate ? appointmentDate.getTime() < now.getTime() - graceWindowMs : false;
      const isUpcomingWindow = appointmentDate
        ? appointmentDate.getTime() >= now.getTime() - graceWindowMs
        : false;
      const derivedStatus = status === "cancelled" ? "cancelled" : isPast ? "completed" : "scheduled";

      return {
        ...appointment,
        appointmentDate,
        derivedStatus,
        isPast,
        isUpcomingWindow,
      };
    });
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    return normalizedAppointments.filter((appointment) => {
      const matchesFilter =
        filter === "all"
          ? true
          : filter === "upcoming"
            ? appointment.derivedStatus === "scheduled" && appointment.isUpcomingWindow
            : filter === "past"
              ? appointment.derivedStatus === "completed"
              : appointment.derivedStatus === "cancelled";

      const search = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !search ||
        appointment.doctor_name?.toLowerCase().includes(search) ||
        appointment.specialty?.toLowerCase().includes(search) ||
        appointment.hospital?.toLowerCase().includes(search);

      return matchesFilter && matchesSearch;
    });
  }, [filter, normalizedAppointments, searchQuery]);

  const stats = useMemo(() => {
    const upcoming = normalizedAppointments.filter((item) => item.derivedStatus === "scheduled" && item.isUpcomingWindow).length;
    const completed = normalizedAppointments.filter((item) => item.derivedStatus === "completed").length;
    const cancelled = normalizedAppointments.filter((item) => item.derivedStatus === "cancelled").length;

    return { upcoming, completed, cancelled };
  }, [normalizedAppointments]);

  const activeTabCount = useMemo(() => {
    if (filter === "all") {
      return normalizedAppointments.length;
    }
    if (filter === "past") {
      return stats.completed;
    }
    return stats[filter] || 0;
  }, [filter, normalizedAppointments.length, stats]);

  async function fetchAppointments() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/v1/appointment/my-appointments", { credentials: "include" });
      const payload = await safeJson(response);

      if (!response.ok) {
        throw new Error(payload.error || "Could not load appointments.");
      }

      setAppointments(Array.isArray(payload) ? payload : []);
    } catch (fetchError) {
      setAppointments([]);
      setError(fetchError.message || "Could not load appointments.");
    } finally {
      setIsLoading(false);
    }
  }

  async function cancelAppointment(appointmentId) {
    setBusyId(appointmentId);
    setError("");

    try {
      const response = await fetch(`/api/v1/appointment/${appointmentId}/cancel`, {
        method: "POST",
        credentials: "include",
      });
      const payload = await safeJson(response);

      if (!response.ok) {
        throw new Error(payload.error || "Could not cancel appointment.");
      }

      setAppointments((current) =>
        current.map((item) => (item.id === appointmentId ? { ...item, status: "cancelled", can_cancel: false } : item))
      );
      setSuccess("Appointment cancelled successfully.");
    } catch (cancelError) {
      setError(cancelError.message || "Could not cancel appointment.");
    } finally {
      setBusyId(null);
    }
  }

  async function copyRoomCode(code) {
    if (!code) {
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      setSuccess("Room code copied.");
    } catch {
      setSuccess("Copy failed on this device.");
    }
  }

  if (isLoading) {
    return (
      <div className={`flex min-h-[320px] flex-col items-center justify-center rounded-[32px] p-8 ${glassCardClass} ${isDark ? "text-slate-300" : "text-slate-500"}`}>
        <LoaderCircle size={32} className="animate-spin text-blue-600" />
        <p className="mt-4 text-sm font-medium">Loading your appointments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold ${isDark ? "border-emerald-400/20 bg-emerald-400/12 text-emerald-100" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}
          >
            <CheckCircle2 size={18} />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`rounded-[32px] p-6 ${glassPanelClass}`}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">My appointments</p>
            <h1 className={`mt-2 text-3xl font-bold ${isDark ? "text-slate-50" : "text-slate-900"}`}>{t.myAppointments || "Manage your bookings"}</h1>
            <p className={`mt-3 max-w-2xl text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>
              Review upcoming consultations, keep track of room codes, and manage changes without losing context.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {onBrowseDoctors && (
              <button
                onClick={onBrowseDoctors}
                className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5 ${
                  isDark ? "border-white/10 bg-white/8 text-slate-300 hover:border-cyan-300/25 hover:text-white" : "border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-200 hover:text-blue-700"
                }`}
              >
                Browse doctors
                <ArrowRight size={16} />
              </button>
            )}
            <button
              onClick={fetchAppointments}
              className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5 ${
                isDark ? "border-white/10 bg-white/8 text-slate-300 hover:border-blue-300/25 hover:text-white" : "border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-200 hover:text-blue-700"
              }`}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <StatCard label="Upcoming" value={stats.upcoming} tone="blue" />
          <StatCard label="Completed" value={stats.completed} tone="emerald" />
          <StatCard label="Cancelled" value={stats.cancelled} tone="rose" />
        </div>
      </div>

      <div className={`rounded-2xl border p-4 text-sm ${isDark ? "border-blue-300/20 bg-blue-500/10 text-blue-100" : "border-blue-100 bg-blue-50 text-blue-800"}`}>
        <div className="flex items-start gap-3">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p>
            Use the Consult tab at the scheduled time to join the video session. Room codes stay visible here for quick reference and handoff.
          </p>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`rounded-2xl border px-4 py-3 text-sm font-medium ${isDark ? "border-rose-400/20 bg-rose-400/12 text-rose-100" : "border-rose-200 bg-rose-50 text-rose-700"}`}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <section className={`rounded-[28px] p-5 ${glassCardClass}`}>
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative flex-1">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-500" : "text-slate-400"}`} size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by doctor, specialty, or hospital..."
              className={`w-full rounded-2xl border py-4 pl-12 pr-4 outline-none transition-all ${
                isDark
                  ? "border-white/10 bg-slate-950/55 text-slate-100 placeholder:text-slate-500 focus:border-blue-400/30 focus:bg-slate-950/70 focus:ring-4 focus:ring-blue-500/10"
                  : "border-slate-200 bg-slate-50 text-slate-700 placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
              }`}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {statusTabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => setFilter(tab.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  filter === tab.id
                    ? "bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-[0_16px_35px_-18px_rgba(37,99,235,0.7)]"
                    : isDark
                      ? "border border-white/10 bg-white/8 text-slate-300 hover:border-blue-300/25 hover:text-blue-200"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700"
                }`}
              >
                {tab.label}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
            isDark ? "bg-white/8 text-slate-300" : "bg-slate-50 text-slate-600"
          }`}>
            {activeTabCount} results in this view
          </span>
          {searchQuery && (
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
              isDark ? "bg-cyan-400/10 text-cyan-100" : "bg-cyan-50 text-cyan-700"
            }`}>
              Matching "{searchQuery}"
            </span>
          )}
        </div>
      </section>

      {filteredAppointments.length === 0 ? (
        <EmptyAppointmentsState
          isDark={isDark}
          searchQuery={searchQuery}
          onBrowseDoctors={onBrowseDoctors}
          recommendedDoctors={recommendedDoctors}
        />
      ) : (
        <motion.div layout className="space-y-4">
          <AnimatePresence initial={false}>
            {filteredAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onCancel={cancelAppointment}
                onCopyRoomCode={copyRoomCode}
                onBrowseDoctors={onBrowseDoctors}
                onOpenConsult={onOpenConsult}
                isBusy={busyId === appointment.id}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

function EmptyAppointmentsState({ isDark, searchQuery, onBrowseDoctors, recommendedDoctors }) {
  return (
    <div className={`rounded-[32px] border border-dashed px-6 py-16 text-center shadow-sm ${isDark ? "border-white/10 bg-slate-900/55" : "border-slate-200 bg-white"}`}>
      <Calendar className={`mx-auto ${isDark ? "text-slate-500" : "text-slate-300"}`} size={36} />
      <h3 className={`mt-4 text-xl font-bold ${isDark ? "text-slate-100" : "text-slate-800"}`}>No appointments found</h3>
      <p className={`mt-2 text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>
        {searchQuery ? "Try another search or filter." : "Book your first consultation to see it here."}
      </p>
      {onBrowseDoctors && (
        <button
          onClick={onBrowseDoctors}
          className="mt-5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-[0_16px_40px_-22px_rgba(37,99,235,0.72)]"
        >
          Browse doctors
        </button>
      )}

      {!searchQuery && recommendedDoctors.length > 0 && (
        <div className="mt-8 text-left">
          <p className={`text-xs font-bold uppercase tracking-[0.22em] ${isDark ? "text-slate-400" : "text-slate-400"}`}>
            Recommended doctors
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {recommendedDoctors.map((doctor) => (
              <div
                key={doctor.id}
                className={`rounded-[24px] border p-4 ${isDark ? "border-white/10 bg-white/6" : "border-slate-200 bg-slate-50"}`}
              >
                <p className={`font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{doctor.name}</p>
                <p className="mt-1 text-sm font-medium text-blue-600">{doctor.specialty || "General consultation"}</p>
                <div className={`mt-3 flex items-center justify-between text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>
                  <span>{formatFee(doctor.fee)}</span>
                  <span>{Number(doctor.rating || 4.5).toFixed(1)} rating</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, tone }) {
  const { isDark } = useDashboardTheme();
  const tones = {
    blue: isDark ? "border-blue-300/20 bg-blue-500/10 text-blue-200" : "border-blue-100 bg-blue-50 text-blue-700",
    emerald: isDark ? "border-emerald-300/20 bg-emerald-500/10 text-emerald-200" : "border-emerald-100 bg-emerald-50 text-emerald-700",
    rose: isDark ? "border-rose-300/20 bg-rose-500/10 text-rose-200" : "border-rose-100 bg-rose-50 text-rose-700",
  };

  return (
    <motion.div whileHover={{ y: -4 }} className={`rounded-[24px] border p-5 ${tones[tone]}`}>
      <p className="text-xs font-bold uppercase tracking-[0.22em]">{label}</p>
      <p className={`mt-3 text-3xl font-bold ${isDark ? "text-slate-50" : "text-slate-900"}`}>{value}</p>
    </motion.div>
  );
}

function AppointmentCard({ appointment, onCancel, onCopyRoomCode, onBrowseDoctors, onOpenConsult, isBusy }) {
  const { isDark } = useDashboardTheme();
  const statusConfig = {
    scheduled: {
      label: "Upcoming",
      tone: isDark ? "bg-blue-500/10 text-blue-200 border-blue-300/20" : "bg-blue-100 text-blue-700 border-blue-200",
      accent: "from-cyan-500 via-blue-600 to-indigo-600",
    },
    completed: {
      label: "Completed",
      tone: isDark ? "bg-emerald-500/10 text-emerald-200 border-emerald-300/20" : "bg-emerald-100 text-emerald-700 border-emerald-200",
      accent: "from-emerald-500 via-teal-500 to-cyan-500",
    },
    cancelled: {
      label: "Cancelled",
      tone: isDark ? "bg-rose-500/10 text-rose-200 border-rose-300/20" : "bg-rose-100 text-rose-700 border-rose-200",
      accent: "from-rose-500 via-red-500 to-orange-500",
    },
  }[appointment.derivedStatus] || {
    label: "Scheduled",
    tone: isDark ? "bg-white/8 text-slate-200 border-white/10" : "bg-slate-100 text-slate-700 border-slate-200",
    accent: "from-slate-500 to-slate-600",
  };

  const showJoinAction =
    appointment.derivedStatus === "scheduled" && appointment.video_room_code && typeof onOpenConsult === "function";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      whileHover={{ y: -4 }}
      className={`rounded-[28px] border p-5 shadow-sm ${isDark ? "border-white/10 bg-slate-900/72" : "border-slate-200 bg-white"}`}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <div className={`h-16 w-16 overflow-hidden rounded-2xl shadow-sm ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
            <img
              src={appointment.image || "/images/doc1.png"}
              alt={appointment.doctor_name}
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.src = "/images/doc1.png";
              }}
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className={`text-xl font-bold ${isDark ? "text-slate-50" : "text-slate-900"}`}>Dr. {appointment.doctor_name}</h3>
              <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${statusConfig.tone}`}>
                {statusConfig.label}
              </span>
            </div>

            <p className="mt-2 text-sm font-semibold text-blue-600">
              {appointment.specialty || "General consultation"}
            </p>
            <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{appointment.hospital || "Online consultation"}</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className={`rounded-[20px] px-4 py-3 ${isDark ? "bg-white/8" : "bg-slate-50"}`}>
                <p className={`text-[11px] font-bold uppercase tracking-[0.18em] ${isDark ? "text-slate-400" : "text-slate-400"}`}>Date</p>
                <p className={`mt-2 flex items-center gap-2 text-sm font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                  <Calendar size={14} />
                  {formatDate(appointment.appointmentDate)}
                </p>
              </div>
              <div className={`rounded-[20px] px-4 py-3 ${isDark ? "bg-white/8" : "bg-slate-50"}`}>
                <p className={`text-[11px] font-bold uppercase tracking-[0.18em] ${isDark ? "text-slate-400" : "text-slate-400"}`}>Time</p>
                <p className={`mt-2 flex items-center gap-2 text-sm font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                  <Clock3 size={14} />
                  {formatTime(appointment.appointmentDate)}
                </p>
              </div>
              <div className={`rounded-[20px] px-4 py-3 ${isDark ? "bg-white/8" : "bg-slate-50"}`}>
                <p className={`text-[11px] font-bold uppercase tracking-[0.18em] ${isDark ? "text-slate-400" : "text-slate-400"}`}>Mode</p>
                <p className={`mt-2 flex items-center gap-2 text-sm font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                  <Video size={14} />
                  Video consult
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:min-w-[250px] lg:items-end">
          <div className={`w-full rounded-[24px] border px-4 py-4 text-sm ${isDark ? "border-white/10 bg-white/8" : "border-slate-200 bg-slate-50"}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className={`text-xs font-bold uppercase tracking-[0.2em] ${isDark ? "text-slate-400" : "text-slate-400"}`}>Room code</p>
                <code className={`mt-2 block font-bold ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                  {appointment.video_room_code || "Assigned after booking"}
                </code>
              </div>
              {appointment.video_room_code && (
                <button
                  onClick={() => onCopyRoomCode(appointment.video_room_code)}
                  className={`rounded-xl p-2 transition-colors ${isDark ? "bg-slate-900 text-slate-300 hover:text-blue-200" : "bg-white text-slate-500 hover:text-blue-700"}`}
                >
                  <Copy size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="flex w-full flex-col gap-2">
            {showJoinAction && (
              <button
                onClick={onOpenConsult}
                className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r ${statusConfig.accent} px-4 py-3 text-sm font-bold text-white shadow-[0_16px_40px_-22px_rgba(37,99,235,0.72)] transition-all hover:-translate-y-0.5`}
              >
                <Video size={16} />
                Join consult
              </button>
            )}

            {onBrowseDoctors && (
              <button
                onClick={onBrowseDoctors}
                className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold transition-all hover:-translate-y-0.5 ${
                  isDark ? "border-white/10 bg-white/8 text-slate-200 hover:border-cyan-300/25 hover:text-white" : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-blue-700"
                }`}
              >
                {appointment.derivedStatus === "completed" ? "Book follow-up" : "Reschedule"}
                <ArrowRight size={16} />
              </button>
            )}

            {appointment.can_cancel && (
              <button
                onClick={() => onCancel(appointment.id)}
                disabled={isBusy}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <XCircle size={16} />
                {isBusy ? "Cancelling..." : "Cancel appointment"}
              </button>
            )}
          </div>
        </div>
      </div>

      {appointment.reason && (
        <div className={`mt-5 rounded-[24px] p-4 ${isDark ? "bg-white/8" : "bg-slate-50"}`}>
          <p className={`text-xs font-bold uppercase tracking-[0.2em] ${isDark ? "text-slate-400" : "text-slate-400"}`}>Consultation reason</p>
          <p className={`mt-2 text-sm leading-6 ${isDark ? "text-slate-300" : "text-slate-600"}`}>{appointment.reason}</p>
        </div>
      )}
    </motion.div>
  );
}

function formatDate(value) {
  if (!value || Number.isNaN(value.getTime())) {
    return "Date pending";
  }

  return value.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value) {
  if (!value || Number.isNaN(value.getTime())) {
    return "Time pending";
  }

  return value.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatFee(value) {
  if (value === null || value === undefined || value === "") {
    return "Fee on request";
  }

  const numeric = Number(String(value).replace(/[^0-9.]/g, ""));
  if (Number.isNaN(numeric)) {
    return String(value);
  }

  return `Rs. ${numeric}`;
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export default Appointments;
