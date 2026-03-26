import React from "react";

function ConsultationTools({ detailPage }) {
  // Example tools data (optional detail view)
  const tools = {
    video: "Video Call Tool: Start/Join meetings securely.",
    chat: "Chat Tool: Send messages to patients in real-time.",
    files: "File Sharing: Share medical reports and prescriptions.",
  };

  if (detailPage && tools[detailPage]) {
    return (
      <div>
        <h3>{detailPage.charAt(0).toUpperCase() + detailPage.slice(1)} Tool</h3>
        <p>{tools[detailPage]}</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Consultation Tools</h2>
      <p>
        <span style={{ cursor: "pointer" }} onClick={() => detailPage && detailPage("video")}>
          Video Call
        </span>{" "}
        |{" "}
        <span style={{ cursor: "pointer" }} onClick={() => detailPage && detailPage("chat")}>
          Chat
        </span>{" "}
        |{" "}
        <span style={{ cursor: "pointer" }} onClick={() => detailPage && detailPage("files")}>
          File Sharing
        </span>
      </p>
    </div>
  );
}

export default ConsultationTools;
