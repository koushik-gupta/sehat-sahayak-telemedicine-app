// src/components/SplashScreen.jsx
import React, { useState, useEffect } from "react";
//import "../styles/splash.css"; // optional: you can also keep it in index.css

function SplashScreen({ onFinish }) {
  const [language, setLanguage] = useState("punjabi");

  const subtexts = {
    english: "Your Health, Your Language, Anytime.",
    bengali: "আপনার স্বাস্থ্য, আপনার ভাষা, যে কোন সময়।",
    punjabi: "ਤੁਹਾਡੀ ਸਿਹਤ, ਤੁਹਾਡੀ ਭਾਸ਼ਾ, ਕਿਸੇ ਵੀ ਸਮੇਂ।",
    hindi: "आपका स्वास्थ्य, आपकी भाषा, कभी भी।",
  };

  useEffect(() => {
    const languages = ["punjabi", "hindi", "bengali"];
    let currentIndex = 0;
    const intervalId = setInterval(() => {
      currentIndex = (currentIndex + 1) % languages.length;
      setLanguage(languages[currentIndex]);
    }, 2000);

    const timeout = setTimeout(() => {
      onFinish?.(); // move to next stage after 4s
    }, 4000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeout);
    };
  }, [onFinish]);


  return (
    <div className="splash-screen">
      <div className="splash-logo">
        <img
          src="/logo.png"
          alt="SwasthyaSetu Logo"
          className="splash-logo-image"
        />
        <div className="ripple"></div>
      </div>
      <div className="splash-subtext">
        <p>{subtexts.english}</p>
        <p className="regional-text">{subtexts[language]}</p>
      </div>
    </div>
  );
}

export default SplashScreen;
