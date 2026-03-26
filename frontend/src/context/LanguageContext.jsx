import React, { createContext, useState } from "react";
import { translations } from "../translations";

// Create the context
export const LanguageContext = createContext();

// Provider component
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en"); // default English

  const t = translations[language]; // current translations

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
