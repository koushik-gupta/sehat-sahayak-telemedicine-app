import React from "react";

function BackButton({ onClick }) {
  return (
    <button className="back-button" onClick={onClick}>
      <span className="icon">←</span> Back
    </button>
  );
}

export default BackButton;
