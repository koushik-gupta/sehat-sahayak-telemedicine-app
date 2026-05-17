import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Bell,
  Calendar,
  ChevronRight,
  ClipboardList,
  Clock3,
  FileText,
  HeartPulse,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Pill,
  Search,
  Shield,
  Sparkles,
  Sun,
  User,
  Video,
} from "lucide-react";
import "./PatientDashboard.css";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { getUiCopy } from "../../i18n/uiCopy";
import HealthRecordsScreen from "./HealthRecordsScreen";
import AISymptomCheckerScreen from "./Consultation/AISymptomCheckerScreen";
import EmergencyScreen from "./Emergency/EmergencyScreen";
import AppointmentFlow from "./Appointments/AppointmentFlow";
import ConsultationFlow from "./Consultation/ConsultationFlow";
import NearbyMedicines from "./Pharmacy/NearbyMedicines";
import ProfileScreen from "./ProfileScreen";
import {
  DashboardThemeContext,
  getGlassCardClass,
  getGlassPanelClass,
  pickTheme,
  useDashboardTheme,
} from "./DashboardThemeContext";

const tOr = (value, fallback) => value || fallback;

const gradientButtonClass =
  "relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_-18px_rgba(37,99,235,0.95)]";
const THEME_STORAGE_KEY = "sehat-sahayak-dashboard-theme";

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
  },
};

const firstName = (fullName) => fullName?.split(" ")?.[0] || "User";

const HeaderIconButton = ({ children, className = "", ...props }) => {
  const { isDark } = useDashboardTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.04, y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border backdrop-blur-xl transition-colors ${
        isDark
          ? "border-white/10 bg-white/8 text-slate-200 shadow-[0_16px_40px_-26px_rgba(2,6,23,0.8)] hover:border-cyan-400/25 hover:bg-white/12 hover:text-white"
          : "border-slate-200/90 bg-white/95 text-slate-700 shadow-[0_14px_35px_-24px_rgba(15,23,42,0.22)] hover:border-slate-300 hover:text-slate-950"
      } ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

const PatientSidebar = ({ activeTab, setActiveTab, onLogout, isOpen, toggleSidebar, ui, user }) => {
  const { isDark } = useDashboardTheme();
  const primaryItems = [
    { id: "home", label: tOr(ui.home, "Home"), icon: Home },
    { id: "consult", label: ui.consultation, icon: Video },
    { id: "pharmacy", label: tOr(ui.pharmacy, "Pharmacy"), icon: Pill },
  ];

  const secondaryItems = [
    { id: "appointments", label: ui.appointments, icon: Calendar },
    { id: "records", label: tOr(ui.records, "Records"), icon: FileText },
    { id: "emergency", label: ui.emergency, icon: Activity, accent: "text-rose-400" },
    { id: "profile", label: ui.profile, icon: User },
  ];

  const navigate = (tabId) => {
    setActiveTab(tabId);
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-20 bg-slate-950/45 backdrop-blur-sm md:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      <motion.aside
        layout
        transition={{ type: "spring", stiffness: 240, damping: 24 }}
        whileHover={window.innerWidth >= 768 ? { scale: 1.01, x: 2 } : undefined}
        className={`fixed inset-y-3 left-3 z-30 flex flex-col overflow-hidden rounded-[30px] border backdrop-blur-2xl transition-transform duration-300 ${
          isDark
            ? "border-white/10 bg-slate-950/92 text-white shadow-[0_32px_90px_-24px_rgba(2,6,23,0.92)]"
            : "border-white/40 bg-white/56 text-slate-900 shadow-[0_30px_80px_-24px_rgba(14,116,144,0.18)]"
        } ${
          isOpen ? "w-[18rem] translate-x-0" : "-translate-x-[120%] w-[5.8rem] md:translate-x-0"
        } md:inset-y-4 md:left-4`}
      >
        <div
          className={`absolute inset-0 ${
            isDark
              ? "bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.22),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.2),_transparent_28%)]"
              : "bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.34),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.24),_transparent_28%)]"
          }`}
        />
        <div className={`absolute inset-x-0 top-0 h-28 bg-gradient-to-b ${isDark ? "from-white/8" : "from-cyan-200/10"} to-transparent`} />

        <div className="relative flex h-full flex-col">
          <div className={`flex items-center ${isOpen ? "justify-between px-5 pb-4 pt-5" : "flex-col gap-4 px-3 pb-4 pt-5"}`}>
            <div className={`flex items-center gap-3 ${!isOpen ? "md:flex-col" : ""}`}>
              <motion.button
                whileHover={{ rotate: 8, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={!isOpen ? toggleSidebar : undefined}
                className={`flex h-12 w-12 items-center justify-center rounded-2xl border backdrop-blur-xl ${
                  isDark
                    ? "border-white/20 bg-white/12 text-white shadow-[0_18px_45px_-18px_rgba(34,211,238,0.7)]"
                    : "border-white/45 bg-cyan-300/18 text-slate-800 shadow-[0_18px_45px_-18px_rgba(34,211,238,0.22)]"
                }`}
              >
                <span className="text-xl font-bold">+</span>
              </motion.button>

              {isOpen && (
                <div>
                  <p className={`text-[11px] font-semibold uppercase tracking-[0.32em] ${isDark ? "text-cyan-200/75" : "text-slate-500"}`}>Patient space</p>
                  <p className={`text-xl font-semibold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                    Sehat<span className={`font-extrabold ${isDark ? "text-cyan-300" : "text-cyan-600"}`}>Sahayak</span>
                  </p>
                </div>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.96 }}
              onClick={toggleSidebar}
              className={`hidden rounded-2xl border p-2 transition-colors md:inline-flex ${
                isDark
                  ? "border-white/10 bg-white/8 text-slate-200 hover:border-cyan-300/20 hover:bg-white/12"
                  : "border-white/40 bg-white/40 text-slate-600 hover:border-cyan-300/30 hover:bg-white/55"
              } ${
                !isOpen ? "self-center" : ""
              }`}
            >
              <ChevronRight size={18} className={isOpen ? "rotate-180" : ""} />
            </motion.button>
          </div>

          <nav className="dashboard-scrollbar relative mt-4 flex-1 space-y-7 overflow-y-auto px-3 pb-4">
            <SidebarSection label={ui.menu} items={primaryItems} activeTab={activeTab} isOpen={isOpen} onSelect={navigate} />
            <SidebarSection label={ui.myHealth} items={secondaryItems} activeTab={activeTab} isOpen={isOpen} onSelect={navigate} />
          </nav>

          <div className="relative p-3">
            <motion.button
              whileHover={{ scale: 1.01, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={onLogout}
              className={`flex w-full items-center gap-3 rounded-[24px] border bg-gradient-to-r px-4 py-3 text-sm font-semibold backdrop-blur-xl transition-colors ${
                isDark
                  ? "border-rose-400/15 from-rose-500/16 to-orange-400/10 text-rose-100 hover:border-rose-300/30 hover:from-rose-500/22 hover:to-orange-400/18"
                  : "border-rose-300/25 from-rose-500/10 to-orange-400/10 text-rose-700 hover:border-rose-300/40 hover:from-rose-500/16 hover:to-orange-400/14"
              } ${
                !isOpen ? "justify-center px-0" : ""
              }`}
            >
              <LogOut size={18} />
              {isOpen && <span>{ui.logout}</span>}
            </motion.button>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

const SidebarSection = ({ label, items, activeTab, isOpen, onSelect }) => (
  <div className="space-y-2">
    {isOpen && <SidebarSectionLabel>{label}</SidebarSectionLabel>}
    {items.map((item) => (
      <NavItem
        key={item.id}
        icon={item.icon}
        label={item.label}
        isActive={activeTab === item.id}
        onClick={() => onSelect(item.id)}
        isOpen={isOpen}
        accent={item.accent}
      />
    ))}
  </div>
);

const SidebarSectionLabel = ({ children }) => {
  const { isDark } = useDashboardTheme();

  return (
    <p className={`px-3 text-[11px] font-semibold uppercase tracking-[0.28em] ${isDark ? "text-slate-400/90" : "text-slate-500/95"}`}>
      {children}
    </p>
  );
};

const NavItem = ({ icon: Icon, label, isActive, onClick, isOpen, accent = "" }) => {
  const { isDark } = useDashboardTheme();

  return (
    <motion.button
      whileHover={{ scale: 1.015, x: 3 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-[24px] px-3 py-3.5 text-left transition-colors ${
        isActive
          ? pickTheme(isDark, "bg-cyan-300/22 text-slate-900", "bg-white/16 text-white")
          : pickTheme(isDark, "text-slate-600 hover:bg-white/28 hover:text-slate-900", "text-slate-300 hover:bg-white/8 hover:text-white")
      } ${!isOpen ? "justify-center px-2" : ""}`}
      title={!isOpen ? label : ""}
    >
      {isActive && (
        <motion.div
          layoutId="sidebar-active-pill"
          className="absolute inset-0 rounded-[24px] bg-gradient-to-r from-cyan-400/24 via-blue-400/20 to-indigo-400/20"
          transition={{ type: "spring", stiffness: 280, damping: 26 }}
        />
      )}

      <div
        className={`relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] border ${
          isActive
            ? pickTheme(isDark, "border-white/45 bg-white/40 text-slate-900", "border-white/20 bg-white/18 text-white")
            : pickTheme(isDark, "border-white/35 bg-white/18 text-slate-600", "border-white/10 bg-white/8 text-slate-300")
        } ${accent}`}
      >
        <Icon size={18} />
      </div>

      {isOpen && (
        <div className="relative flex min-w-0 flex-1 items-center justify-between gap-3">
          <span className="truncate text-sm font-medium">{label}</span>
          {isActive && <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.9)]" />}
        </div>
      )}

      {!isOpen && (
        <span
          className={`pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-xl border px-3 py-1.5 text-xs opacity-0 shadow-xl transition-opacity group-hover:opacity-100 ${
            isDark ? "border-slate-700 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-900"
          }`}
        >
          {label}
        </span>
      )}
    </motion.button>
  );
};

const DashboardHome = ({ navigateTo, user, ui }) => {
  const { isDark } = useDashboardTheme();
  const glassPanelClass = getGlassPanelClass(isDark);
  const glassCardClass = getGlassCardClass(isDark);
  const [searchQuery, setSearchQuery] = useState("");
  const [dashboardData, setDashboardData] = useState({
    isLoading: true,
    error: "",
    appointments: [],
    records: [],
  });

  const heroX = useMotionValue(0);
  const heroY = useMotionValue(0);
  const springX = useSpring(heroX, { stiffness: 140, damping: 22, mass: 0.5 });
  const springY = useSpring(heroY, { stiffness: 140, damping: 22, mass: 0.5 });

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      try {
        setDashboardData((prev) => ({ ...prev, isLoading: true, error: "" }));

        const [appointmentsResponse, recordsResponse] = await Promise.all([
          fetch("/api/v1/appointment/my-appointments", { credentials: "include" }),
          fetch("/api/v1/user/documents", { credentials: "include" }),
        ]);

        if (!appointmentsResponse.ok) {
          throw new Error("Could not load appointments.");
        }

        if (!recordsResponse.ok) {
          throw new Error("Could not load health records.");
        }

        const [appointments, records] = await Promise.all([
          appointmentsResponse.json(),
          recordsResponse.json(),
        ]);

        if (!isMounted) {
          return;
        }

        setDashboardData({
          isLoading: false,
          error: "",
          appointments: Array.isArray(appointments) ? appointments : [],
          records: Array.isArray(records) ? records : [],
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setDashboardData((prev) => ({
          ...prev,
          isLoading: false,
          error: error.message || "Unable to load dashboard summary.",
        }));
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearch = () => {
    const query = searchQuery.toLowerCase();

    if (query.includes("medicine") || query.includes("drug") || query.includes("pharmacy") || query.includes("pill")) {
      navigateTo("pharmacy");
    } else if (
      query.includes("symptom") ||
      query.includes("check") ||
      query.includes("pain") ||
      query.includes("fever") ||
      query.includes("cough")
    ) {
      navigateTo("ai-checker");
    } else if (query.includes("record") || query.includes("history") || query.includes("report")) {
      navigateTo("records");
    } else {
      navigateTo("appointments", { search: searchQuery });
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleHeroMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const relativeX = event.clientX - bounds.left - bounds.width / 2;
    const relativeY = event.clientY - bounds.top - bounds.height / 2;

    heroX.set(relativeX / 18);
    heroY.set(relativeY / 18);
  };

  const resetHeroMotion = () => {
    heroX.set(0);
    heroY.set(0);
  };

  const now = new Date();
  const appointments = dashboardData.appointments
    .map((appointment) => ({
      ...appointment,
      appointmentDate: appointment.appointment_datetime ? new Date(appointment.appointment_datetime) : null,
    }))
    .filter((appointment) => appointment.appointmentDate && !Number.isNaN(appointment.appointmentDate.getTime()))
    .sort((a, b) => a.appointmentDate - b.appointmentDate);

  const upcomingAppointments = appointments.filter(
    (appointment) => appointment.status?.toLowerCase() !== "cancelled" && appointment.appointmentDate >= now
  );
  const nextAppointment = upcomingAppointments[0] || null;
  const recentRecords = [...dashboardData.records].slice(0, 3);

  const profileChecks = [
    Boolean(user?.email),
    Boolean(user?.mobile),
    Boolean(user?.blood_group),
    Boolean(user?.weight),
    Boolean(user?.height),
    Boolean(user?.address),
  ];
  const completedChecks = profileChecks.filter(Boolean).length;
  const profileCompletion = Math.round((completedChecks / profileChecks.length) * 100);
  const profileStatusLabel =
    profileCompletion >= 100 ? "Ready to go" : profileCompletion >= 70 ? "Almost complete" : "Needs attention";

  const heroInsights = [
    { label: "Profile", value: `${profileCompletion}%`, detail: profileStatusLabel },
    {
      label: "Upcoming",
      value: `${upcomingAppointments.length}`,
      detail: upcomingAppointments.length === 1 ? ui.appointmentSingular : ui.appointmentPlural,
    },
    {
      label: "Records",
      value: `${dashboardData.records.length}`,
      detail: dashboardData.records.length > 0 ? ui.filesSaved : ui.startUploading,
    },
  ];

  const summaryCards = [
    {
      title: ui.summaryProfile,
      value: `${profileCompletion}%`,
      subtitle: profileStatusLabel,
      insight: "Open profile",
      icon: <ClipboardList size={18} />,
      tone: "blue",
      onClick: () => navigateTo("profile"),
    },
    {
      title: ui.summaryUpcoming,
      value: upcomingAppointments.length,
      subtitle: upcomingAppointments.length === 1 ? ui.appointmentSingular : ui.appointmentPlural,
      insight: "View schedule",
      icon: <Calendar size={18} />,
      tone: "indigo",
      onClick: () => navigateTo("appointments"),
    },
    {
      title: ui.summaryRecords,
      value: dashboardData.records.length,
      subtitle: dashboardData.records.length > 0 ? ui.filesSaved : ui.startUploading,
      insight: "Open records",
      icon: <FileText size={18} />,
      tone: "emerald",
      onClick: () => navigateTo("records"),
    },
    {
      title: ui.summarySecurity,
      value: user?.email && user?.mobile ? ui.good : ui.update,
      subtitle: user?.email && user?.mobile ? ui.emailMobileLinked : ui.addRecoveryOptions,
      insight: "Review contact",
      icon: <Shield size={18} />,
      tone: "amber",
      onClick: () => navigateTo("profile"),
    },
  ];

  return (
    <div className="patient-home relative z-10 space-y-7 pb-10">
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        onMouseMove={handleHeroMove}
        onMouseLeave={resetHeroMotion}
        className={`hero-gradient-shell group relative overflow-hidden rounded-[34px] p-6 md:p-8 lg:p-10 ${glassPanelClass}`}
      >
        <div
          className={`pointer-events-none absolute inset-0 ${
            isDark
              ? "bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.12),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.14),_transparent_28%),linear-gradient(135deg,rgba(15,23,42,0.16),rgba(15,23,42,0.04))]"
              : "bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.22),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(99,102,241,0.22),_transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.65),rgba(255,255,255,0.18))]"
          }`}
        />
        <div className="hero-grid-overlay absolute inset-0 opacity-45" />
        <motion.div
          animate={{ y: [0, -14, 0], x: [0, 8, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-12 top-10 h-44 w-44 rounded-full bg-cyan-300/18 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 10, 0], x: [0, -10, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-4 top-0 h-40 w-40 rounded-full bg-indigo-400/16 blur-3xl"
        />

        <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.95fr)] xl:items-center">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] backdrop-blur-xl ${
                isDark
                  ? "border-white/10 bg-white/8 text-slate-200"
                  : "border-slate-200/90 bg-white/95 text-slate-600"
              }`}
            >
              <Sparkles size={14} className="text-cyan-500" />
              Premium care dashboard
            </motion.div>

            <h2 className={`mt-5 max-w-2xl text-4xl font-semibold tracking-tight md:text-5xl ${isDark ? "text-slate-50" : "text-slate-900"}`}>
              {ui.welcomeBack}, <span className="bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 bg-clip-text text-transparent">{firstName(user?.full_name)}</span>
            </h2>
            <p className={`mt-4 max-w-xl text-base leading-7 md:text-lg ${isDark ? "text-slate-300" : "text-slate-600"}`}>{ui.welcomeSubtitle}</p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <div
                className={`flex min-w-0 flex-1 items-center gap-3 rounded-[24px] border px-4 py-3 backdrop-blur-2xl transition-all focus-within:-translate-y-0.5 ${
                  isDark
                    ? "border-white/10 bg-slate-950/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_20px_45px_-28px_rgba(2,6,23,0.8)] focus-within:border-cyan-400/35 focus-within:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_24px_50px_-24px_rgba(8,145,178,0.45)]"
                    : "border-slate-200/90 bg-white/96 shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_20px_45px_-28px_rgba(15,23,42,0.2)] focus-within:border-cyan-300 focus-within:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_24px_50px_-24px_rgba(37,99,235,0.2)]"
                }`}
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${isDark ? "bg-white/8 text-slate-300" : "bg-slate-950/5 text-slate-500"}`}>
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  placeholder={ui.searchPlaceholder}
                  className={`min-w-0 flex-1 bg-transparent text-sm font-medium outline-none md:text-base ${
                    isDark ? "text-slate-100 placeholder:text-slate-500" : "text-slate-700 placeholder:text-slate-400"
                  }`}
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSearch}
                className={`${gradientButtonClass} shadow-[0_18px_45px_-20px_rgba(37,99,235,0.95)] before:absolute before:inset-0 before:bg-[linear-gradient(120deg,rgba(255,255,255,0.34),transparent_35%,transparent_65%,rgba(255,255,255,0.18))] before:opacity-80`}
              >
                <span className="relative z-10">{ui.findNow}</span>
              </motion.button>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {ui.shortcuts.map((shortcut) => (
                <motion.button
                  key={shortcut}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    shortcut === ui.shortcuts[0]
                      ? navigateTo("appointments")
                      : shortcut === ui.shortcuts[1]
                        ? navigateTo("records")
                        : navigateTo("pharmacy")
                  }
                  className={`rounded-full border px-4 py-2 text-sm font-medium backdrop-blur-xl transition-colors ${
                    isDark
                      ? "border-white/10 bg-white/8 text-slate-200 shadow-[0_14px_35px_-25px_rgba(2,6,23,0.7)] hover:border-cyan-300/25 hover:text-cyan-200"
                      : "border-slate-200/85 bg-white/92 text-slate-600 shadow-[0_14px_35px_-25px_rgba(15,23,42,0.18)] hover:border-cyan-200 hover:text-blue-700"
                  }`}
                >
                  {shortcut}
                </motion.button>
              ))}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {heroInsights.map((insight) => (
                <div
                  key={insight.label}
                  className={`rounded-[24px] border p-4 backdrop-blur-xl ${
                    isDark
                      ? "border-white/10 bg-white/8 shadow-[0_18px_40px_-26px_rgba(2,6,23,0.72)]"
                      : "border-slate-200/85 bg-white/90 shadow-[0_18px_40px_-26px_rgba(15,23,42,0.16)]"
                  }`}
                >
                  <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${isDark ? "text-slate-500" : "text-slate-400"}`}>{insight.label}</p>
                  <p className={`mt-3 text-2xl font-semibold tracking-tight ${isDark ? "text-slate-50" : "text-slate-900"}`}>{insight.value}</p>
                  <p className={`mt-1 text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>{insight.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden min-h-[360px] md:block">
            <motion.div
              style={{ x: springX, y: springY }}
              className="relative mx-auto flex h-full max-w-[430px] items-center justify-center"
            >
              <div className="absolute inset-x-10 bottom-2 h-16 rounded-full bg-blue-900/12 blur-2xl" />

              <motion.div
                animate={{ rotate: [0, 3, 0], y: [0, -8, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className={`relative overflow-hidden rounded-[34px] px-8 pb-6 pt-10 ${glassCardClass}`}
              >
                <div className={`absolute inset-0 ${isDark ? "bg-[linear-gradient(140deg,rgba(15,23,42,0.96),rgba(15,23,42,0.52))]" : "bg-[linear-gradient(140deg,rgba(255,255,255,0.92),rgba(255,255,255,0.55))]"}`} />
                <div className="absolute -right-10 top-4 h-28 w-28 rounded-full bg-cyan-200/55 blur-3xl" />
                <div className="absolute -left-8 bottom-6 h-24 w-24 rounded-full bg-indigo-200/55 blur-3xl" />

                <div className="relative">
                  <div className={`mx-auto w-fit rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] backdrop-blur-xl ${
                    isDark
                      ? "border-white/10 bg-white/8 text-slate-300"
                      : "border-slate-200/85 bg-white/90 text-slate-500"
                  }`}>
                    Live care overview
                  </div>
                  <img src="/Online Doctor.svg" alt="Doctor" className="mx-auto mt-6 h-56 drop-shadow-[0_24px_30px_rgba(59,130,246,0.18)]" />
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
                className={`absolute left-0 top-10 w-48 rounded-[26px] p-4 ${glassCardClass}`}
              >
                <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${isDark ? "text-slate-500" : "text-slate-400"}`}>Next focus</p>
                <p className={`mt-2 text-lg font-semibold ${isDark ? "text-slate-50" : "text-slate-900"}`}>
                  {nextAppointment ? `Dr. ${nextAppointment.doctor_name}` : ui.noUpcomingAppointments}
                </p>
                <p className={`mt-1 text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>
                  {nextAppointment ? formatAppointmentDateTime(nextAppointment.appointmentDate) : ui.bookConsultationToSeeHere}
                </p>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 7.2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-8 right-0 w-52 rounded-[28px] border border-slate-900/5 bg-slate-950/85 p-4 text-white shadow-[0_24px_55px_-20px_rgba(15,23,42,0.5)] backdrop-blur-2xl"
              >
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-100/60">Readiness</p>
                  <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-200">
                    Stable
                  </span>
                </div>
                <p className="mt-3 text-3xl font-semibold">{profileCompletion}%</p>
                <p className="mt-1 text-sm text-slate-300">Profile completion and access are flowing smoothly.</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <AnimatePresence>
        {dashboardData.error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex flex-col gap-4 rounded-[28px] border p-5 backdrop-blur-xl md:flex-row md:items-center md:justify-between ${
              isDark
                ? "border-amber-300/15 bg-amber-400/10 text-amber-100 shadow-[0_18px_45px_-28px_rgba(120,53,15,0.55)]"
                : "border-amber-200/60 bg-amber-50/92 text-amber-900 shadow-[0_18px_45px_-28px_rgba(180,83,9,0.24)]"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`rounded-2xl p-2.5 ${isDark ? "bg-amber-300/10 text-amber-200" : "bg-amber-100 text-amber-700"}`}>
                <AlertCircle size={18} />
              </div>
              <div>
                <h3 className="font-semibold">{ui.dataLoadErrorTitle}</h3>
                <p className={`mt-1 text-sm ${isDark ? "text-amber-100/80" : "text-amber-800/85"}`}>{dashboardData.error}</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.location.reload()}
              className={`rounded-2xl border px-4 py-2.5 text-sm font-semibold shadow-sm ${
                isDark ? "border-amber-200/15 bg-white/10 text-amber-100" : "border-amber-200 bg-white text-amber-800"
              }`}
            >
              {ui.retry}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card, index) => (
          <SummaryCard key={card.title} {...card} index={index} isLoading={dashboardData.isLoading} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`lg:col-span-2 rounded-[32px] p-6 md:p-7 ${glassPanelClass}`}
        >
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${isDark ? "text-slate-500" : "text-slate-400"}`}>Wellness snapshot</p>
              <h3 className={`mt-2 flex items-center gap-2 text-xl font-semibold ${isDark ? "text-slate-50" : "text-slate-900"}`}>
                <HeartPulse size={20} className="text-cyan-500" /> {ui.healthSnapshot}
              </h3>
            </div>
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigateTo("profile")}
              className={`w-fit rounded-full border px-4 py-2 text-sm font-semibold backdrop-blur-xl ${
                isDark ? "border-white/10 bg-white/8 text-cyan-200" : "border-slate-200/85 bg-white/92 text-blue-700"
              }`}
            >
              {ui.updateProfile}
            </motion.button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SnapshotMetric
              tone="red"
              label={ui.bloodGroup}
              value={user?.blood_group || "Add"}
              helper={user?.blood_group ? ui.onProfile : ui.completeProfile}
            />
            <SnapshotMetric
              tone="emerald"
              label={ui.weight}
              value={user?.weight ? `${user.weight} kg` : "--"}
              helper={user?.weight ? ui.latestSaved : ui.notAdded}
            />
            <SnapshotMetric
              tone="blue"
              label={ui.height}
              value={user?.height ? `${user.height} cm` : "--"}
              helper={user?.height ? ui.latestSaved : ui.notAdded}
            />
            <SnapshotMetric
              tone="amber"
              label={ui.contact}
              value={user?.email && user?.mobile ? ui.verified : ui.pending}
              helper={user?.email && user?.mobile ? ui.recoveryReady : ui.addEmailMobile}
            />
          </div>

          <div
            className={`mt-6 grid gap-4 rounded-[28px] border p-5 backdrop-blur-xl md:grid-cols-[1.2fr_0.8fr] md:items-center ${
              isDark ? "border-white/10 bg-white/8" : "border-slate-200/85 bg-white/88"
            }`}
          >
            <div>
              <p className={`text-sm font-semibold ${isDark ? "text-slate-100" : "text-slate-700"}`}>{ui.profileCompletion}</p>
              <p className={`mt-1 text-sm leading-6 ${isDark ? "text-slate-300" : "text-slate-500"}`}>{ui.profileCompletionDesc}</p>
            </div>
            <div className="w-full">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className={isDark ? "text-slate-400" : "text-slate-500"}>Complete</span>
                <span className="font-semibold text-blue-700">{profileCompletion}%</span>
              </div>
              <div className={`h-3 rounded-full p-0.5 ${isDark ? "bg-slate-800" : "bg-slate-200/80"}`}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${profileCompletion}%` }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600"
                />
              </div>
            </div>
          </div>
        </motion.section>
 
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={`relative overflow-hidden rounded-[32px] p-6 ${
            nextAppointment
              ? "bg-slate-950 text-white shadow-[0_24px_70px_-28px_rgba(15,23,42,0.75)]"
              : `${glassPanelClass} ${isDark ? "text-slate-50" : "text-slate-900"}`
          }`}
        >
          {nextAppointment ? (
            <>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.26),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(99,102,241,0.28),_transparent_30%)]" />
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-100/65">Live appointment</p>
                    <h3 className="mt-2 text-xl font-semibold">{ui.nextAppointment}</h3>
                  </div>
                  <div className="rounded-2xl border border-white/12 bg-white/10 p-3 backdrop-blur-xl">
                    <Calendar size={20} className="text-cyan-200" />
                  </div>
                </div>

                <div className="mt-6 rounded-[28px] border border-white/12 bg-white/10 p-5 backdrop-blur-2xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-white/10 text-lg font-semibold">
                      Dr
                    </div>
                    <div>
                      <p className="text-lg font-semibold">Dr. {nextAppointment.doctor_name}</p>
                      <p className="text-sm capitalize text-slate-200/85">{nextAppointment.status}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4 text-sm">
                    <span className="text-cyan-100">{formatAppointmentDateTime(nextAppointment.appointmentDate)}</span>
                    <span className="rounded-full border border-cyan-300/20 bg-cyan-400/12 px-3 py-1 text-xs font-semibold text-cyan-100">
                      {ui.videoCall}
                    </span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigateTo("appointments")}
                  className="mt-6 rounded-[22px] bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-[0_18px_40px_-22px_rgba(255,255,255,0.7)]"
                >
                  {ui.openAppointments}
                </motion.button>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-[22px] border text-blue-600 backdrop-blur-xl ${
                  isDark ? "border-white/10 bg-white/8" : "border-slate-200/85 bg-white/90"
                }`}
              >
                <Calendar size={24} />
              </div>
              <h3 className={`mt-5 text-lg font-semibold ${isDark ? "text-slate-50" : "text-slate-900"}`}>{ui.noUpcomingAppointments}</h3>
              <p className={`mt-2 max-w-xs text-sm leading-6 ${isDark ? "text-slate-300" : "text-slate-500"}`}>
                {dashboardData.isLoading ? ui.checkingSchedule : ui.bookConsultationToSeeHere}
              </p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigateTo("appointments")}
                className={`mt-5 rounded-full border px-4 py-2 text-sm font-semibold backdrop-blur-xl ${
                  isDark ? "border-white/10 bg-white/8 text-cyan-200" : "border-slate-200/85 bg-white/92 text-blue-700"
                }`}
              >
                {ui.bookNow}
              </motion.button>
            </div>
          )}
        </motion.section>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <WidgetSection
          title={ui.upcomingConsultations}
          icon={<Clock3 size={20} className="text-cyan-500" />}
          actionLabel={ui.viewAll}
          onAction={() => navigateTo("appointments")}
        >
          {dashboardData.isLoading ? (
            [1, 2, 3].map((item) => <LoadingListItem key={item} />)
          ) : upcomingAppointments.length > 0 ? (
            upcomingAppointments
              .slice(0, 3)
              .map((appointment) => (
                <AppointmentPreviewCard key={appointment.id} appointment={appointment} onOpen={() => navigateTo("appointments")} />
              ))
          ) : (
            <EmptyStateCard title={ui.noConsultations} description={ui.noConsultationsDesc} actionLabel={ui.findDoctorTitle} onAction={() => navigateTo("appointments")} />
          )}
        </WidgetSection>

        <WidgetSection
          title={ui.recentRecords}
          icon={<FileText size={20} className="text-cyan-500" />}
          actionLabel={ui.openRecords}
          onAction={() => navigateTo("records")}
        >
          {dashboardData.isLoading ? (
            [1, 2, 3].map((item) => <LoadingListItem key={item} />)
          ) : recentRecords.length > 0 ? (
            recentRecords.map((record) => <RecordPreviewCard key={record.id} record={record} onOpen={() => navigateTo("records")} />)
          ) : (
            <EmptyStateCard title={ui.noRecords} description={ui.noRecordsDesc} actionLabel={ui.uploadRecords} onAction={() => navigateTo("records")} />
          )}
        </WidgetSection>
      </div>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${isDark ? "text-slate-500" : "text-slate-400"}`}>Quick actions</p>
            <h3 className={`mt-2 flex items-center gap-2 text-xl font-semibold ${isDark ? "text-slate-50" : "text-slate-900"}`}>
              <LayoutDashboard size={22} className="text-cyan-500" /> {ui.quickAccess}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          <ServiceCard title={ui.findDoctorTitle} desc={ui.findDoctorDesc} icon={<Video size={28} />} color="blue" onClick={() => navigateTo("appointments")} />
          <ServiceCard title={ui.medicinesTitle} desc={ui.medicinesDesc} icon={<Pill size={28} />} color="green" onClick={() => navigateTo("pharmacy")} />
          <ServiceCard title={ui.recordsTitle} desc={ui.recordsDesc} icon={<FileText size={28} />} color="purple" onClick={() => navigateTo("records")} />
          <ServiceCard title={ui.emergencyTitle} desc={ui.emergencyDesc} icon={<Activity size={28} />} color="red" onClick={() => navigateTo("emergency")} />
        </div>
      </section>
    </div>
  );
};

const WidgetSection = ({ title, icon, actionLabel, onAction, children }) => {
  const { isDark } = useDashboardTheme();
  const glassPanelClass = getGlassPanelClass(isDark);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18 }}
      className={`rounded-[32px] p-6 ${glassPanelClass}`}
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <h3 className={`flex items-center gap-2 text-lg font-semibold ${isDark ? "text-slate-50" : "text-slate-900"}`}>
          {icon} {title}
        </h3>
        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAction}
          className={`rounded-full border px-4 py-2 text-sm font-semibold backdrop-blur-xl ${
            isDark ? "border-white/10 bg-white/8 text-cyan-200" : "border-slate-200/85 bg-white/92 text-blue-700"
          }`}
        >
          {actionLabel}
        </motion.button>
      </div>
      <div className="space-y-3">{children}</div>
    </motion.section>
  );
};

const SummaryCard = ({ title, value, subtitle, insight, icon, tone, onClick, index, isLoading }) => {
  const { isDark } = useDashboardTheme();
  const glassCardClass = getGlassCardClass(isDark);
  const toneStyles = {
    blue: "from-cyan-400/20 via-blue-500/16 to-indigo-500/16 text-blue-700",
    indigo: "from-violet-400/20 via-indigo-500/16 to-blue-500/16 text-indigo-700",
    emerald: "from-emerald-400/20 via-teal-500/16 to-cyan-500/16 text-emerald-700",
    amber: "from-amber-400/20 via-orange-500/16 to-rose-500/16 text-amber-700",
  }[tone];

  return (
    <motion.button
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 * index }}
      whileHover={{ y: -8, scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className={`group relative overflow-hidden rounded-[28px] p-5 text-left ${glassCardClass}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${toneStyles} opacity-100`} />
      <div className={`absolute inset-0 opacity-70 ${isDark ? "bg-[linear-gradient(120deg,rgba(255,255,255,0.1),transparent_45%)]" : "bg-[linear-gradient(120deg,rgba(255,255,255,0.45),transparent_45%)]"}`} />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={`text-sm font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>{title}</p>
            {isLoading ? (
              <>
                <div className="dashboard-shimmer mt-4 h-8 w-20 rounded-2xl" />
                <div className="dashboard-shimmer mt-3 h-4 w-32 rounded-full" />
              </>
            ) : (
              <>
                <p className={`mt-4 text-3xl font-semibold tracking-tight ${isDark ? "text-slate-50" : "text-slate-900"}`}>{value}</p>
                <p className={`mt-2 text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>{subtitle}</p>
              </>
            )}
          </div>
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-[18px] border backdrop-blur-xl ${
              isDark
                ? "border-white/10 bg-white/8 text-slate-100 shadow-[0_16px_40px_-28px_rgba(2,6,23,0.8)]"
                : "border-slate-200/85 bg-white/92 text-slate-700 shadow-[0_16px_40px_-28px_rgba(15,23,42,0.18)]"
            }`}
          >
            {icon}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between text-sm">
          <span className={isDark ? "text-slate-400" : "text-slate-500"}>{insight}</span>
          <motion.span
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className={`rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-xl ${
              isDark ? "border-white/10 bg-white/8 text-slate-100" : "border-slate-200/85 bg-white/90 text-slate-700"
            }`}
          >
            Explore
          </motion.span>
        </div>
      </div>
    </motion.button>
  );
};

const SnapshotMetric = ({ label, value, helper, tone }) => {
  const { isDark } = useDashboardTheme();
  const toneStyles = {
    red: "from-rose-400/16 to-orange-400/14 text-rose-700",
    blue: "from-cyan-400/16 to-indigo-400/14 text-blue-700",
    emerald: "from-emerald-400/16 to-cyan-400/14 text-emerald-700",
    amber: "from-amber-400/16 to-orange-400/14 text-amber-700",
  }[tone];

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      className={`rounded-[26px] border p-4 backdrop-blur-xl ${
        isDark
          ? `border-white/10 bg-gradient-to-br ${toneStyles} shadow-[0_18px_40px_-28px_rgba(2,6,23,0.78)]`
          : `border-slate-200/85 bg-gradient-to-br ${toneStyles} shadow-[0_18px_40px_-28px_rgba(15,23,42,0.16)]`
      }`}
    >
      <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>{label}</p>
      <p className={`mt-3 text-2xl font-semibold tracking-tight ${isDark ? "text-slate-50" : "text-slate-900"}`}>{value}</p>
      <p className={`mt-2 text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>{helper}</p>
    </motion.div>
  );
};

const AppointmentPreviewCard = ({ appointment, onOpen }) => {
  const { isDark } = useDashboardTheme();
  const glassCardClass = getGlassCardClass(isDark);

  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.985 }}
      onClick={onOpen}
      className={`group w-full rounded-[24px] p-4 text-left ${glassCardClass}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`font-semibold ${isDark ? "text-slate-50" : "text-slate-900"}`}>Dr. {appointment.doctor_name}</p>
          <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{formatAppointmentDateTime(appointment.appointmentDate)}</p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize backdrop-blur-xl ${
            isDark ? "border-white/10 bg-white/8 text-slate-200" : "border-slate-200/85 bg-white/90 text-slate-600"
          }`}
        >
          {appointment.status}
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className={isDark ? "text-slate-400" : "text-slate-500"}>Open your appointments to manage this consult</span>
        <ArrowRight size={16} className="text-blue-500 transition-transform group-hover:translate-x-1" />
      </div>
    </motion.button>
  );
};

const RecordPreviewCard = ({ record, onOpen }) => {
  const { isDark } = useDashboardTheme();
  const glassCardClass = getGlassCardClass(isDark);

  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.985 }}
      onClick={onOpen}
      className={`group w-full rounded-[24px] p-4 text-left ${glassCardClass}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`line-clamp-1 font-semibold ${isDark ? "text-slate-50" : "text-slate-900"}`} title={record.file_name}>
            {displayDocumentName(record.file_name)}
          </p>
          <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Added {formatShortDate(record.uploaded_at)}</p>
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-[18px] border text-blue-600 backdrop-blur-xl ${
            isDark ? "border-white/10 bg-white/8" : "border-slate-200/85 bg-white/90"
          }`}
        >
          <FileText size={18} />
        </div>
      </div>
    </motion.button>
  );
};

const EmptyStateCard = ({ title, description, actionLabel, onAction }) => {
  const { isDark } = useDashboardTheme();
  const glassCardClass = getGlassCardClass(isDark);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`rounded-[26px] p-6 text-center ${glassCardClass}`}>
      <p className={`font-semibold ${isDark ? "text-slate-50" : "text-slate-900"}`}>{title}</p>
      <p className={`mt-2 text-sm leading-6 ${isDark ? "text-slate-300" : "text-slate-500"}`}>{description}</p>
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        onClick={onAction}
        className={`mt-4 ${gradientButtonClass}`}
      >
        {actionLabel}
      </motion.button>
    </motion.div>
  );
};

const LoadingListItem = () => {
  const { isDark } = useDashboardTheme();
  const glassCardClass = getGlassCardClass(isDark);

  return (
    <div className={`rounded-[24px] p-4 ${glassCardClass}`}>
      <div className="dashboard-shimmer h-5 w-32 rounded-full" />
      <div className="dashboard-shimmer mt-3 h-4 w-48 rounded-full" />
      <div className="dashboard-shimmer mt-4 h-3 w-full rounded-full" />
    </div>
  );
};

const ServiceCard = ({ title, desc, icon, color, onClick }) => {
  const { isDark } = useDashboardTheme();
  const glassCardClass = getGlassCardClass(isDark);
  const colorStyles = {
    blue: "from-cyan-400/18 via-blue-500/16 to-indigo-500/16 text-blue-700",
    green: "from-emerald-400/18 via-teal-500/16 to-cyan-500/16 text-emerald-700",
    purple: "from-fuchsia-400/18 via-violet-500/16 to-indigo-500/16 text-violet-700",
    red: "from-rose-400/18 via-red-500/16 to-orange-500/16 text-rose-700",
  }[color];

  return (
    <motion.button
      whileHover={{ y: -8, scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className={`group relative overflow-hidden rounded-[30px] p-6 text-left ${glassCardClass}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${colorStyles}`} />
      <div className={`absolute inset-0 opacity-70 ${isDark ? "bg-[linear-gradient(120deg,rgba(255,255,255,0.08),transparent_40%)]" : "bg-[linear-gradient(120deg,rgba(255,255,255,0.45),transparent_40%)]"}`} />
      <div className="relative">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-[22px] border backdrop-blur-xl transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3 ${
            isDark ? "border-white/10 bg-white/8 text-slate-100" : "border-slate-200/85 bg-white/90 text-slate-700"
          }`}
        >
          {icon}
        </div>
        <h3 className={`mt-5 text-lg font-semibold ${isDark ? "text-slate-50" : "text-slate-900"}`}>{title}</h3>
        <p className={`mt-2 text-sm leading-6 ${isDark ? "text-slate-300" : "text-slate-500"}`}>{desc}</p>
        <div className={`mt-5 flex items-center justify-between text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-600"}`}>
          <span>Open workspace</span>
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </motion.button>
  );
};

const displayDocumentName = (fileName = "") => {
  if (!fileName) {
    return "Medical record";
  }

  return fileName.includes("user_") ? fileName.split("_").slice(1).join("_") : fileName;
};

const formatShortDate = (value) => {
  if (!value) {
    return "recently";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "recently";
  }

  return parsedDate.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatAppointmentDateTime = (value) => {
  if (!value || Number.isNaN(value.getTime())) {
    return "Time not available";
  }

  return value.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function Dashboard({ user, t, onLogout, language, onLanguageChange, refreshUser }) {
  const ui = getUiCopy(language).dashboard;
  const [activeTab, setActiveTab] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme === "light" || storedTheme === "dark") {
      return storedTheme;
    }

    return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
  });
  const [tabParams, setTabParams] = useState({});
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const isDark = theme === "dark";
  const isAiCheckerTab = activeTab === "ai-checker";
  const glassPanelClass = getGlassPanelClass(isDark);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const navigateTo = (tab, params = {}) => {
    setActiveTab(tab);
    setTabParams(params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setActiveTab("home");
    setTabParams({});
  };

  const toggleSidebar = () => {
    setSidebarOpen((current) => !current);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "consult":
        return <ConsultationFlow user={user} onBack={goBack} t={t} />;
      case "pharmacy":
        return <NearbyMedicines t={t} onBack={goBack} />;
      case "records":
        return <HealthRecordsScreen t={t} onBack={goBack} />;
      case "ai-checker":
        return <AISymptomCheckerScreen t={t} language={language} onLanguageChange={onLanguageChange} onBack={goBack} />;
      case "appointments":
        return (
          <AppointmentFlow
            user={user}
            t={t}
            onBack={goBack}
            initialSearchQuery={tabParams.search}
            onOpenConsult={() => navigateTo("consult")}
          />
        );
      case "emergency":
        return <EmergencyScreen t={t} user={user} />;
      case "profile":
        return <ProfileScreen user={user} onLogout={onLogout} refreshUser={refreshUser} />;
      case "home":
      default:
        return <DashboardHome navigateTo={navigateTo} user={user} ui={ui} />;
    }
  };

  return (
    <DashboardThemeContext.Provider value={{ theme, isDark }}>
      <div className="patient-shell relative flex min-h-screen overflow-hidden font-sans" data-theme={theme}>
        <div className="pointer-events-none absolute inset-0">
          <div className={`absolute -left-24 top-0 h-80 w-80 rounded-full blur-3xl ${isDark ? "bg-cyan-400/16" : "bg-cyan-300/25"}`} />
          <div className={`absolute right-0 top-20 h-96 w-96 rounded-full blur-3xl ${isDark ? "bg-indigo-400/14" : "bg-indigo-300/18"}`} />
          <div className={`absolute bottom-0 left-1/3 h-72 w-72 rounded-full blur-3xl ${isDark ? "bg-blue-500/12" : "bg-blue-200/24"}`} />
        </div>
        <div className="hero-grid-overlay pointer-events-none absolute inset-0 opacity-40" />

        <PatientSidebar
          activeTab={activeTab}
          setActiveTab={navigateTo}
          onLogout={onLogout}
          isOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          ui={ui}
          user={user}
        />

        <main
          className={`relative z-10 flex flex-1 flex-col transition-all duration-300 ${
            sidebarOpen ? "md:ml-[20rem]" : "md:ml-[7.2rem]"
          } ${isAiCheckerTab ? "min-h-screen" : ""}`}
        >
          <header className="sticky top-0 z-40 px-4 pt-4 sm:px-6 lg:px-8">
            <div className={`mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-[28px] px-4 py-3 md:px-5 ${glassPanelClass}`}>
              <div className="flex min-w-0 items-center gap-3 md:gap-4">
                <HeaderIconButton className="md:hidden" onClick={() => setSidebarOpen(true)}>
                  <Menu size={20} />
                </HeaderIconButton>

                <div className="welcome-text min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="hidden h-10 w-10 items-center justify-center rounded-[18px] bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-[0_16px_40px_-22px_rgba(37,99,235,0.9)] md:flex">
                      <Sparkles size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-[11px] font-semibold uppercase tracking-[0.28em] ${isDark ? "text-slate-400" : "text-slate-400"}`}>Patient dashboard</p>
                      <h1 className={`truncate text-lg font-semibold tracking-tight md:text-xl ${isDark ? "text-slate-50" : "text-slate-900"}`}>
                        Care hub for {firstName(user?.full_name)}
                      </h1>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-3">
                <div
                  className={`hidden rounded-2xl border px-3 py-2 text-sm font-medium backdrop-blur-xl lg:block ${
                    isDark ? "border-white/10 bg-white/8 text-slate-300" : "border-slate-200/85 bg-white/92 text-slate-600"
                  }`}
                >
                  Health data synced
                </div>
                <LanguageSwitcher language={language} onChange={onLanguageChange} compact themeVariant={isDark ? "dark" : "light"} />
                <HeaderIconButton
                  onClick={() => setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"))}
                  aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                  title={isDark ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {isDark ? <Sun size={18} /> : <Moon size={18} />}
                </HeaderIconButton>
                <HeaderIconButton onClick={() => navigateTo("profile")}>
                  <User size={18} />
                </HeaderIconButton>
                <HeaderIconButton className="relative">
                  <Bell size={18} />
                  <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]" />
                </HeaderIconButton>
              </div>
            </div>
          </header>

          <div
            className={`relative z-10 px-4 pt-6 sm:px-6 lg:px-8 ${
              isAiCheckerTab ? "flex min-h-0 flex-1 pb-8" : "pb-10"
            }`}
          >
            <div className={`mx-auto max-w-7xl ${isAiCheckerTab ? "flex min-h-0 w-full flex-1" : ""}`}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeTab}
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className={isAiCheckerTab ? "flex min-h-0 w-full flex-1" : ""}
                >
                  {renderActiveTab()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>
        {activeTab !== "ai-checker" && (
          <div
            className="fixed bottom-24 right-6 z-50 pointer-events-none md:bottom-10"
            style={{
              transform: `translate(${position.x}px, ${position.y}px)`,
              transition: isDragging ? "none" : "transform 0.1s ease-out",
            }}
          >
            <div className="flex flex-col-reverse items-end gap-2 animate-float-medium">
              <button
                onMouseDown={(event) => {
                  setIsDragging(true);
                  dragStart.current = {
                    startX: event.clientX,
                    startY: event.clientY,
                    initialX: position.x,
                    initialY: position.y,
                  };

                  const handleMouseMove = (moveEvent) => {
                    const dx = moveEvent.clientX - dragStart.current.startX;
                    const dy = moveEvent.clientY - dragStart.current.startY;
                    setPosition({
                      x: dragStart.current.initialX + dx,
                      y: dragStart.current.initialY + dy,
                    });
                  };

                  const handleMouseUp = (upEvent) => {
                    setIsDragging(false);
                    const distance = Math.hypot(
                      upEvent.clientX - dragStart.current.startX,
                      upEvent.clientY - dragStart.current.startY
                    );

                    if (distance < 5) {
                      navigateTo("ai-checker");
                    }

                    window.removeEventListener("mousemove", handleMouseMove);
                    window.removeEventListener("mouseup", handleMouseUp);
                  };

                  window.addEventListener("mousemove", handleMouseMove);
                  window.addEventListener("mouseup", handleMouseUp);
                }}
                onMouseEnter={() => {
                  if (!isDragging && "speechSynthesis" in window) {
                    window.speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance("Hi I'm Setu, click me to get AI suggestions.");
                    utterance.pitch = 1.6;
                    utterance.rate = 1.1;
                    window.speechSynthesis.speak(utterance);
                  }
                }}
                onMouseLeave={() => {
                  if ("speechSynthesis" in window) {
                    window.speechSynthesis.cancel();
                  }
                }}
                className={`peer pointer-events-auto rounded-full border p-1 backdrop-blur-xl transition-transform duration-300 active:scale-95 focus:outline-none ${
                  isDark
                    ? "border-white/10 bg-white/8 shadow-[0_25px_60px_-22px_rgba(8,145,178,0.5)]"
                    : "border-slate-200/80 bg-white/70 shadow-[0_25px_60px_-22px_rgba(59,130,246,0.28)]"
                } ${!isDragging ? "hover:scale-110" : "cursor-grabbing"}`}
                style={{ cursor: isDragging ? "grabbing" : "grab" }}
              >
                <img
                  src="/cute_robot_avatar.png"
                  alt="AI Helper"
                  className="pointer-events-none h-20 w-20 select-none object-contain drop-shadow-2xl md:h-32 md:w-32"
                />
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardThemeContext.Provider>
  );
}
