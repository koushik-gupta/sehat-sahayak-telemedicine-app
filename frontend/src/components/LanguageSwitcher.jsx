import React from 'react';
import { Globe } from 'lucide-react';
import { LANGUAGE_OPTIONS, getUiCopy } from '../i18n/uiCopy';

function LanguageSwitcher({ language = 'en', onChange, compact = false, className = '', themeVariant = 'light' }) {
  const ui = getUiCopy(language);
  const isDark = themeVariant === 'dark';

  return (
    <label
      className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium shadow-sm backdrop-blur ${
        isDark
          ? 'border-white/10 bg-white/8 text-slate-200'
          : 'border-slate-200 bg-white/90 text-slate-700'
      } ${className}`}
    >
      <Globe size={16} className={isDark ? 'text-slate-400' : 'text-slate-400'} />
      {!compact && <span className="hidden sm:inline">{ui.common.language}</span>}
      <select
        value={language}
        onChange={(event) => onChange?.(event.target.value)}
        className={`min-w-[92px] bg-transparent outline-none ${isDark ? 'text-slate-100' : 'text-slate-700'}`}
        aria-label={ui.common.selectLanguage}
      >
        {LANGUAGE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.nativeLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

export default LanguageSwitcher;
