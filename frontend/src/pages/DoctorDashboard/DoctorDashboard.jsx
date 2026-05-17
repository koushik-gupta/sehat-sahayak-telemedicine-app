// src/pages/DoctorDashboard/DoctorDashboard.jsx
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import {
  Bell,
  Calendar,
  ChevronRight,
  Clock,
  FileText,
  LogOut,
  Menu,
  Moon,
  Search,
  Sparkles,
  Stethoscope,
  Sun,
  TrendingUp,
  User,
  Users,
} from "lucide-react";

import LanguageSwitcher from "../../components/LanguageSwitcher";
import { resolveBackendAssetUrl } from "../../utils/runtime";
import "../Dashboard/PatientDashboard.css";
import "./DoctorDashboard.css";
import UpcomingConsultations from "./UpcomingConsultations";
import InCallScreen from "../Dashboard/Consultation/InCallScreen";
import DoctorProfileEditor from "./DoctorProfileEditor";
import RecentPatients from "./RecentPatients";
import Prescriptions from "./Prescriptions";
import AvailabilityScheduler from "./AvailabilityScheduler";
import AnalyticsDashboard from "./AnalyticsDashboard";
import {
  DashboardThemeContext,
  getGlassPanelClass,
  pickTheme,
  useDashboardTheme,
} from "../Dashboard/DashboardThemeContext";
import { getDoctorDashboardCopy } from "./doctorDashboardCopy";

const THEME_STORAGE_KEY = "sehat-sahayak-dashboard-theme";

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } },
};

const firstName = (user) =>
  user?.first_name || user?.full_name?.split(" ")?.[0] || user?.last_name || "Doctor";

function DoctorDashboard({ user, onLogout, t, language = "en", onLanguageChange, refreshUser }) {
  const d = getDoctorDashboardCopy(language);
  const [activeTab, setActiveTab] = useState("schedule");
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [view, setView] = useState("dashboard");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
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

  const isDark = theme === "dark";

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const handleStartCall = (appointment) => {
    setSelectedAppointment(appointment);
    setView("in_call");
  };

  const handleEndCall = () => {
    setSelectedAppointment(null);
    setView("dashboard");
  };

  const navigateTo = (tabId) => {
    setActiveTab(tabId);
    setSelectedPatientId(null);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderContent = () => {
    switch (activeTab) {
      case "schedule":
        return <UpcomingConsultations onStartCall={handleStartCall} t={d} onNavigate={navigateTo} />;
      case "patients":
        return <RecentPatients onViewDetails={setSelectedPatientId} detailPage={selectedPatientId} searchQuery={searchQuery} t={d} />;
      case "prescriptions":
        return <Prescriptions t={d} />;
      case "availability":
        return <AvailabilityScheduler t={d} />;
      case "analytics":
        return <AnalyticsDashboard t={d} />;
      case "profile":
        return <DoctorProfileEditor t={d} user={user} refreshUser={refreshUser} />;
      default:
        return <UpcomingConsultations onStartCall={handleStartCall} t={d} onNavigate={navigateTo} />;
    }
  };

  if (view === "in_call") {
    return <InCallScreen user={user} appointment={selectedAppointment} onEndCall={handleEndCall} t={t} />;
  }

  return (
    <DashboardThemeContext.Provider value={{ theme, isDark }}>
      <div className="patient-shell doctor-shell relative flex min-h-screen overflow-hidden font-sans" data-theme={theme}>
        <div className="pointer-events-none absolute inset-0">
          <div className={`absolute -left-24 top-0 h-80 w-80 rounded-full blur-3xl ${isDark ? "bg-cyan-400/16" : "bg-cyan-300/25"}`} />
          <div className={`absolute right-0 top-20 h-96 w-96 rounded-full blur-3xl ${isDark ? "bg-indigo-400/14" : "bg-indigo-300/18"}`} />
          <div className={`absolute bottom-0 left-1/3 h-72 w-72 rounded-full blur-3xl ${isDark ? "bg-blue-500/12" : "bg-blue-200/24"}`} />
        </div>
        <div className="hero-grid-overlay pointer-events-none absolute inset-0 opacity-40" />

        <DoctorSidebar
          activeTab={activeTab}
          isOpen={isSidebarOpen}
          onLogout={onLogout}
          onSelect={navigateTo}
          t={d}
          toggleSidebar={() => setIsSidebarOpen((current) => !current)}
        />

        <main className={`relative z-10 flex flex-1 flex-col transition-all duration-300 ${isSidebarOpen ? "md:ml-[20rem]" : "md:ml-[7.2rem]"}`}>
          <DoctorTopbar
            user={user}
            activeTab={activeTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            language={language}
            t={d}
            onLanguageChange={onLanguageChange}
            onOpenSidebar={() => setIsSidebarOpen(true)}
            onOpenProfile={() => navigateTo("profile")}
            onToggleTheme={() => setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"))}
          />

          <div className="relative z-10 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <AnimatePresence mode="wait" initial={false}>
                <Motion.div key={activeTab} variants={pageVariants} initial="initial" animate="animate" exit="exit">
                  {renderContent()}
                </Motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
    </DashboardThemeContext.Provider>
  );
}

const DoctorSidebar = ({ activeTab, isOpen, toggleSidebar, onSelect, onLogout, t }) => {
  const { isDark } = useDashboardTheme();
  const practiceItems = [
    { id: "schedule", label: t.nav.schedule, icon: Calendar },
    { id: "patients", label: t.nav.patients, icon: Users },
    { id: "prescriptions", label: t.nav.prescriptions, icon: FileText },
    { id: "availability", label: t.nav.availability, icon: Clock },
    { id: "analytics", label: t.nav.analytics, icon: TrendingUp },
  ];
  const personalItems = [{ id: "profile", label: t.nav.profile, icon: User }];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-20 bg-slate-950/45 backdrop-blur-sm md:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      <Motion.aside
        layout
        transition={{ type: "spring", stiffness: 240, damping: 24 }}
        whileHover={window.innerWidth >= 768 ? { scale: 1.01, x: 2 } : undefined}
        className={`fixed inset-y-3 left-3 z-30 flex flex-col overflow-hidden rounded-[30px] border backdrop-blur-2xl transition-transform duration-300 ${
          isDark
            ? "border-white/10 bg-slate-950/92 text-white shadow-[0_32px_90px_-24px_rgba(2,6,23,0.92)]"
            : "border-white/40 bg-white/56 text-slate-900 shadow-[0_30px_80px_-24px_rgba(14,116,144,0.18)]"
        } ${isOpen ? "w-[18rem] translate-x-0" : "-translate-x-[120%] w-[5.8rem] md:translate-x-0"} md:inset-y-4 md:left-4`}
      >
        <div
          className={`absolute inset-0 ${
            isDark
              ? "bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.22),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.2),_transparent_28%)]"
              : "bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.34),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.24),_transparent_28%)]"
          }`}
        />

        <div className="relative flex h-full flex-col">
          <div className={`flex items-center ${isOpen ? "justify-between px-5 pb-4 pt-5" : "flex-col gap-4 px-3 pb-4 pt-5"}`}>
            <div className={`flex items-center gap-3 ${!isOpen ? "md:flex-col" : ""}`}>
              <Motion.button
                whileHover={{ rotate: 8, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={!isOpen ? toggleSidebar : undefined}
                className={`flex h-12 w-12 items-center justify-center rounded-2xl border backdrop-blur-xl ${
                  isDark
                    ? "border-white/20 bg-white/12 text-white shadow-[0_18px_45px_-18px_rgba(34,211,238,0.7)]"
                    : "border-white/45 bg-cyan-300/18 text-slate-800 shadow-[0_18px_45px_-18px_rgba(34,211,238,0.22)]"
                }`}
              >
                <Stethoscope size={22} />
              </Motion.button>

              {isOpen && (
                <div>
                  <p className={`text-[11px] font-semibold uppercase tracking-[0.32em] ${isDark ? "text-cyan-200/75" : "text-slate-500"}`}>{t.nav.doctorSpace}</p>
                  <p className={`text-xl font-semibold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                    Sehat<span className={`font-extrabold ${isDark ? "text-cyan-300" : "text-cyan-600"}`}>Sahayak</span>
                  </p>
                </div>
              )}
            </div>

            <Motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.96 }}
              onClick={toggleSidebar}
              className={`hidden rounded-2xl border p-2 transition-colors md:inline-flex ${
                isDark
                  ? "border-white/10 bg-white/8 text-slate-200 hover:border-cyan-300/20 hover:bg-white/12"
                  : "border-white/40 bg-white/40 text-slate-600 hover:border-cyan-300/30 hover:bg-white/55"
              } ${!isOpen ? "self-center" : ""}`}
            >
              <ChevronRight size={18} className={isOpen ? "rotate-180" : ""} />
            </Motion.button>
          </div>

          <nav className="dashboard-scrollbar relative mt-4 flex-1 space-y-7 overflow-y-auto px-3 pb-4">
            <SidebarSection label={t.nav.practice} items={practiceItems} activeTab={activeTab} isOpen={isOpen} onSelect={onSelect} />
            <SidebarSection label={t.nav.personal} items={personalItems} activeTab={activeTab} isOpen={isOpen} onSelect={onSelect} />
          </nav>

          <div className="relative p-3">
            <Motion.button
              whileHover={{ scale: 1.01, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={onLogout}
              className={`flex w-full items-center gap-3 rounded-[24px] border bg-gradient-to-r px-4 py-3 text-sm font-semibold backdrop-blur-xl transition-colors ${
                isDark
                  ? "border-rose-400/15 from-rose-500/16 to-orange-400/10 text-rose-100 hover:border-rose-300/30 hover:from-rose-500/22 hover:to-orange-400/18"
                  : "border-rose-300/25 from-rose-500/10 to-orange-400/10 text-rose-700 hover:border-rose-300/40 hover:from-rose-500/16 hover:to-orange-400/14"
              } ${!isOpen ? "justify-center px-0" : ""}`}
            >
              <LogOut size={18} />
              {isOpen && <span>{t.nav.logout}</span>}
            </Motion.button>
          </div>
        </div>
      </Motion.aside>
    </>
  );
};

const SidebarSection = ({ label, items, activeTab, isOpen, onSelect }) => (
  <div className="space-y-2">
    {isOpen && <SidebarSectionLabel>{label}</SidebarSectionLabel>}
    {items.map((item) => (
      <NavItem key={item.id} icon={item.icon} label={item.label} isActive={activeTab === item.id} onClick={() => onSelect(item.id)} isOpen={isOpen} />
    ))}
  </div>
);

const SidebarSectionLabel = ({ children }) => {
  const { isDark } = useDashboardTheme();
  return <p className={`px-3 text-[11px] font-semibold uppercase tracking-[0.28em] ${isDark ? "text-slate-400/90" : "text-slate-500/95"}`}>{children}</p>;
};

const NavItem = ({ icon, label, isActive, onClick, isOpen }) => {
  const { isDark } = useDashboardTheme();
  return (
    <Motion.button
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
        <Motion.div
          layoutId="doctor-sidebar-active-pill"
          className="absolute inset-0 rounded-[24px] bg-gradient-to-r from-cyan-400/24 via-blue-400/20 to-indigo-400/20"
          transition={{ type: "spring", stiffness: 280, damping: 26 }}
        />
      )}

      <div
        className={`relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] border ${
          isActive
            ? pickTheme(isDark, "border-white/45 bg-white/40 text-slate-900", "border-white/20 bg-white/18 text-white")
            : pickTheme(isDark, "border-white/35 bg-white/18 text-slate-600", "border-white/10 bg-white/8 text-slate-300")
        }`}
      >
        {React.createElement(icon, { size: 18 })}
      </div>

      {isOpen && (
        <div className="relative flex min-w-0 flex-1 items-center justify-between gap-3">
          <span className="truncate text-sm font-medium">{label}</span>
          {isActive && <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.9)]" />}
        </div>
      )}

      {!isOpen && (
        <span className={`pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-xl border px-3 py-1.5 text-xs opacity-0 shadow-xl transition-opacity group-hover:opacity-100 ${isDark ? "border-slate-700 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-900"}`}>
          {label}
        </span>
      )}
    </Motion.button>
  );
};

const DoctorTopbar = ({
  user,
  activeTab,
  searchQuery,
  setSearchQuery,
  language,
  t,
  onLanguageChange,
  onOpenSidebar,
  onOpenProfile,
  onToggleTheme,
}) => {
  const { isDark } = useDashboardTheme();
  const glassPanelClass = getGlassPanelClass(isDark);

  return (
    <header className="sticky top-0 z-40 px-4 pt-4 sm:px-6 lg:px-8">
      <div className={`mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-[28px] px-4 py-3 md:px-5 ${glassPanelClass}`}>
        <div className="flex min-w-0 items-center gap-3 md:gap-4">
          <HeaderIconButton className="md:hidden" onClick={onOpenSidebar}>
            <Menu size={20} />
          </HeaderIconButton>

          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="hidden h-10 w-10 items-center justify-center rounded-[18px] bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-[0_16px_40px_-22px_rgba(37,99,235,0.9)] md:flex">
                <Sparkles size={18} />
              </div>
              <div className="min-w-0">
                <p className={`text-[11px] font-semibold uppercase tracking-[0.28em] ${isDark ? "text-slate-400" : "text-slate-400"}`}>{t.topbar.eyebrow}</p>
                <h1 className={`truncate text-lg font-semibold tracking-tight md:text-xl ${isDark ? "text-slate-50" : "text-slate-900"}`}>
                  {t.topbar.titlePrefix} {firstName(user)}
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {activeTab === "patients" && (
            <div
              className={`hidden items-center gap-2 rounded-2xl border px-3 py-2 backdrop-blur-xl lg:flex ${
                isDark ? "border-white/10 bg-white/8 text-slate-300" : "border-slate-200/85 bg-white/92 text-slate-600"
              }`}
            >
              <Search size={16} />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={t.topbar.searchPatients}
                className={`w-40 bg-transparent text-sm outline-none ${isDark ? "text-slate-100 placeholder:text-slate-500" : "text-slate-700 placeholder:text-slate-400"}`}
              />
            </div>
          )}

          <div className={`hidden rounded-2xl border px-3 py-2 text-sm font-medium backdrop-blur-xl lg:block ${isDark ? "border-white/10 bg-white/8 text-slate-300" : "border-slate-200/85 bg-white/92 text-slate-600"}`}>
            {t.topbar.practiceSynced}
          </div>
          <div className={`hidden items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold backdrop-blur-xl sm:inline-flex ${isDark ? "border-emerald-400/15 bg-emerald-400/10 text-emerald-200" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
            {t.topbar.online}
          </div>
          <LanguageSwitcher language={language} onChange={onLanguageChange} compact themeVariant={isDark ? "dark" : "light"} />
          <HeaderIconButton onClick={onToggleTheme} aria-label={isDark ? t.topbar.switchLight : t.topbar.switchDark}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </HeaderIconButton>
          <HeaderIconButton onClick={onOpenProfile}>
            <User size={18} />
          </HeaderIconButton>
          <HeaderIconButton className="relative">
            <Bell size={18} />
            <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]" />
          </HeaderIconButton>
          <button onClick={onOpenProfile} className="hidden h-11 w-11 overflow-hidden rounded-2xl border border-white/50 shadow-[0_14px_35px_-24px_rgba(15,23,42,0.3)] sm:block">
            <img src={resolveBackendAssetUrl(user?.profile_picture) || "https://i.pravatar.cc/150?u=doctor"} alt={t.topbar.doctorAlt} className="h-full w-full object-cover" />
          </button>
        </div>
      </div>
    </header>
  );
};

const HeaderIconButton = ({ children, className = "", ...props }) => {
  const { isDark } = useDashboardTheme();

  return (
    <Motion.button
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
    </Motion.button>
  );
};

export default DoctorDashboard;
