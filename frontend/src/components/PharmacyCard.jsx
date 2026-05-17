import React, { useEffect, useState } from "react";
import {
  Bike,
  Clock3,
  MapPin,
  Navigation,
  Package,
  Plus,
  Minus,
  ShoppingCart,
} from "lucide-react";
import { useDashboardTheme } from "../pages/Dashboard/DashboardThemeContext";

const PharmacyCard = ({ pharmacy, onAddToCart, cartQuantity = 0 }) => {
  const { isDark } = useDashboardTheme();
  const {
    name,
    address,
    district,
    state,
    quantity,
    price,
    medicine_name: medicineName,
    home_delivery: homeDelivery,
    opening_time: openingTime,
    closing_time: closingTime,
  } = pharmacy;

  const [count, setCount] = useState(1);

  useEffect(() => {
    setCount((prev) => {
      if (quantity <= 0) {
        return 0;
      }

      return Math.min(Math.max(prev, 1), quantity);
    });
  }, [quantity]);

  const increment = () => {
    if (count < quantity) {
      setCount((prev) => prev + 1);
    }
  };

  const decrement = () => {
    if (count > 1) {
      setCount((prev) => prev - 1);
    }
  };

  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || name)}`;
  const stockLevel = Math.min(100, Math.max(12, quantity * 10));

  return (
    <div className={`group relative flex h-full flex-col overflow-hidden rounded-[28px] border p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 ${
      isDark ? "border-white/10 bg-slate-900/72 hover:shadow-xl hover:shadow-cyan-950/30" : "border-slate-200/80 bg-white hover:shadow-xl hover:shadow-blue-100/60"
    }`}>
      <div className="pointer-events-none absolute inset-x-5 top-0 h-20 rounded-b-[24px] bg-gradient-to-b from-blue-50 to-transparent" />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] ${isDark ? "bg-blue-500/12 text-blue-200" : "bg-blue-50 text-blue-700"}`}>
              {medicineName}
            </span>
            {homeDelivery && (
              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold ${isDark ? "bg-emerald-500/12 text-emerald-200" : "bg-emerald-50 text-emerald-700"}`}>
                <Bike size={12} />
                Home delivery
              </span>
            )}
          </div>
          <h3 className={`mt-3 text-xl font-bold transition-colors ${isDark ? "text-slate-100 group-hover:text-blue-300" : "text-slate-800 group-hover:text-blue-700"}`}>
            {name}
          </h3>
          <p className={`mt-2 flex items-start gap-2 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            <MapPin size={15} className={`mt-0.5 shrink-0 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
            <span>{address || "Address not available"}</span>
          </p>
        </div>

        <div className={`rounded-2xl border px-3 py-2 text-right ${isDark ? "border-blue-300/20 bg-blue-500/10" : "border-blue-100 bg-blue-50"}`}>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-600">Per unit</p>
          <p className={`mt-1 text-2xl font-bold ${isDark ? "text-slate-50" : "text-slate-900"}`}>Rs. {Number(price || 0).toFixed(0)}</p>
        </div>
      </div>

      <div className="relative mt-5 grid grid-cols-2 gap-3">
        <InfoChip icon={<Package size={14} />} label={`${quantity} in stock`} tone="emerald" />
        <InfoChip
          icon={<Clock3 size={14} />}
          label={openingTime && closingTime ? `${openingTime} - ${closingTime}` : "Hours not listed"}
          tone="blue"
        />
        <InfoChip icon={<MapPin size={14} />} label={district || "Local area"} tone="slate" />
        <InfoChip icon={<MapPin size={14} />} label={state || "State not listed"} tone="slate" />
      </div>

      <div className="relative mt-5">
        <div className={`mb-2 flex items-center justify-between text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          <span>Stock confidence</span>
          <span>{quantity > 10 ? "Ready to dispense" : quantity > 3 ? "Limited units" : "Low stock"}</span>
        </div>
        <div className={`h-2 rounded-full ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
          <div
            className={`h-full rounded-full transition-all ${
              quantity > 10 ? "bg-emerald-500" : quantity > 3 ? "bg-amber-500" : "bg-rose-500"
            }`}
            style={{ width: `${stockLevel}%` }}
          />
        </div>
      </div>

      <div className="relative mt-auto pt-5">
        {cartQuantity > 0 && (
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            <ShoppingCart size={14} />
            {cartQuantity} in cart
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className={`flex items-center rounded-2xl border ${isDark ? "border-white/10 bg-white/8" : "border-slate-200 bg-slate-50"}`}>
            <button
              onClick={decrement}
              disabled={count <= 1}
              className={`p-3 transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${isDark ? "text-slate-300 hover:text-blue-300" : "text-slate-500 hover:text-blue-600"}`}
            >
              <Minus size={16} />
            </button>
            <span className={`w-10 text-center text-base font-bold ${isDark ? "text-slate-100" : "text-slate-700"}`}>{count}</span>
            <button
              onClick={increment}
              disabled={count >= quantity}
              className={`p-3 transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${isDark ? "text-slate-300 hover:text-blue-300" : "text-slate-500 hover:text-blue-600"}`}
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="flex flex-1 gap-2">
            <button
              onClick={() => onAddToCart(pharmacy, count)}
              disabled={quantity <= 0}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            >
              <ShoppingCart size={17} />
              Add to cart
            </button>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center justify-center rounded-2xl border px-4 transition-colors ${isDark ? "border-white/10 bg-white/8 text-slate-300 hover:bg-white/12 hover:text-blue-200" : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-blue-700"}`}
              title="Get Directions"
            >
              <Navigation size={18} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

function InfoChip({ icon, label, tone }) {
  const { isDark } = useDashboardTheme();
  const tones = {
    emerald: isDark ? "border-emerald-300/20 bg-emerald-500/10 text-emerald-200" : "border-emerald-100 bg-emerald-50 text-emerald-700",
    blue: isDark ? "border-blue-300/20 bg-blue-500/10 text-blue-200" : "border-blue-100 bg-blue-50 text-blue-700",
    slate: isDark ? "border-white/10 bg-white/8 text-slate-300" : "border-slate-200 bg-slate-50 text-slate-600",
  };

  return (
    <div className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium ${tones[tone]}`}>
      <span className="shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </div>
  );
}

export default PharmacyCard;
