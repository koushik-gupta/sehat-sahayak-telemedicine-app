// src/components/TopBanner.jsx
import React from "react";

function TopBanner({ userName, t }) {
  return (
    <div className="top-banner">
      <div className="top-banner-content">
        <h1 className="app-title">SwasthyaSetu</h1>
        <p className="welcome-text">
          {t.greeting} {userName}
        </p>
      </div>
    </div>
  );
}

export default TopBanner;
