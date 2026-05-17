import React from "react";
import { motion } from "framer-motion";
import { CalendarDays, Headset, Stethoscope } from "lucide-react";
import { getGlassCardClass, useDashboardTheme } from "../DashboardThemeContext";

const tabs = [
  { id: "list", label: "Browse Doctors", icon: Stethoscope },
  { id: "my_appointments", label: "My Appointments", icon: CalendarDays },
  { id: "contact", label: "Support", icon: Headset },
];

const AppointmentNav = ({ currentView, setView, t }) => {
  const { isDark } = useDashboardTheme();
  const glassCardClass = getGlassCardClass(isDark);

  return (
    <nav className={`rounded-[28px] p-2 ${glassCardClass}`}>
      <div className="grid gap-2 md:grid-cols-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = currentView === tab.id || (tab.id === "list" && currentView === "profile");
          const label =
            tab.id === "list"
              ? t.browseDoctors || tab.label
              : tab.id === "my_appointments"
                ? t.myAppointments || tab.label
                : t.contact || tab.label;

          return (
            <motion.button
              key={tab.id}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => setView(tab.id)}
              className={`relative flex items-center justify-center gap-3 overflow-hidden rounded-[22px] px-4 py-4 text-sm font-bold transition-all ${
                active
                  ? "text-white shadow-lg shadow-blue-200"
                  : isDark
                    ? "text-slate-300 hover:bg-white/8 hover:text-white"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="appointments-nav-pill"
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600"
                  transition={{ type: "spring", stiffness: 280, damping: 26 }}
                />
              )}
              <span className={`absolute inset-0 opacity-0 transition-opacity ${active ? "opacity-100" : ""} ${isDark ? "bg-[linear-gradient(120deg,rgba(255,255,255,0.1),transparent_38%)]" : "bg-[linear-gradient(120deg,rgba(255,255,255,0.28),transparent_38%)]"}`} />
              <span className="relative inline-flex items-center gap-3">
              <Icon size={18} />
              {label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};

export default AppointmentNav;
