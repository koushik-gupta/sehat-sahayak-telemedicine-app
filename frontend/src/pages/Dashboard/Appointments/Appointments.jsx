// src/pages/Dashboard/Appointments/Appointments.jsx

import React, { useState, useEffect } from "react";
import { Calendar, Clock, Video, AlertCircle } from "lucide-react";

// This component now ONLY shows a list of appointments. It does not start calls.
const Appointments = ({ t }) => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/v1/appointment/my-appointments', { credentials: 'include' });
        const data = await response.json();
        setAppointments(data);
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-500">
      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
      <p>Loading your appointments...</p>
    </div>
  );

  return (
    <div className="animation-fade-in space-y-6">
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 text-blue-700">
        <AlertCircle className="shrink-0" size={20} />
        <p className="text-sm">After booking an appointment, please go to the 'Consult' tab to join the video call at the scheduled time.</p>
      </div>

      <h2 className="text-xl font-bold text-slate-800">{t.myAppointments || "My Appointments"}</h2>

      {appointments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
          <Calendar className="mx-auto text-slate-300 mb-3" size={32} />
          <p className="text-slate-500">You have no appointments booked yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => (
            <div key={apt.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                  Dr
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Dr. {apt.doctor_name}</h3>
                  <div className="flex items-center gap-3 text-slate-500 text-sm mt-1">
                    <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(apt.appointment_datetime).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Clock size={14} /> {new Date(apt.appointment_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide w-fit ${apt.status?.toLowerCase() === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                  apt.status?.toLowerCase() === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-600'
                }`}>
                {apt.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Appointments;