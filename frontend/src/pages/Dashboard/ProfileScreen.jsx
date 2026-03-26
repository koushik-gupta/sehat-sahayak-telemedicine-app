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
  Droplet
} from "lucide-react";
import EditProfileModal from "../../components/Dashboard/EditProfileModal";
import { resolveBackendAssetUrl } from "../../utils/runtime";

const ProfileScreen = ({ user, onLogout, refreshUser }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Safe defaults merging with real user data
  const userData = {
    full_name: user?.full_name || "Guest User",
    email: user?.email || "No email provided",
    role: user?.role || "Patient",
    phone: user?.mobile || "+880 1XXX-XXXXXX",
    address: user?.address || "Update your address",
    blood_group: user?.blood_group || "N/A",
    dob: user?.date_of_birth || "N/A", // Backend uses date_of_birth
    gender: user?.gender || "N/A",
    profile_picture: resolveBackendAssetUrl(user?.profile_picture) || "https://i.pravatar.cc/150?img=12",
    id: user?.id || "P-1001",
    stats: {
      appointments: user?.appointments_count || 0,
      prescriptions: user?.prescriptions_count || 0,
      weight: user?.weight ? `${user.weight} kg` : "N/A",
      height: user?.height ? `${user.height} cm` : "N/A"
    }
  };

  const handleUpdateProfile = async (formData) => {
    // API Call to update profile
    const response = await fetch('/api/v1/user/update-profile', {
      method: 'POST',
      body: formData, // FormData handles headers automatically
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update profile");
    }

    const result = await response.json();
    // Profile Updated

    // Refresh user data via parent logic instead of reloading
    if (refreshUser) {
      await refreshUser();
    }

    // Close modal
    setIsEditModalOpen(false);
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto animation-fade-in space-y-4 md:space-y-6">

      {/* Missing Information Warning */}
      {(!user?.email || !user?.mobile) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-4 shadow-sm animate-fade-in-up">
          <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
            <Shield size={20} />
          </div>
          <div>
            <h4 className="font-bold text-amber-800">Complete Your Profile Security</h4>
            <p className="text-amber-700 text-sm mt-1">
              For better account recovery and security, please link both your <span className="font-bold">Email</span> and <span className="font-bold">Mobile Number</span>.
              This ensures you never lose access to your account.
            </p>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="mt-3 text-sm font-bold text-amber-800 bg-amber-200/50 px-4 py-2 rounded-lg hover:bg-amber-200 transition-colors"
            >
              Update Information Now
            </button>
          </div>
        </div>
      )}

      {/* Header Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative">
        {/* Cover Image with Gradient */}
        <div className="h-32 md:h-48 w-full bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'radial-gradient(circle at 10px 10px, white 2px, transparent 0)', backgroundSize: '30px 30px' }}>
          </div>
        </div>

        {/* Profile Info & Stats */}
        <div className="px-4 md:px-8 pb-6 md:pb-8 relative">
          <div className="flex flex-col md:flex-row items-end gap-4 md:gap-6 -mt-12 md:-mt-16 mb-6">
            <div className="relative group">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                <img
                  src={userData.profile_picture}
                  alt={userData.full_name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="absolute bottom-1 right-1 bg-white p-1.5 md:p-2 rounded-full shadow-md hover:bg-gray-50 border border-gray-100 transition-all hover:scale-110 text-blue-600">
                <Edit3 size={14} className="md:w-4 md:h-4" />
              </button>
            </div>

            <div className="flex-grow mb-1 md:mb-2 w-full">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-800">{userData.full_name}</h1>
                  <p className="text-slate-500 font-medium flex items-center gap-2 text-sm md:text-base">
                    <span className="bg-blue-100 text-blue-700 px-3 py-0.5 rounded-full text-xs md:text-sm font-semibold border border-blue-200 uppercase tracking-wide">
                      {userData.role}
                    </span>
                    <span className="text-slate-300">•</span>
                    ID: {userData.id}
                  </p>
                </div>
                <div className="flex gap-2 md:gap-3 w-full md:w-auto">
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex-1 md:flex-none justify-center px-4 py-2 md:px-5 md:py-2.5 rounded-xl bg-blue-600 text-white font-medium shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5 transition-all text-sm flex items-center gap-2"
                  >
                    <Edit3 size={16} /> <span className="whitespace-nowrap">Edit Profile</span>
                  </button>
                  <button
                    onClick={onLogout}
                    className="px-4 py-2 md:px-5 md:py-2.5 rounded-xl bg-slate-100 text-slate-600 font-medium hover:bg-slate-200 hover:text-slate-800 transition-all text-sm flex items-center gap-2"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6 md:mt-8 border-t border-slate-100 pt-6 md:pt-8">
            <StatCard label="Appointments" value={userData.stats.appointments} icon={<Calendar className="text-purple-500" size={20} />} bg="bg-purple-50" />
            <StatCard label="Prescriptions" value={userData.stats.prescriptions} icon={<FileText className="text-blue-500" size={20} />} bg="bg-blue-50" />
            <StatCard label="Weight" value={userData.stats.weight} icon={<Activity className="text-emerald-500" size={20} />} bg="bg-emerald-50" />
            <StatCard label="Blood Group" value={userData.blood_group} icon={<Droplet className="text-rose-500" size={20} />} bg="bg-rose-50" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-3 gap-6">

        {/* Personal Details Column */}
        <div className="md:col-span-2 space-y-4 md:space-y-6">
          <SectionCard title="Personal Information" icon={<User size={20} />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 md:gap-y-6 gap-x-8">
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
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-colors cursor-pointer group">
                <div>
                  <h4 className="font-semibold text-slate-700 group-hover:text-blue-700 transition-colors text-sm md:text-base">Change Password</h4>
                  <p className="text-xs md:text-sm text-slate-500">Update your password for security</p>
                </div>
                <div className="bg-slate-100 p-2 rounded-lg group-hover:bg-white group-hover:text-blue-600 transition-all">
                  <Shield size={18} />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-red-100 hover:bg-red-50/30 transition-colors cursor-pointer group">
                <div>
                  <h4 className="font-semibold text-slate-700 group-hover:text-red-700 transition-colors text-sm md:text-base">Deactivate Account</h4>
                  <p className="text-xs md:text-sm text-slate-500">Temporarily disable your account</p>
                </div>
                <div className="bg-slate-100 p-2 rounded-lg group-hover:bg-white group-hover:text-red-600 transition-all">
                  <Activity size={18} />
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* ... (Premium Plan Sidebar - kept same, mostly ok) ... */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-lg shadow-blue-200 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2">Premium Plan</h3>
              <p className="text-blue-100 text-sm mb-6 opacity-90">You are currently on the free plan. Upgrade for specific benefits.</p>
              <button className="w-full py-3 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-sm">
                Upgrade Now
              </button>
            </div>
            {/* Decoration */}
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
              Completion
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-slate-600">Profile Complete</span>
                  <span className="font-bold text-blue-600">85%</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[85%] rounded-full shadow-sm"></div>
                </div>
                <p className="text-xs text-slate-400 mt-2">Add your medical history to reach 100%</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onUpdate={handleUpdateProfile}
      />
    </div>
  );
};

// Helper Components
const StatCard = ({ label, value, icon, bg }) => (
  <div className="flex flex-col items-center justify-center p-3 md:p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
    <div className={`p-2.5 md:p-3 rounded-xl ${bg} mb-2 md:mb-3 group-hover:scale-110 transition-transform duration-300`}>
      {icon}
    </div>
    <span className="text-xl md:text-2xl font-bold text-slate-800">{value}</span>
    <span className="text-xs md:text-sm text-slate-400 font-medium text-center">{label}</span>
  </div>
);

const SectionCard = ({ title, icon, children }) => (
  <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-4 md:p-8">
    <div className="flex items-center gap-3 mb-4 md:mb-6 pb-3 md:pb-4 border-b border-slate-50">
      <div className="p-2 md:p-2.5 bg-blue-50 text-blue-600 rounded-xl">
        {icon}
      </div>
      <h3 className="text-lg md:text-xl font-bold text-slate-800">{title}</h3>
    </div>
    {children}
  </div>
);

const InfoItem = ({ label, value, icon, className }) => (
  <div className={className}>
    <label className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
      {icon} {label}
    </label>
    <div className="text-slate-700 font-medium text-lg border-b border-slate-100 pb-1">
      {value}
    </div>
  </div>
);

export default ProfileScreen;
