import React from "react";

function EHR({ detailPage, onViewDetails }) {
  // If you want sub-sections inside EHR in the future, use detailPage
  if (detailPage === "patientDetails") {
    return (
      <div>
        <button className="back-btn" onClick={() => onViewDetails(null)}>
          ← Back
        </button>
        <h3>Patient Details</h3>
        <p>Name: John Doe</p>
        <p>Age: 30</p>
        <p>Medical History: None</p>
      </div>
    );
  }

  // Main EHR content
  return (
    <div className="doctor-content">
      <h2>Electronic Health Records</h2>
      <p>View, manage, and update patient records securely.</p>

      {/* Example of clicking a patient to see details */}
      <button onClick={() => onViewDetails("patientDetails")}>
        View Patient Details
      </button>
    </div>
  );
}

export default EHR;
