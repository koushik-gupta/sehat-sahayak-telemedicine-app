// frontend/src/App.jsx

import React, { useState, useEffect } from "react";
import { translations } from "./translations";
import SplashScreen from "./components/SplashScreen";
import LanguageSelection from "./components/LanguageSelection";
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

function App() {
  const [language, setLanguage] = useState("en");
  const [stage, setStage] = useState("landing");
  const [user, setUser] = useState(null);
  const t = translations[language];

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
      {stage === "splash" && <SplashScreen onFinish={() => setStage("language")} />}
      {stage === "language" && <LanguageSelection t={t} onLanguageSelect={(lang) => { setLanguage(lang); setStage("landing"); }} />}

      {/* Landing Page is now the main entry point */}
      {stage === "landing" && (
        <LandingPage
          t={t}
          onLoginClick={() => setStage("login")}
          onRegisterClick={() => setStage("register")}
        />
      )}

      {stage === "login" && (
        <Login
          t={t}
          onLogin={handleAuthSuccess}
          onSwitchToRegister={() => setStage("register")}
          onForgotPassword={() => setStage("forgot")}
          onBack={() => setStage("landing")} // Allow backing out to landing
        />
      )}

      {stage === "register" && (
        <Register
          t={t}
          onRegister={handleAuthSuccess}
          onSwitchToLogin={() => setStage("login")}
          onBack={() => setStage("landing")} // Allow backing out to landing
        />
      )}

      {stage === "forgot" && <ForgotPassword t={t} onBackToLogin={() => setStage("login")} />}

      {stage === "dashboard" && user && (
        <>
          {user.role === "pharmacy" && (
            (user.status === 'active' || user.status === 'approved') ? <PharmacyDashboard onLogout={handleLogout} t={t} user={user} />
              : user.status === 'pending_admin_approval' ? <PendingApproval user={user} onLogout={handleLogout} />
                : <DocumentUpload user={user} onLogout={handleLogout} onUploadComplete={handleDocumentSubmission} />
          )}
          {user.role === "doctor" && (
            (user.status === 'active' || user.status === 'approved') ? <DoctorDashboard user={user} onLogout={handleLogout} t={t} />
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
              refreshUser={refreshUser}
            />
          )}
        </>
      )}
    </>
  );
}

export default App;