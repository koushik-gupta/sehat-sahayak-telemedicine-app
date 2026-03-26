// frontend/src/pages/DoctorDashboard/DoctorDocumentUpload.jsx

import React, { useState } from "react";

function DoctorDocumentUpload({ user, onUploadComplete, onLogout }) {
  const [qualification, setQualification] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [certificateFile, setCertificateFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCertificateFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!qualification || !specialization || !certificateFile) {
      setError("Please fill in all fields and upload your certificate.");
      return;
    }

    setError("");
    setUploading(true);

    // FormData is required for sending files along with text data
    const formData = new FormData();
    formData.append('qualification', qualification);
    formData.append('specialization', specialization);
    formData.append('document', certificateFile); // 'document' is the key the backend expects

    try {
      // --- REMOVED: All localStorage and token handling is gone. ---

      const response = await fetch('/api/v1/user/upload-documents', {
        method: 'POST',
        // --- CRITICAL CHANGE for Session-Based Auth ---
        // This tells the browser to automatically include the secure session cookie.
        // The Authorization header is no longer needed.
        credentials: 'include',
        body: formData,
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.error || "File upload failed.");
      }

      // Document upload successful

      // Notify App.jsx that the process is complete.
      onUploadComplete();

    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="auth-container" style={{ justifyContent: 'center' }}>
      <div className="auth-card">
        <h2>Doctor Verification Required</h2>
        <p style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
          Welcome, Dr. {user.full_name || user.name || "Doctor"}. To activate your account, please provide your credentials for review by our administrative team.
        </p>

        <div className="form-group">
          <label htmlFor="qualification">Qualifications</label>
          <input
            type="text"
            id="qualification"
            value={qualification}
            onChange={(e) => setQualification(e.target.value)}
            placeholder="e.g., MBBS, MD, FRCS"
          />
        </div>

        <div className="form-group">
          <label htmlFor="specialization">Specialization</label>
          <select
            id="specialization"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className="form-select"
          >
            <option value="" disabled>Select your specialty</option>
            <option value="dermatologist">Dermatologist</option>
            <option value="gynecologist">Gynecologist</option>
            <option value="nephrologist">Nephrologist</option>
            <option value="cardiologist">Cardiologist</option>
            <option value="pediatrician">Pediatrician</option>
            <option value="orthopedist">Orthopedist</option>
            <option value="general_physician">General Physician</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="certificateUpload">Upload Practice Certificate/License</label>
          <input type="file" id="certificateUpload" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
        </div>

        {error && <p className="error-message">{error}</p>}

        <button onClick={handleSubmit} disabled={uploading} className="btn btn-primary" style={{ marginTop: "1rem" }}>
          {uploading ? "Submitting..." : "Submit for Verification"}
        </button>

        <footer style={{ marginTop: "2rem", textAlign: 'center' }}>
          <button className="link-button" onClick={onLogout}>Logout</button>
        </footer>
      </div>
    </div>
  );
}

export default DoctorDocumentUpload;
