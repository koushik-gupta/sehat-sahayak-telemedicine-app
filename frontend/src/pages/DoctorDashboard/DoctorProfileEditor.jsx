// src/pages/DoctorDashboard/DoctorProfileEditor.jsx
import React, { useState, useEffect } from 'react';
import { User, Stethoscope, Award, MapPin, DollarSign, Building, FileText, Globe } from 'lucide-react';

const DoctorProfileEditor = ({ t }) => {
    // Initial state with new fields
    const [profile, setProfile] = useState({
        specialty: '',
        qualification: '',
        experience: '',
        fee: '',
        about: '',
        languages: '',
        clinic_name: '',
        clinic_address: '',
        registration_number: ''
    });
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Note: Fetch existing profile data here in a real scenario
    // For now, we start fresh or mock if needed

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            const payload = {
                ...profile,
                languages: profile.languages.split(',').map(lang => lang.trim())
            };

            const response = await fetch('/api/v1/doctor/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update profile.');
            }

            setMessage({ type: 'success', text: 'Profile updated successfully!' });

        } catch (error) {
            setMessage({ type: 'error', text: `Error: ${error.message}` });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-2 animation-fade-in">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">{t.editProfile || "Professional Profile"}</h2>
                <p className="text-slate-500">Manage your public profile, potential patients will see this information.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 md:p-8 shadow-lg border border-slate-100 space-y-8">

                {/* Section 1: Professional Details */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                        <User size={20} className="text-blue-600" /> Basic Information
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Specialty</label>
                            <div className="relative">
                                <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    name="specialty"
                                    value={profile.specialty}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    placeholder="e.g. Cardiologist"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Qualification</label>
                            <div className="relative">
                                <Award className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    name="qualification"
                                    value={profile.qualification}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    placeholder="e.g. MBBS, MD"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Experience</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="experience"
                                    value={profile.experience}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    placeholder="e.g. 10 Years"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Consultation Fee</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    name="fee"
                                    value={profile.fee}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    placeholder="e.g. 500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1 md:col-span-2">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Languages Spoken</label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    name="languages"
                                    value={profile.languages}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    placeholder="e.g. English, Hindi"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: Clinic Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                        <Building size={20} className="text-blue-600" /> Clinic Details
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Clinic Name</label>
                            <input
                                type="text"
                                name="clinic_name"
                                value={profile.clinic_name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                placeholder="Your Clinic Name"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Registration Number</label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    name="registration_number"
                                    value={profile.registration_number}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    placeholder="Medical Council Reg. No"
                                />
                            </div>
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-sm font-semibold text-slate-700 ml-1">Clinic Address</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
                                <textarea
                                    name="clinic_address"
                                    value={profile.clinic_address}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
                                    placeholder="Full address of your clinic..."
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 3: About */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                        <FileText size={20} className="text-blue-600" /> Professional Bio
                    </h3>
                    <div className="space-y-1">
                        <textarea
                            name="about"
                            value={profile.about}
                            onChange={handleChange}
                            rows="5"
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            placeholder="Tell patients about your experience and medical philosophy..."
                        ></textarea>
                    </div>
                </div>

                {/* Actions */}
                <div className="pt-4 flex items-center justify-end gap-4">
                    {message && (
                        <span className={`text-sm font-medium ${message.type === 'success' ? 'text-green-600' : 'text-red-500'} animate-pulse`}>
                            {message.text}
                        </span>
                    )}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:pointer-events-none"
                    >
                        {isLoading ? 'Saving Changes...' : 'Save Profile'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DoctorProfileEditor;