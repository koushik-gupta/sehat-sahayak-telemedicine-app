import React, { useState } from 'react';
import { MapPin, Navigation, Package, Plus, Minus } from 'lucide-react';

const PharmacyCard = ({ pharmacy, onAddToCart, medicineName }) => {
  const { name, address, quantity, price } = pharmacy; // price is now passed from parent
  const [count, setCount] = useState(1);

  const increment = () => {
    if (count < quantity) setCount(prev => prev + 1);
  };

  const decrement = () => {
    if (count > 1) setCount(prev => prev - 1);
  };

  // Create a Google Maps URL for directions
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || name)}`;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group h-full flex flex-col relative overflow-hidden">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">{name}</h3>
        <p className="text-sm text-slate-500 flex items-start gap-1">
          <MapPin size={14} className="shrink-0 mt-0.5" />
          {address || "Address not available"}
        </p>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-50 space-y-4">

        {/* Price and Stock Info */}
        <div className="flex items-end justify-between">
          <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 w-max">
            <Package size={14} />
            <span>{quantity} in stock</span>
          </div>
          <span className="text-2xl font-bold text-slate-800">₹{price}</span>
        </div>

        {/* Quantity Selector & Actions */}
        <div className="flex items-center justify-between gap-3">
          {/* Quantity Selector */}
          <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
            <button
              onClick={decrement}
              disabled={count <= 1}
              className="p-2 text-slate-500 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-slate-500 transition-colors"
            >
              <Minus size={16} />
            </button>
            <span className="w-8 text-center font-bold text-slate-700">{count}</span>
            <button
              onClick={increment}
              disabled={count >= quantity}
              className="p-2 text-slate-500 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-slate-500 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="flex gap-2 flex-1 justify-end">
            <button
              onClick={() => onAddToCart({ ...pharmacy, price, medicineName, quantity: count })}
              className="bg-blue-600 text-white px-3 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center gap-2 flex-1 justify-center whitespace-nowrap"
            >
              Add to Cart
            </button>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-100 text-slate-600 p-2 rounded-xl hover:bg-slate-200 transition-colors"
              title="Get Directions"
            >
              <Navigation size={20} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyCard;
