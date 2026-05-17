// frontend/src/App.jsx

import React, { useState, useEffect } from "react";
import { translations } from "./translations";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import PendingApproval from "./pages/Auth/PendingApproval";
import Dashboard from "./pages/Dashboard/Dashboard";
import DoctorDashboard from "./pages/DoctorDashboard/DoctorDashboard";
import PharmacyDashboard from "./pages/PharmacyDashboard/PharmacyDashboard";
import DocumentUpload from "./pages/PharmacyDashboard/DocumentUpload";
import DoctorDocumentUpload from "./pages/DoctorDashboard/DoctorDocumentUpload";
import LandingPage from "./components/LandingPage"; // Import Landing Page

const LANGUAGE_STORAGE_KEY = "sehat-sahayak-language";

function App() {
  const [language, setLanguage] = useState(() => {
    if (typeof window === "undefined") {
      return "en";
    }

    return window.localStorage.getItem(LANGUAGE_STORAGE_KEY) || "en";
  });
  const [stage, setStage] = useState("landing");
  const [user, setUser] = useState(null);
  const t = translations[language];

  const handleLanguageChange = (nextLanguage) => {
    setLanguage(nextLanguage);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    }
  };

  // Define refreshUser BEFORE useEffect to avoid hoisting issues
  const refreshUser = async () => {
    try {
      const response = await fetch('/api/v1/auth/check-session', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
          setStage("dashboard");
        }
      }
    } catch (error) {
      console.error("Session check failed:", error);
    }
  };

  // Restore session on mount
  useEffect(() => {
    refreshUser();
  }, []);

  const handleAuthSuccess = (userFromBackend) => {
    if (!userFromBackend) {
      console.error("Auth success called without a user object.");
      return;
    }
    setUser(userFromBackend);
    setStage("dashboard");
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      setUser(null);
      setStage("landing"); // Return to landing page on logout
    }
  };

  const handleDocumentSubmission = () => {
    setUser(prevUser => ({ ...prevUser, status: "pending_admin_approval" }));
  };

  return (
    <>
      {/* Landing Page is now the main entry point */}
      {stage === "landing" && (
        <LandingPage
          t={t}
          language={language}
          onLanguageChange={handleLanguageChange}
          onLoginClick={() => setStage("login")}
          onRegisterClick={() => setStage("register")}
        />
      )}

      {stage === "login" && (
        <Login
          t={t}
          language={language}
          onLanguageChange={handleLanguageChange}
          onLogin={handleAuthSuccess}
          onSwitchToRegister={() => setStage("register")}
          onForgotPassword={() => setStage("forgot")}
          onBack={() => setStage("landing")} // Allow backing out to landing
        />
      )}

      {stage === "register" && (
        <Register
          t={t}
          language={language}
          onLanguageChange={handleLanguageChange}
          onRegister={handleAuthSuccess}
          onSwitchToLogin={() => setStage("login")}
          onBack={() => setStage("landing")} // Allow backing out to landing
        />
      )}

      {stage === "forgot" && (
        <ForgotPassword
          t={t}
          language={language}
          onLanguageChange={handleLanguageChange}
          onBackToLogin={() => setStage("login")}
        />
      )}

      {stage === "dashboard" && user && (
        <>
          {user.role === "pharmacy" && (
            (user.status === 'active' || user.status === 'approved') ? <PharmacyDashboard onLogout={handleLogout} t={t} user={user} />
              : user.status === 'pending_admin_approval' ? <PendingApproval user={user} onLogout={handleLogout} />
                : <DocumentUpload user={user} onLogout={handleLogout} onUploadComplete={handleDocumentSubmission} />
          )}
          {user.role === "doctor" && (
            (user.status === 'active' || user.status === 'approved') ? (
              <DoctorDashboard
                user={user}
                onLogout={handleLogout}
                t={t}
                language={language}
                onLanguageChange={handleLanguageChange}
                refreshUser={refreshUser}
              />
            )
              : user.status === 'pending_admin_approval' ? <PendingApproval user={user} onLogout={handleLogout} />
                : <DoctorDocumentUpload user={user} onLogout={handleLogout} onUploadComplete={handleDocumentSubmission} />
          )}
          {user.role === "admin" && (user.status === 'active' || user.status === 'approved') && <AdminDashboard onLogout={handleLogout} t={t} />}

          {/* --- THIS IS THE CRITICAL FIX --- */}
          {user.role === "patient" && user.status === 'active' && (
            <Dashboard
              user={user} // The user object is now correctly passed down
              onLogout={handleLogout}
              t={t}
              userName={user.full_name || "Guest"}
              language={language}
              onLanguageChange={handleLanguageChange}
              refreshUser={refreshUser}
            />
          )}
        </>
      )}
    </>
  );
}

export default App;
