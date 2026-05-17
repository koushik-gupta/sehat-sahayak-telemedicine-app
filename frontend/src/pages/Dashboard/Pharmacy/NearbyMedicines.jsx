import React, { useEffect, useMemo, useState } from "react";
import PharmacyCard from "../../../components/PharmacyCard";
import { ArrowLeft, CheckCircle2, Clock3, History, MapPin, Minus, Pill, Plus, Search, ShoppingCart, Trash2, X } from "lucide-react";
import { getGlassCardClass, getGlassPanelClass, useDashboardTheme } from "../DashboardThemeContext";

const QUICK = ["Paracetamol", "Azithromycin", "Vitamin C", "Cetirizine", "ORS"];
const RECENT_KEY = "sehat-pharmacy-searches";

export default function NearbyMedicines({ t, onBack }) {
  const { isDark } = useDashboardTheme();
  const glassPanelClass = getGlassPanelClass(isDark);
  const glassCardClass = getGlassCardClass(isDark);
  const [term, setTerm] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("recommended");
  const [deliveryOnly, setDeliveryOnly] = useState(false);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [recent, setRecent] = useState([]);
  const [success, setSuccess] = useState("");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    try { setRecent(JSON.parse(window.localStorage.getItem(RECENT_KEY) || "[]")); } catch { setRecent([]); }
    loadOrders();
  }, []);

  useEffect(() => {
    if (!success) return undefined;
    const id = window.setTimeout(() => setSuccess(""), 3000);
    return () => window.clearTimeout(id);
  }, [success]);

  const cardCounts = useMemo(() => {
    const map = new Map();
    cart.forEach((item) => map.set(`${item.pharmacyId}-${item.medicineId}`, item.quantity));
    return map;
  }, [cart]);

  const visible = useMemo(() => {
    let next = results.filter((item) => item.quantity > 0);
    if (deliveryOnly) next = next.filter((item) => item.home_delivery);
    return [...next].sort((a, b) => {
      if (sortBy === "price") return a.price - b.price;
      if (sortBy === "stock") return b.quantity - a.quantity;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return Number(b.home_delivery) - Number(a.home_delivery) || a.price - b.price || b.quantity - a.quantity;
    });
  }, [deliveryOnly, results, sortBy]);

  const groups = useMemo(() => {
    const map = new Map();
    cart.forEach((item) => {
      if (!map.has(item.pharmacyId)) map.set(item.pharmacyId, { pharmacyId: item.pharmacyId, pharmacyName: item.pharmacyName, address: item.address, items: [] });
      map.get(item.pharmacyId).items.push(item);
    });
    return [...map.values()].map((group) => ({ ...group, count: group.items.reduce((s, i) => s + i.quantity, 0), total: group.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0) }));
  }, [cart]);

  const cartUnits = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const bestPrice = visible.length ? Math.min(...visible.map((item) => item.price)) : null;
  const deliveryCount = visible.filter((item) => item.home_delivery).length;

  async function loadOrders() {
    setOrdersLoading(true);
    try {
      const res = await fetch("/api/v1/pharmacy/patient-orders", { credentials: "include" });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data.error || "Could not load orders.");
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }

  function remember(nextTerm) {
    const next = [nextTerm, ...recent.filter((item) => item.toLowerCase() !== nextTerm.toLowerCase())].slice(0, 6);
    setRecent(next);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  }

  async function search(nextTerm = term) {
    const clean = nextTerm.trim();
    if (!clean) { setError("Please enter a medicine name."); setSearched(true); setResults([]); return; }
    setLoading(true); setError(""); setSearched(true); setSubmitted(clean); setTerm(clean);
    try {
      const res = await fetch(`/api/v1/pharmacy/search?medicine=${encodeURIComponent(clean)}`, { credentials: "include" });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data.error || "Could not search stock.");
      setResults((Array.isArray(data) ? data : []).map((item) => ({ ...item, quantity: Number(item.quantity || 0), price: Number(item.price || 0) })));
      remember(clean);
    } catch (err) {
      setResults([]); setError(err.message || "Could not search stock.");
    } finally {
      setLoading(false);
    }
  }

  function addToCart(pharmacy, qty) {
    const safeQty = Math.max(1, Math.min(qty, Number(pharmacy.quantity || 0)));
    setCart((current) => {
      const index = current.findIndex((item) => item.pharmacyId === pharmacy.pharmacy_id && item.medicineId === pharmacy.medicine_id);
      if (index >= 0) {
        const next = [...current];
        next[index] = { ...next[index], quantity: Math.min(next[index].availableStock, next[index].quantity + safeQty) };
        return next;
      }
      return [...current, { pharmacyId: pharmacy.pharmacy_id, pharmacyName: pharmacy.name, address: pharmacy.address, medicineId: pharmacy.medicine_id, medicineName: pharmacy.medicine_name, unitPrice: pharmacy.price, quantity: safeQty, availableStock: pharmacy.quantity }];
    });
    setSuccess(`${pharmacy.medicine_name} added to cart.`);
  }

  function setQty(pharmacyId, medicineId, qty) {
    setCart((current) => current.map((item) => item.pharmacyId === pharmacyId && item.medicineId === medicineId ? { ...item, quantity: Math.max(0, Math.min(item.availableStock, qty)) } : item).filter((item) => item.quantity > 0));
  }

  async function checkout(group) {
    setBusyId(group.pharmacyId); setError("");
    try {
      const res = await fetch("/api/v1/pharmacy/order", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pharmacy_id: group.pharmacyId, pharmacy_name: group.pharmacyName, items: group.items.map((item) => ({ medicine_id: item.medicineId, medicineName: item.medicineName, quantity: item.quantity })) }),
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data.error || "Failed to place order.");
      setCart((current) => current.filter((item) => item.pharmacyId !== group.pharmacyId));
      setResults((current) => current.map((item) => {
        const match = group.items.find((cartItem) => cartItem.pharmacyId === item.pharmacy_id && cartItem.medicineId === item.medicine_id);
        return match ? { ...item, quantity: Math.max(0, item.quantity - match.quantity) } : item;
      }));
      setSuccess(`Order #${data.order_id} placed successfully.`);
      loadOrders();
    } catch (err) {
      setError(err.message || "Failed to place order.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6 pb-10">
      {success && <div className={`sticky top-20 z-20 flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold ${isDark ? "border-emerald-400/20 bg-emerald-400/12 text-emerald-100" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}><CheckCircle2 size={18} />{success}</div>}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">{onBack && <button onClick={onBack} className={`flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold ${isDark ? "border-white/10 bg-white/8 text-slate-300 hover:text-blue-200" : "border-slate-200 bg-white text-slate-600 hover:text-blue-700"}`}><ArrowLeft size={16} />Back</button>}<div><p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Patient pharmacy</p><h1 className={`text-3xl font-bold ${isDark ? "text-slate-50" : "text-slate-900"}`}>{t.findAMedicine || "Find medicines nearby"}</h1></div></div>
        <button onClick={() => setCartOpen(true)} className="relative flex items-center gap-3 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-200"><ShoppingCart size={18} />Basket{cartUnits > 0 && <span className="rounded-full bg-emerald-400 px-2 py-0.5 text-xs font-bold text-slate-900">{cartUnits}</span>}</button>
      </div>
      <section className="rounded-[32px] bg-gradient-to-br from-blue-600 via-blue-500 to-emerald-500 p-6 text-white shadow-xl shadow-blue-200/60">
        <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold">Search brand or generic names</p>
        <h2 className="mt-4 max-w-3xl text-3xl font-bold">Compare live stock, prices, and delivery options without leaving the app theme.</h2>
        <div className="mt-5 flex flex-wrap gap-2">{QUICK.map((item) => <button key={item} onClick={() => search(item)} className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20">{item}</button>)}</div>
      </section>
      <section className={`rounded-[28px] p-5 ${glassCardClass}`}>
        <div className="flex flex-col gap-3 xl:flex-row">
          <div className="relative flex-1"><Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-500" : "text-slate-400"}`} size={20} /><input value={term} onChange={(e) => setTerm(e.target.value)} onKeyDown={(e) => e.key === "Enter" && search()} placeholder={t.searchMedicinePlaceholder || "Search medicines like Paracetamol, ORS, Vitamin C"} className={`w-full rounded-2xl border py-4 pl-12 pr-4 outline-none ${isDark ? "border-white/10 bg-slate-950/55 text-slate-100 placeholder:text-slate-500 focus:border-blue-400/30 focus:ring-4 focus:ring-blue-500/10" : "border-slate-200 bg-slate-50 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"}`} /></div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={`rounded-2xl border px-4 py-4 text-sm font-medium ${isDark ? "border-white/10 bg-slate-950/55 text-slate-100" : "border-slate-200 text-slate-700"}`}><option value="recommended">Recommended</option><option value="price">Lowest price</option><option value="stock">Highest stock</option><option value="name">Pharmacy name</option></select>
          <label className={`flex items-center gap-3 rounded-2xl border px-4 py-4 text-sm font-medium ${isDark ? "border-white/10 bg-slate-950/55 text-slate-200" : "border-slate-200 bg-slate-50 text-slate-700"}`}><input type="checkbox" checked={deliveryOnly} onChange={(e) => setDeliveryOnly(e.target.checked)} />Delivery only</label>
          <button onClick={() => search()} disabled={loading} className="rounded-2xl bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:bg-blue-300">{loading ? "Searching..." : "Search stock"}</button>
        </div>
        {!!recent.length && <div className="mt-4 flex flex-wrap gap-2">{recent.map((item) => <button key={item} onClick={() => search(item)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${isDark ? "border-white/10 bg-white/8 text-slate-300 hover:border-blue-300/25 hover:text-blue-200" : "border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-200 hover:text-blue-700"}`}>{item}</button>)}</div>}
      </section>
      <div className="grid gap-4 sm:grid-cols-3"><Stat label="Results" value={searched ? visible.length : "--"} helper="matching pharmacy options" tone="blue" /><Stat label="Best price" value={bestPrice == null ? "--" : money(bestPrice)} helper="lowest visible unit price" tone="emerald" /><Stat label="Delivery" value={searched ? deliveryCount : "--"} helper="home delivery options" tone="amber" /></div>
      <div className="grid gap-6 xl:grid-cols-[1.7fr_0.95fr]">
        <section className={`rounded-[28px] p-5 ${glassPanelClass}`}>
          <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Search results</p><h2 className={`mt-1 text-2xl font-bold ${isDark ? "text-slate-50" : "text-slate-900"}`}>{submitted ? `Availability for ${submitted}` : "Search a medicine to begin"}</h2></div>{searched && <div className={`rounded-2xl px-4 py-3 text-sm ${isDark ? "bg-white/8 text-slate-300" : "bg-slate-50 text-slate-600"}`}>{visible.length} option{visible.length === 1 ? "" : "s"}</div>}</div>
          {error && <div className={`mt-5 rounded-2xl border px-4 py-3 text-sm font-medium ${isDark ? "border-rose-400/20 bg-rose-400/12 text-rose-100" : "border-rose-200 bg-rose-50 text-rose-700"}`}>{error}</div>}
          <div className="mt-6">{loading ? <div className="grid gap-4 md:grid-cols-2">{[1, 2, 3, 4].map((n) => <div key={n} className={`h-80 animate-pulse rounded-[28px] border ${isDark ? "border-white/10 bg-white/8" : "border-slate-200 bg-slate-50"}`} />)}</div> : !searched ? <Empty /> : !visible.length ? <NoResults search={search} submitted={submitted} /> : <div className="grid gap-4 md:grid-cols-2">{visible.map((pharmacy) => <PharmacyCard key={`${pharmacy.pharmacy_id}-${pharmacy.medicine_id}`} pharmacy={pharmacy} onAddToCart={addToCart} cartQuantity={cardCounts.get(`${pharmacy.pharmacy_id}-${pharmacy.medicine_id}`) || 0} />)}</div>}</div>
        </section>
        <aside className="space-y-6">
          <section className={`rounded-[28px] p-5 ${glassCardClass}`}>
            <div className="flex items-center justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Basket summary</p><h2 className={`mt-1 text-2xl font-bold ${isDark ? "text-slate-50" : "text-slate-900"}`}>Ready to checkout</h2></div><button onClick={() => setCartOpen(true)} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Open</button></div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-1"><Mini label="Units" value={cartUnits} /><Mini label="Pharmacies" value={groups.length} /><Mini label="Subtotal" value={cartUnits ? money(cartTotal) : "--"} /></div>
          </section>
          <section className={`rounded-[28px] p-5 ${glassCardClass}`}>
            <div className="flex items-center justify-between"><div><p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Recent orders</p><h2 className={`mt-1 flex items-center gap-2 text-2xl font-bold ${isDark ? "text-slate-50" : "text-slate-900"}`}><History size={22} className={isDark ? "text-slate-400" : "text-slate-500"} />Order history</h2></div><button onClick={loadOrders} className={`rounded-2xl border px-3 py-2 text-sm font-semibold ${isDark ? "border-white/10 text-slate-300" : "border-slate-200 text-slate-600"}`}>Refresh</button></div>
            <div className="mt-5 space-y-3">{ordersLoading ? [1, 2, 3].map((n) => <div key={n} className={`h-28 animate-pulse rounded-2xl border ${isDark ? "border-white/10 bg-white/8" : "border-slate-200 bg-slate-50"}`} />) : !orders.length ? <div className={`rounded-2xl border border-dashed p-5 text-center text-sm ${isDark ? "border-white/10 bg-white/8 text-slate-300" : "border-slate-200 bg-slate-50 text-slate-500"}`}>Placed medicine requests will appear here.</div> : orders.map((order) => <OrderCard key={order.id} order={order} />)}</div>
          </section>
        </aside>
      </div>
      {cartOpen && <div className="fixed inset-0 z-50 flex justify-end"><button className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setCartOpen(false)} aria-label="Close cart" /><div className={`relative flex h-full w-full max-w-xl flex-col shadow-2xl ${isDark ? "bg-slate-950" : "bg-white"}`}><div className={`flex items-start justify-between border-b px-6 py-5 ${isDark ? "border-white/10" : "border-slate-200"}`}><div><p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Your basket</p><h2 className={`mt-1 text-3xl font-bold ${isDark ? "text-slate-50" : "text-slate-900"}`}>Review medicines</h2></div><button onClick={() => setCartOpen(false)} className={`rounded-2xl border p-2 ${isDark ? "border-white/10 text-slate-300" : "border-slate-200 text-slate-500"}`}><X size={20} /></button></div><div className="flex-1 overflow-y-auto px-6 py-6">{!groups.length ? <div className={`flex h-full flex-col items-center justify-center rounded-[28px] border border-dashed text-center ${isDark ? "border-white/10 bg-white/8 text-slate-300" : "border-slate-200 bg-slate-50 text-slate-500"}`}><ShoppingCart size={36} className={isDark ? "text-slate-500" : "text-slate-300"} /><p className={`mt-3 font-semibold ${isDark ? "text-slate-100" : "text-slate-700"}`}>Your basket is empty</p></div> : <div className="space-y-5">{groups.map((group) => <div key={group.pharmacyId} className={`rounded-[28px] border p-5 ${isDark ? "border-white/10 bg-white/8" : "border-slate-200 bg-slate-50"}`}><div className="flex items-start justify-between gap-3"><div><h3 className={`text-lg font-bold ${isDark ? "text-slate-50" : "text-slate-900"}`}>{group.pharmacyName}</h3><p className={`mt-1 flex items-center gap-2 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}><MapPin size={14} />{group.address || "Address not listed"}</p></div><p className={`text-xl font-bold ${isDark ? "text-slate-50" : "text-slate-900"}`}>{money(group.total)}</p></div><div className="mt-4 space-y-3">{group.items.map((item) => <div key={`${item.pharmacyId}-${item.medicineId}`} className={`rounded-2xl border p-4 ${isDark ? "border-white/10 bg-slate-950/65" : "border-slate-200 bg-white"}`}><div className="flex items-start justify-between gap-4"><div><p className={`font-bold ${isDark ? "text-slate-100" : "text-slate-800"}`}>{item.medicineName}</p><p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{money(item.unitPrice)} each</p></div><button onClick={() => setQty(item.pharmacyId, item.medicineId, 0)} className={`rounded-xl p-2 ${isDark ? "text-slate-400 hover:bg-rose-500/10 hover:text-rose-200" : "text-slate-400 hover:bg-rose-50 hover:text-rose-600"}`}><Trash2 size={16} /></button></div><div className="mt-4 flex items-center justify-between gap-4"><div className={`flex items-center rounded-2xl border ${isDark ? "border-white/10 bg-white/8" : "border-slate-200 bg-slate-50"}`}><button onClick={() => setQty(item.pharmacyId, item.medicineId, item.quantity - 1)} className={`p-3 ${isDark ? "text-slate-300 hover:text-blue-200" : "text-slate-500 hover:text-blue-600"}`}><Minus size={16} /></button><span className={`w-10 text-center font-bold ${isDark ? "text-slate-100" : "text-slate-800"}`}>{item.quantity}</span><button onClick={() => setQty(item.pharmacyId, item.medicineId, item.quantity + 1)} disabled={item.quantity >= item.availableStock} className={`p-3 disabled:opacity-30 ${isDark ? "text-slate-300 hover:text-blue-200" : "text-slate-500 hover:text-blue-600"}`}><Plus size={16} /></button></div><p className={`text-lg font-bold ${isDark ? "text-slate-50" : "text-slate-900"}`}>{money(item.quantity * item.unitPrice)}</p></div></div>)}</div><div className={`mt-5 flex items-center justify-between gap-3 border-t pt-5 ${isDark ? "border-white/10" : "border-slate-200"}`}><p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{group.count} unit{group.count === 1 ? "" : "s"} from this pharmacy</p><button onClick={() => checkout(group)} disabled={busyId === group.pharmacyId} className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 disabled:bg-blue-300">{busyId === group.pharmacyId ? "Placing order..." : "Place order"}</button></div></div>)}</div>}</div><div className={`border-t px-6 py-5 ${isDark ? "border-white/10" : "border-slate-200"}`}><div className="flex items-center justify-between gap-4"><div><p className={`text-xs font-bold uppercase tracking-[0.2em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Current basket</p><p className={`mt-1 text-2xl font-bold ${isDark ? "text-slate-50" : "text-slate-900"}`}>{cartUnits ? money(cartTotal) : "--"}</p></div><button onClick={() => setCartOpen(false)} className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${isDark ? "border-white/10 text-slate-300" : "border-slate-200 text-slate-600"}`}>Continue browsing</button></div></div></div></div>}
    </div>
  );
}

function Stat({ label, value, helper, tone }) {
  const { isDark } = useDashboardTheme();
  const tones = { blue: isDark ? "border-blue-300/20 bg-blue-500/10 text-blue-200" : "border-blue-100 bg-blue-50 text-blue-700", emerald: isDark ? "border-emerald-300/20 bg-emerald-500/10 text-emerald-200" : "border-emerald-100 bg-emerald-50 text-emerald-700", amber: isDark ? "border-amber-300/20 bg-amber-500/10 text-amber-200" : "border-amber-100 bg-amber-50 text-amber-700" };
  return <div className={`rounded-[28px] border p-5 shadow-sm ${tones[tone]}`}><p className="text-xs font-bold uppercase tracking-[0.22em]">{label}</p><p className={`mt-3 text-3xl font-bold ${isDark ? "text-slate-50" : "text-slate-900"}`}>{value}</p><p className={`mt-2 text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>{helper}</p></div>;
}

function Mini({ label, value }) {
  const { isDark } = useDashboardTheme();
  return <div className={`rounded-2xl border p-4 ${isDark ? "border-white/10 bg-white/8" : "border-slate-200 bg-slate-50"}`}><p className={`text-xs font-bold uppercase tracking-[0.2em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>{label}</p><p className={`mt-2 text-xl font-bold ${isDark ? "text-slate-50" : "text-slate-900"}`}>{value}</p></div>;
}

function Empty() {
  const { isDark } = useDashboardTheme();
  return <div className={`rounded-[30px] border border-dashed px-6 py-12 text-center ${isDark ? "border-white/10 bg-white/8" : "border-slate-200 bg-slate-50"}`}><div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-3xl text-blue-600 ${isDark ? "bg-blue-500/12" : "bg-blue-100"}`}><Pill size={28} /></div><h3 className={`mt-5 text-2xl font-bold ${isDark ? "text-slate-50" : "text-slate-900"}`}>Search for a medicine to compare pharmacies</h3><p className={`mx-auto mt-3 max-w-xl text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>Use the search bar above to find available stock, compare pricing, and add medicines to your basket.</p></div>;
}

function NoResults({ search, submitted }) {
  const { isDark } = useDashboardTheme();
  return <div className={`rounded-[30px] border border-dashed px-6 py-12 text-center ${isDark ? "border-white/10 bg-white/8" : "border-slate-200 bg-slate-50"}`}><div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-3xl text-amber-600 ${isDark ? "bg-amber-500/12" : "bg-amber-100"}`}><Search size={28} /></div><h3 className={`mt-5 text-2xl font-bold ${isDark ? "text-slate-50" : "text-slate-900"}`}>No live stock found for {submitted}</h3><p className={`mx-auto mt-3 max-w-xl text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>Try a generic name or one of the quick search options below.</p><div className="mt-6 flex flex-wrap justify-center gap-2">{QUICK.map((item) => <button key={item} onClick={() => search(item)} className={`rounded-full border px-4 py-2 text-sm font-semibold ${isDark ? "border-white/10 bg-slate-950/55 text-slate-200 hover:border-blue-300/25 hover:text-blue-200" : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-blue-700"}`}>{item}</button>)}</div></div>;
}

function OrderCard({ order }) {
  const { isDark } = useDashboardTheme();
  const tone = { pending: isDark ? "border-amber-300/20 bg-amber-500/10 text-amber-200" : "border-amber-200 bg-amber-100 text-amber-700", ready: isDark ? "border-blue-300/20 bg-blue-500/10 text-blue-200" : "border-blue-200 bg-blue-100 text-blue-700", completed: isDark ? "border-emerald-300/20 bg-emerald-500/10 text-emerald-200" : "border-emerald-200 bg-emerald-100 text-emerald-700", cancelled: isDark ? "border-rose-300/20 bg-rose-500/10 text-rose-200" : "border-rose-200 bg-rose-100 text-rose-700" }[order.status] || (isDark ? "border-white/10 bg-white/8 text-slate-200" : "border-slate-200 bg-slate-100 text-slate-700");
  return <div className={`rounded-2xl border p-4 ${isDark ? "border-white/10 bg-white/8" : "border-slate-200 bg-slate-50"}`}><div className="flex items-start justify-between gap-3"><div><p className={`font-bold ${isDark ? "text-slate-100" : "text-slate-800"}`}>{order.pharmacy_name}</p><p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Order #{order.id}</p></div><span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${tone}`}>{order.status}</span></div><div className={`mt-4 flex items-center justify-between text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}><span className="inline-flex items-center gap-2"><Clock3 size={14} />{when(order.created_at)}</span><span className={`font-bold ${isDark ? "text-slate-100" : "text-slate-800"}`}>{money(order.total_amount)}</span></div><div className="mt-3 space-y-2">{(order.items || []).slice(0, 2).map((item, index) => <div key={`${order.id}-${index}`} className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm ${isDark ? "bg-slate-950/65" : "bg-white"}`}><span className={`font-medium ${isDark ? "text-slate-100" : "text-slate-700"}`}>{item.medicine_name}</span><span className={isDark ? "text-slate-400" : "text-slate-500"}>{item.quantity} x {money(item.price_per_unit)}</span></div>)}</div></div>;
}

function money(value) {
  const amount = Number(value || 0);
  return `Rs. ${amount.toFixed(amount % 1 === 0 ? 0 : 2)}`;
}

function when(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

async function safeJson(response) {
  try { return await response.json(); } catch { return {}; }
}
