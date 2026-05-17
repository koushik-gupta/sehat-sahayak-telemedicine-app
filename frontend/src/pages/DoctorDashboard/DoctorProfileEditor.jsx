// src/pages/DoctorDashboard/DoctorProfileEditor.jsx
import React, { useEffect, useState } from "react";
import { motion as Motion } from "framer-motion";
import { Award, Building, Camera, DollarSign, FileText, Globe, MapPin, Save, Stethoscope, User } from "lucide-react";
import { getGlassCardClass, getGlassPanelClass, useDashboardTheme } from "../Dashboard/DashboardThemeContext";
import { resolveBackendAssetUrl } from "../../utils/runtime";

const DoctorProfileEditor = ({ t, user, refreshUser }) => {
  const { isDark } = useDashboardTheme();
  const glassPanelClass = getGlassPanelClass(isDark);
  const glassCardClass = getGlassCardClass(isDark);
  const initialAvatar = resolveBackendAssetUrl(user?.profile_picture) || "https://i.pravatar.cc/150?u=doctor-profile";
  const [profile, setProfile] = useState({
    specialty: "",
    qualification: "",
    experience: "",
    fee: "",
    about: "",
    languages: "",
    clinic_name: "",
    clinic_address: "",
    registration_number: "",
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(initialAvatar);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  useEffect(() => {
    setAvatarPreview(initialAvatar);
  }, [initialAvatar]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const payload = {
        ...profile,
        languages: profile.languages.split(",").map((lang) => lang.trim()),
      };

      const response = await fetch("/api/v1/doctor/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t.profile.updateFailed);
      }

      setMessage({ type: "success", text: t.profile.updated });
    } catch (error) {
      setMessage({ type: "error", text: `${t.profile.errorPrefix} ${error.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setAvatarPreview(URL.createObjectURL(file));
    setIsUploadingPhoto(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("profile_picture", file);

      const response = await fetch("/api/v1/user/update-profile", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || t.profile.pictureUpdateFailed);
      }

      if (data.user?.profile_picture) {
        setAvatarPreview(resolveBackendAssetUrl(data.user.profile_picture));
      }

      if (refreshUser) {
        await refreshUser();
      }

      setMessage({ type: "success", text: t.profile.pictureUpdated });
    } catch (error) {
      setAvatarPreview(initialAvatar);
      setMessage({ type: "error", text: `${t.profile.errorPrefix} ${error.message}` });
    } finally {
      setIsUploadingPhoto(false);
      event.target.value = "";
    }
  };

  const profileStats = [
    { label: t.profile.stats.specialization, value: profile.specialty || t.profile.stats.addSpecialty, icon: Stethoscope },
    { label: t.profile.stats.experience, value: profile.experience || t.profile.stats.addYears, icon: Award },
    { label: t.profile.stats.fee, value: profile.fee ? `Rs ${profile.fee}` : t.profile.stats.addFee, icon: DollarSign },
  ];

  return (
    <div className="doctor-page space-y-6 pb-10">
      <section className={`overflow-hidden rounded-[34px] p-6 md:p-8 ${glassPanelClass}`}>
        <div className="hero-grid-overlay absolute inset-0 opacity-30" />
        <div className="relative grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className={`rounded-[30px] p-5 text-center ${glassCardClass}`}>
            <div className="relative mx-auto h-28 w-28">
              <div className="h-28 w-28 overflow-hidden rounded-[32px] border-4 border-white/70 shadow-[0_24px_60px_-28px_rgba(37,99,235,0.5)]">
                <img src={avatarPreview} alt={t.topbar.doctorAlt} className={`h-full w-full object-cover transition duration-300 ${isUploadingPhoto ? "scale-105 opacity-60" : ""}`} />
              </div>
              <label
                className={`absolute -bottom-2 -right-2 flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border shadow-lg transition-all hover:-translate-y-0.5 ${
                  isDark
                    ? "border-white/10 bg-slate-900 text-cyan-200 hover:bg-slate-800"
                    : "border-white bg-white text-cyan-600 hover:bg-cyan-50"
                }`}
                title={t.profile.updatePictureTitle}
              >
                <Camera size={18} />
                <input type="file" accept="image/*" className="hidden" onChange={handleProfilePictureChange} disabled={isUploadingPhoto} />
              </label>
            </div>
            {isUploadingPhoto && <p className="mt-3 text-sm font-semibold text-cyan-500">{t.profile.uploadingPhoto}</p>}
            <p className={`mt-5 text-[11px] font-semibold uppercase tracking-[0.24em] ${isDark ? "text-slate-400" : "text-slate-400"}`}>{t.profile.professionalProfile}</p>
            <h2 className={`mt-2 text-2xl font-bold ${isDark ? "text-slate-50" : "text-slate-900"}`}>
              Dr. {user?.full_name || user?.last_name || "Doctor"}
            </h2>
            <p className={`mt-2 text-sm leading-6 ${isDark ? "text-slate-300" : "text-slate-500"}`}>
              {t.profile.description}
            </p>
          </div>

          <div>
            <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${isDark ? "text-slate-400" : "text-slate-400"}`}>{t.profile.commandCenter}</p>
            <h1 className={`mt-2 text-3xl font-bold ${isDark ? "text-slate-50" : "text-slate-900"}`}>{t.profile.title}</h1>
            <p className={`mt-3 max-w-2xl ${isDark ? "text-slate-300" : "text-slate-500"}`}>{t.profile.summary}</p>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {profileStats.map((stat, index) => (
                <Motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className={`rounded-[24px] p-4 ${glassCardClass}`}>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[16px] bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-500 text-white">
                    <stat.icon size={17} />
                  </div>
                  <p className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${isDark ? "text-slate-400" : "text-slate-400"}`}>{stat.label}</p>
                  <p className={`mt-2 text-sm font-bold ${isDark ? "text-slate-50" : "text-slate-900"}`}>{stat.value}</p>
                </Motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className={`rounded-[34px] p-6 md:p-8 ${glassPanelClass}`}>
        <FormSection title={t.profile.sections.basicInformation} icon={User}>
          <Field icon={Stethoscope} label={t.profile.fields.specialty} name="specialty" value={profile.specialty} onChange={handleChange} placeholder={t.profile.fields.specialtyPlaceholder} required />
          <Field icon={Award} label={t.profile.fields.qualification} name="qualification" value={profile.qualification} onChange={handleChange} placeholder={t.profile.fields.qualificationPlaceholder} required />
          <Field label={t.profile.fields.experience} name="experience" value={profile.experience} onChange={handleChange} placeholder={t.profile.fields.experiencePlaceholder} required />
          <Field icon={DollarSign} label={t.profile.fields.fee} name="fee" value={profile.fee} onChange={handleChange} placeholder={t.profile.fields.feePlaceholder} required />
          <Field icon={Globe} label={t.profile.fields.languages} name="languages" value={profile.languages} onChange={handleChange} placeholder={t.profile.fields.languagesPlaceholder} className="md:col-span-2" />
        </FormSection>

        <FormSection title={t.profile.sections.clinicDetails} icon={Building}>
          <Field label={t.profile.fields.clinicName} name="clinic_name" value={profile.clinic_name} onChange={handleChange} placeholder={t.profile.fields.clinicNamePlaceholder} />
          <Field icon={FileText} label={t.profile.fields.registrationNumber} name="registration_number" value={profile.registration_number} onChange={handleChange} placeholder={t.profile.fields.registrationPlaceholder} />
          <TextArea icon={MapPin} label={t.profile.fields.clinicAddress} name="clinic_address" value={profile.clinic_address} onChange={handleChange} placeholder={t.profile.fields.clinicAddressPlaceholder} className="md:col-span-2" />
        </FormSection>

        <FormSection title={t.profile.sections.professionalBio} icon={FileText}>
          <TextArea name="about" value={profile.about} onChange={handleChange} rows="5" placeholder={t.profile.fields.bioPlaceholder} className="md:col-span-2" />
        </FormSection>

        <div className="flex flex-col gap-4 border-t border-slate-200/60 pt-6 sm:flex-row sm:items-center sm:justify-end">
          {message && (
            <span className={`text-sm font-semibold ${message.type === "success" ? "text-green-500" : "text-red-500"}`}>
              {message.text}
            </span>
          )}
          <button type="submit" disabled={isLoading} className="doctor-gradient-button px-8 py-3 font-bold disabled:opacity-70">
            <span className="relative flex items-center justify-center gap-2">
              <Save size={18} />
              {isLoading ? t.profile.saving : t.profile.saveProfile}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

const FormSection = ({ title, icon, children }) => {
  const { isDark } = useDashboardTheme();
  return (
    <section className="mb-8 space-y-4">
      <h3 className={`flex items-center gap-2 border-b pb-3 text-lg font-bold ${isDark ? "border-white/10 text-slate-50" : "border-slate-100 text-slate-800"}`}>
        {React.createElement(icon, { size: 20, className: "text-cyan-500" })} {title}
      </h3>
      <div className="grid gap-5 md:grid-cols-2">{children}</div>
    </section>
  );
};

const Field = ({ icon, label, className = "", ...props }) => {
  const { isDark } = useDashboardTheme();
  return (
    <label className={`space-y-2 ${className}`}>
      <span className={`ml-1 text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>{label}</span>
      <div className={`doctor-glass-field relative rounded-2xl border ${isDark ? "border-white/10 bg-white/8 focus-within:border-cyan-400/35" : "border-slate-200 bg-white/92 focus-within:border-cyan-300"}`}>
        {icon && React.createElement(icon, { className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-400", size: 18 })}
        <input {...props} className={`w-full bg-transparent py-3 outline-none ${icon ? "pl-10" : "pl-4"} pr-4 ${isDark ? "text-slate-100 placeholder:text-slate-500" : "text-slate-700 placeholder:text-slate-400"}`} />
      </div>
    </label>
  );
};

const TextArea = ({ icon, label, className = "", ...props }) => {
  const { isDark } = useDashboardTheme();
  return (
    <label className={`space-y-2 ${className}`}>
      {label && <span className={`ml-1 text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>{label}</span>}
      <div className={`doctor-glass-field relative rounded-2xl border ${isDark ? "border-white/10 bg-white/8 focus-within:border-cyan-400/35" : "border-slate-200 bg-white/92 focus-within:border-cyan-300"}`}>
        {icon && React.createElement(icon, { className: "absolute left-3 top-3 text-slate-400", size: 18 })}
        <textarea {...props} className={`w-full resize-none bg-transparent py-3 outline-none ${icon ? "pl-10" : "pl-4"} pr-4 ${isDark ? "text-slate-100 placeholder:text-slate-500" : "text-slate-700 placeholder:text-slate-400"}`} />
      </div>
    </label>
  );
};

export default DoctorProfileEditor;
