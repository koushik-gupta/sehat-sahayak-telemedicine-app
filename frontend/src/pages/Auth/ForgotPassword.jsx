import React, { useState, useEffect } from "react";
import AuthLayout from "../../components/AuthLayout";

function ForgotPassword({ t, onBackToLogin }) {
  const [role, setRole] = useState("patient");
  const [method, setMethod] = useState("email");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState("verify"); // verify -> reset -> success
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [otpSent, setOtpSent] = useState(false); // NEW STATE

  // Loading states
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (role !== "patient") {
      setMethod("email");
    }
  }, [role]);

  const handleSendOtp = async () => {
    setError("");
    setSuccessMessage("");
    setOtpSent(false); // Reset on new attempt if needed, or keep logic simple
    setIsSendingOtp(true);

    const identifier = method === 'email' ? email : mobile;
    if (!identifier) {
      setError(`Please provide your ${method}.`);
      setIsSendingOtp(false);
      return;
    }

    try {
      const response = await fetch('/api/v1/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [method]: identifier })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send OTP.');

      setSuccessMessage("Code sent! Check backend terminal.");
      setOtpSent(true); // Show OTP input
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    setSuccessMessage("");
    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }
    setIsVerifying(true);

    try {
      const response = await fetch('/api/v1/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp, ...(method === 'email' ? { email } : { mobile }) })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'OTP verification failed.');

      setStep("reset");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResetPassword = async () => {
    setError("");
    if (!newPassword || newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsResetting(true);
    try {
      const response = await fetch('/api/v1/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword, ...(method === 'email' ? { email } : { mobile }) })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Password reset failed.');

      setStep("success");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <AuthLayout
      title={step === "reset" ? "Reset Password" : (t.forgotPassword || "Forgot Password")}
      subtitle={step === "reset" ? "Enter your new password" : "Recover your account access"}
      onBack={onBackToLogin}
    >
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Status Messages */}
        {successMessage && <div className="p-3 bg-emerald-50 text-emerald-600 text-sm rounded-lg font-bold text-center">{successMessage}</div>}
        {error && <div className="p-3 bg-rose-50 text-rose-600 text-sm rounded-lg font-bold text-center">{error}</div>}

        {step === "verify" && (
          <>
            {/* Role Tabs */}
            <div className="bg-slate-100 p-1.5 rounded-2xl flex">
              {["patient", "doctor", "pharmacy", "admin"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all capitalize ${role === r
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* Method Toggle (Patient) */}
            {role === "patient" && (
              <div className="flex gap-4 px-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-600">
                  <input type="radio" checked={method === "email"} onChange={() => setMethod("email")} className="w-4 h-4 text-blue-600" />
                  Email
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-600">
                  <input type="radio" checked={method === "mobile"} onChange={() => setMethod("mobile")} className="w-4 h-4 text-blue-600" />
                  Mobile
                </label>
              </div>
            )}

            {/* Input Fields */}
            <div className="space-y-4">
              {method === "email" ? (
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">{t.email || "Email Address"}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700">{t.mobileNumber || "Mobile Number"}</label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isSendingOtp}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                {isSendingOtp ? 'Sending...' : (otpSent ? "Resend Verification Code" : (t.sendOtp || "Send Verification Code"))}
              </button>

              {otpSent && (
                <div className="animate-in slide-in-from-top-2 fade-in duration-500 space-y-4">
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400">Verify OTP</span></div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-bold text-slate-700">{t.enterOtp || "Verification Code"}</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit code"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-center font-mono text-lg tracking-widest transition-all"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={isVerifying}
                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  >
                    {isVerifying ? 'Verifying...' : (t.verify || "Verify & Proceed")}
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {step === "reset" && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700">{t.newPassword || "New Password"}</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700">{t.confirmPassword || "Confirm Password"}</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <button
              type="button"
              onClick={handleResetPassword}
              disabled={isResetting}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              {isResetting ? 'Resetting...' : (t.resetPassword || "Reset Password")}
            </button>
          </div>
        )}

        {step === "success" && (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800">Password Reset!</h3>
            <p className="text-slate-500">{t.passwordResetSuccess || "Your password has been successfully updated."}</p>
            <button
              type="button"
              onClick={onBackToLogin}
              className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors mt-4"
            >
              {t.login || "Back to Login"}
            </button>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}

export default ForgotPassword;