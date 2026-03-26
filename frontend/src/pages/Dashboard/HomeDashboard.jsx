// src/pages/Dashboard/HomeDashboard.jsx
import React from "react";

function HomeDashboard({ userName, t }) {
  return (
    <div className="home-dashboard">
      <h2>
        {t.greeting} {userName}
      </h2>
      <p>{t.consultDoctor}</p>
    </div>
  );
}

export default HomeDashboard;
