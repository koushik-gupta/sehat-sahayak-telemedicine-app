import React, { useState, useMemo } from 'react';
import PharmacyCard from '../../../components/PharmacyCard';
import { Pill, Search, AlertCircle, ShoppingCart, X, Trash2, CheckCircle } from 'lucide-react';

const NearbyMedicines = ({ t, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  // Cart State
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [ordersPlaced, setOrdersPlaced] = useState([]); // Track placed orders (mock)

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError("Please enter a medicine name to search.");
      setSearched(true);
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSearched(true);

    try {
      const url = `/api/v1/pharmacy/search?medicine=${encodeURIComponent(searchTerm)}`;
      const response = await fetch(url, { credentials: 'include' });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Something went wrong during the search.');
      }

      const data = await response.json();
      setResults(data);

    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = (item) => {
    setCart([...cart, item]);
    // Optional: Show toast
  };

  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const placeOrder = async (pharmacyName) => {
    const itemsToOrder = cart.filter(item => item.name === pharmacyName);

    // Prepare payload
    const payload = {
      pharmacy_name: pharmacyName,
      pharmacy_id: itemsToOrder[0].id, // pharmacy.id is actually itemsToOrder[0].id from the search result struct? No, let's check. Search returns p.id.
      items: itemsToOrder.map(item => ({
        medicineName: item.medicineName,
        quantity: item.quantity,
        price: item.price
      }))
    };

    try {
      const response = await fetch('/api/v1/pharmacy/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to place order");
      }

      const resData = await response.json();
      alert(`Order placed successfully! Order ID: ${resData.order_id}`);

      // Remove ordered items from cart
      const newCart = cart.filter(item => item.name !== pharmacyName);
      setCart(newCart);
      setOrdersPlaced([...ordersPlaced, pharmacyName]);

    } catch (error) {
      alert(error.message);
    }
  };

  // Group cart items by Pharmacy
  const groupedCart = useMemo(() => {
    const groups = {};
    cart.forEach(item => {
      if (!groups[item.name]) {
        groups[item.name] = [];
      }
      groups[item.name].push(item);
    });
    return groups;
  }, [cart]);

  return (
    <div className="p-6 max-w-5xl mx-auto animation-fade-in space-y-8 relative">

      {/* Top Bar with Cart Button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
            <Pill size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{t.findAMedicine || 'Find Medicines'}</h1>
            <p className="text-sm text-slate-500">Locate & Order from nearby pharmacies</p>
          </div>
        </div>

        <button
          onClick={() => setShowCart(true)}
          className="relative p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors group"
        >
          <ShoppingCart size={24} className="text-slate-600 group-hover:text-blue-600" />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
              {cart.length}
            </span>
          )}
        </button>
      </div>


      {/* Search Bar */}
      <div className="bg-white p-2 rounded-2xl shadow-lg border border-slate-100 flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium text-slate-700"
            placeholder={t.searchMedicinePlaceholder || "e.g., Paracetamol, Aspirin..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <button
          className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-200 disabled:opacity-70 disabled:pointer-events-none"
          onClick={handleSearch}
          disabled={isLoading}
        >
          {isLoading ? 'Searching...' : 'Search Stock'}
        </button>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center border border-red-100 flex items-center justify-center gap-2">
            <AlertCircle size={20} /> {error}
          </div>
        ) : !isLoading && searched && results.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-500 font-medium">No pharmacies found with "{searchTerm}" in stock.</p>
            <p className="text-xs text-slate-400 mt-1">Try checking the spelling or searching for a generic name.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((pharmacy, index) => (
              <PharmacyCard
                key={`${pharmacy.name}-${index}`}
                pharmacy={pharmacy}
                onAddToCart={addToCart}
                medicineName={searchTerm} // Pass current search term as medicine name
              />
            ))}
          </div>
        )}
      </div>

      {/* --- CART MODAL / DRAWER --- */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowCart(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto animate-slide-in-right">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <ShoppingCart className="text-blue-600" /> Your Cart
              </h2>
              <button onClick={() => setShowCart(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={24} className="text-slate-500" />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-20 opacity-50">
                <ShoppingCart size={48} className="mx-auto mb-4 text-slate-300" />
                <p className="text-slate-500 font-medium">Your cart is empty</p>
                <button onClick={() => setShowCart(false)} className="mt-4 text-blue-600 font-bold hover:underline">Start Shopping</button>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedCart).map(([pharmacyName, items]) => {
                  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

                  return (
                    <div key={pharmacyName} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50">
                      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-200">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                          <Pill size={16} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-sm">{pharmacyName}</h3>
                          <p className="text-xs text-slate-500">{items.length} items</p>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        {items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-100 shadow-sm">
                            <div>
                              <p className="font-bold text-slate-700 text-sm">{item.medicineName}</p>
                              <p className="text-xs text-slate-400">Qty: {item.quantity} units</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-slate-800 text-sm">₹{item.price * item.quantity}</span>
                              <button
                                onClick={() => removeFromCart(cart.indexOf(item))}
                                className="text-red-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                        <div>
                          <p className="text-xs text-slate-500 font-bold uppercase">Total</p>
                          <p className="text-xl font-bold text-slate-900">₹{total}</p>
                        </div>
                        <button
                          onClick={() => placeOrder(pharmacyName)}
                          className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2"
                        >
                          Place Order <CheckCircle size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NearbyMedicines;
