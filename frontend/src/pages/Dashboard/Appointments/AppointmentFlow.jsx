import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, LoaderCircle, RefreshCw } from "lucide-react";
import AppointmentNav from "./AppointmentNav";
import Doctors from "./Doctors";
import DoctorProfile from "./DoctorProfile";
import Appointments from "./Appointments";
import Contact from "./Contact";
import { getGlassCardClass, useDashboardTheme } from "../DashboardThemeContext";

export default function AppointmentFlow({ user, t, onBack, initialSearchQuery, onOpenConsult }) {
  const { isDark } = useDashboardTheme();
  const glassCardClass = getGlassCardClass(isDark);
  const [view, setView] = useState("list");
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [doctorsList, setDoctorsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const [appointmentsVersion, setAppointmentsVersion] = useState(0);

  const selectedDoctor = useMemo(
    () => doctorsList.find((doctor) => String(doctor.id) === String(selectedDoctorId)) || null,
    [doctorsList, selectedDoctorId]
  );
  const recommendedDoctors = useMemo(
    () =>
      [...doctorsList]
        .sort((a, b) => {
          const ratingDiff = Number(b.rating || 4.5) - Number(a.rating || 4.5);
          if (ratingDiff !== 0) {
            return ratingDiff;
          }
          return parseNumber(b.experience) - parseNumber(a.experience);
        })
        .slice(0, 3),
    [doctorsList]
  );

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timer = window.setTimeout(() => setNotice(""), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const loadDoctors = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/v1/doctor/list", { credentials: "include" });
      const payload = await safeJson(response);

      if (!response.ok) {
        throw new Error(payload.error || "Failed to load available doctors.");
      }

      setDoctorsList(Array.isArray(payload) ? payload : []);
    } catch (fetchError) {
      setDoctorsList([]);
      setError(fetchError.message || "Failed to load available doctors.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDoctor = (doctorId) => {
    setSelectedDoctorId(doctorId);
    setView("profile");
  };

  const handleBackToList = () => {
    setSelectedDoctorId(null);
    setView("list");
  };

  const handleBookAppointment = async (bookingDetails) => {
    setIsBooking(true);
    setError("");

    try {
      const response = await fetch("/api/v1/appointment/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(bookingDetails),
      });
      const payload = await safeJson(response);

      if (!response.ok) {
        throw new Error(payload.error || "Booking failed");
      }

      setAppointmentsVersion((current) => current + 1);
      setNotice(`Appointment confirmed with ${payload.appointment?.doctor_name || "your doctor"}.`);
      setView("my_appointments");
    } catch (bookingError) {
      setError(bookingError.message || "Booking failed.");
    } finally {
      setIsBooking(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className={`flex min-h-[320px] flex-col items-center justify-center rounded-[32px] p-8 ${glassCardClass} ${isDark ? "text-slate-300" : "text-slate-500"}`}>
          <LoaderCircle size={32} className="animate-spin text-blue-600" />
          <p className="mt-4 text-sm font-medium">Loading available doctors...</p>
        </div>
      );
    }

    switch (view) {
      case "profile":
        return (
          <DoctorProfile
            doctor={selectedDoctor}
            onBack={handleBackToList}
            onBookAppointment={handleBookAppointment}
            isBooking={isBooking}
            t={t}
          />
        );
      case "my_appointments":
        return (
          <Appointments
            user={user}
            t={t}
            refreshKey={appointmentsVersion}
            onBrowseDoctors={() => setView("list")}
            recommendedDoctors={recommendedDoctors}
            onOpenConsult={onOpenConsult}
          />
        );
      case "contact":
        return <Contact t={t} />;
      case "list":
      default:
        return (
          <Doctors
            doctors={doctorsList}
            onSelectDoctor={handleSelectDoctor}
            onBack={onBack}
            t={t}
            initialSearchQuery={initialSearchQuery}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>
      {notice && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold ${
          isDark ? "border-emerald-400/20 bg-emerald-400/12 text-emerald-100" : "border-emerald-200 bg-emerald-50 text-emerald-800"
        }`}>
          <CheckCircle2 size={18} />
          {notice}
        </motion.div>
      )}
      </AnimatePresence>

      <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className={`flex items-start justify-between gap-4 rounded-2xl border px-4 py-3 text-sm ${
          isDark ? "border-rose-400/20 bg-rose-400/12 text-rose-100" : "border-rose-200 bg-rose-50 text-rose-700"
        }`}>
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadDoctors}
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${
              isDark ? "border-rose-300/20 bg-white/8 text-rose-100 hover:bg-white/12" : "border-rose-200 bg-white text-rose-700 hover:bg-rose-100"
            }`}
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </motion.div>
      )}
      </AnimatePresence>

      <AppointmentNav currentView={view} setView={setView} t={t} />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={view === "profile" ? `profile-${selectedDoctorId}` : view}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function parseNumber(value) {
  const parsed = Number(String(value ?? "").replace(/[^0-9.]/g, ""));
  return Number.isNaN(parsed) ? 0 : parsed;
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}
