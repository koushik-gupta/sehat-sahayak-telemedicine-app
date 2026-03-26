import React from "react";
import { Copy, FileText, ChevronRight, Pill, Calendar } from "lucide-react";

function Prescriptions({ onViewDetails, detailPage }) {
  const [prescriptions, setPrescriptions] = React.useState([]);

  React.useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const response = await fetch('/api/v1/doctor/prescriptions');
      if (response.ok) {
        const data = await response.json();
        setPrescriptions(data);
      }
    } catch (error) {
      console.error("Failed to fetch prescriptions", error);
    }
  };

  // If a detailPage is active, show prescription details
  if (detailPage) {
    const prescription = prescriptions.find((p) => p.id === detailPage);
    if (!prescription) return (
      <div className="p-8 text-center text-slate-500">
        <p>Prescription details not found.</p>
        <button onClick={() => onViewDetails(null)} className="text-blue-600 font-bold mt-2 hover:underline">Back to list</button>
      </div>
    );

    return (
      <div className="space-y-6 animation-slide-in">
        <button
          onClick={() => onViewDetails(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium transition-colors"
        >
          <ChevronRight size={18} className="rotate-180" /> Back to Prescriptions
        </button>

        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                <FileText size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Rx: {prescription.patient}</h2>
                <p className="text-slate-500 font-medium">Issued on {prescription.date}</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-colors">
              <Copy size={18} /> Copy
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
                <Pill size={16} /> Medications
              </h4>
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-lg font-bold text-slate-800">{prescription.meds}</p>
              </div>
            </div>

            <div>
              <h4 className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
                Instructions
              </h4>
              <div className="p-5 bg-yellow-50 rounded-2xl border border-yellow-100 text-yellow-800 font-medium">
                {prescription.notes}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main prescription list
  return (
    <div className="space-y-6 animation-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Issued Prescriptions</h2>
        <p className="text-slate-500">History of prescriptions issued to your patients.</p>
      </div>

      <div className="grid gap-4">
        {prescriptions.map((p) => (
          <div
            key={p.id}
            onClick={() => onViewDetails(p.id)}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm cursor-pointer hover:shadow-md hover:border-emerald-200 transition-all group flex items-center justify-between gap-4"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Pill size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{p.patient}</h3>
                <p className="text-sm font-medium text-slate-500 mt-1 line-clamp-1">{p.meds}</p>
              </div>
            </div>

            <div className="text-right hidden sm:block">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase justify-end mb-1">
                <Calendar size={12} /> Date
              </div>
              <p className="text-sm font-semibold text-slate-600">{p.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Prescriptions;
