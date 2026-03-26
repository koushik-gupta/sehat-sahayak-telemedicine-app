import React, { useState, useEffect } from "react";
import { User, Activity, Clock, ChevronRight, FileText, Phone, Mail, Calendar, Pill } from "lucide-react";
import PrescriptionBuilder from "./PrescriptionBuilder";

const MOCK_PATIENT = {
  id: "mock-1",
  name: "Emily Clark",
  type: "Follow-up",
  date: "Today, 09:30 AM",
  status: "Active",
  gender: "Female",
  dob: "1988-05-12",
  phone: "+1 (555) 123-4567",
  email: "emily.clark@example.com",
  history: [
    {
      id: 101,
      appointment_datetime: "2025-02-01T09:30:00",
      status: "completed",
      notes: "Patient reported mild headaches. Blood pressure normal. Advised rest and hydration.",
      prescription_text: "Paracetamol 500mg (SOS)"
    },
    {
      id: 102,
      appointment_datetime: "2025-01-15T14:00:00",
      status: "completed",
      notes: "Routine checkup. Everything looks good.",
      prescription_text: "Multivitamin (Daily)"
    }
  ]
};

function RecentPatients({ onViewDetails, detailPage }) {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState(null);

  // Fetch recent patients list
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch('/api/v1/doctor/recent-patients', { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch patients');
        const data = await response.json();

        // Use mock data if list is empty, for demonstration
        if (!data || data.length === 0) {
          setPatients([{
            id: MOCK_PATIENT.id,
            name: MOCK_PATIENT.name,
            type: MOCK_PATIENT.type,
            date: MOCK_PATIENT.date,
            status: MOCK_PATIENT.status
          }]);
        } else {
          setPatients(data);
        }

      } catch (err) {
        console.error("Error loading patients:", err);
        // Fallback to mock data on error for demo purposes
        setPatients([{
          id: MOCK_PATIENT.id,
          name: MOCK_PATIENT.name,
          type: MOCK_PATIENT.type,
          date: MOCK_PATIENT.date,
          status: MOCK_PATIENT.status
        }]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPatients();
  }, []);

  // Fetch full details when a patient is selected via detailPage prop
  useEffect(() => {
    if (detailPage) {
      // Handle Mock Data Click
      if (detailPage === MOCK_PATIENT.id) {
        setSelectedPatient(MOCK_PATIENT);
        return;
      }

      const fetchDetails = async () => {
        setIsLoadingDetails(true);
        try {
          const response = await fetch(`/api/v1/doctor/patients/${detailPage}`, { credentials: 'include' });
          if (!response.ok) throw new Error('Failed to fetch stats');
          const data = await response.json();
          setSelectedPatient(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setIsLoadingDetails(false);
        }
      };
      fetchDetails();
    } else {
      setSelectedPatient(null);
    }
  }, [detailPage]);

  // If a detailPage is active, show patient details
  if (detailPage) {
    if (isLoadingDetails) return <div className="p-10 text-center text-slate-400">Loading patient details...</div>;
    if (error && !selectedPatient) return (
      <div className="p-8 text-center text-slate-500">
        <p>Patient details not found.</p>
        <button onClick={() => onViewDetails(null)} className="text-blue-600 font-bold mt-2 hover:underline">Back to list</button>
      </div>
    );

    // Fallback if selectedPatient is null for some reason
    if (!selectedPatient) return null;

    return (
      <div className="space-y-6 animation-slide-in">
        <button
          onClick={() => onViewDetails(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium transition-colors"
        >
          <ChevronRight size={18} className="rotate-180" /> Back to Patients
        </button>

        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8 pb-8 border-b border-slate-100">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
              <User size={40} />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-800">{selectedPatient.name}</h2>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-slate-500">
                {selectedPatient.gender && <span className="flex items-center gap-1"><User size={14} /> {selectedPatient.gender}</span>}
                {selectedPatient.dob && <span className="flex items-center gap-1"><Calendar size={14} /> DOB: {selectedPatient.dob}</span>}
              </div>
            </div>
            <div className="md:ml-auto flex flex-col gap-2">
              {selectedPatient.phone && (
                <a href={`tel:${selectedPatient.phone}`} className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors">
                  <Phone size={16} className="text-blue-500" /> {selectedPatient.phone}
                </a>
              )}
              {selectedPatient.email && (
                <a href={`mailto:${selectedPatient.email}`} className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors">
                  <Mail size={16} className="text-blue-500" /> {selectedPatient.email}
                </a>
              )}
            </div>
          </div>

          {/* Medical History Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Activity className="text-blue-500" /> Consultation History
            </h3>

            {selectedPatient.history && selectedPatient.history.length > 0 ? (
              <div className="grid gap-4">
                {selectedPatient.history.map((record) => (
                  <div key={record.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                        <Calendar size={16} />
                        {new Date(record.appointment_datetime).toLocaleString()}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${record.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                        {record.status}
                      </span>
                    </div>

                    {record.notes && (
                      <div className="mb-4">
                        <h4 className="text-sm font-bold text-slate-700 mb-1">Doctor's Notes</h4>
                        <p className="text-slate-600 leading-relaxed">{record.notes}</p>
                      </div>
                    )}

                    {record.prescription_text && (
                      <div className="bg-white p-4 rounded-xl border border-slate-200">
                        <h4 className="text-sm font-bold text-emerald-600 mb-2 flex items-center gap-2">
                          <Pill size={16} /> Prescribed Medicines
                        </h4>
                        <p className="text-slate-700 font-mono text-sm">{record.prescription_text}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-500">No previous consultation history found with this doctor.</p>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex gap-4">
            <button className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
              Start New Consultation
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main patient list
  return (
    <div className="space-y-6 animation-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Recent Patients</h2>
        <p className="text-slate-500">View and manage your recent patient interactions.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div></div>
      ) : patients.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-3xl border border-dashed border-slate-200">
          <User size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">No recent patients found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {patients.map((p, index) => (
            <div
              key={p.id}
              onClick={() => onViewDetails(p.id)}
              className={`group p-5 flex items-center justify-between cursor-pointer hover:bg-blue-50/50 transition-all ${index !== patients.length - 1 ? 'border-b border-slate-100' : ''
                }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{p.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Activity size={14} className="text-slate-400" />
                    {p.type}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-400 uppercase">Last Visit</p>
                  <p className="text-sm font-semibold text-slate-600">{p.date}</p>
                </div>
                <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecentPatients;
