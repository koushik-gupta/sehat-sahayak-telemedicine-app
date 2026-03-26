// frontend/src/pages/Auth/PendingApproval.jsx

import React from "react";

function PendingApproval({ user, onLogout }) {
  // This component displays a waiting message to users whose status is 'pending_admin_approval'.
  return (
    <div className="auth-container" style={{ justifyContent: 'center' }}>
      <div className="auth-card">
        <h2 style={{ marginBottom: '1rem' }}>Application Submitted</h2>
        <p style={{ textAlign: 'left', lineHeight: '1.6' }}>
          Thank you, {user.full_name || user.name}. Your details and documents have been successfully submitted for review.
        </p>
        <p style={{ textAlign: 'left', marginTop: '1rem', fontWeight: '600' }}>
          Current Status: <span style={{ color: '#F59E0B' }}>Pending Admin Approval</span>
        </p>
        <p style={{ textAlign: 'left', marginTop: '1.5rem', fontSize: '0.9rem' }}>
          You will receive an email notification once your account has been reviewed by our administration team. You may now log out.
        </p>

        <footer style={{ marginTop: "2rem", textAlign: 'center' }}>
          <button className="btn btn-secondary" onClick={onLogout}>Logout</button>
        </footer>
      </div>
    </div>
  );
}

export default PendingApproval;