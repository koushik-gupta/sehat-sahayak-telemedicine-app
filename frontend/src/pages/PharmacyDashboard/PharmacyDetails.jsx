
import React, { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Clock, FileText, Truck, Building2, Map } from 'lucide-react';

// Adapted for "Retail Command Center" Theme
function PharmacyDetails({ pharmacy, onDetailsChange, theme = "light" }) {
  const [isEditing, setIsEditing] = useState(false);

  // Colors based on theme
  const isDark = theme === "dark";
  const colors = {
    cardBg: isDark ? "bg-slate-800/50 border-white/5 text-slate-200" : "bg-white text-slate-700",
    inputBg: isDark ? "bg-slate-900 border-white/10 text-white focus:border-emerald-500" : "bg-slate-50 border-slate-200 text-slate-700",
    label: isDark ? "text-slate-500" : "text-slate-500",
    iconBg: isDark ? "bg-slate-900 text-emerald-500" : "bg-emerald-50 text-emerald-600",
  };

  // Local state for the form fields
  const [details, setDetails] = useState({
    email: pharmacy.email || '',
    mobile: pharmacy.mobile || '',
    address: pharmacy.address || '',
    opening_time: pharmacy.opening_time || '',
    closing_time: pharmacy.closing_time || '',
    license_number: pharmacy.license_number || '',
    home_delivery: pharmacy.home_delivery || false,
    chain_name: pharmacy.chain_name || '',
    district: pharmacy.district || '',
    state: pharmacy.state || ''
  });

  useEffect(() => {
    if (!pharmacy.address && !pharmacy.chain_name) {
      // Only force edit if strictly empty profile
      // setIsEditing(true); 
    }
    setDetails({
      email: pharmacy.email || '',
      mobile: pharmacy.mobile || '',
      address: pharmacy.address || '',
      opening_time: pharmacy.opening_time || '',
      closing_time: pharmacy.closing_time || '',
      license_number: pharmacy.license_number || '',
      home_delivery: pharmacy.home_delivery || false,
      chain_name: pharmacy.chain_name || '',
      district: pharmacy.district || '',
      state: pharmacy.state || ''
    });
  }, [pharmacy]);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;
    const newDetails = { ...details, [id]: finalValue };
    setDetails(newDetails);
    onDetailsChange(newDetails);
  };

  // Shared Save Logic
  const handleSave = async () => {
    try {
      const res = await fetch('/api/v1/pharmacy/update-details', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(details)
      });
      if (res.ok) setIsEditing(false);
    } catch (e) { alert("Error saving details"); }
  };

  if (!isEditing) {
    return (
      <div className="space-y-4">
        {[
          { icon: Building2, label: "Pharmacy Chain", val: details.chain_name || "Independent" },
          { icon: Map, label: "Location", val: (details.district && details.state) ? `${details.district}, ${details.state}` : "Not set" },
          { icon: Mail, label: "Email", val: details.email || "Not set" },
          { icon: Phone, label: "Phone", val: details.mobile || "Not set" },
          { icon: MapPin, label: "Address", val: details.address || "Not set" },
          { icon: Clock, label: "Hours", val: `${details.opening_time || "--:--"} - ${details.closing_time || "--:--"}` },
          { icon: FileText, label: "License", val: details.license_number || "Not set" },
          { icon: Truck, label: "Full Delivery", val: details.home_delivery ? "Available" : "No" }
        ].map((item, i) => (
          <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${colors.cardBg}`}>
            <div className={`p-2 rounded-lg ${colors.iconBg}`}><item.icon size={16} /></div>
            <div>
              <p className={`text-xs font-bold uppercase ${colors.label}`}>{item.label}</p>
              <p className="text-sm font-semibold">{item.val}</p>
            </div>
          </div>
        ))}

        <button
          onClick={() => setIsEditing(true)}
          className="w-full py-3 mt-4 text-sm font-bold text-white bg-slate-700/50 border border-white/5 rounded-xl hover:bg-emerald-600 transition-colors"
        >
          Edit Configuration
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animation-fade-in">
      <div className="form-group space-y-1">
        <label className={`text-xs font-bold uppercase ml-1 ${colors.label}`}>Pharmacy Chain Name</label>
        <input
          type="text"
          id="chain_name"
          className={`w-full px-4 py-2 rounded-xl outline-none transition-all text-sm font-semibold ${colors.inputBg}`}
          value={details.chain_name}
          onChange={handleChange}
          placeholder="e.g. Apollo Pharmacy"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="form-group space-y-1">
          <label className={`text-xs font-bold uppercase ml-1 ${colors.label}`}>District</label>
          <input type="text" id="district" className={`w-full px-4 py-2 rounded-xl outline-none transition-all text-sm font-semibold ${colors.inputBg}`} value={details.district} onChange={handleChange} />
        </div>
        <div className="form-group space-y-1">
          <label className={`text-xs font-bold uppercase ml-1 ${colors.label}`}>State</label>
          <input type="text" id="state" className={`w-full px-4 py-2 rounded-xl outline-none transition-all text-sm font-semibold ${colors.inputBg}`} value={details.state} onChange={handleChange} />
        </div>
      </div>

      {/* Simplified for brevity - applying same classes */}
      {['email', 'mobile', 'address', 'license_number'].map(field => (
        <div key={field} className="form-group space-y-1">
          <label className={`text-xs font-bold uppercase ml-1 ${colors.label}`}>{field.replace('_', ' ')}</label>
          {field === 'address' ? (
            <textarea id={field} value={details[field]} onChange={handleChange} className={`w-full px-4 py-2 rounded-xl outline-none transition-all text-sm font-semibold resize-none ${colors.inputBg}`} rows={2} />
          ) : (
            <input type="text" id={field} value={details[field]} onChange={handleChange} className={`w-full px-4 py-2 rounded-xl outline-none transition-all text-sm font-semibold ${colors.inputBg}`} />
          )}
        </div>
      ))}

      <div className="grid grid-cols-2 gap-3">
        <div className="form-group space-y-1">
          <label className={`text-xs font-bold uppercase ml-1 ${colors.label}`}>Opens At</label>
          <input type="time" id="opening_time" className={`w-full px-3 py-2 rounded-xl outline-none transition-all text-sm font-semibold ${colors.inputBg}`} value={details.opening_time} onChange={handleChange} />
        </div>
        <div className="form-group space-y-1">
          <label className={`text-xs font-bold uppercase ml-1 ${colors.label}`}>Closes At</label>
          <input type="time" id="closing_time" className={`w-full px-3 py-2 rounded-xl outline-none transition-all text-sm font-semibold ${colors.inputBg}`} value={details.closing_time} onChange={handleChange} />
        </div>
      </div>

      <div className={`flex items-center gap-3 p-3 rounded-xl border ${colors.cardBg}`}>
        <input
          type="checkbox"
          id="home_delivery"
          className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300 bg-slate-700"
          checked={details.home_delivery || false}
          onChange={handleChange}
        />
        <label htmlFor="home_delivery" className="text-sm font-bold cursor-pointer select-none">
          Offers Home Delivery
        </label>
      </div>

      <button
        onClick={handleSave}
        className="w-full py-3 mt-4 text-sm font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/50"
      >
        Save Changes
      </button>

      <button onClick={() => setIsEditing(false)} className="w-full py-2 text-xs font-bold text-slate-500 hover:text-white">Cancel</button>
    </div>
  );
}

export default PharmacyDetails;
