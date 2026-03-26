import React, { useState, useEffect } from "react";
import { Plus, Trash2, Search, Package, AlertCircle, Save, X, Edit2 } from "lucide-react";

function StockManager({ pharmacy, onUpdateProfile }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [stockList, setStockList] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newMed, setNewMed] = useState({ name: "", quantity: 10, price: 0 });
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    // Pharmacy prop now has the new array structure from backend
    if (pharmacy?.stock && Array.isArray(pharmacy.stock)) {
      setStockList(pharmacy.stock);
    }
  }, [pharmacy]);

  // Filtering
  const filteredStock = stockList.filter(item =>
    item.medicine_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Actions ---

  const handleAdd = async () => {
    if (!newMed.name) return;
    try {
      const res = await fetch('/api/v1/pharmacy/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicine_name: newMed.name,
          quantity: parseInt(newMed.quantity),
          price: parseFloat(newMed.price)
        })
      });
      if (res.ok) {
        const data = await res.json();
        // Optimistic update or refetch
        setStockList(prev => [...prev, data.item]);
        setNewMed({ name: "", quantity: 10, price: 0 });
        setIsAdding(false);
      }
    } catch (e) {
      alert("Failed to add");
    }
  };

  const handleUpdate = async (id) => {
    try {
      const res = await fetch(`/api/v1/pharmacy/stock/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: parseInt(editForm.quantity),
          price: parseFloat(editForm.price)
        })
      });
      if (res.ok) {
        setStockList(prev => prev.map(item => item.id === id ? { ...item, ...editForm } : item));
        setEditId(null);
      }
    } catch (e) {
      alert("Failed to update");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      const res = await fetch(`/api/v1/pharmacy/stock/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setStockList(prev => prev.filter(item => item.id !== id));
      }
    } catch (e) {
      alert("Failed to delete");
    }
  };

  const startEdit = (item) => {
    setEditId(item.id);
    setEditForm({ ...item, quantity: item.quantity, price: item.price });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header & Toolbar */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Package className="text-emerald-600" size={20} />
              Inventory Management
            </h3>
            <p className="text-slate-500 text-sm">Track and update stock levels</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search medicines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm w-64 transition-all"
              />
            </div>
            <button
              onClick={() => setIsAdding(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all flex items-center gap-2 text-sm shadow-md shadow-emerald-200"
            >
              <Plus size={18} /> Add Medicine
            </button>
          </div>
        </div>
      </div>

      {/* Add Row (Inline) */}
      {isAdding && (
        <div className="p-4 bg-emerald-50 border-b border-emerald-100 grid grid-cols-1 md:grid-cols-12 gap-4 items-center animate-in slide-in-from-top-2">
          <div className="md:col-span-5">
            <input autoFocus type="text" placeholder="Medicine Name" className="w-full bg-white px-3 py-2 rounded-lg border border-emerald-200 outline-none focus:border-emerald-500" value={newMed.name} onChange={e => setNewMed({ ...newMed, name: e.target.value })} />
          </div>
          <div className="md:col-span-3">
            <input type="number" placeholder="Qty" className="w-full bg-white px-3 py-2 rounded-lg border border-emerald-200 outline-none focus:border-emerald-500" value={newMed.quantity} onChange={e => setNewMed({ ...newMed, quantity: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <input type="number" placeholder="Price" className="w-full bg-white px-3 py-2 rounded-lg border border-emerald-200 outline-none focus:border-emerald-500" value={newMed.price} onChange={e => setNewMed({ ...newMed, price: e.target.value })} />
          </div>
          <div className="md:col-span-2 flex gap-2">
            <button onClick={handleAdd} className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"><Save size={18} /></button>
            <button onClick={() => setIsAdding(false)} className="p-2 bg-white text-slate-500 border border-slate-200 rounded-lg hover:text-rose-500"><X size={18} /></button>
          </div>
        </div>
      )}

      {/* Table Header */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
        <div className="col-span-5">Product Name</div>
        <div className="col-span-3">Stock Level</div>
        <div className="col-span-2">Unit Price</div>
        <div className="col-span-2 text-right">Actions</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-100">
        {filteredStock.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
              <Package size={32} />
            </div>
            <p>No inventory found.</p>
          </div>
        ) : (
          filteredStock.map(item => (
            <div key={item.id} className={`grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50/80 transition-colors group`}>

              {/* Name */}
              <div className="col-span-5 font-semibold text-slate-700 flex items-center gap-2">
                {item.quantity < 10 && (
                  <div className="w-2 h-2 rounded-full bg-amber-500 mr-1" title="Low Stock"></div>
                )}
                {item.medicine_name}
              </div>

              {/* Quantity */}
              <div className="col-span-3">
                {editId === item.id ? (
                  <input type="number" value={editForm.quantity} onChange={e => setEditForm({ ...editForm, quantity: e.target.value })} className="w-24 bg-white border border-emerald-500 rounded px-2 py-1 text-slate-800" />
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-full bg-slate-100 rounded-full h-2 max-w-[100px] overflow-hidden">
                      <div className={`h-full rounded-full ${item.quantity < 10 ? 'bg-amber-400' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, item.quantity)}%` }}></div>
                    </div>
                    <span className={`text-sm font-bold ${item.quantity < 10 ? 'text-amber-500' : 'text-slate-500'}`}>{item.quantity}</span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="col-span-2 font-mono text-slate-600 font-medium">
                {editId === item.id ? (
                  <input type="number" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} className="w-24 bg-white border border-emerald-500 rounded px-2 py-1 text-slate-800" />
                ) : (
                  <span>₹{item.price.toFixed(2)}</span>
                )}
              </div>

              {/* Actions */}
              <div className="col-span-2 flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                {editId === item.id ? (
                  <>
                    <button onClick={() => handleUpdate(item.id)} className="p-1.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg"><Save size={16} /></button>
                    <button onClick={() => setEditId(null)} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"><X size={16} /></button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(item)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default StockManager;