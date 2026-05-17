import React, { useMemo, useState } from "react";
import { motion as Motion } from "framer-motion";
import { Calendar, ChevronRight, Copy, Download, FilePlus2, FileText, Pill, Search } from "lucide-react";
import { getGlassCardClass, getGlassPanelClass, useDashboardTheme } from "../Dashboard/DashboardThemeContext";

function Prescriptions({ onViewDetails, detailPage, t }) {
  const { isDark } = useDashboardTheme();
  const glassPanelClass = getGlassPanelClass(isDark);
  const glassCardClass = getGlassCardClass(isDark);
  const [prescriptions, setPrescriptions] = React.useState([]);
  const [search, setSearch] = useState("");

  React.useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const response = await fetch("/api/v1/doctor/prescriptions");
      if (response.ok) {
        const data = await response.json();
        setPrescriptions(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch prescriptions", error);
    }
  };

  const filteredPrescriptions = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return prescriptions;
    return prescriptions.filter((prescription) =>
      [prescription.patient, prescription.meds, prescription.notes, prescription.date].filter(Boolean).some((value) => String(value).toLowerCase().includes(query))
    );
  }, [prescriptions, search]);

  if (detailPage) {
    const prescription = prescriptions.find((p) => p.id === detailPage);
    if (!prescription)
      return (
        <div className={`rounded-[34px] p-8 text-center ${glassPanelClass}`}>
          <p className={isDark ? "text-slate-300" : "text-slate-500"}>{t.prescriptions.detailsNotFound}</p>
          <button onClick={() => onViewDetails(null)} className="mt-2 font-bold text-cyan-600 hover:underline">
            {t.prescriptions.backToList}
          </button>
        </div>
      );

    return (
      <div className="doctor-page space-y-6">
        <button onClick={() => onViewDetails(null)} className={`flex items-center gap-2 font-medium transition-colors ${isDark ? "text-slate-300 hover:text-cyan-200" : "text-slate-500 hover:text-blue-600"}`}>
          <ChevronRight size={18} className="rotate-180" /> {t.prescriptions.backToPrescriptions}
        </button>

        <div className={`rounded-[34px] p-6 md:p-8 ${glassPanelClass}`}>
          <div className="mb-7 flex flex-col gap-5 border-b border-slate-200/60 pb-7 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-500 text-white shadow-[0_20px_50px_-24px_rgba(16,185,129,0.85)]">
                <FileText size={30} />
              </div>
              <div>
                <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${isDark ? "text-slate-400" : "text-slate-400"}`}>{t.prescriptions.prescription}</p>
                <h2 className={`mt-1 text-2xl font-bold ${isDark ? "text-slate-50" : "text-slate-900"}`}>Rx: {prescription.patient}</h2>
                <p className={isDark ? "text-slate-300" : "text-slate-500"}>{t.prescriptions.issuedOn} {prescription.date}</p>
              </div>
            </div>
            <button className={`flex items-center gap-2 rounded-2xl border px-4 py-2 font-bold ${isDark ? "border-white/10 bg-white/8 text-slate-200 hover:bg-white/12" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>
              <Copy size={18} /> {t.prescriptions.copy}
            </button>
          </div>

          <div className="grid gap-5">
            <div>
              <h4 className={`mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                <Pill size={16} /> {t.prescriptions.medications}
              </h4>
              <div className={`rounded-[26px] border p-5 ${isDark ? "border-white/10 bg-white/7 text-slate-100" : "border-slate-200 bg-white/84 text-slate-800"}`}>
                <p className="text-lg font-bold">{prescription.meds}</p>
              </div>
            </div>

            <div>
              <h4 className={`mb-3 text-sm font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>{t.prescriptions.instructions}</h4>
              <div className={`rounded-[26px] border p-5 font-medium ${isDark ? "border-amber-400/15 bg-amber-400/10 text-amber-100" : "border-amber-100 bg-amber-50/80 text-amber-800"}`}>
                {prescription.notes}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-page space-y-6">
      <section className={`rounded-[34px] p-6 md:p-8 ${glassPanelClass}`}>
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${isDark ? "text-slate-400" : "text-slate-400"}`}>{t.prescriptions.manager}</p>
            <h2 className={`mt-2 text-3xl font-bold ${isDark ? "text-slate-50" : "text-slate-900"}`}>{t.prescriptions.issuedPrescriptions}</h2>
            <p className={`mt-2 ${isDark ? "text-slate-300" : "text-slate-500"}`}>{t.prescriptions.description}</p>
          </div>
          <button className="doctor-gradient-button flex items-center gap-2 px-5 py-3 font-bold">
            <span className="relative flex items-center gap-2">
              <FilePlus2 size={18} />
              {t.prescriptions.generateNew}
            </span>
          </button>
        </div>

        <div className={`doctor-glass-field mt-6 flex min-w-0 items-center gap-3 rounded-[24px] border px-4 py-3 ${isDark ? "border-white/10 bg-slate-950/55 focus-within:border-cyan-400/35" : "border-slate-200/90 bg-white/96 focus-within:border-cyan-300"}`}>
          <Search size={18} className="text-cyan-500" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t.prescriptions.searchPlaceholder}
            className={`min-w-0 flex-1 bg-transparent text-sm outline-none ${isDark ? "text-slate-100 placeholder:text-slate-500" : "text-slate-700 placeholder:text-slate-400"}`}
          />
        </div>
      </section>

      {filteredPrescriptions.length === 0 ? (
        <div className={`rounded-[34px] border border-dashed p-12 text-center ${glassPanelClass}`}>
          <FileText size={46} className={`mx-auto mb-4 ${isDark ? "text-slate-500" : "text-slate-300"}`} />
          <p className={isDark ? "text-slate-400" : "text-slate-500"}>{t.prescriptions.noPrescriptions}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredPrescriptions.map((prescription, index) => (
            <Motion.div
              key={prescription.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              whileHover={{ y: -4, scale: 1.006 }}
              onClick={() => onViewDetails?.(prescription.id)}
              className={`group cursor-pointer rounded-[30px] p-5 ${glassCardClass}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-500 text-white shadow-[0_18px_42px_-24px_rgba(16,185,129,0.85)]">
                    <Pill size={24} />
                  </div>
                  <div className="min-w-0">
                    <h3 className={`line-clamp-1 text-lg font-bold group-hover:text-cyan-500 ${isDark ? "text-slate-50" : "text-slate-900"}`}>{prescription.patient}</h3>
                    <p className={`mt-1 line-clamp-2 text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-500"}`}>{prescription.meds}</p>
                  </div>
                </div>
                <Download size={18} className={isDark ? "text-slate-400" : "text-slate-400"} />
              </div>

              <div className={`mt-5 flex items-center justify-between border-t pt-4 ${isDark ? "border-white/10" : "border-slate-100"}`}>
                <div className={`flex items-center gap-1.5 text-xs font-bold uppercase ${isDark ? "text-slate-400" : "text-slate-400"}`}>
                  <Calendar size={12} /> {t.prescriptions.date}
                </div>
                <p className={`text-sm font-semibold ${isDark ? "text-slate-300" : "text-slate-600"}`}>{prescription.date}</p>
              </div>
            </Motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Prescriptions;
