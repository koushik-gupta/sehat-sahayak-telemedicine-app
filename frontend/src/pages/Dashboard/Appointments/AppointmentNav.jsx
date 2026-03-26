// src/pages/Dashboard/Appointments/AppointmentNav.jsx

import React from 'react';

const AppointmentNav = ({ currentView, setView, t }) => {
  const tabs = [
    { id: 'list', label: t.browseDoctors || "Browse Doctors" },
    { id: 'my_appointments', label: t.myAppointments || "My Appointments" },
    { id: 'contact', label: t.contact || "Contact" }
  ];

  return (
    <nav className="mb-8">
      <div className="flex p-1 bg-slate-100 rounded-xl w-fit mx-auto md:mx-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${currentView === tab.id || (tab.id === 'list' && currentView === 'profile')
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default AppointmentNav;