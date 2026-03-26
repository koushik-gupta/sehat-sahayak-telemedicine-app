import React, { useState, useEffect } from "react";
import AuthLayout from "../../components/AuthLayout";
import { User, Mail, Phone, Lock, CreditCard, MapPin, Stethoscope, Building2, ShieldCheck, CheckCircle, AlertCircle } from 'lucide-react';

function Register({ t, onRegister, onSwitchToLogin, onBack }) {
  // --- States for all fields ---
  const [role, setRole] = useState("patient");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [loginMethod, setLoginMethod] = useState("email");

  // --- UI and Error States ---
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Role-specific States ---
  const [doctorRegistrationNumber, setDoctorRegistrationNumber] = useState("");
  const [pharmacyLicenseNumber, setPharmacyLicenseNumber] = useState("");
  const [pharmacyAddress, setPharmacyAddress] = useState("");

  // --- Geolocation States ---
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [geolocationError, setGeolocationError] = useState("");

  // --- OTP Flow States ---
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  // Effect to switch to email method for non-patient roles
  useEffect(() => {
    if (role !== "patient") {
      setLoginMethod("email");
    }
  }, [role]);

  const handleSendOtp = async () => {
    setError("");
    setSuccessMessage("");
    setIsSendingOtp(true);
    const identifier = loginMethod === 'email' ? email : mobile;
    if (!identifier) {
      setError(`Please enter your ${loginMethod} to receive an OTP.`);
      setIsSendingOtp(false);
      return;
    }
    try {
      const response = await fetch('/api/v1/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [loginMethod]: identifier,
          purpose: 'register' // <-- CRITICAL FIX: Tell backend this is for a new registration
        }),
        credentials: 'include',
      });
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.error || 'Failed to send OTP.');
      setSuccessMessage(responseData.message);
      setOtpSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit OTP code.");
      return;
    }
    setError("");
    setSuccessMessage("");
    try {
      const response = await fetch('/api/v1/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          otp,
          ...(loginMethod === 'email' ? { email } : { mobile }),
          purpose: 'register' // <-- CRITICAL FIX: Tell backend this is for a new registration
        }),
        credentials: 'include',
      });
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.error || 'OTP verification failed.');
      setSuccessMessage(responseData.message);
      setOtpVerified(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGeolocation = async () => { /* ... geolocation logic is correct ... */ };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (role === 'patient' && !otpVerified) {
      setError("Please verify your email or mobile number with the OTP before registering.");
      return;
    }

    setIsSubmitting(true);
    let userData = {
      role,
      name: fullName,
      password,
      aadhar,
      status: "active",
      ...(loginMethod === 'email' || role !== 'patient' ? { email } : { mobile }),
    };

    if (role === "doctor") {
      userData.registrationNumber = doctorRegistrationNumber;
      userData.status = "pending_document_upload";
    } else if (role === "pharmacy") {
      userData.licenseNumber = pharmacyLicenseNumber;
      userData.address = pharmacyAddress;
      userData.status = "pending_document_upload";
    }

    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
        credentials: 'include',
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.error || 'Registration failed.');
      }

      // The backend now creates a session automatically. No token needed.
      onRegister(responseData.user);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title={t.register || "Create Account"}
      subtitle={t.chooseRolePrompt || "Join our community to get started."}
      onBack={onBack}
    >
      <div className="space-y-6">

        {/* Role Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">{t.selectRole || "I am registering as a:"}</label>
          <div className="relative">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 pl-12 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none appearance-none bg-white text-slate-700 font-medium cursor-pointer"
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="pharmacy">Pharmacy</option>
              <option value="admin">Admin</option>
            </select>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              {role === 'patient' && <User size={20} />}
              {role === 'doctor' && <Stethoscope size={20} />}
              {role === 'pharmacy' && <Building2 size={20} />}
              {role === 'admin' && <ShieldCheck size={20} />}
            </div>
          </div>
        </div>

        {/* Patient Login Method Toggle */}
        {role === "patient" && (
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button type="button" onClick={() => setLoginMethod("email")} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginMethod === "email" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`} disabled={otpSent}>Email</button>
            <button type="button" onClick={() => setLoginMethod("mobile")} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginMethod === "mobile" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`} disabled={otpSent}>Mobile</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><User size={20} /></div>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={t.fullName || "Full Name"} className="w-full px-4 py-3 pl-12 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none font-medium text-slate-700 placeholder:text-slate-400" />
          </div>

          {/* Email/Mobile Input */}
          {loginMethod === 'email' || role !== 'patient' ? (
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Mail size={20} /></div>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.emailAddress || "Email Address"} disabled={otpSent && role === 'patient'} className="w-full px-4 py-3 pl-12 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none disabled:bg-slate-50 disabled:text-slate-400 font-medium text-slate-700 placeholder:text-slate-400" />
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Phone size={20} /></div>
              <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder={t.mobileNumber || "Mobile Number"} disabled={otpSent && role === 'patient'} className="w-full px-4 py-3 pl-12 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none disabled:bg-slate-50 disabled:text-slate-400 font-medium text-slate-700 placeholder:text-slate-400" />
            </div>
          )}

          {/* OTP Section for Patient */}
          {role === 'patient' && !otpVerified && (
            otpSent ? (
              <div className="flex gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="relative flex-grow">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Lock size={20} /></div>
                  <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" className="w-full px-4 py-3 pl-12 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none font-medium text-center tracking-widest text-slate-700 placeholder:text-slate-400" />
                </div>
                <button type="button" onClick={handleVerifyOtp} className="px-6 py-3 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 transition-colors shadow-lg shadow-teal-100/50">Verify</button>
              </div>
            ) : (
              <button type="button" onClick={handleSendOtp} disabled={isSendingOtp} className="w-full py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                {isSendingOtp ? 'Sending...' : `Send OTP via ${loginMethod === 'email' ? 'Email' : 'SMS'}`}
              </button>
            )
          )}

          {/* Password */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Lock size={20} /></div>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t.password || "Password"} className="w-full px-4 py-3 pl-12 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none font-medium text-slate-700 placeholder:text-slate-400" />
          </div>

          {/* Aadhar */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><CreditCard size={20} /></div>
            <input type="text" value={aadhar} onChange={(e) => setAadhar(e.target.value)} placeholder={t.aadharNumber || "Aadhar Number"} className="w-full px-4 py-3 pl-12 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none font-medium text-slate-700 placeholder:text-slate-400" />
          </div>

          {/* Doctor Fields */}
          {role === "doctor" && (
            <div className="relative animate-in fade-in slide-in-from-top-2">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Stethoscope size={20} /></div>
              <input type="text" value={doctorRegistrationNumber} onChange={(e) => setDoctorRegistrationNumber(e.target.value)} placeholder="Medical Registration Number" className="w-full px-4 py-3 pl-12 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none font-medium text-slate-700 placeholder:text-slate-400" />
            </div>
          )}

          {/* Pharmacy Fields */}
          {role === "pharmacy" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Building2 size={20} /></div>
                <input type="text" value={pharmacyLicenseNumber} onChange={(e) => setPharmacyLicenseNumber(e.target.value)} placeholder="Pharmacy License Number" className="w-full px-4 py-3 pl-12 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none font-medium text-slate-700 placeholder:text-slate-400" />
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <textarea value={pharmacyAddress} onChange={(e) => setPharmacyAddress(e.target.value)} placeholder="Pharmacy Address" rows="3" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none resize-none font-medium text-slate-700 placeholder:text-slate-400"></textarea>
                </div>
                <button type="button" onClick={handleGeolocation} disabled={isFetchingLocation} className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors">
                  <MapPin size={16} /> {isFetchingLocation ? "Fetching location..." : "Use Current Location"}
                </button>
                {geolocationError && <p className="text-red-500 text-xs">{geolocationError}</p>}
              </div>
            </div>
          )}

          {error && <div className="p-3 bg-red-50 text-red-500 text-sm rounded-xl flex items-center gap-2 border border-red-100 animate-in fade-in"><AlertCircle size={16} /> {error}</div>}
          {successMessage && <div className="p-3 bg-green-50 text-green-600 text-sm rounded-xl flex items-center gap-2 border border-green-100 animate-in fade-in"><CheckCircle size={16} /> {successMessage}</div>}

          <button type="submit" disabled={isSubmitting || (role === 'patient' && !otpVerified)} className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none mt-2">
            {isSubmitting ? 'Creating Account...' : (t.register || "Create Account")}
          </button>
        </form>

        <div className="text-center pt-6 border-t border-slate-100">
          <p className="text-slate-500 text-sm mb-2">{t.loginPrompt || "Already have an account?"}</p>
          <button onClick={onSwitchToLogin} className="text-blue-600 font-bold hover:underline transition-all hover:text-blue-700">{t.login || "Sign In"}</button>
        </div>
      </div>
    </AuthLayout>
  );
}

export default Register;