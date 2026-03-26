import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import './index.css';
import { LanguageProvider } from "./context/LanguageContext";
import { BrowserRouter } from "react-router-dom";
import { installFetchBaseUrl } from "./utils/runtime";

installFetchBaseUrl();

ReactDOM.createRoot(document.getElementById("root")).render(
  //<React.StrictMode>
    <LanguageProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </LanguageProvider>
  //</React.StrictMode>
);
