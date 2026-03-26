import React, { useState, useEffect } from "react";
import { LogOut, LayoutDashboard, Package, ShoppingCart, Settings, Store, Search, Bell, Menu, ChevronRight, TrendingUp, Activity, Clock, Map } from "lucide-react";
import PharmacyDetails from "./PharmacyDetails";
import StockManager from "./StockManager";
import OrdersPanel from "./OrdersPanel";
import NearbyStock from "./NearbyStock";

const PharmacyDashboard = ({ t, onLogout }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [pharmacyData, setPharmacyData] = useState(null);

  // Theme Colors - Professional Medical/Retail Theme
  const theme = {
    sidebarBg: "bg-white",
    mainBg: "bg-slate-50/50",
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/v1/pharmacy/profile');
      if (res.ok) {
        const data = await res.json();
        setPharmacyData(data);
      }
    } catch (e) {
      console.error("Failed to load profile", e);
    }
  };

  // Mock Detection
  const isMockAccount = pharmacyData?.email === 'pharma@test.com';

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Top Stats Row - Conditional */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard icon={Package} label="Total Inventory" value={pharmacyData?.stock?.length || 0} sub="Items in stock" color="emerald" />
              {isMockAccount ? (
                <>
                  <StatCard icon={ShoppingCart} label="Active Orders" value="3" sub="2 pending" color="blue" />
                  <StatCard icon={TrendingUp} label="Daily Revenue" value="₹12,450" sub="+15% from yesterday" color="indigo" />
                  <StatCard icon={Activity} label="Store Health" value="98%" sub="Fully Operational" color="teal" />
                </>
              ) : (
                <>
                  <StatCard icon={ShoppingCart} label="Active Orders" value="0" sub="No active orders" color="slate" />
                  <StatCard icon={TrendingUp} label="Daily Revenue" value="₹0" sub="Tracking started" color="slate" />
                  <StatCard icon={Activity} label="Store Health" value="--" sub="Gathering data" color="slate" />
                </>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Chart Section */}
              <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">Revenue Analytics</h3>
                    <p className="text-sm text-slate-400">{isMockAccount ? "Monthly sales performance" : "Data collection in progress"}</p>
                  </div>
                  {isMockAccount && (
                    <select className="bg-slate-50 border-none text-sm font-bold text-slate-600 rounded-lg p-2 outline-none cursor-pointer hover:bg-slate-100">
                      <option>Last 6 Months</option>
                      <option>Last Year</option>
                    </select>
                  )}
                </div>

                {isMockAccount ? (
                  <RevenueChart />
                ) : (
                  <div className="h-48 w-full flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400">
                    <TrendingUp size={32} className="mb-2 opacity-50" />
                    <p className="font-medium text-sm">Analytics will appear here as you process orders.</p>
                  </div>
                )}
              </div>

              {/* Recent Activity Feed */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col">
                <h3 className="font-bold text-slate-800 text-lg mb-4">Recent Activity</h3>
                <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                  {isMockAccount ? (
                    <>
                      <ActivityItem icon={ShoppingCart} color="blue" title="New Order #1024" time="10 min ago" desc="Received from Rahul S." />
                      <ActivityItem icon={Package} color="emerald" title="Stock Updated" time="1 hour ago" desc="Added 50 units of Paracetamol" />
                      <ActivityItem icon={Settings} color="slate" title="Profile Updated" time="3 hours ago" desc="Changed opening hours" />
                      <ActivityItem icon={ShoppingCart} color="rose" title="Order #1021 Cancelled" time="Yesterday" desc="Patient cancelled request" />
                    </>
                  ) : (
                    <div className="text-center py-10 text-slate-400">
                      <Clock size={24} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No recent activity.</p>
                    </div>
                  )}
                </div>
                {isMockAccount && (
                  <button className="mt-4 w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-xl transition-all text-sm">
                    View Full Log
                  </button>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 rounded-3xl text-white shadow-2xl shadow-emerald-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Manage Your Pharmacy Efficiency</h3>
                  <p className="text-emerald-100 max-w-lg">
                    Access quick tools to restock low inventory, process pending orders, or find stock in other branches.
                  </p>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setActiveTab('inventory')} className="px-6 py-3 bg-white text-emerald-700 font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                    <Package className="inline mr-2" size={18} /> Restock Now
                  </button>
                  <button onClick={() => setActiveTab('nearby')} className="px-6 py-3 bg-emerald-700/50 border border-white/20 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all">
                    <Map className="inline mr-2" size={18} /> Find Stock
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'inventory': return <StockManager pharmacy={pharmacyData} onUpdateProfile={fetchProfile} />;
      case 'orders': return <OrdersPanel />;
      case 'nearby': return <NearbyStock chainName={pharmacyData?.chain_name} district={pharmacyData?.district} state={pharmacyData?.state} />;
      case 'settings': return (
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 max-w-4xl mx-auto animation-fade-in">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Store Configuration</h2>
          <PharmacyDetails pharmacy={pharmacyData || {}} onDetailsChange={() => { }} theme="light" />
        </div>
      );
      default: return null;
    }
  }

  return (
    <div className={`flex min-h-screen ${theme.mainBg} font-sans text-slate-900`}>

      {/* Sidebar */}
      <aside
        className={`${isSidebarOpen ? 'w-72' : 'w-24'} bg-white border-r border-slate-200 shadow-2xl transition-all duration-300 ease-in-out fixed h-full z-20 hidden md:flex flex-col`}
      >
        <div className={`flex items-center ${isSidebarOpen ? 'justify-between p-6' : 'justify-center flex-col gap-4 py-6'}`}>
          <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}>
            <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 cursor-pointer" onClick={() => !isSidebarOpen && setIsSidebarOpen(true)}>
              <Store size={24} />
            </div>
            {isSidebarOpen && (
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
                Pharma<span className="font-extrabold">Connect</span>
              </span>
            )}
          </div>
          {isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ChevronRight size={18} className="rotate-180" />
            </button>
          )}
        </div>

        {/* Floating Expand Button (User Requested Fix) */}
        {!isSidebarOpen && (
          <div className="flex justify-center mb-6 w-full relative">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="absolute -right-3 top-[-10px] p-1.5 bg-white border border-slate-200 rounded-full shadow-md text-emerald-600 hover:scale-110 transition-all z-50"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        <nav className="flex-1 px-4 space-y-3 mt-4">
          {isSidebarOpen && <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Main Menu</p>}

          <NavItem icon={LayoutDashboard} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} isOpen={isSidebarOpen} />
          <NavItem icon={Package} label="Inventory" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} isOpen={isSidebarOpen} />
          <NavItem icon={ShoppingCart} label="Orders" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} isOpen={isSidebarOpen} badge={isMockAccount ? "3" : null} />
          <NavItem icon={Map} label="Nearby Stock" active={activeTab === 'nearby'} onClick={() => setActiveTab('nearby')} isOpen={isSidebarOpen} /> {/* NEW TAB */}

          <div className="pt-4 mt-4 border-t border-slate-100">
            <NavItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} isOpen={isSidebarOpen} />
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={onLogout}
            className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all ${isSidebarOpen
              ? 'hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-medium'
              : 'justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50'
              }`}
          >
            <LogOut size={20} />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'md:ml-72' : 'md:ml-24'}`}>
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{pharmacyData?.chain_name || "Pharmacy Dashboard"}</h1>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              Online • {pharmacyData?.district || "Unknown Location"}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex bg-slate-100 rounded-full px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200">
              <Clock size={16} className="inline mr-2 -mt-0.5 text-slate-400" />
              Opens: {pharmacyData?.opening_time || "--:--"} - Closes: {pharmacyData?.closing_time || "--:--"}
            </div>
            <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-emerald-700 font-bold border border-slate-300 shadow-inner">
              {pharmacyData?.chain_name?.[0] || "P"}
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="p-8 max-w-7xl mx-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

// --- Helpers & Widgets ---

const NavItem = ({ icon: Icon, label, active, onClick, isOpen, badge }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 w-full p-3 rounded-2xl transition-all duration-200 group relative ${active
      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 font-bold transform scale-105'
      : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-700 font-medium'
      } ${!isOpen && 'justify-center'}`}
    title={!isOpen ? label : ''}
  >
    <Icon size={20} className={active ? "text-white" : ""} />
    {isOpen && <span className="flex-1 text-left">{label}</span>}
    {isOpen && badge && (
      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${active ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-600'}`}>
        {badge}
      </span>
    )}
  </button>
);

const StatCard = ({ icon: Icon, label, value, sub, color }) => {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    teal: 'bg-teal-50 text-teal-600',
    slate: 'bg-slate-50 text-slate-500' // Added Slate
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-slate-200/60 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-4 rounded-2xl ${colors[color]} group-hover:scale-110 transition-transform`}>
          <Icon size={24} />
        </div>
        {/* Micro Chart Placeholder */}
        <div className="flex gap-0.5 items-end h-8 opacity-30">
          <div className="w-1 bg-slate-800 h-2 rounded-t"></div>
          <div className="w-1 bg-slate-800 h-4 rounded-t"></div>
          <div className="w-1 bg-slate-800 h-3 rounded-t"></div>
          <div className="w-1 bg-slate-800 h-6 rounded-t"></div>
        </div>
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <h4 className="text-3xl font-extrabold text-slate-800 tracking-tight">{value}</h4>
        </div>
        <p className="text-xs font-medium text-slate-500 mt-2 flex items-center gap-1">
          {sub.includes('+') ? <TrendingUp size={12} className="text-emerald-500" /> : null}
          {sub}
        </p>
      </div>
    </div>
  );
};

const ActivityItem = ({ icon: Icon, color, title, time, desc }) => {
  const colors = {
    emerald: 'bg-emerald-100 text-emerald-600',
    blue: 'bg-blue-100 text-blue-600',
    rose: 'bg-rose-100 text-rose-600',
    slate: 'bg-slate-100 text-slate-600'
  };
  return (
    <div className="flex gap-4 items-start group">
      <div className={`min-w-[40px] h-10 rounded-full flex items-center justify-center ${colors[color]} mt-1`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 pb-4 border-b border-slate-50 group-last:border-none">
        <div className="flex justify-between">
          <h5 className="font-bold text-slate-700 text-sm">{title}</h5>
          <span className="text-[10px] font-bold text-slate-400 uppercase">{time}</span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
      </div>
    </div>
  )
}

const RevenueChart = () => (
  <div className="h-48 w-full flex justify-between gap-2 px-2"> {/* Removed items-end */}
    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
      <div key={i} className="w-full h-full bg-slate-50 rounded-t-xl relative group overflow-hidden hover:bg-emerald-50 transition-colors"> {/* Added h-full */}
        <div
          className="absolute bottom-0 left-0 w-full bg-emerald-500/80 rounded-t-xl transition-all duration-500 group-hover:bg-emerald-500"
          style={{ height: `${h}%` }}
        ></div>
        {/* Tooltip */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
          ₹{h * 100}
        </div>
      </div>
    ))}
  </div>
);

export default PharmacyDashboard;