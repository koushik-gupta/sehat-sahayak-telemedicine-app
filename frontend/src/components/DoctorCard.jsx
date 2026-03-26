// src/components/DoctorCard.jsx

import React from "react";
import { Star, MapPin } from "lucide-react";

const DoctorCard = ({ doctor }) => {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer h-full flex flex-col">
      <div className="relative mb-4">
        <div className="w-full h-48 bg-slate-100 rounded-xl overflow-hidden relative">
          <img
            src={doctor.image}
            alt={doctor.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => { e.target.src = "https://i.pravatar.cc/150?u=doc_placeholder" }}
          />
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-slate-800 flex items-center gap-1 shadow-sm">
            <Star size={12} className="text-yellow-400 fill-yellow-400" />
            4.9
          </div>
        </div>
      </div>

      <div className="flex-1">
        <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">{doctor.name}</h3>
        <p className="text-blue-600 font-medium text-sm mb-2">{doctor.specialty}</p>

        <div className="flex items-center gap-1 text-slate-400 text-xs mb-3">
          <MapPin size={12} />
          <span className="truncate">New York Medical Center</span>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-50 flex items-center justify-between mt-auto">
        <div>
          <p className="text-xs text-slate-400 font-medium">Consultation Fee</p>
          <p className="text-slate-800 font-bold">{doctor.fee}</p>
        </div>
        <button className="px-4 py-2 bg-slate-50 text-blue-600 text-sm font-bold rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
          Book
        </button>
      </div>
    </div>
  );
};

export default DoctorCard;