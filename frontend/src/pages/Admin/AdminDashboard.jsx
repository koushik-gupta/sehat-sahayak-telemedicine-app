// frontend/src/pages/Admin/AdminDashboard.jsx

import React, { useState } from "react";
// import "./AdminDashboard.css"; // Removing legacy CSS dependency
import ManagePharmacies from "./ManagePharmacies";
import ManageDoctors from "./ManageDoctors";
import ManagePatients from "./ManagePatients";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Pill,
  Calendar,
  FileText,
  Settings,
  LogOut,
  Search,
  Bell,
  ChevronRight,
  ShieldAlert,
  Activity,
  Server
} from "lucide-react";

function AdminDashboard({ onLogout }) {
  const [view, setView] = useState("dashboard"); // 'dashboard', 'managePharmacy', 'manageDoctors', 'patients', 'logs'
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Helper to render content based on view
  const renderContent = () => {
    switch (view) {
      case "managePharmacy":
        return <ManagePharmacies />;
      case "manageDoctors":
        return <ManageDoctors />;
      case "patients":
        return <ManagePatients />;
      case "logs":
        return <SystemLogs />;
      case "settings":
        return <SettingsView />;
      default:
        return <DashboardHome setView={setView} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside
        className={`${isSidebarOpen ? 'w-72' : 'w-24'
          } bg-white border-r border-slate-200 shadow-xl transition-all duration-300 ease-in-out fixed h-full z-20 hidden md:flex flex-col`}
      >
        <div className={`flex items-center ${isSidebarOpen ? 'justify-between p-6' : 'justify-center flex-col gap-4 py-6'}`}>
          <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}>
            <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-200 cursor-pointer" onClick={!isSidebarOpen ? () => setIsSidebarOpen(true) : undefined}>
              <span className="font-bold text-xl">+</span>
            </div>
            {isSidebarOpen && (
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-700">
                Sehat<span className="font-extrabold">Sahayak</span>
              </span>
            )}
          </div>
          {isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ChevronRight size={18} className="rotate-180" />
            </button>
          )}
        </div>

        {!isSidebarOpen && (
          <div className="flex justify-center mb-6">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="absolute top-8 left-16 p-1 bg-white border border-slate-200 rounded-full shadow-md text-slate-500 hover:text-purple-600 z-50"
              style={{ left: '70%', transform: 'translateX(-50%)' }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        <nav className="flex-1 px-4 space-y-8 overflow-y-auto">
          {/* Section: Main */}
          <div className="space-y-2">
            {isSidebarOpen && <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Main</p>}

            <NavItem
              icon={<LayoutDashboard size={20} />}
              label="Dashboard"
              isActive={view === "dashboard"}
              onClick={() => setView("dashboard")}
              isOpen={isSidebarOpen}
            />
            <NavItem
              icon={<Users size={20} />}
              label="Patients"
              isActive={view === "patients"}
              onClick={() => setView("patients")}
              isOpen={isSidebarOpen}
            />
            <NavItem
              icon={<Stethoscope size={20} />}
              label="Doctors"
              isActive={view === "manageDoctors"}
              onClick={() => setView("manageDoctors")}
              isOpen={isSidebarOpen}
            />
            <NavItem
              icon={<Pill size={20} />}
              label="Pharmacy"
              isActive={view === "managePharmacy"}
              onClick={() => setView("managePharmacy")}
              isOpen={isSidebarOpen}
            />
          </div>

          {/* Section: System (Exclusive Features) */}
          <div className="space-y-2">
            {isSidebarOpen && <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">System</p>}
            <NavItem
              icon={<ShieldAlert size={20} />}
              label="System Logs"
              isActive={view === "logs"}
              onClick={() => setView("logs")}
              isOpen={isSidebarOpen}
            />
            <NavItem
              icon={<Settings size={20} />}
              label="Settings"
              isActive={view === "settings"}
              onClick={() => setView("settings")}
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
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'md:ml-72' : 'md:ml-24'} flex flex-col`}>
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full border border-slate-200 focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-500 transition-all">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search users, logs..."
              className="bg-transparent border-none outline-none text-sm placeholder:text-slate-400 w-48"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-700">Administrator</p>
                <p className="text-xs text-slate-500">Super User</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold border-2 border-white shadow-sm">
                AD
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="p-6 max-w-7xl mx-auto w-full">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

// Sub-component for Dashboard Home View
function DashboardHome({ setView }) {
  return (
    <div className="space-y-8 animation-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
        <p className="text-slate-500">Welcome back, Administrator. System status is stable.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Users size={24} className="text-blue-600" />}
          label="Total Patients"
          val="1,245"
          change="+12%"
          bg="bg-blue-50"
          border="border-blue-100"
        />
        <StatCard
          icon={<Stethoscope size={24} className="text-purple-600" />}
          label="Active Doctors"
          val="84"
          change="+5%"
          bg="bg-purple-50"
          border="border-purple-100"
        />
        <StatCard
          icon={<Calendar size={24} className="text-indigo-600" />}
          label="Appointments"
          val="42"
          change="Today"
          bg="bg-indigo-50"
          border="border-indigo-100"
        />
        <StatCard
          icon={<Pill size={24} className="text-emerald-600" />}
          label="Pharmacy Req"
          val="12"
          change="-2"
          bg="bg-emerald-50"
          border="border-emerald-100"
        />
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ActionCard
            icon={<Stethoscope size={32} />}
            title="Manage Doctors"
            desc="Approve or reject doctor registrations"
            onClick={() => setView("manageDoctors")}
            color="blue"
          />
          <ActionCard
            icon={<Pill size={32} />}
            title="Manage Pharmacy"
            desc="Verify pharmacy licenses"
            onClick={() => setView("managePharmacy")}
            color="emerald"
          />
          <ActionCard
            icon={<ShieldAlert size={32} />}
            title="System Logs"
            desc="View security and error logs"
            onClick={() => setView("logs")}
            color="indigo"
          />
        </div>
      </div>
    </div>
  );
}

// Exclusive Feature: System Logs
function SystemLogs() {
  return (
    <div className="space-y-6 animation-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <ShieldAlert className="text-indigo-600" /> System Health & Logs
        </h2>
        <p className="text-slate-500">Real-time monitoring of application performance and security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-xl"><Server size={24} /></div>
          <div>
            <p className="text-sm text-slate-500 font-bold">Server Status</p>
            <p className="text-lg font-bold text-slate-800">Operational</p>
            <span className="text-xs text-green-600 flex items-center gap-1">● 99.9% Uptime</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Activity size={24} /></div>
          <div>
            <p className="text-sm text-slate-500 font-bold">Database Health</p>
            <p className="text-lg font-bold text-slate-800">Healthy</p>
            <span className="text-xs text-blue-600 flex items-center gap-1">24ms Latency</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-xl"><ShieldAlert size={24} /></div>
          <div>
            <p className="text-sm text-slate-500 font-bold">Security Alerts</p>
            <p className="text-lg font-bold text-slate-800">None</p>
            <span className="text-xs text-slate-400">Last scan: 5m ago</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800">Recent System Events</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${i === 1 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                <p className="text-sm font-medium text-slate-700">
                  {i === 1 ? 'Failed Login Attempt (IP: 192.168.1.45)' : 'User Registration API Success'}
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">10:{10 + i}:45 AM</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Exclusive Feature: Settings
function SettingsView() {
  return (
    <div className="space-y-6 animation-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Settings className="text-slate-600" /> Admin Settings
        </h2>
        <p className="text-slate-500">Manage system configurations and preferences.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">General Settings</h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-800">System Maintenance Mode</p>
              <p className="text-sm text-slate-500">Prevent users from logging in during updates.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-800">Allow New Doctor Registrations</p>
              <p className="text-sm text-slate-500">Toggle new doctor sign-ups.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Notification Preferences</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <input type="checkbox" id="check1" className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500" defaultChecked />
            <label htmlFor="check1" className="text-sm font-medium text-slate-700">Email Alerts for New Registrations</label>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="check2" className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500" defaultChecked />
            <label htmlFor="check2" className="text-sm font-medium text-slate-700">System Health Critical Alerts</label>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="check3" className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500" />
            <label htmlFor="check3" className="text-sm font-medium text-slate-700">Daily Digest Report</label>
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <button className="bg-purple-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200">
          Save Changes
        </button>
      </div>
    </div>
  )
}

// Helper Components
const NavItem = ({ icon, label, isActive, onClick, isOpen }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 w-full p-3 rounded-2xl transition-all duration-200 group relative ${isActive
      ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 font-bold'
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

const StatCard = ({ icon, label, val, change, bg, border }) => (
  <div className={`p-6 bg-white rounded-3xl border ${border} shadow-sm hover:shadow-md transition-shadow`}>
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${bg}`}>{icon}</div>
      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">{change}</span>
    </div>
    <h3 className="text-3xl font-bold text-slate-800">{val}</h3>
    <p className="text-sm text-slate-500 font-medium">{label}</p>
  </div>
);

const ActionCard = ({ icon, title, desc, onClick, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600 hover:bg-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
    indigo: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100",
  }
  return (
    <div onClick={onClick} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-300 ${colors[color]}`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-purple-600 transition-colors">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
};

export default AdminDashboard;
