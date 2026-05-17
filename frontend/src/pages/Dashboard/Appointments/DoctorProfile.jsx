import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  BriefcaseMedical,
  Clock3,
  Globe2,
  Hospital,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  Video,
  Wallet,
} from "lucide-react";
import { getGlassCardClass, getGlassPanelClass, useDashboardTheme } from "../DashboardThemeContext";

const DoctorProfile = ({ doctor, onBack, onBookAppointment, isBooking, t }) => {
  const { isDark } = useDashboardTheme();
  const glassPanelClass = getGlassPanelClass(isDark);
  const glassCardClass = getGlassCardClass(isDark);
  const [reason, setReason] = useState("");

  const languageList = useMemo(() => {
    if (Array.isArray(doctor?.languages)) {
      return doctor.languages;
    }

    if (doctor?.languages) {
      return String(doctor.languages)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [];
  }, [doctor]);

  if (!doctor) {
    return (
      <div className={`flex min-h-[400px] flex-col items-center justify-center rounded-[32px] p-8 ${glassCardClass} ${isDark ? "text-slate-300" : "text-slate-500"}`}>
        <h2 className={`text-xl font-bold ${isDark ? "text-slate-100" : "text-slate-800"}`}>Doctor not found</h2>
        <button onClick={onBack} className="mt-4 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">
          Go back
        </button>
      </div>
    );
  }

  const handleBooking = () => {
    onBookAppointment({
      doctorId: doctor.id,
      reason,
    });
  };

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold shadow-sm transition-colors ${
          isDark ? "border-white/10 bg-white/8 text-slate-300 hover:border-blue-300/25 hover:text-white" : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700"
        }`}
      >
        <ArrowLeft size={16} />
        Back to doctors
      </button>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className={`overflow-hidden rounded-[32px] ${glassPanelClass}`}>
          <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 px-6 py-8 text-white md:px-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-end">
              <div className="h-32 w-32 overflow-hidden rounded-[28px] border-4 border-white/20 bg-white/10 shadow-lg backdrop-blur">
                <img
                  src={doctor.image || "/images/doc1.png"}
                  alt={doctor.name}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.src = "/images/doc1.png";
                  }}
                />
              </div>

              <div className="flex-1">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em]">
                  <Sparkles size={14} />
                  Verified doctor
                </div>
                <h1 className="mt-4 text-3xl font-bold">{doctor.name}</h1>
                <p className="mt-2 text-lg text-blue-50">{doctor.specialty || "General consultation"}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge icon={<Star size={13} className="fill-yellow-300 text-yellow-300" />} label={`${Number(doctor.rating || 4.8).toFixed(1)} rating`} />
                  <Badge icon={<BriefcaseMedical size={13} />} label={doctor.experience || "Experienced"} />
                  <Badge icon={<Hospital size={13} />} label={doctor.hospital || "Online consultation"} />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-6 md:p-8">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <InfoTile icon={<Wallet size={18} className="text-emerald-600" />} label="Fee" value={formatFee(doctor.fee)} />
              <InfoTile icon={<Globe2 size={18} className="text-blue-600" />} label="Languages" value={languageList.length || "--"} />
              <InfoTile icon={<ShieldCheck size={18} className="text-indigo-600" />} label="Consult mode" value="Instant video" />
              <InfoTile icon={<Clock3 size={18} className="text-amber-600" />} label="Response" value="Queue based" />
            </div>

            <DetailCard
              title="About doctor"
              icon={<Stethoscope size={18} className="text-blue-600" />}
              content={
                doctor.about ||
                `Dr. ${doctor.name.split(" ").slice(-1)[0]} provides patient-focused ${doctor.specialty || "medical"} consultations with clear next steps and practical care guidance.`
              }
            />

            <div className="grid gap-4 md:grid-cols-2">
              <DetailCard
                title="Qualifications"
                icon={<ShieldCheck size={18} className="text-indigo-600" />}
                content={doctor.qualification || "Professional qualification details will be shared during consultation."}
              />
              <DetailCard
                title="Hospital or clinic"
                icon={<Hospital size={18} className="text-emerald-600" />}
                content={doctor.hospital || "Online consultation available from the dashboard."}
              />
            </div>

            {languageList.length > 0 && (
              <div className={`rounded-[28px] border p-5 ${isDark ? "border-white/10 bg-white/8" : "border-slate-200 bg-slate-50"}`}>
                <p className={`text-sm font-bold uppercase tracking-[0.22em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Languages spoken</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {languageList.map((language) => (
                    <span key={language} className={`rounded-full px-4 py-2 text-sm font-semibold shadow-sm ${isDark ? "bg-slate-900/70 text-slate-100" : "bg-white text-slate-700"}`}>
                      {language}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-6">
          <section className={`rounded-[32px] p-6 ${glassCardClass}`}>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Book appointment</p>
            <h2 className={`mt-2 text-2xl font-bold ${isDark ? "text-slate-50" : "text-slate-900"}`}>Instant consultation queue</h2>
            <p className={`mt-3 text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>
              This patient flow uses instant queue-based booking. The backend assigns the next available consultation time automatically.
            </p>

            <div className={`mt-5 rounded-[24px] p-4 ${isDark ? "bg-white/8" : "bg-slate-50"}`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className={`text-xs font-bold uppercase tracking-[0.2em] ${isDark ? "text-slate-400" : "text-slate-400"}`}>Expected mode</p>
                  <p className={`mt-1 text-lg font-bold ${isDark ? "text-slate-50" : "text-slate-900"}`}>Secure video consultation</p>
                </div>
                <div className={`rounded-2xl p-3 text-blue-700 ${isDark ? "bg-blue-500/15" : "bg-blue-100"}`}>
                  <Video size={20} />
                </div>
              </div>
            </div>

            <label className={`mt-5 block text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>
              Consultation reason
              <textarea
                rows="5"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Briefly describe your symptoms, follow-up need, or what you'd like help with."
                className={`mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all ${
                  isDark
                    ? "border-white/10 bg-slate-950/55 text-slate-100 placeholder:text-slate-500 focus:border-blue-400/30 focus:bg-slate-950/70 focus:ring-4 focus:ring-blue-500/10"
                    : "border-slate-200 bg-slate-50 text-slate-700 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                }`}
              />
            </label>

            <div className={`mt-5 space-y-3 rounded-[24px] border p-4 text-sm ${isDark ? "border-blue-300/20 bg-blue-500/10 text-blue-100" : "border-blue-100 bg-blue-50 text-blue-800"}`}>
              <p className="font-bold">Before you book</p>
              <ul className={`space-y-2 ${isDark ? "text-blue-100/85" : "text-blue-700"}`}>
                <li>Keep your internet stable so the consultation starts smoothly.</li>
                <li>After booking, your room code appears in My Appointments and the Consult tab flow.</li>
                <li>Add your reason now to help the doctor prepare faster.</li>
              </ul>
            </div>

            <button
              onClick={handleBooking}
              disabled={isBooking}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              <Video size={18} />
              {isBooking ? "Booking appointment..." : "Book instant consultation"}
            </button>
          </section>

          <section className={`rounded-[32px] p-6 ${glassCardClass}`}>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Patient trust</p>
            <h3 className={`mt-2 text-xl font-bold ${isDark ? "text-slate-50" : "text-slate-900"}`}>Why patients choose this doctor</h3>
            <div className="mt-5 space-y-3">
              <TrustRow title="Clear communication" description="Patient-friendly explanations and practical next steps." />
              <TrustRow title="Faster triage" description="Queue-based consultation helps urgent needs get seen sooner." />
              <TrustRow title="Dashboard continuity" description="Appointments and consult access stay connected inside the app." />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

function Badge({ icon, label }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-semibold text-white">
      {icon}
      {label}
    </span>
  );
}

function InfoTile({ icon, label, value }) {
  const { isDark } = useDashboardTheme();

  return (
    <div className={`rounded-[24px] border p-4 ${isDark ? "border-white/10 bg-white/8" : "border-slate-200 bg-slate-50"}`}>
      <div className="flex items-center gap-2">
        {icon}
        <p className={`text-xs font-bold uppercase tracking-[0.22em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>{label}</p>
      </div>
      <p className={`mt-3 text-xl font-bold ${isDark ? "text-slate-50" : "text-slate-900"}`}>{value}</p>
    </div>
  );
}

function DetailCard({ title, icon, content }) {
  const { isDark } = useDashboardTheme();

  return (
    <div className={`rounded-[28px] border p-5 ${isDark ? "border-white/10 bg-white/8" : "border-slate-200 bg-white"}`}>
      <div className="flex items-center gap-2">
        {icon}
        <h3 className={`text-lg font-bold ${isDark ? "text-slate-50" : "text-slate-900"}`}>{title}</h3>
      </div>
      <p className={`mt-4 text-sm leading-7 ${isDark ? "text-slate-300" : "text-slate-600"}`}>{content}</p>
    </div>
  );
}

function TrustRow({ title, description }) {
  const { isDark } = useDashboardTheme();

  return (
    <div className={`rounded-2xl p-4 ${isDark ? "bg-white/8" : "bg-slate-50"}`}>
      <p className={`font-bold ${isDark ? "text-slate-100" : "text-slate-800"}`}>{title}</p>
      <p className={`mt-1 text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>{description}</p>
    </div>
  );
}

function formatFee(value) {
  if (value === null || value === undefined || value === "") {
    return "Fee on request";
  }

  if (typeof value === "number") {
    return `Rs. ${value}`;
  }

  const parsed = Number(String(value).replace(/[^0-9.]/g, ""));
  return Number.isNaN(parsed) ? String(value) : `Rs. ${parsed}`;
}

export default DoctorProfile;
