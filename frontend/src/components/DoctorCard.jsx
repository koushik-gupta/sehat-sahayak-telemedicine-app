import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, BriefcaseMedical, CalendarClock, MapPin, Star, Wallet } from "lucide-react";
import { useDashboardTheme } from "../pages/Dashboard/DashboardThemeContext";

const DoctorCard = ({
  doctor,
  badgeLabels = [],
  nextAvailableLabel = "",
  onPrimaryAction,
  onSecondaryAction,
  primaryActionLabel = "Book Now",
  secondaryActionLabel = "View Profile",
}) => {
  const { isDark } = useDashboardTheme();
  const fee = formatFee(doctor.fee);
  const experience = doctor.experience || "Experienced";
  const hospital = doctor.hospital || "Online consultation";
  const rating = Number(doctor.rating || 4.8).toFixed(1);
  const languages = normalizeLanguages(doctor.languages);
  const primaryAction = onPrimaryAction || onSecondaryAction;
  const secondaryAction = onSecondaryAction || onPrimaryAction;
  const showActionButtons = Boolean(primaryAction || secondaryAction);

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.012 }}
      whileTap={{ scale: 0.995 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={`group flex h-full flex-col overflow-hidden rounded-[28px] border p-4 shadow-sm transition-all duration-300 ${
        isDark
          ? "border-white/10 bg-slate-900/72 hover:shadow-[0_26px_60px_-30px_rgba(8,145,178,0.55)]"
          : "border-slate-200 bg-white hover:shadow-[0_26px_60px_-30px_rgba(59,130,246,0.24)]"
      }`}
    >
      <div className="relative">
        <div className={`h-52 overflow-hidden rounded-[24px] ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
          <img
            src={doctor.image || "/images/doc1.png"}
            alt={doctor.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(event) => {
              event.currentTarget.src = "/images/doc1.png";
            }}
          />
        </div>

        <div className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold shadow-sm backdrop-blur ${
          isDark ? "bg-slate-950/75 text-slate-100" : "bg-white/90 text-slate-700"
        }`}>
          <Star size={12} className="fill-yellow-400 text-yellow-400" />
          {rating}
        </div>

        {badgeLabels.length > 0 && (
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2">
            {badgeLabels.slice(0, 2).map((badge) => (
              <span
                key={badge}
                className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] shadow-sm backdrop-blur ${
                  badge.toLowerCase().includes("top")
                    ? "bg-amber-400/90 text-slate-950"
                    : isDark
                      ? "bg-cyan-400/18 text-cyan-100"
                      : "bg-cyan-500/90 text-white"
                }`}
              >
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col pt-4">
        <div>
          <h3 className={`line-clamp-1 text-lg font-bold transition-colors ${isDark ? "text-slate-100 group-hover:text-blue-300" : "text-slate-800 group-hover:text-blue-700"}`}>
            {doctor.name}
          </h3>
          <p className="mt-1 text-sm font-semibold text-blue-600">{doctor.specialty || "General consultation"}</p>
        </div>

        <div className={`mt-4 space-y-2 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          <div className="flex items-center gap-2">
            <BriefcaseMedical size={14} className={isDark ? "text-slate-500" : "text-slate-400"} />
            <span className="truncate">{experience}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} className={isDark ? "text-slate-500" : "text-slate-400"} />
            <span className="truncate">{hospital}</span>
          </div>
        </div>

        <div className={`mt-4 rounded-[22px] px-4 py-3 ${isDark ? "bg-white/8" : "bg-slate-50"}`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className={`text-[11px] font-bold uppercase tracking-[0.2em] ${isDark ? "text-slate-400" : "text-slate-400"}`}>
                Next available
              </p>
              <p className={`mt-1 text-sm font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                {nextAvailableLabel || "Instant queue booking"}
              </p>
            </div>
            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-[16px] ${isDark ? "bg-slate-950/70 text-cyan-200" : "bg-white text-cyan-700"} shadow-sm`}>
              <CalendarClock size={16} />
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {languages.slice(0, 3).map((language) => (
            <span
              key={language}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${isDark ? "bg-white/8 text-slate-300" : "bg-slate-50 text-slate-600"}`}
            >
              {language}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-5">
          <div className={`flex items-end justify-between rounded-[22px] px-4 py-3 ${isDark ? "bg-white/8" : "bg-slate-50"}`}>
            <div>
              <p className={`text-xs font-bold uppercase tracking-[0.2em] ${isDark ? "text-slate-400" : "text-slate-400"}`}>Consultation fee</p>
              <p className={`mt-1 text-xl font-bold ${isDark ? "text-slate-50" : "text-slate-900"}`}>{fee}</p>
            </div>
          </div>

          {showActionButtons ? (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  primaryAction?.();
                }}
                className="inline-flex items-center justify-center gap-2 rounded-[18px] bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-[0_16px_40px_-22px_rgba(37,99,235,0.75)] transition-all hover:-translate-y-0.5 hover:shadow-[0_22px_44px_-18px_rgba(37,99,235,0.85)]"
              >
                <Wallet size={15} />
                {primaryActionLabel}
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  secondaryAction?.();
                }}
                className={`inline-flex items-center justify-center gap-2 rounded-[18px] border px-4 py-3 text-sm font-bold transition-all hover:-translate-y-0.5 ${
                  isDark
                    ? "border-white/10 bg-white/8 text-slate-200 hover:border-cyan-300/25 hover:text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-blue-700"
                }`}
              >
                {secondaryActionLabel}
                <ArrowRight size={15} />
              </button>
            </div>
          ) : (
            <div className={`mt-3 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white transition-colors group-hover:bg-blue-700`}>
              <Wallet size={15} />
              View profile
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

function formatFee(value) {
  if (value === null || value === undefined || value === "") {
    return "Fee on request";
  }

  if (typeof value === "number") {
    return `Rs. ${value}`;
  }

  const numeric = Number(String(value).replace(/[^0-9.]/g, ""));
  if (Number.isNaN(numeric)) {
    return String(value);
  }

  return `Rs. ${numeric}`;
}

function normalizeLanguages(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

export default DoctorCard;
