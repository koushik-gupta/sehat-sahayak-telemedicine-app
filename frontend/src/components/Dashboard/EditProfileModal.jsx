import React, { useState, useEffect } from "react";
import { X, Camera, Save } from "lucide-react";
import { resolveBackendAssetUrl } from "../../utils/runtime";

/**
 * EditProfileModal
 * Allows users to edit their profile details and upload a profile picture.
 * 
 * @param {boolean} isOpen - Whether the modal is open
 * @param {function} onClose - Function to close the modal
 * @param {object} user - Current user object
 * @param {function} onUpdate - Function to handle the update API call (returns a Promise)
 */
const EditProfileModal = ({ isOpen, onClose, user, onUpdate }) => {
    // --- OTP STATE ---
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpError, setOtpError] = useState("");
    const [otpMessage, setOtpMessage] = useState("");

    // --- FORM STATE ---
    const [formData, setFormData] = useState({});
    const [previewImage, setPreviewImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Helper to format date as YYYY-MM-DD
    const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        // Check if date is valid
        if (isNaN(date.getTime())) return "";
        return date.toISOString().split('T')[0];
    };

    // Initialize form with user data when modal opens
    useEffect(() => {
        if (user && isOpen) {
            setFormData({
                full_name: user.full_name || "",
                email: user.email || "",
                mobile: user.mobile || "",
                dob: formatDateForInput(user.date_of_birth), // Format date for input
                gender: user.gender || "",
                address: user.address || "",
                blood_group: user.blood_group || "",
                weight: user.weight || "",
                height: user.height || ""
            });
            setPreviewImage(resolveBackendAssetUrl(user.profile_picture) || null);
            setImageFile(null);
            setError("");
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError("Image size too large (max 5MB)");
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSendOtp = async () => {
        setOtpLoading(true);
        setOtpError("");
        try {
            const response = await fetch('/api/v1/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ purpose: 'update_profile' }),
                credentials: 'include'
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            setOtpMessage(data.message); // "Verification code sent to..."
        } catch (err) {
            setOtpError(err.message);
        } finally {
            setOtpLoading(false);
        }
    };

    // Helper to execute the update
    const executeProfileUpdate = async () => {
        setLoading(true);
        setError("");

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key]) data.append(key, formData[key]);
            });
            if (imageFile) data.append("profile_picture", imageFile);

            await onUpdate(data);
            onClose();
        } catch (err) {
            console.error("Update Error:", err);
            // Check for Security Challenge
            if (err.message === "Security Verification Required" || (err.message && err.message.includes("Verification Required"))) {
                setShowOtpModal(true);
                handleSendOtp(); // Auto-send OTP when challenge received
            } else {
                setError(err.message || "Failed to update profile");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        setOtpLoading(true);
        setOtpError("");
        try {
            const response = await fetch('/api/v1/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ purpose: 'update_profile', otp }), // mobile/email inferred by backend from session
                credentials: 'include'
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            // Success! Close OTP modal and RETRY the profile update
            setShowOtpModal(false);
            setOtp("");
            await executeProfileUpdate(); // DIRECT CALL
        } catch (err) {
            setOtpError(err.message);
        } finally {
            setOtpLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        await executeProfileUpdate();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animation-fade-in">
            {/* Main Edit Modal */}
            <div className={`bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl transition-opacity ${showOtpModal ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-800">Edit Profile</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* ... Profile Picture ... */}
                    <div className="flex flex-col items-center justify-center mb-6">
                        <div className="relative group cursor-pointer">
                            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-100">
                                <img src={previewImage || "https://i.pravatar.cc/150?img=12"} alt="Profile" className="w-full h-full object-cover" />
                            </div>
                            <label htmlFor="profile-upload" className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition cursor-pointer">
                                <Camera size={16} />
                                <input type="file" id="profile-upload" accept="image/*" className="hidden" onChange={handleImageChange} />
                            </label>
                        </div>
                        <p className="text-sm text-gray-400 mt-2">Click icon to change</p>
                    </div>

                    {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">{error}</div>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Full Name" name="full_name" value={formData.full_name} onChange={handleChange} required />
                        <InputField label="Email" name="email" value={formData.email} onChange={handleChange} type="email" required />
                        <InputField label="Phone" name="mobile" value={formData.mobile} onChange={handleChange} />
                        <InputField label="Date of Birth" name="dob" value={formData.dob} onChange={handleChange} type="date" />

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Gender</label>
                            <select name="gender" value={formData.gender} onChange={handleChange} className="p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none">
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <InputField label="Blood Group" name="blood_group" value={formData.blood_group} onChange={handleChange} placeholder="e.g. O+" />
                        <div className="form-group md:col-span-2">
                            <InputField label="Address" name="address" value={formData.address} onChange={handleChange} />
                        </div>
                        <div className="grid grid-cols-2 gap-4 md:col-span-2">
                            <InputField label="Weight (kg)" name="weight" value={formData.weight} onChange={handleChange} placeholder="e.g. 70" />
                            <InputField label="Height (cm)" name="height" value={formData.height} onChange={handleChange} placeholder="e.g. 175" />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white p-4">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
                        <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-70 flex items-center gap-2">
                            {loading ? "Saving..." : <><Save size={18} /> Save Changes</>}
                        </button>
                    </div>
                </form>
            </div>

            {/* OTP Verification Modal Overlay */}
            {showOtpModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 animation-fade-in border border-blue-100">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Security Verification</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            You are updating sensitive information. Please enter the code sent to your <b>current</b> registered contact to verify it's you.
                        </p>

                        {otpMessage && <div className="mb-4 p-2 bg-blue-50 text-blue-700 text-xs rounded-lg">{otpMessage}</div>}
                        {otpError && <div className="mb-4 p-2 bg-red-50 text-red-600 text-xs rounded-lg">{otpError}</div>}

                        <div className="space-y-4">
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Enter 6-digit Code"
                                className="w-full p-3 text-center text-2xl tracking-widest font-bold border rounded-xl focus:ring-2 ring-blue-500 outline-none"
                                maxLength={6}
                            />
                            <button
                                onClick={handleVerifyOtp}
                                disabled={otpLoading || otp.length < 6}
                                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-all"
                            >
                                {otpLoading ? "Verifying..." : "Verify & Save"}
                            </button>
                            <button
                                onClick={() => setShowOtpModal(false)}
                                className="w-full py-2 text-gray-500 text-sm hover:text-gray-700"
                            >
                                Cancel
                            </button>
                            <div className="text-center">
                                <button onClick={handleSendOtp} className="text-xs text-blue-500 hover:underline">
                                    Resend Code
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const InputField = ({ label, name, value, onChange, type = "text", placeholder, required }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-700 placeholder:text-gray-400"
        />
    </div>
);

export default EditProfileModal;
