// src/components/LanguageSelection.jsx
import React, { useState } from "react";
import { translations } from "../translations";

function LanguageSelection({ onLanguageSelect }) {
  const [selectedLang, setSelectedLang] = useState(null);
  const t = translations["en"]; // Always show selection screen in English

  const LanguageIcon = ({ code }) => {
    const icons = {
      pa: "ੳ",
      hi: "अ",
      en: "A",
      bn: "অ",
    };
    return <div className="language-script-icon">{icons[code] || ""}</div>;
  };

  const languages = [
    { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
    { code: "hi", name: "Hindi", native: "हिन्दी" },
    { code: "en", name: "English", native: "English" },
    { code: "bn", name: "Bengali", native: "বাংলা" },
  ];

  const handleContinue = () => {
    if (selectedLang) {
      onLanguageSelect(selectedLang);
    }
  };

  return (
    <div className="language-selection-screen">
      <div className="language-banner">
        <img src="/icons8-language-64.png" alt="Language Icon" />
      </div>

      <div className="language-content">
        <h2 className="language-selection-header">{t.chooseLanguage}</h2>
        <div className="language-grid">
          {languages.map((lang) => (
            <button
              key={lang.code}
              className={`language-card ${
                selectedLang === lang.code ? "active" : ""
              }`}
              onClick={() => setSelectedLang(lang.code)}
            >
              <LanguageIcon code={lang.code} />
              <span className="native-name">{lang.native}</span>
              <span className="english-name">{lang.name}</span>
            </button>
          ))}
        </div>
        <button
          className="btn btn-primary"
          onClick={handleContinue}
          disabled={!selectedLang}
        >
          {t.continue}
        </button>
      </div>
    </div>
  );
}

export default LanguageSelection;
