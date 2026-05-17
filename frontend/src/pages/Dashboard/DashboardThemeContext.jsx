import { createContext, useContext } from "react";

export const DashboardThemeContext = createContext({ theme: "light", isDark: false });

export const useDashboardTheme = () => useContext(DashboardThemeContext);

export const pickTheme = (isDark, lightClass, darkClass) => (isDark ? darkClass : lightClass);

export const getGlassPanelClass = (isDark) =>
  isDark
    ? "border border-slate-700/80 bg-slate-900/78 backdrop-blur-2xl shadow-[0_30px_90px_-30px_rgba(2,6,23,0.9)]"
    : "border border-slate-300/95 bg-white/97 backdrop-blur-2xl shadow-[0_24px_80px_-28px_rgba(15,23,42,0.18)]";

export const getGlassCardClass = (isDark) =>
  isDark
    ? "border border-slate-700/75 bg-slate-900/72 backdrop-blur-2xl shadow-[0_24px_65px_-30px_rgba(2,6,23,0.82)]"
    : "border border-slate-300/95 bg-white/96 backdrop-blur-2xl shadow-[0_20px_60px_-28px_rgba(15,23,42,0.16)]";
