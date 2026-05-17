import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Edit3,
  LogOut,
  Activity,
  FileText,
  Droplet,
} from "lucide-react";
import EditProfileModal from "../../components/Dashboard/EditProfileModal";
import { resolveBackendAssetUrl } from "../../utils/runtime";
import { getGlassCardClass, getGlassPanelClass, useDashboardTheme } from "./DashboardThemeContext";

const ProfileScreen = ({ user, onLogout, refreshUser }) => {
  const { isDark } = useDashboardTheme();
  const glassPanelClass = getGlassPanelClass(isDark);
  const glassCardClass = getGlassCardClass(isDark);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const userData = {
    full_name: user?.full_name || "Guest User",
    email: user?.email || "No email provided",
    role: user?.role || "Patient",
    phone: user?.mobile || "+880 1XXX-XXXXXX",
    address: user?.address || "Update your address",
    blood_group: user?.blood_group || "N/A",
    dob: user?.date_of_birth || "N/A",
    gender: user?.gender || "N/A",
    profile_picture: resolveBackendAssetUrl(user?.profile_picture) || "https://i.pravatar.cc/150?img=12",
    id: user?.id || "P-1001",
    stats: {
      appointments: user?.appointments_count || 0,
      prescriptions: user?.prescriptions_count || 0,
      weight: user?.weight ? `${user.weight} kg` : "N/A",
      height: user?.height ? `${user.height} cm` : "N/A",
    },
  };

  const handleUpdateProfile = async (formData) => {
    const response = await fetch("/api/v1/user/update-profile", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update profile");
    }

    await response.json();

    if (refreshUser) {
      await refreshUser();
    }

    setIsEditModalOpen(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 p-4 md:space-y-6 md:p-6">
      {(!user?.email || !user?.mobile) && (
        <div className={`flex items-start gap-4 rounded-2xl border p-4 shadow-sm ${isDark ? "border-amber-300/20 bg-amber-500/10" : "border-amber-200 bg-amber-50"}`}>
          <div className={`rounded-lg p-2 ${isDark ? "bg-amber-300/10 text-amber-200" : "bg-amber-100 text-amber-700"}`}>
            <Shield size={20} />
          </div>
          <div>
            <h4 className={`font-bold ${isDark ? "text-amber-100" : "text-amber-800"}`}>Complete Your Profile Security</h4>
            <p className={`mt-1 text-sm ${isDark ? "text-amber-100/85" : "text-amber-700"}`}>
              For better account recovery and security, please link both your <span className="font-bold">Email</span> and{" "}
              <span className="font-bold">Mobile Number</span>. This ensures you never lose access to your account.
            </p>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className={`mt-3 rounded-lg px-4 py-2 text-sm font-bold transition-colors ${isDark ? "bg-amber-300/10 text-amber-100 hover:bg-amber-300/20" : "bg-amber-200/50 text-amber-800 hover:bg-amber-200"}`}
            >
              Update Information Now
            </button>
          </div>
        </div>
      )}

      <div className={`relative overflow-hidden rounded-3xl ${glassPanelClass}`}>
        <div className="relative h-32 w-full overflow-hidden bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 md:h-48">
          <div className="absolute inset-0 bg-black/10" />
          <div
            className="absolute inset-0 opacity-20"
            style={{ backgroundImage: "radial-gradient(circle at 10px 10px, white 2px, transparent 0)", backgroundSize: "30px 30px" }}
          />
        </div>

        <div className="relative px-4 pb-6 md:px-8 md:pb-8">
          <div className="mb-6 -mt-12 flex flex-col gap-4 md:-mt-16 md:flex-row md:items-end md:gap-6">
            <div className="relative group">
              <div className={`h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-lg md:h-32 md:w-32 ${isDark ? "bg-slate-900" : "bg-white"}`}>
                <img
                  src={userData.profile_picture}
                  alt={userData.full_name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className={`absolute bottom-1 right-1 rounded-full border p-1.5 text-blue-600 shadow-md transition-all hover:scale-110 md:p-2 ${isDark ? "border-white/10 bg-slate-900 hover:bg-slate-800" : "border-gray-100 bg-white hover:bg-gray-50"}`}
              >
                <Edit3 size={14} className="md:h-4 md:w-4" />
              </button>
            </div>

            <div className="mb-1 w-full flex-grow md:mb-2">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className={`text-2xl font-bold md:text-3xl ${isDark ? "text-slate-50" : "text-slate-800"}`}>{userData.full_name}</h1>
                  <p className={`flex items-center gap-2 text-sm font-medium md:text-base ${isDark ? "text-slate-300" : "text-slate-500"}`}>
                    <span className={`rounded-full border px-3 py-0.5 text-xs font-semibold uppercase tracking-wide md:text-sm ${isDark ? "border-blue-300/20 bg-blue-500/10 text-blue-200" : "border-blue-200 bg-blue-100 text-blue-700"}`}>
                      {userData.role}
                    </span>
                    <span className={isDark ? "text-slate-500" : "text-slate-300"}>•</span>
                    ID: {userData.id}
                  </p>
                </div>

                <div className="flex w-full gap-2 md:w-auto md:gap-3">
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 hover:shadow-blue-300 md:flex-none md:px-5 md:py-2.5"
                  >
                    <Edit3 size={16} />
                    <span className="whitespace-nowrap">Edit Profile</span>
                  </button>
                  <button
                    onClick={onLogout}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all md:px-5 md:py-2.5 ${isDark ? "bg-white/8 text-slate-300 hover:bg-white/12 hover:text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800"}`}
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className={`mt-6 grid grid-cols-2 gap-3 border-t pt-6 md:mt-8 md:grid-cols-4 md:gap-4 md:pt-8 ${isDark ? "border-white/10" : "border-slate-100"}`}>
            <StatCard label="Appointments" value={userData.stats.appointments} icon={<Calendar className="text-purple-500" size={20} />} tone={isDark ? "bg-purple-500/10" : "bg-purple-50"} />
            <StatCard label="Prescriptions" value={userData.stats.prescriptions} icon={<FileText className="text-blue-500" size={20} />} tone={isDark ? "bg-blue-500/10" : "bg-blue-50"} />
            <StatCard label="Weight" value={userData.stats.weight} icon={<Activity className="text-emerald-500" size={20} />} tone={isDark ? "bg-emerald-500/10" : "bg-emerald-50"} />
            <StatCard label="Blood Group" value={userData.blood_group} icon={<Droplet className="text-rose-500" size={20} />} tone={isDark ? "bg-rose-500/10" : "bg-rose-50"} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-4 md:col-span-2 md:space-y-6">
          <SectionCard title="Personal Information" icon={<User size={20} />}>
            <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 md:gap-y-6">
              <InfoItem label="Full Name" value={userData.full_name} icon={<User size={16} />} />
              <InfoItem label="Date of Birth" value={userData.dob} icon={<Calendar size={16} />} />
              <InfoItem label="Email Address" value={userData.email} icon={<Mail size={16} />} />
              <InfoItem label="Phone Number" value={userData.phone} icon={<Phone size={16} />} />
              <InfoItem label="Gender" value={userData.gender} icon={<User size={16} />} />
              <InfoItem label="Address" value={userData.address} icon={<MapPin size={16} />} className="sm:col-span-2" />
            </div>
          </SectionCard>

          <SectionCard title="Account Settings" icon={<Shield size={20} />}>
            <div className="space-y-4">
              <ActionRow icon={<Shield size={18} />} title="Change Password" description="Update your password for security" hoverTone={isDark ? "hover:bg-blue-500/10 hover:border-blue-300/20" : "hover:bg-blue-50/30 hover:border-blue-100"} accent={isDark ? "bg-white/8 group-hover:bg-slate-900 group-hover:text-blue-300" : "bg-slate-100 group-hover:bg-white group-hover:text-blue-600"} />
              <ActionRow icon={<Activity size={18} />} title="Deactivate Account" description="Temporarily disable your account" hoverTone={isDark ? "hover:bg-rose-500/10 hover:border-rose-300/20" : "hover:bg-red-50/30 hover:border-red-100"} accent={isDark ? "bg-white/8 group-hover:bg-slate-900 group-hover:text-rose-300" : "bg-slate-100 group-hover:bg-white group-hover:text-red-600"} danger />
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-lg shadow-blue-200">
            <div className="relative z-10">
              <h3 className="mb-2 text-lg font-bold">Premium Plan</h3>
              <p className="mb-6 text-sm text-blue-100 opacity-90">You are currently on the free plan. Upgrade for specific benefits.</p>
              <button className="w-full rounded-xl bg-white py-3 font-bold text-blue-700 shadow-sm transition-colors hover:bg-blue-50">Upgrade Now</button>
            </div>
            <div className="absolute -mr-8 -mt-8 right-0 top-0 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -mb-8 -ml-8 bottom-0 left-0 h-32 w-32 rounded-full bg-blue-500/20 blur-2xl" />
          </div>

          <div className={`rounded-3xl p-6 ${glassCardClass}`}>
            <h3 className={`mb-4 flex items-center gap-2 font-bold ${isDark ? "text-slate-50" : "text-slate-800"}`}>
              <span className="h-6 w-1 rounded-full bg-blue-500" />
              Completion
            </h3>
            <div className="space-y-4">
              <div>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className={`font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}>Profile Complete</span>
                  <span className="font-bold text-blue-600">85%</span>
                </div>
                <div className={`h-2.5 overflow-hidden rounded-full ${isDark ? "bg-white/8" : "bg-slate-100"}`}>
                  <div className="h-full w-[85%] rounded-full bg-blue-500 shadow-sm" />
                </div>
                <p className={`mt-2 text-xs ${isDark ? "text-slate-400" : "text-slate-400"}`}>Add your medical history to reach 100%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onUpdate={handleUpdateProfile}
      />
    </div>
  );
};

const StatCard = ({ label, value, icon, tone }) => {
  const { isDark } = useDashboardTheme();

  return (
    <div className={`group flex flex-col items-center justify-center rounded-2xl border p-3 shadow-sm transition-shadow hover:shadow-md md:p-4 ${isDark ? "border-white/10 bg-slate-900/72" : "border-slate-100 bg-white"}`}>
      <div className={`mb-2 rounded-xl p-2.5 transition-transform duration-300 group-hover:scale-110 md:mb-3 md:p-3 ${tone}`}>
        {icon}
      </div>
      <span className={`text-xl font-bold md:text-2xl ${isDark ? "text-slate-100" : "text-slate-800"}`}>{value}</span>
      <span className={`text-center text-xs font-medium md:text-sm ${isDark ? "text-slate-400" : "text-slate-400"}`}>{label}</span>
    </div>
  );
};

const SectionCard = ({ title, icon, children }) => {
  const { isDark } = useDashboardTheme();
  const glassCardClass = getGlassCardClass(isDark);

  return (
    <div className={`rounded-3xl p-4 md:p-8 ${glassCardClass}`}>
      <div className={`mb-4 flex items-center gap-3 border-b pb-3 md:mb-6 md:pb-4 ${isDark ? "border-white/10" : "border-slate-50"}`}>
        <div className={`rounded-xl p-2 text-blue-600 md:p-2.5 ${isDark ? "bg-blue-500/10" : "bg-blue-50"}`}>{icon}</div>
        <h3 className={`text-lg font-bold md:text-xl ${isDark ? "text-slate-100" : "text-slate-800"}`}>{title}</h3>
      </div>
      {children}
    </div>
  );
};

const InfoItem = ({ label, value, icon, className }) => {
  const { isDark } = useDashboardTheme();

  return (
    <div className={className}>
      <label className={`mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-400"}`}>
        {icon} {label}
      </label>
      <div className={`border-b pb-1 text-lg font-medium ${isDark ? "border-white/10 text-slate-200" : "border-slate-100 text-slate-700"}`}>
        {value}
      </div>
    </div>
  );
};

const ActionRow = ({ icon, title, description, hoverTone, accent, danger = false }) => {
  const { isDark } = useDashboardTheme();

  return (
    <div className={`group flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-colors ${isDark ? "border-white/10" : "border-slate-100"} ${hoverTone}`}>
      <div>
        <h4 className={`text-sm font-semibold md:text-base ${danger ? (isDark ? "group-hover:text-rose-300 text-slate-100" : "group-hover:text-red-700 text-slate-700") : (isDark ? "group-hover:text-blue-300 text-slate-100" : "group-hover:text-blue-700 text-slate-700")}`}>{title}</h4>
        <p className={`text-xs md:text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{description}</p>
      </div>
      <div className={`rounded-lg p-2 transition-all ${accent}`}>
        {icon}
      </div>
    </div>
  );
};

export default ProfileScreen;
