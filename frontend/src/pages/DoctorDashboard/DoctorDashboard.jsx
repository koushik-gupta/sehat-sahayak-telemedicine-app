// src/pages/DoctorDashboard/DoctorDashboard.jsx
import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  User,
  LogOut,
  Bell,
  Search,
  ChevronRight,
  Activity,
  Clock,
  TrendingUp
} from "lucide-react";

import UpcomingConsultations from "./UpcomingConsultations";
import InCallScreen from "../Dashboard/Consultation/InCallScreen";
import DoctorProfileEditor from "./DoctorProfileEditor";
import RecentPatients from "./RecentPatients";
import Prescriptions from "./Prescriptions";
import AvailabilityScheduler from "./AvailabilityScheduler";
import AnalyticsDashboard from "./AnalyticsDashboard";
import { resolveBackendAssetUrl } from "../../utils/runtime";

function DoctorDashboard({ user, onLogout, t }) {
  const [activeTab, setActiveTab] = useState("schedule");
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [view, setView] = useState('dashboard');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  const handleStartCall = (appointment) => {
    setSelectedAppointment(appointment);
    setView('in_call');
  };

  const handleEndCall = () => {
    setSelectedAppointment(null);
    setView('dashboard');
  };

  const renderContent = () => {
    switch (activeTab) {
      case "schedule":
        return <UpcomingConsultations onStartCall={handleStartCall} t={t} />;
      case "patients":
        return (
          <RecentPatients
            onViewDetails={setSelectedPatientId}
            detailPage={selectedPatientId}
          />
        );
      case "prescriptions":
        // Direct to builder if patient selected (logic can be enhanced), else list
        return <Prescriptions />;
      case "availability":
        return <AvailabilityScheduler />;
      case "analytics":
        return <AnalyticsDashboard />;
      case "profile":
        return <DoctorProfileEditor t={t} />;
      default:
        return <UpcomingConsultations onStartCall={handleStartCall} t={t} />;
    }
  };

  if (view === 'in_call') {
    return <InCallScreen user={user} appointment={selectedAppointment} onEndCall={handleEndCall} t={t} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-slate-200 shadow-xl transition-all duration-300 ease-in-out fixed h-full z-30 flex flex-col
          ${isSidebarOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full md:translate-x-0 md:w-24'}
        `}
      >
        <div className={`flex items-center ${isSidebarOpen ? 'justify-between p-6' : 'justify-center flex-col gap-4 py-6'}`}>
          <div className={`flex items-center gap-3 ${!isSidebarOpen ? 'md:justify-center' : ''}`}>
            <div
              className="w-10 h-10 min-w-[2.5rem] bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 cursor-pointer"
              onClick={!isSidebarOpen ? () => setIsSidebarOpen(true) : undefined}
            >
              <Activity size={24} />
            </div>
            {isSidebarOpen && (
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 whitespace-nowrap">
                Sehat<span className="font-extrabold">Sahayak</span>
              </span>
            )}
          </div>
          {isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors hidden md:block"
            >
              <ChevronRight size={18} className="rotate-180" />
            </button>
          )}
        </div>

        {!isSidebarOpen && (
          <div className="hidden md:flex justify-center mb-6 relative">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="absolute -right-3 p-1 bg-white border border-slate-200 rounded-full shadow-md text-slate-500 hover:text-blue-600 z-50"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        <nav className="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar">
          {/* Section: Practice */}
          <div className="space-y-2">
            {isSidebarOpen && <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Practice</p>}

            <NavItem
              icon={<Calendar size={20} />}
              label="Schedule"
              isActive={activeTab === "schedule"}
              onClick={() => { setActiveTab("schedule"); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
              isOpen={isSidebarOpen}
            />
            <NavItem
              icon={<Users size={20} />}
              label="Patients"
              isActive={activeTab === "patients"}
              onClick={() => { setActiveTab("patients"); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
              isOpen={isSidebarOpen}
            />
            <NavItem
              icon={<FileText size={20} />}
              label="Prescriptions"
              isActive={activeTab === "prescriptions"}
              onClick={() => { setActiveTab("prescriptions"); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
              isOpen={isSidebarOpen}
            />
            <NavItem
              icon={<Clock size={20} />}
              label="Availability"
              isActive={activeTab === "availability"}
              onClick={() => { setActiveTab("availability"); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
              isOpen={isSidebarOpen}
            />
            <NavItem
              icon={<TrendingUp size={20} />}
              label="Analytics"
              isActive={activeTab === "analytics"}
              onClick={() => { setActiveTab("analytics"); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
              isOpen={isSidebarOpen}
            />
          </div>

          {/* Section: Personal */}
          <div className="space-y-2">
            {isSidebarOpen && <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Personal</p>}
            <NavItem
              icon={<User size={20} />}
              label="Profile"
              isActive={activeTab === "profile"}
              onClick={() => { setActiveTab("profile"); if (window.innerWidth < 768) setIsSidebarOpen(false); }}
              isOpen={isSidebarOpen}
            />
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={onLogout}
            className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all ${isSidebarOpen
              ? 'hover:bg-red-50 text-slate-600 hover:text-red-600 font-medium'
              : 'justify-center text-slate-400 hover:text-red-500 hover:bg-red-50'
              }`}
          >
            <LogOut size={20} />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'md:ml-72' : 'md:ml-24'}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile Toggle */}
            <button
              className="md:hidden text-slate-500 hover:bg-slate-100 p-2 rounded-lg"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Activity size={24} />
            </button>

            <div>
              <h1 className="text-xl font-bold text-slate-800">
                Hello, Dr. {user?.last_name || "Doctor"} 👋
              </h1>
              <p className="text-sm text-slate-500 hidden sm:block">Have a nice day at work!</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
              <Search size={18} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search patients..."
                className="bg-transparent border-none outline-none text-sm placeholder:text-slate-400 w-48"
              />
            </div>

            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            </button>

            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-md">
              <img
                src={resolveBackendAssetUrl(user?.profile_picture) || "https://i.pravatar.cc/150?u=doctor"}
                alt="Doctor"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>

        {/* Content Container */}
        <main className="p-6 max-w-7xl mx-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

// Helper Components
const NavItem = ({ icon, label, isActive, onClick, isOpen }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 w-full p-3 rounded-2xl transition-all duration-200 group relative ${isActive
      ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 font-bold'
      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 font-medium'
      } ${!isOpen && 'justify-center'}`}
    title={!isOpen ? label : ''}
  >
    <div className={`${!isOpen && isActive ? '' : ''}`}>{icon}</div>

    {isOpen && <span>{label}</span>}

    {/* Tooltip for collapsed mode */}
    {!isOpen && (
      <span className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
        {label}
      </span>
    )}
  </button>
);

export default DoctorDashboard;
