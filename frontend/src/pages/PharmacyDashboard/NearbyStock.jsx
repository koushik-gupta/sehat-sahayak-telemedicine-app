
import React, { useState } from "react";
import { Search, MapPin, Store } from "lucide-react";

function NearbyStock({ chainName, district, state }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async () => {
        if (!searchTerm.trim()) return;
        setIsLoading(true);
        setHasSearched(true);
        try {
            const response = await fetch(`/api/v1/pharmacy/nearby-stock?medicine=${encodeURIComponent(searchTerm)}`);
            if (response.ok) {
                const data = await response.json();
                setResults(data);
            } else {
                setResults([]);
            }
        } catch (error) {
            console.error("Error fetching nearby stock:", error);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!chainName) {
        return (
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-center text-slate-500">
                <Store className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="font-bold">Enter your Pharmacy Chain Name to see other branches.</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <MapPin size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Nearby Branches</h2>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                        {chainName} • {district || state || 'Local'}
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Check medicine stock in other branches..."
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium text-slate-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button
                        onClick={handleSearch}
                        disabled={isLoading || !searchTerm.trim()}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        <Search size={20} />
                    </button>
                </div>

                <div className="max-h-[300px] overflow-y-auto space-y-2">
                    {isLoading ? (
                        <div className="text-center py-8 text-slate-400 font-medium">Checking other branches...</div>
                    ) : hasSearched && results.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 font-medium">No stock found in nearby branches.</div>
                    ) : (
                        results.map((item, index) => (
                            <div key={index} className="p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-100 transition-all">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold text-slate-700">{item.medicine_name}</h3>
                                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-md">
                                        {item.quantity} units
                                    </span>
                                </div>
                                <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                                    <MapPin size={12} /> {item.address}, {item.district}
                                </div>
                                <div className="text-xs font-bold text-indigo-600">
                                    Price: ₹{item.price}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default NearbyStock;
