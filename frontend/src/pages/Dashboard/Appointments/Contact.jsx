import React, { useState } from "react";
import { Building2, Mail, MapPin, MessageSquareText, Phone, Send } from "lucide-react";
import { getGlassCardClass, useDashboardTheme } from "../DashboardThemeContext";

function Contact() {
  const { isDark } = useDashboardTheme();
  const glassCardClass = getGlassCardClass(isDark);
  const [sent, setSent] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSent(true);
    window.setTimeout(() => setSent(false), 2500);
    event.currentTarget.reset();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <section className={`rounded-[32px] p-6 ${glassCardClass}`}>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Support</p>
        <h1 className={`mt-2 text-3xl font-bold ${isDark ? "text-slate-50" : "text-slate-900"}`}>Need help with appointments?</h1>
        <p className={`mt-3 text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>
          Reach the SehatSahayak support team for booking help, account issues, or consultation guidance.
        </p>

        <div className="mt-6 space-y-4">
          <ContactCard icon={<Mail size={18} className="text-blue-600" />} label="Email" value="support@sehatnabha.in" />
          <ContactCard icon={<Phone size={18} className="text-emerald-600" />} label="Phone" value="+91 98765 43210" />
          <ContactCard icon={<MapPin size={18} className="text-rose-600" />} label="Address" value="Sehat Nabha Clinic, Nabha, Punjab, India" />
          <ContactCard icon={<Building2 size={18} className="text-indigo-600" />} label="Hours" value="Mon to Sat, 9:00 AM to 6:00 PM" />
        </div>
      </section>

      <section className={`rounded-[32px] p-6 ${glassCardClass}`}>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Message support</p>
        <h2 className={`mt-2 text-2xl font-bold ${isDark ? "text-slate-50" : "text-slate-900"}`}>Send a quick request</h2>
        <p className={`mt-3 text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>
          This form is currently a lightweight front-end helper so patients can draft their issue inside the appointments tab.
        </p>

        {sent && (
          <div className={`mt-5 rounded-2xl border px-4 py-3 text-sm font-semibold ${isDark ? "border-emerald-400/20 bg-emerald-400/12 text-emerald-100" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
            Your message draft was recorded locally. You can also contact support directly using the details on the left.
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <Field label="Your Name">
            <input
              type="text"
              required
              placeholder="Enter your full name"
              className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all ${
                isDark
                  ? "border-white/10 bg-slate-950/55 text-slate-100 placeholder:text-slate-500 focus:border-blue-400/30 focus:bg-slate-950/70 focus:ring-4 focus:ring-blue-500/10"
                  : "border-slate-200 bg-slate-50 text-slate-700 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
              }`}
            />
          </Field>

          <Field label="Email Address">
            <input
              type="email"
              required
              placeholder="Enter your email"
              className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all ${
                isDark
                  ? "border-white/10 bg-slate-950/55 text-slate-100 placeholder:text-slate-500 focus:border-blue-400/30 focus:bg-slate-950/70 focus:ring-4 focus:ring-blue-500/10"
                  : "border-slate-200 bg-slate-50 text-slate-700 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
              }`}
            />
          </Field>

          <Field label="Message">
            <textarea
              rows="6"
              required
              placeholder="Tell us what you need help with."
              className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-all ${
                isDark
                  ? "border-white/10 bg-slate-950/55 text-slate-100 placeholder:text-slate-500 focus:border-blue-400/30 focus:bg-slate-950/70 focus:ring-4 focus:ring-blue-500/10"
                  : "border-slate-200 bg-slate-50 text-slate-700 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
              }`}
            />
          </Field>

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-colors hover:bg-blue-700"
          >
            <Send size={16} />
            Send message
          </button>
        </form>
      </section>
    </div>
  );
}

function ContactCard({ icon, label, value }) {
  const { isDark } = useDashboardTheme();

  return (
    <div className={`flex items-start gap-4 rounded-[24px] p-4 ${isDark ? "bg-white/8" : "bg-slate-50"}`}>
      <div className={`rounded-2xl p-3 shadow-sm ${isDark ? "bg-slate-900/70" : "bg-white"}`}>{icon}</div>
      <div>
        <p className={`text-xs font-bold uppercase tracking-[0.2em] ${isDark ? "text-slate-400" : "text-slate-400"}`}>{label}</p>
        <p className={`mt-2 text-sm font-semibold ${isDark ? "text-slate-100" : "text-slate-800"}`}>{value}</p>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  const { isDark } = useDashboardTheme();

  return (
    <label className="block">
      <span className={`mb-2 inline-flex items-center gap-2 text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>
        <MessageSquareText size={16} className={isDark ? "text-slate-500" : "text-slate-400"} />
        {label}
      </span>
      {children}
    </label>
  );
}

export default Contact;
