import React from "react";
import { HomeIcon, ProfileIcon } from "./icons";

function BottomNav({ activeTab, setActiveTab, t }) {
  const tabs = [
    { id: "home", label: t.home, Icon: HomeIcon },
    {
      id: "appointments",
      label: t.appointments,
      Icon: () => (
        <img
          src="/icons8-calendar-50.png"
          alt="Appointments"
          className="nav-icon"
          style={{ width: 24, height: 24 }}
        />
      ),
    },
    {
      id: "emergency",
      label: t.emergency,
      Icon: () => (
        <img
          src="/icons8-emergency-50.png"
          alt="Emergency"
          className="nav-icon"
          style={{ width: 24, height: 24 }}
        />
      ),
    },
    { id: "profile", label: t.profile, Icon: ProfileIcon },
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map(({ id, label, Icon }) => (
        <button
          key={id}
          className={`nav-item ${activeTab === id ? "active" : ""}`}
          onClick={() => setActiveTab(id)}
        >
          <Icon />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

export default BottomNav;
