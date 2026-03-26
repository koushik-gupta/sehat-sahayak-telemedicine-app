// frontend/src/pages/Auth/Login.jsx

import React, { useState, useEffect } from "react";
import AuthLayout from "../../components/AuthLayout";

function Login({ t, onLogin, onSwitchToRegister, onForgotPassword, onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [loginMethod, setLoginMethod] = useState("email");
  const [role, setRole] = useState("patient");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (role !== "patient") {
      setLoginMethod("email");
    }
  }, [role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const loginData = {
      role: role,
      password: password,
      ...(loginMethod === "email" || role !== 'patient' ? { email } : { mobile }),
    };

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
        credentials: 'include',
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'An unknown error occurred.');
      }

      // Login successful
      onLogin(responseData.user);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title={t.login || "Welcome Back"}
      subtitle={t.loginPrompt || "Sign in to access your dashboard"}
      onBack={onBack}
    >
      <div className="space-y-6">
        {/* Role Selection Tabs */}
        <div className="bg-slate-100 p-1.5 rounded-2xl grid grid-cols-2 sm:flex gap-1 sm:gap-0 relative">
          {["patient", "doctor", "pharmacy", "admin"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all capitalize ${role === r
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Method Toggle (Patient Only) */}
        {role === "patient" && (
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-600">
              <input
                type="radio"
                name="method"
                checked={loginMethod === "email"}
                onChange={() => setLoginMethod("email")}
                className="w-4 h-4 text-blue-600"
              />
              Email
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-600">
              <input
                type="radio"
                name="method"
                checked={loginMethod === "mobile"}
                onChange={() => setLoginMethod("mobile")}
                className="w-4 h-4 text-blue-600"
              />
              Mobile
            </label>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {loginMethod === "email" || role !== 'patient' ? (
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700">{t.emailAddress || "Email Address"}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                required
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
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>
          )}

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-700">{t.password || "Password"}</label>
              <button type="button" onClick={onForgotPassword} className="text-xs font-semibold text-blue-600 hover:underline">
                {t.forgotPassword || "Forgot?"}
              </button>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm uppercase tracking-wide disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Authenticating...' : (t.logIn || "Secure Login")}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-slate-500 text-sm">
            New to SehatSahayak? {' '}
            <button onClick={onSwitchToRegister} className="text-blue-600 font-bold hover:underline">
              Create an account
            </button>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}

export default Login;
