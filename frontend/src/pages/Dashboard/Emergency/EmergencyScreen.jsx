// src/pages/Dashboard/Emergency/EmergencyScreen.jsx

import React, { useState } from 'react';
import { Siren, MapPin, Phone, ExternalLink, Navigation, Search } from 'lucide-react';

const HospitalCard = ({ hospital }) => {
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.address)}&query_place_id=${hospital.id}`;

    return (
        <div className="bg-white rounded-2xl p-5 border border-red-100 shadow-sm hover:shadow-lg transition-all border-l-4 border-l-red-500">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        {hospital.name}
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${hospital.type === 'Government' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                            {hospital.type}
                        </span>
                    </h3>
                    <p className="text-sm text-slate-500 mt-1 flex items-start gap-1">
                        <MapPin size={14} className="shrink-0 mt-0.5" />
                        {hospital.address}
                    </p>
                </div>
                {hospital.distanceText && (
                    <div className="text-center bg-slate-50 p-2 rounded-lg shrink-0">
                        <span className="block text-sm font-bold text-slate-700">{hospital.distanceText}</span>
                        <span className="text-[10px] text-slate-400 uppercase">Distance</span>
                    </div>
                )}
            </div>

            <div className="flex gap-3 mt-4">
                {hospital.phone ? (
                    <a href={`tel:${hospital.phone.replace(/[\s-()]/g, '')}`} className="flex-1 bg-red-50 text-red-600 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors">
                        <Phone size={16} /> Call Now
                    </a>
                ) : (
                    <span className="flex-1 bg-slate-50 text-slate-400 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-not-allowed">
                        <Phone size={16} /> N/A
                    </span>
                )}
                <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                    <Navigation size={16} /> Directions
                </a>
            </div>
        </div>
    );
};

const EmergencyScreen = ({ t }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [hospitals, setHospitals] = useState([]);
    const [statusMessage, setStatusMessage] = useState('Find nearest hospitals by searching or using your location.');
    const [isLoading, setIsLoading] = useState(false);

    const fetchHospitals = async (payload) => {
        setIsLoading(true);
        setHospitals([]);
        setStatusMessage('Searching for hospitals...');

        try {
            // Using relative path mainly, assuming proxy is set. If not, use env var.
            const response = await fetch('/api/v1/patient/nearby-hospitals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `An error occurred: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.searchedLocation) {
                setSearchQuery(data.searchedLocation);
            }

            if (data.hospitals && data.hospitals.length > 0) {
                setHospitals(data.hospitals);
                setStatusMessage('');
            } else {
                setHospitals([]);
                setStatusMessage(`No hospitals found near "${data.searchedLocation}".`);
            }
        } catch (error) {
            console.error("Error fetching hospitals:", error);
            setHospitals([]);
            setStatusMessage(`Error: ${error.message}. Please try again.`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTextSearch = () => {
        if (!searchQuery.trim()) return;
        fetchHospitals({ address: searchQuery.trim() });
    };

    const handleUseMyLocation = () => {
        if (!navigator.geolocation) {
            setStatusMessage('Geolocation is not supported by your browser.');
            return;
        }
        setIsLoading(true);
        setStatusMessage('Getting your location...');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fetchHospitals({ latitude, longitude });
            },
            (error) => {
                setIsLoading(false);
                setStatusMessage(`Could not get location: ${error.message}.`);
            }
        );
    };

    return (
        <div className="p-6 max-w-4xl mx-auto animation-fade-in space-y-8">
            <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Siren size={32} />
                </div>
                <h1 className="text-3xl font-bold text-slate-800">{t.emergencyAssistance || 'Emergency Assistance'}</h1>
                <p className="text-slate-500">Quickly find nearby hospitals and ambulance services</p>
            </div>

            <div className="bg-white p-2 rounded-2xl shadow-lg border border-slate-100 flex flex-col md:flex-row gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="search"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium text-slate-700"
                        placeholder="Enter city or neighbourhood (e.g., 'Downtown')"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTextSearch()}
                        disabled={isLoading}
                    />
                </div>
                <button
                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md disabled:bg-blue-400"
                    onClick={handleTextSearch}
                    disabled={isLoading}
                >
                    {isLoading ? 'Searching...' : 'Search'}
                </button>
                <button
                    className="px-6 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors border border-red-100 flex items-center gap-2 justify-center"
                    onClick={handleUseMyLocation}
                    disabled={isLoading}
                >
                    <Navigation size={18} /> Locate Me
                </button>
            </div>

            <div className="space-y-4">
                {isLoading ? (
                    <div className="text-center py-10 text-slate-500 animate-pulse">{statusMessage}</div>
                ) : hospitals.length > 0 ? (
                    <div className="grid gap-4">
                        {hospitals.map((hospital) => (
                            <HospitalCard key={hospital.id} hospital={hospital} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500">
                        {statusMessage}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmergencyScreen;