// src/pages/Dashboard/Consultation/PostCallScreen.jsx
import React from "react";
import { CheckCircleIcon } from "../../../components/icons/VideoIcons";

function PostCallScreen({ onCheckAvailability, onDone, t }) {
  return (
    <div className="consult-flow-container">
      <div className="post-call-card">
        <div className="success-icon">
          <CheckCircleIcon />
        </div>
        <h2>{t.callEnded}</h2>
        <p>{t.prescriptionSaved}</p>

        <div className="medicines-list">
          <h4>{t.suggestedMedicines}</h4>
          <ul>
            <li>Paracetamol 500mg</li>
            <li>Cough Syrup</li>
            <li>Vitamin C Tablets</li>
          </ul>
        </div>

        <button
          className="btn btn-primary"
          onClick={onCheckAvailability}
          style={{ marginBottom: "1rem" }}
        >
          {t.checkAvailability}
        </button>
        <button className="btn btn-secondary" onClick={onDone}>
          {t.done}
        </button>
      </div>
    </div>
  );
}

export default PostCallScreen;
