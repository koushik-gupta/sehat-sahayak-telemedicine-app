// frontend/src/pages/PharmacyDashboard/DocumentUpload.jsx

import React, { useState } from "react";

function DocumentUpload({ user, onUploadComplete, onLogout }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async () => {
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setError("");
    setUploading(true);

    const formData = new FormData();
    formData.append('document', file); // 'document' is the key the backend expects

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
        <h2>Submit Documents for Verification</h2>
        <p style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
          Welcome, {user.full_name || user.name || "Partner"}. Your account is pending approval. Please upload the required documents (e.g., Pharmacy License, Registration Certificate) for review by our admin team.
        </p>

        <div className="form-group">
          <label htmlFor="documentUpload">Upload Pharmacy License</label>
          <input type="file" id="documentUpload" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
        </div>

        {error && <p className="error-message">{error}</p>}

        <button onClick={handleUploadSubmit} disabled={uploading} className="btn btn-primary" style={{ marginTop: "1rem" }}>
          {uploading ? "Submitting..." : "Submit for Review"}
        </button>

        <footer style={{ marginTop: "2rem", textAlign: 'center' }}>
          <button className="link-button" onClick={onLogout}>Logout</button>
        </footer>
      </div>
    </div>
  );
}

export default DocumentUpload;
