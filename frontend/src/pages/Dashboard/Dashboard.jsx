// frontend/src/pages/Dashboard/Dashboard.jsx

import React, { useState, useRef } from "react";
import {
  Home,
  Calendar,
  FileText,
  Activity,
  MessageSquare,
  User,
  LogOut,
  Bell,
  Search,
  Pill,
  Menu,
  Stethoscope,
  Video,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard
} from "lucide-react";
import "./PatientDashboard.css"; // Import new CSS

// Import Screens
import HealthRecordsScreen from "./HealthRecordsScreen";
import AISymptomCheckerScreen from "./Consultation/AISymptomCheckerScreen";
import EmergencyScreen from "./Emergency/EmergencyScreen";
import AppointmentFlow from "./Appointments/AppointmentFlow";
import ConsultationFlow from "./Consultation/ConsultationFlow";
import NearbyMedicines from "./Pharmacy/NearbyMedicines";

// Profile Screen
import ProfileScreen from "./ProfileScreen";

// --- Sidebar Component ---
// --- Sidebar Component (Refactored to match Doctor Dashboard) ---
const PatientSidebar = ({ activeTab, setActiveTab, onLogout, isOpen, toggleSidebar }) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`bg-white border-r border-slate-200 shadow-xl transition-all duration-300 ease-in-out fixed h-full z-30 flex flex-col
          ${isOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full md:translate-x-0 md:w-24'}
        `}
      >
        <div className={`flex items-center ${isOpen ? 'justify-between p-6' : 'justify-center flex-col gap-4 py-6'}`}>
          <div className={`flex items-center gap-3 ${!isOpen ? 'md:justify-center' : ''}`}>
            <div
              className="w-10 h-10 min-w-[2.5rem] bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 cursor-pointer"
              onClick={!isOpen ? toggleSidebar : undefined}
            >
              <span className="font-bold text-xl">+</span>
            </div>
            {isOpen && (
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 whitespace-nowrap">
                Sehat<span className="font-extrabold">Sahayak</span>
              </span>
            )}
          </div>

          {/* Toggle Button */}
          {isOpen && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors hidden md:block"
            >
              <ChevronRight size={18} className="rotate-180" />
            </button>
          )}
        </div>

        {/* Expand Button for Collapsed State (Desktop Only) */}
        {!isOpen && (
          <div className="hidden md:flex justify-center mb-6 relative">
            <button
              onClick={toggleSidebar}
              className="absolute -right-3 p-1 bg-white border border-slate-200 rounded-full shadow-md text-slate-500 hover:text-blue-600 z-50"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        <nav className="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            {isOpen && <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Menu</p>}
            <NavItem icon={<Home size={20} />} label="Home" isActive={activeTab === 'home'} onClick={() => { setActiveTab('home'); if (window.innerWidth < 768) toggleSidebar(); }} isOpen={isOpen} />
            <NavItem icon={<Video size={20} />} label="Consultation" isActive={activeTab === 'consult'} onClick={() => { setActiveTab('consult'); if (window.innerWidth < 768) toggleSidebar(); }} isOpen={isOpen} />
            <NavItem icon={<Pill size={20} />} label="Pharmacy" isActive={activeTab === 'pharmacy'} onClick={() => { setActiveTab('pharmacy'); if (window.innerWidth < 768) toggleSidebar(); }} isOpen={isOpen} />

          </div>

          <div className="space-y-2">
            {isOpen && <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">My Health</p>}
            <NavItem icon={<Calendar size={20} />} label="Appointments" isActive={activeTab === 'appointments'} onClick={() => { setActiveTab('appointments'); if (window.innerWidth < 768) toggleSidebar(); }} isOpen={isOpen} />
            <NavItem icon={<FileText size={20} />} label="Records" isActive={activeTab === 'records'} onClick={() => { setActiveTab('records'); if (window.innerWidth < 768) toggleSidebar(); }} isOpen={isOpen} />
            <NavItem icon={<Activity size={20} className="text-red-500" />} label="Emergency" isActive={activeTab === 'emergency'} onClick={() => { setActiveTab('emergency'); if (window.innerWidth < 768) toggleSidebar(); }} isOpen={isOpen} />
            <NavItem icon={<User size={20} />} label="Profile" isActive={activeTab === 'profile'} onClick={() => { setActiveTab('profile'); if (window.innerWidth < 768) toggleSidebar(); }} isOpen={isOpen} />
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={onLogout}
            className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all ${isOpen
              ? 'hover:bg-red-50 text-slate-600 hover:text-red-600 font-medium'
              : 'justify-center text-slate-400 hover:text-red-500 hover:bg-red-50'
              }`}
          >
            <LogOut size={20} />
            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

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

// --- Home View Component ---
const DashboardHome = ({ navigateTo, t, user }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    const query = searchQuery.toLowerCase();

    if (query.includes('medicine') || query.includes('drug') || query.includes('pharmacy') || query.includes('pill')) {
      navigateTo('pharmacy');
    } else if (query.includes('symptom') || query.includes('check') || query.includes('pain') || query.includes('fever') || query.includes('cough')) {
      navigateTo('ai-checker');
    } else if (query.includes('record') || query.includes('history') || query.includes('report')) {
      navigateTo('records');
    } else {
      // Default: Search for Doctors
      navigateTo('appointments', { search: searchQuery });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="patient-home fade-in space-y-8 pb-10">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-white rounded-3xl p-8 border border-blue-100 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-blue-50/50 to-transparent pointer-events-none"></div>

        <div className="relative z-10 max-w-lg">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome back, <span className="text-blue-600">{user?.full_name?.split(' ')[0] || "User"}!</span></h2>
          <p className="text-slate-500 text-lg mb-6">How are you feeling today? Find the best care for you.</p>

          <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-lg shadow-blue-100/50 border border-slate-100 w-full max-w-md focus-within:ring-2 ring-blue-500/20 transition-all">
            <Search size={20} className="text-slate-400 ml-3" />
            <input
              type="text"
              placeholder="Search doctors, specialities, symptoms..."
              className="flex-grow bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-400 py-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-200"
            >
              Find Now
            </button>
          </div>
        </div>

        <div className="relative z-10 hidden md:block">
          <img src="/Online Doctor.svg" alt="Doctor" className="h-48 drop-shadow-xl" />
        </div>
      </div>

      {/* Professional Widgets Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vitals Widget */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Activity size={20} className="text-blue-500" /> Your Vitals
            </h3>
            <button className="text-sm text-blue-600 font-medium hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
              View History
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-red-50/50 rounded-2xl border border-red-100 hover:shadow-md transition-shadow group">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-white rounded-lg shadow-sm text-red-500 group-hover:text-red-600 transition-colors">
                  <Activity size={16} />
                </div>
                <span className="text-xs text-red-500 font-bold uppercase tracking-wider">Heart Rate</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">98 <span className="text-sm font-medium text-slate-400">bpm</span></p>
            </div>
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 hover:shadow-md transition-shadow group">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-white rounded-lg shadow-sm text-blue-500 group-hover:text-blue-600 transition-colors">
                  <Activity size={16} />
                </div>
                <span className="text-xs text-blue-500 font-bold uppercase tracking-wider">Blood Pressure</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">120/80 <span className="text-sm font-medium text-slate-400">mmHg</span></p>
            </div>
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 hover:shadow-md transition-shadow group">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-white rounded-lg shadow-sm text-emerald-500 group-hover:text-emerald-600 transition-colors">
                  <Activity size={16} />
                </div>
                <span className="text-xs text-emerald-500 font-bold uppercase tracking-wider">Weight</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">{user?.weight || "--"} <span className="text-sm font-medium text-slate-400">kg</span></p>
            </div>
          </div>
        </div>

        {/* Next Appointment Widget */}
        {user?.next_appointment ? (
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 rounded-3xl shadow-lg shadow-blue-200 relative overflow-hidden">
            {/* Decorative Circles */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-black/10 rounded-full blur-3xl"></div>

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg font-bold">Next Appointment</h3>
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                  <Calendar size={20} className="text-white" />
                </div>
              </div>

              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-md border border-white/10 mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <img src={user.next_appointment.doctor_image || "https://i.pravatar.cc/150?u=dr_default"} alt="Dr" className="w-12 h-12 rounded-full border-2 border-white/30 shadow-sm" />
                  <div>
                    <p className="font-bold text-white leading-tight">{user.next_appointment.doctor_name}</p>
                    <p className="text-xs text-blue-100 opacity-90">{user.next_appointment.specialty}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm border-t border-white/10 pt-3 mt-1">
                  <span className="text-blue-100">{user.next_appointment.time_display}</span>
                  <span className="bg-blue-500/40 px-2 py-0.5 rounded text-xs font-medium border border-blue-400/30">{user.next_appointment.type || "Video Call"}</span>
                </div>
              </div>

              <button className="w-full py-3 bg-white text-blue-700 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-sm text-sm">
                Join Waiting Room
              </button>
            </div>
          </div>
        ) : (
          /* Empty State for Next Appointment */
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-3">
              <Calendar size={24} />
            </div>
            <h3 className="font-bold text-slate-800">No Upcoming Appointments</h3>
            <p className="text-slate-400 text-sm mb-4">Book a consultation to see it here.</p>
            <button onClick={() => navigateTo('appointments')} className="text-blue-600 font-bold text-sm hover:underline">
              Book Now
            </button>
          </div>
        )}
      </div>

      {/* Quick Access Grid */}
      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <LayoutDashboard size={24} className="text-blue-500" /> Quick Access
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ServiceCard
            title="Find a Doctor"
            desc="Book video consultations"
            icon={<Video size={28} />}
            color="blue"
            onClick={() => navigateTo('appointments')}
          />
          <ServiceCard
            title="Medicines"
            desc="Order from nearby pharmacies"
            icon={<Pill size={28} />}
            color="green"
            onClick={() => navigateTo('pharmacy')}
          />
          <ServiceCard
            title="Health Records"
            desc="Securely store your history"
            icon={<FileText size={28} />}
            color="purple"
            onClick={() => navigateTo('records')}
          />
          <ServiceCard
            title="Emergency"
            desc="Immediate medical assistance"
            icon={<Activity size={28} />}
            color="red"
            onClick={() => navigateTo('emergency')}
          />
        </div>
      </div>
    </div>
  );
};

const ServiceCard = ({ title, desc, icon, color, onClick }) => {
  const colorStyles = {
    blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
    green: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
    purple: "bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white",
    orange: "bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white",
    red: "bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white",
  }[color];

  return (
    <div onClick={onClick} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-300 ${colorStyles}`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
};

// --- Bottom Navigation (Mobile Only) ---
const BottomNav = ({ activeTab, setActiveTab }) => (
  <div className="bottom-nav"> {/* Hidden on desktop via CSS */}
    <button className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
      <Home size={24} /> <span>Home</span>
    </button>
    <button className={`nav-item ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => setActiveTab('appointments')}>
      <Calendar size={24} /> <span>Appts</span>
    </button>
    <button className={`nav-item ${activeTab === 'emergency' ? 'active' : ''}`} onClick={() => setActiveTab('emergency')}>
      <Activity size={24} className="text-red-500" /> <span>SOS</span>
    </button>
    <button className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
      <User size={24} /> <span>Profile</span>
    </button>
  </div>
);

// --- Main Dashboard Layout ---
export default function Dashboard({ user, t, userName, onLogout, language, refreshUser }) {
  const [activeTab, setActiveTab] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [tabParams, setTabParams] = useState({});
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });


  const navigateTo = (tab, params = {}) => {
    setActiveTab(tab);
    setTabParams(params);
    window.scrollTo(0, 0);
  };

  const goBack = () => {
    setActiveTab("home");
    setTabParams({});
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar - Visible on Desktop */}
      <PatientSidebar
        activeTab={activeTab}
        setActiveTab={navigateTo}
        onLogout={onLogout}
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'md:ml-72' : 'md:ml-24'} flex flex-col`}>
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile Sidebar Toggle */}
            <button
              className="md:hidden text-slate-500 hover:bg-slate-100 p-2 rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="welcome-text">
              <h1 className="text-xl font-bold text-slate-800">Sehat<span className="text-blue-500">Sahayak</span></h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors" onClick={() => navigateTo('profile')}>
              <User size={20} />
            </button>
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto w-full">
          {activeTab === "home" && <DashboardHome navigateTo={navigateTo} t={t} user={user} />}
          {activeTab === "consult" && <ConsultationFlow user={user} onBack={goBack} t={t} />}
          {activeTab === "pharmacy" && <NearbyMedicines t={t} onBack={goBack} />}
          {activeTab === "records" && <HealthRecordsScreen t={t} onBack={goBack} />}
          {activeTab === "ai-checker" && <AISymptomCheckerScreen t={t} language={language} onBack={goBack} />}
          {activeTab === "appointments" && <AppointmentFlow user={user} t={t} onBack={goBack} initialSearchQuery={tabParams.search} />}
          {activeTab === "emergency" && <EmergencyScreen t={t} />}
          {activeTab === "profile" && <ProfileScreen user={user} onLogout={onLogout} refreshUser={refreshUser} />}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <BottomNav activeTab={activeTab} setActiveTab={navigateTo} />

      {/* AI Helper Floating Button - Hidden when on AI Checker screen */}
      {/* AI Helper Floating Button - Hidden when on AI Checker screen */}
      {activeTab !== 'ai-checker' && (
        <div
          className="fixed bottom-24 md:bottom-10 right-6 z-50 pointer-events-none"
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out' // Smooth follow
          }}
        >
          <div className="flex flex-col-reverse items-end gap-2 animate-float-medium">
            <button
              onMouseDown={(e) => {
                setIsDragging(true);
                dragStart.current = {
                  startX: e.clientX,
                  startY: e.clientY,
                  initialX: position.x,
                  initialY: position.y
                };

                const handleMouseMove = (moveEvent) => {
                  const dx = moveEvent.clientX - dragStart.current.startX;
                  const dy = moveEvent.clientY - dragStart.current.startY;
                  setPosition({
                    x: dragStart.current.initialX + dx,
                    y: dragStart.current.initialY + dy
                  });
                };

                const handleMouseUp = (upEvent) => {
                  setIsDragging(false);
                  const distance = Math.hypot(
                    upEvent.clientX - dragStart.current.startX,
                    upEvent.clientY - dragStart.current.startY
                  );

                  // Only navigate if movement is minimal (click, not drag)
                  if (distance < 5) {
                    navigateTo('ai-checker');
                  }

                  window.removeEventListener('mousemove', handleMouseMove);
                  window.removeEventListener('mouseup', handleMouseUp);
                };

                window.addEventListener('mousemove', handleMouseMove);
                window.addEventListener('mouseup', handleMouseUp);
              }}
              onMouseEnter={() => {
                if (!isDragging) {
                  if ('speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance("Hi I'm Setu, click me to get AI suggestions.");
                    utterance.pitch = 1.6;
                    utterance.rate = 1.1;
                    window.speechSynthesis.speak(utterance);
                  }
                }
              }}
              onMouseLeave={() => {
                window.speechSynthesis.cancel();
              }}
              className={`peer w-20 h-20 md:w-32 md:h-32 transition-transform duration-300 active:scale-95 focus:outline-none pointer-events-auto ${!isDragging ? 'hover:scale-125' : 'cursor-grabbing'}`}
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
              <img
                src="/cute_robot_avatar.png"
                alt="AI Helper"
                className="w-full h-full object-contain drop-shadow-2xl select-none pointer-events-none"
              // select-none prevents image dragging ghost
              />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}