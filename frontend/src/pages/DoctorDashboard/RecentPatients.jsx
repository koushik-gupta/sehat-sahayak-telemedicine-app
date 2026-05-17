import React, { useEffect, useMemo, useState } from "react";
import { motion as Motion } from "framer-motion";
import { Activity, Calendar, ChevronRight, Mail, Phone, Pill, Search, User } from "lucide-react";
import { getGlassCardClass, getGlassPanelClass, useDashboardTheme } from "../Dashboard/DashboardThemeContext";

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
      prescription_text: "Paracetamol 500mg (SOS)",
    },
    {
      id: 102,
      appointment_datetime: "2025-01-15T14:00:00",
      status: "completed",
      notes: "Routine checkup. Everything looks good.",
      prescription_text: "Multivitamin (Daily)",
    },
  ],
};

function RecentPatients({ onViewDetails, detailPage, searchQuery = "", t }) {
  const { isDark } = useDashboardTheme();
  const glassPanelClass = getGlassPanelClass(isDark);
  const glassCardClass = getGlassCardClass(isDark);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState(null);
  const [localSearch, setLocalSearch] = useState("");

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch("/api/v1/doctor/recent-patients", { credentials: "include" });
        if (!response.ok) throw new Error("Failed to fetch patients");
        const data = await response.json();

        if (!data || data.length === 0) {
          setPatients([{ id: MOCK_PATIENT.id, name: MOCK_PATIENT.name, type: MOCK_PATIENT.type, date: MOCK_PATIENT.date, status: MOCK_PATIENT.status }]);
        } else {
          setPatients(data);
        }
      } catch (err) {
        console.error("Error loading patients:", err);
        setPatients([{ id: MOCK_PATIENT.id, name: MOCK_PATIENT.name, type: MOCK_PATIENT.type, date: MOCK_PATIENT.date, status: MOCK_PATIENT.status }]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPatients();
  }, []);

  useEffect(() => {
    if (detailPage) {
      if (detailPage === MOCK_PATIENT.id) {
        setSelectedPatient(MOCK_PATIENT);
        return;
      }

      const fetchDetails = async () => {
        setIsLoadingDetails(true);
        try {
          const response = await fetch(`/api/v1/doctor/patients/${detailPage}`, { credentials: "include" });
          if (!response.ok) throw new Error("Failed to fetch stats");
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

  const filteredPatients = useMemo(() => {
    const query = (searchQuery || localSearch).toLowerCase().trim();
    if (!query) return patients;
    return patients.filter((patient) =>
      [patient.name, patient.type, patient.status, patient.date].filter(Boolean).some((value) => String(value).toLowerCase().includes(query))
    );
  }, [localSearch, patients, searchQuery]);

  if (detailPage) {
    if (isLoadingDetails) return <div className={`rounded-[34px] p-10 text-center ${glassPanelClass}`}>{t.patients.loadingDetails}</div>;
    if (error && !selectedPatient)
      return (
        <div className={`rounded-[34px] p-8 text-center ${glassPanelClass}`}>
          <p className={isDark ? "text-slate-300" : "text-slate-500"}>{t.patients.detailsNotFound}</p>
          <button onClick={() => onViewDetails(null)} className="mt-3 font-bold text-cyan-600 hover:underline">
            {t.patients.backToList}
          </button>
        </div>
      );

    if (!selectedPatient) return null;

    return (
      <div className="doctor-page space-y-6">
        <button onClick={() => onViewDetails(null)} className={`flex items-center gap-2 font-semibold transition-colors ${isDark ? "text-slate-300 hover:text-cyan-200" : "text-slate-500 hover:text-blue-600"}`}>
          <ChevronRight size={18} className="rotate-180" /> {t.patients.backToPatients}
        </button>

        <div className={`overflow-hidden rounded-[34px] p-6 md:p-8 ${glassPanelClass}`}>
          <div className="hero-grid-overlay absolute inset-0 opacity-30" />
          <div className="relative flex flex-col gap-6 border-b border-slate-200/50 pb-8 md:flex-row md:items-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-[30px] bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-500 text-white shadow-[0_22px_55px_-24px_rgba(37,99,235,0.9)]">
              <User size={42} />
            </div>
            <div>
              <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${isDark ? "text-slate-400" : "text-slate-400"}`}>{t.patients.profile}</p>
              <h2 className={`mt-1 text-3xl font-bold ${isDark ? "text-slate-50" : "text-slate-900"}`}>{selectedPatient.name}</h2>
              <div className={`mt-3 flex flex-wrap items-center gap-3 ${isDark ? "text-slate-300" : "text-slate-500"}`}>
                {selectedPatient.gender && <span className="flex items-center gap-1"><User size={14} /> {selectedPatient.gender}</span>}
                {selectedPatient.dob && <span className="flex items-center gap-1"><Calendar size={14} /> {t.patients.dob}: {selectedPatient.dob}</span>}
              </div>
            </div>
            <div className="md:ml-auto grid gap-2">
              {selectedPatient.phone && (
                <a href={`tel:${selectedPatient.phone}`} className={`flex items-center gap-2 rounded-2xl border px-4 py-2 ${isDark ? "border-white/10 bg-white/8 text-slate-200" : "border-slate-200 bg-white text-slate-700"}`}>
                  <Phone size={16} className="text-cyan-500" /> {selectedPatient.phone}
                </a>
              )}
              {selectedPatient.email && (
                <a href={`mailto:${selectedPatient.email}`} className={`flex items-center gap-2 rounded-2xl border px-4 py-2 ${isDark ? "border-white/10 bg-white/8 text-slate-200" : "border-slate-200 bg-white text-slate-700"}`}>
                  <Mail size={16} className="text-cyan-500" /> {selectedPatient.email}
                </a>
              )}
            </div>
          </div>

          <div className="relative mt-8 space-y-5">
            <h3 className={`flex items-center gap-2 text-xl font-bold ${isDark ? "text-slate-50" : "text-slate-900"}`}>
              <Activity className="text-cyan-500" /> {t.patients.history}
            </h3>

            {selectedPatient.history && selectedPatient.history.length > 0 ? (
              <div className="grid gap-4">
                {selectedPatient.history.map((record, index) => (
                  <Motion.div
                    key={record.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`rounded-[28px] border p-5 ${isDark ? "border-white/10 bg-white/7" : "border-slate-200/80 bg-white/88"}`}
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className={`flex items-center gap-2 text-sm font-bold ${isDark ? "text-slate-300" : "text-slate-500"}`}>
                        <Calendar size={16} />
                        {new Date(record.appointment_datetime).toLocaleString()}
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${record.status === "completed" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                        {record.status}
                      </span>
                    </div>

                    {record.notes && (
                      <div className="mb-4">
                        <h4 className={`mb-1 text-sm font-bold ${isDark ? "text-slate-200" : "text-slate-700"}`}>{t.patients.doctorNotes}</h4>
                        <p className={`leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>{record.notes}</p>
                      </div>
                    )}

                    {record.prescription_text && (
                      <div className={`rounded-2xl border p-4 ${isDark ? "border-emerald-400/15 bg-emerald-400/10" : "border-emerald-100 bg-emerald-50/70"}`}>
                        <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-emerald-600">
                          <Pill size={16} /> {t.patients.prescribedMedicines}
                        </h4>
                        <p className={`font-mono text-sm ${isDark ? "text-emerald-100" : "text-slate-700"}`}>{record.prescription_text}</p>
                      </div>
                    )}
                  </Motion.div>
                ))}
              </div>
            ) : (
              <div className={`rounded-[28px] border border-dashed p-8 text-center ${isDark ? "border-white/10 bg-white/6 text-slate-400" : "border-slate-200 bg-white/72 text-slate-500"}`}>
                {t.patients.noHistory}
              </div>
            )}
          </div>

          <div className="relative mt-8 border-t border-slate-200/50 pt-6">
            <button className="doctor-gradient-button w-full px-5 py-3 font-bold">
              <span className="relative">{t.patients.startNewConsultation}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-page space-y-6">
      <div className={`rounded-[34px] p-6 md:p-8 ${glassPanelClass}`}>
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${isDark ? "text-slate-400" : "text-slate-400"}`}>{t.patients.directory}</p>
            <h2 className={`mt-2 text-3xl font-bold ${isDark ? "text-slate-50" : "text-slate-900"}`}>{t.patients.recentPatients}</h2>
            <p className={`mt-2 ${isDark ? "text-slate-300" : "text-slate-500"}`}>{t.patients.description}</p>
          </div>
          <div className={`doctor-glass-field flex min-w-0 items-center gap-3 rounded-[24px] border px-4 py-3 md:w-80 ${isDark ? "border-white/10 bg-slate-950/55 focus-within:border-cyan-400/35" : "border-slate-200/90 bg-white/96 focus-within:border-cyan-300"}`}>
            <Search size={18} className="text-cyan-500" />
            <input
              value={localSearch}
              onChange={(event) => setLocalSearch(event.target.value)}
              placeholder={t.patients.searchPlaceholder}
              className={`min-w-0 flex-1 bg-transparent text-sm outline-none ${isDark ? "text-slate-100 placeholder:text-slate-500" : "text-slate-700 placeholder:text-slate-400"}`}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className={`flex justify-center rounded-[34px] py-14 ${glassPanelClass}`}>
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-cyan-500/25 border-t-cyan-500" />
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className={`rounded-[34px] border border-dashed p-12 text-center ${glassPanelClass}`}>
          <User size={48} className={`mx-auto mb-4 ${isDark ? "text-slate-500" : "text-slate-300"}`} />
          <p className={isDark ? "text-slate-400" : "text-slate-500"}>{t.patients.noRecent}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredPatients.map((patient, index) => (
            <Motion.button
              key={patient.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              whileHover={{ y: -4, scale: 1.01 }}
              onClick={() => onViewDetails(patient.id)}
              className={`group rounded-[30px] p-5 text-left ${glassCardClass}`}
            >
              <div className="mb-5 flex items-start justify-between gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-500 text-white shadow-[0_18px_42px_-24px_rgba(37,99,235,0.9)]">
                  <User size={24} />
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${patient.status === "Active" ? "bg-emerald-100 text-emerald-700" : isDark ? "bg-white/8 text-slate-300" : "bg-slate-100 text-slate-600"}`}>
                  {patient.status === "Active" ? t.patients.active : patient.status || t.patients.recent}
                </span>
              </div>
              <h3 className={`text-lg font-bold transition-colors group-hover:text-cyan-500 ${isDark ? "text-slate-50" : "text-slate-900"}`}>{patient.name}</h3>
              <div className={`mt-3 flex flex-wrap gap-2 text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>
                <span className={`rounded-full px-3 py-1 ${isDark ? "bg-white/8" : "bg-slate-50"}`}>{patient.type || t.patients.generalConsult}</span>
                <span className={`rounded-full px-3 py-1 ${isDark ? "bg-white/8" : "bg-slate-50"}`}>{patient.gender || t.patients.ageGenderPending}</span>
              </div>
              <div className={`mt-5 flex items-center justify-between border-t pt-4 ${isDark ? "border-white/10" : "border-slate-100"}`}>
                <div>
                  <p className={`text-[11px] font-bold uppercase tracking-[0.22em] ${isDark ? "text-slate-500" : "text-slate-400"}`}>{t.patients.lastVisit}</p>
                  <p className={`mt-1 text-sm font-semibold ${isDark ? "text-slate-300" : "text-slate-600"}`}>{patient.date || t.patients.recently}</p>
                </div>
                <ChevronRight size={20} className="text-cyan-500" />
              </div>
            </Motion.button>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecentPatients;
