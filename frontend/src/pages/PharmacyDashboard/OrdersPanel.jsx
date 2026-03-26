import React, { useState } from 'react';
import { Clock, CheckCircle, XCircle, FileText, ChevronRight, User } from 'lucide-react';

const OrdersPanel = () => {
    // Mock Data for Demo
    const [orders, setOrders] = useState([
        { id: 101, patient: "Rahul Sharma", items: 3, status: "pending", time: "10 min ago", total: 450 },
        { id: 102, patient: "Priya Singh", items: 1, status: "pending", time: "25 min ago", total: 120 },
        { id: 103, patient: "Amit Verma", items: 5, status: "ready", time: "1 hour ago", total: 1250 },
        { id: 104, patient: "Sneha Gupta", items: 2, status: "completed", time: "2 hours ago", total: 340 },
    ]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'ready': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Prescription Orders</h2>
                    <p className="text-slate-500">Manage incoming orders from patients</p>
                </div>
                <div className="flex gap-2">
                    <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <span className="text-xs text-slate-400 font-bold uppercase block">Pending</span>
                        <span className="text-xl font-bold text-amber-500">{orders.filter(o => o.status === 'pending').length}</span>
                    </div>
                    <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <span className="text-xs text-slate-400 font-bold uppercase block">Revenue</span>
                        <span className="text-xl font-bold text-emerald-600">₹{orders.reduce((acc, curr) => acc + curr.total, 0)}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {orders.map(order => (
                    <div key={order.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                    <User size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">{order.patient}</h3>
                                    <p className="text-xs text-slate-500">Order #{order.id}</p>
                                </div>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)} uppercase tracking-wider`}>
                                {order.status}
                            </span>
                        </div>

                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Medicines</span>
                                <span className="font-medium text-slate-700">{order.items} Items</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Total Bill</span>
                                <span className="font-bold text-emerald-600">₹{order.total}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Received</span>
                                <span className="flex items-center gap-1 text-slate-600">
                                    <Clock size={14} /> {order.time}
                                </span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex gap-2">
                            {order.status === 'pending' && (
                                <>
                                    <button className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-colors">Accept</button>
                                    <button className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors"><XCircle size={18} /></button>
                                </>
                            )}
                            {order.status === 'ready' && (
                                <button className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors">Mark as Picked Up</button>
                            )}
                            {order.status === 'completed' && (
                                <button className="flex-1 py-2 bg-slate-100 text-slate-400 rounded-xl text-sm font-bold cursor-not-allowed">Archived</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600 mt-1"><FileText size={18} /></div>
                <div>
                    <h4 className="font-bold text-blue-800">Coming Soon: Digital Prescriptions</h4>
                    <p className="text-sm text-blue-600 mt-1">
                        In Phase 2, patients will be able to send digital prescriptions directly to your dashboard.
                        You will see strict PDF attachments and doctor notes here.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OrdersPanel;
