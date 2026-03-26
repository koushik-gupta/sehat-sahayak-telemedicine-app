// src/pages/Dashboard/DoctorDashboard.jsx
import React from "react";

function DoctorDashboard({ t }) {
  return (
    <div className="doctor-dashboard">
      <h2>{t.doctorDashboardTitle}</h2>
      <p>{t.doctorDashboardPrompt}</p>

      <div className="feature-grid">
        <div className="feature-card">
          <h3>{t.todayAppointments}</h3>
          <p>{t.todayAppointmentsDesc}</p>
          <button className="btn btn-primary">{t.viewSchedule}</button>
        </div>
        <div className="feature-card">
          <h3>{t.patientRecords}</h3>
          <p>{t.patientRecordsDesc}</p>
          <button className="btn btn-primary">{t.accessRecords}</button>
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboard;
