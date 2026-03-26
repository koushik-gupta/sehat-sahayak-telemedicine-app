import React, { useState, useEffect } from 'react';
import DoctorCard from '../../../components/DoctorCard';
import BackButton from '../../../components/BackButton';
import { Search, Filter, Stethoscope } from 'lucide-react';

export default function Doctors({ doctors, onSelectDoctor, onBack, t, initialSearchQuery }) {
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || "");

  useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  const categories = ["All", ...new Set(doctors.map((doc) => doc.specialty))];

  const filteredDoctors = doctors.filter((doc) => {
    const matchesCategory = filter === "All" || doc.specialty === filter;
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto animation-fade-in space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <BackButton onClick={onBack} />
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
              {t.availableDoctors || "Available Doctors"}
            </h1>
            <p className="text-slate-500 mt-1">Book appointments with top specialists</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by name or specialty..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 transform active:scale-95 ${filter === cat
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 ring-2 ring-blue-600 ring-offset-2'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredDoctors.length > 0 ? (
          filteredDoctors.map((doc) => (
            <div key={doc.id} onClick={() => onSelectDoctor(doc.id)} className="h-full">
              <DoctorCard doctor={doc} />
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-300">
              <Stethoscope size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No doctors found</h3>
            <p className="text-slate-500">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}