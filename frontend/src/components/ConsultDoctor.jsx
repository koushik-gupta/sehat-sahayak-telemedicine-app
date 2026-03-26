import React, { useState, useEffect } from "react";
import BackButton from "../components/BackButton";

function ConsultDoctor({ t, onBack }) {
  // --- NEW: State for managing data, loading, and errors ---
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [step, setStep] = useState("list");
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // --- NEW: useEffect to fetch doctors from the API when the component loads ---
  useEffect(() => {
    const fetchDoctors = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/v1/doctor/list');
        if (!response.ok) {
          throw new Error('Failed to fetch the list of doctors.');
        }
        const data = await response.json();
        setDoctors(data); // Store the fetched doctors in our state
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctors();
  }, []); // The empty array [] ensures this runs only once

  // --- NEW: Render loading and error states for a better user experience ---
  if (isLoading) {
    return <div className="consult-flow-container"><p>Loading available doctors...</p></div>;
  }

  if (error) {
    return <div className="consult-flow-container"><p style={{ color: 'red' }}>Error: {error}</p></div>;
  }

  return (
    <div className="consult-doctor-page" style={{ position: "relative", paddingTop: "50px" }}>
      <BackButton onClick={onBack} />

      {step === "list" && (
        <div className="consult-flow-container">
          <h1 className="text-xl font-bold">{t.consultDoctor}</h1>

          {doctors.length === 0 ? (
            <p>No doctors are currently available. Please check back later.</p>
          ) : (
            <div className="doctor-grid">
              {/* This now maps over the DYNAMIC list of doctors from the state */}
              {doctors.map((doc) => (
                <div
                  key={doc.id}
                  className="doctor-profile-card"
                  onClick={() => {
                    setSelectedDoctor(doc);
                    setStep("details");
                  }}
                >
                  <img src={doc.pic} alt={doc.name} className="doctor-pic" />
                  <h3 className="doctor-name">{doc.name}</h3>
                  <p className="doctor-specialty">{doc.specialty}</p>
                  <div className="doctor-info">
                    <div className="info-item">
                      <strong>{doc.experience || 'N/A'}</strong>
                      <span>{t.experience}</span>
                    </div>
                    <div className="info-item">
                      <strong>{doc.rating || '4.5'}</strong>
                      <span>{t.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* The rest of the component for details, call, and post-call remains the same */}
      {step === "details" && selectedDoctor && (
        <div className="doctor-profile-card">
          <img src={selectedDoctor.pic} alt={selectedDoctor.name} className="doctor-pic" />
          <h3 className="doctor-name">{selectedDoctor.name}</h3>
          <p className="doctor-specialty">{selectedDoctor.specialty}</p>
          <p className="languages-spoken">{t.languagesSpoken}: {selectedDoctor.languages || 'English, Hindi'}</p>
          
          <button className="btn btn-primary" onClick={() => setStep("call")}>
            {t.startVideoCall}
          </button>
          <button className="btn btn-secondary" onClick={() => setStep("list")}>
            {t.backToDashboard}
          </button>
        </div>
      )}

      {step === "call" && (
        <div className="in-call-screen">
            {/* You would render your actual VideoComponent here */}
            <p>Video Call in Progress...</p>
            <button className="control-btn end-call" onClick={() => setStep("postcall")}>
                {t.endCall}
            </button>
        </div>
      )}

      {step === "postcall" && (
        <div className="post-call-card">
          <div className="success-icon">✅</div>
          <h2>{t.consultationComplete}</h2>
          <p>{t.prescriptionSent}</p>
          <button className="btn btn-primary" onClick={() => setStep("list")}>
            {t.backToDoctors}
          </button>
        </div>
      )}
    </div>
  );
}

export default ConsultDoctor;