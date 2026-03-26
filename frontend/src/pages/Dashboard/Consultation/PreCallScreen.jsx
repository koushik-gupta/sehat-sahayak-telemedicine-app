// src/pages/Dashboard/Consultation/PreCallScreen.jsx

import React from 'react';
import { ChevronLeft, Video, ShieldCheck, Wifi, Volume2, Mic } from 'lucide-react';

const PreCallScreen = ({ appointment, onStartCall, onBack, t }) => {
  // Loading state
  if (!appointment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p>Loading appointment details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 animation-fade-in">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium"
      >
        <ChevronLeft size={20} /> Back to Consultations
      </button>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        {/* Doctor Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

          <div className="relative relative-z-10 -mt-12 mb-4">
            <div className="w-32 h-32 mx-auto rounded-full border-4 border-white shadow-lg bg-slate-100 overflow-hidden">
              <img
                src="/images/doc1.png"
                alt={appointment.doctor_name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = "https://i.pravatar.cc/150?u=doc_placeholder" }}
              />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-1">Dr. {appointment.doctor_name}</h2>
          <p className="text-blue-600 font-medium mb-6">General Physician</p>

          <div className="flex justify-center gap-4 mb-8">
            <div className="text-center">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-1">
                <ShieldCheck size={18} />
              </div>
              <span className="text-xs text-slate-500 font-semibold">Verified</span>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-1">
                <Video size={18} />
              </div>
              <span className="text-xs text-slate-500 font-semibold">HD Video</span>
            </div>
          </div>

          <button
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 text-lg"
            onClick={onStartCall}
          >
            <Video size={24} />
            {t.startVideoCall || "Start Video Call"}
          </button>
          <p className="text-xs text-slate-400 mt-4">By starting, you agree to our telemedicine consent policy.</p>
        </div>

        {/* Instructions */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-slate-800">Ready for your call?</h3>
          <p className="text-slate-500 text-lg">Please follow these quick checks to ensure a smooth consultation experience with your doctor.</p>

          <div className="space-y-4">
            <CheckItem
              icon={<Wifi size={20} />}
              title="Stable Internet"
              desc="Ensure you have a good Wi-Fi or 4G connection."
            />
            <CheckItem
              icon={<Mic size={20} />}
              title="Microphone Access"
              desc="Allow browser permissions for your microphone."
            />
            <CheckItem
              icon={<Volume2 size={20} />}
              title="Quiet Environment"
              desc="Find a quiet place with good lighting."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckItem = ({ icon, title, desc }) => (
  <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
      {icon}
    </div>
    <div>
      <h4 className="font-bold text-slate-800">{title}</h4>
      <p className="text-sm text-slate-500 mt-0.5">{desc}</p>
    </div>
  </div>
);

export default PreCallScreen;