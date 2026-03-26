// src/pages/Dashboard/PharmacyScreen.jsx
import React from "react";

function PharmacyScreen({ t }) {
  return (
    <div className="pharmacy-screen">
      <h2>{t.pharmacy}</h2>
      <ul>
        <li>Paracetamol – {t.available}</li>
        <li>Ibuprofen – {t.outOfStock}</li>
        <li>Cough Syrup – {t.available}</li>
      </ul>
    </div>
  );
}

export default PharmacyScreen;
