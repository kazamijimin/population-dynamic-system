import { useState, useEffect, useCallback } from "react";
import { commonApi } from "../../api/common.api";
import * as inventoryApi from "../../api/inventory.api";
import Topbar from "../../components/layout/Topbar";
import Sidebar from "../../components/layout/Sidebar";
import { 
  Users, Layout, MapPin, Activity, ArrowUpRight, TrendingUp, 
  AlertTriangle, CheckCircle, Clock, ShoppingCart, 
  Package, BarChart3, ArrowDownCircle, RefreshCw, Zap
} from "lucide-react";

export default function ManagerDashboard() {
  const [households, setHouseholds] = useState([]);
  const [activePopulation, setActivePopulation] = useState([]);
  const [zones, setZones] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Simulated Peak Hours Data (In real app, this would come from analytics.api)
  const peakHours = [
    { time: "08:00", load: 45 },
    { time: "12:00", load: 88, peak: true },
    { time: "15:00", load: 62 },
    { time: "18:00", load: 94, peak: true },
    { time: "21:00", load: 30 },
  ];

  const fetchDashboardData = useCallback(async () => {
    try {
      const [hRes, pRes, zRes, lsRes, ingRes] = await Promise.all([
        commonApi.getHouseholds(),
        commonApi.getPopulation({ status: "Active" }),
        commonApi.getZones(),
        inventoryApi.getLowStockIngredients(),
        inventoryApi.getIngredients()
      ]);

      setHouseholds(hRes.data?.results || hRes.data || []);
      setActivePopulation(pRes.data?.results || pRes.data || []);
      setZones(zRes.data?.results || zRes.data || []);
      setLowStock(lsRes?.results || lsRes || []);
      setIngredients(ingRes?.results || ingRes || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
      fetchDashboardData();
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Use refreshKey and zones
  console.log("REFRESH_CYCLE:", refreshKey, "ZONES_ACTIVE:", zones.length);

  const totalCapacity = households.reduce((acc, curr) => acc + (curr.capacity || 0), 0);
  const currentOccupancy = activePopulation.length;
  const occupancyRate = totalCapacity > 0 ? (currentOccupancy / totalCapacity) * 100 : 0;

  const getStatusColor = (rate) => {
    if (rate > 90) return "text-rose-400 bg-rose-500/10 border-rose-500/20";
    if (rate > 70) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  };

  return (
    <div className="min-h-screen bg-emerald-50/30 dark:bg-linear-to-br dark:from-emerald-950 dark:via-slate-900 dark:to-black relative overflow-hidden transition-colors duration-500 italic">
      <div className="flex relative z-10 w-full h-screen">
        <Sidebar role="manager" />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 relative z-10">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Header section with Peak Hour Tracking */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                  <h1 className="text-5xl md:text-6xl font-black text-emerald-900 dark:text-emerald-50 tracking-tighter uppercase italic leading-none">Shop <span className="text-emerald-600 dark:text-emerald-400">Operations</span></h1>
                  <div className="flex items-center gap-3 bg-white dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-full px-4 py-1.5 w-fit shadow-sm">
                    <Activity size={14} className="text-emerald-500 animate-pulse" />
                    <p className="text-[10px] font-black text-emerald-600/70 dark:text-emerald-300 uppercase tracking-[0.3em] font-mono">MANAGER_DASHBOARD // LOAD_STABILITY: {occupancyRate < 80 ? "OPTIMAL" : "CRITICAL"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden lg:flex items-center gap-6 bg-white dark:bg-white/5 px-6 py-3 rounded-2xl border border-slate-200 dark:border-white/10">
                     <div className="flex items-center gap-2">
                        <TrendingUp size={14} className="text-emerald-500" />
                        <span className="text-[10px] font-black uppercase text-emerald-900/80 dark:text-emerald-100/80">Peak Shift: 18:00</span>
                     </div>
                     <div className="w-px h-10 bg-slate-200 dark:bg-white/10" />
                     <div className="flex items-center gap-2">
                        <Clock size={14} className="text-emerald-500" />
                        <span className="text-[10px] font-black uppercase text-emerald-900/80 dark:text-emerald-100/80">Current: {new Date().toLocaleTimeString([], {hour: "2-digit", minute:"2-digit"})}</span>
                     </div>
                  </div>
                  <button onClick={() => setRefreshKey(k => k + 1)} className="p-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-500 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-500/20">
                    <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                  </button>
                </div>
              </div>

              {/* Top Stats: Occupancy & Stocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Live Occupancy (Existing but enhanced) */}
                <div className="col-span-1 lg:col-span-2 p-8 rounded-4xl bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 shadow-xl relative overflow-hidden group">
                  <Users size={120} className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-700 text-emerald-500" />
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500"><Users size={24} /></div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(occupancyRate)}`}>
                      {occupancyRate > 85 ? "High Density" : "Stable Flow"}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-4 mb-4">
                    <span className="text-7xl font-black text-emerald-900 dark:text-emerald-50 italic tracking-tighter">{currentOccupancy}</span>
                    <span className="text-2xl font-black text-emerald-600/40 dark:text-emerald-400/40 italic">/ {totalCapacity}</span>
                  </div>
                  <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400/80 uppercase tracking-widest mb-4">Live Shop Occupancy</p>
                  <div className="w-full bg-slate-100 dark:bg-white/5 h-2 rounded-full overflow-hidden">
                     <div 
                        className={`h-full transition-all duration-1000 ${occupancyRate > 90 ? "bg-rose-500" : occupancyRate > 70 ? "bg-amber-500" : "bg-emerald-500"}`} 
                        style={{ width: `${Math.min(occupancyRate, 100)}%` }} 
                     />
                  </div>
                </div>

                {/* Stock Alerts Card */}
                <div className="p-8 rounded-4xl bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 shadow-xl flex flex-col justify-between group">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500"><AlertTriangle size={24} /></div>
                    {lowStock.length > 0 && (
                      <span className="animate-pulse bg-rose-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Action Required</span>
                    )}
                  </div>
                  <div className="mt-6">
                    <h3 className="text-3xl font-black text-emerald-900 dark:text-emerald-50 italic tracking-tighter">{lowStock.length}</h3>
                    <p className="text-[10px] font-black text-emerald-900 dark:text-emerald-100 uppercase tracking-widest">Critical Stock Alerts</p>
                  </div>
                  <button className="mt-6 w-full py-3 bg-rose-500/10 text-rose-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all">View Depletion</button>
                </div>

                {/* Restocking Summary */}
                <div className="p-8 rounded-4xl bg-emerald-600 text-white shadow-2xl relative overflow-hidden group border border-white/10 flex flex-col justify-between">
                  <ShoppingCart size={80} className="absolute -right-8 -bottom-8 opacity-10 group-hover:rotate-12 transition-transform duration-1000" />
                  <div>
                    <h3 className="text-xl font-black uppercase italic tracking-tighter">Supply Chain</h3>
                    <p className="text-white/70 text-[10px] font-medium mt-1">Suggested restocking plans available.</p>
                  </div>
                  <div className="mt-8 space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-black border-b border-white/10 pb-2">
                       <span className="text-white/60">ACTIVE REQUESTS</span>
                       <span>04</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black border-b border-white/10 pb-2">
                       <span className="text-white/60">NEXT SHIPMENT</span>
                       <span>IN 4.2H</span>
                    </div>
                  </div>
                  <button className="mt-6 w-full py-3 bg-white text-emerald-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">Restock Wizard</button>
                </div>
              </div>

              {/* Main Content Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Daily Sales & Peak Hours Monitor */}
                <div className="lg:col-span-1 p-8 rounded-4xl bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 shadow-xl">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-emerald-900 dark:text-emerald-50 uppercase italic tracking-tighter">Peak Load Matrix</h3>
                    <Activity size={18} className="text-emerald-500" />
                  </div>
                  <div className="space-y-6">
                    {peakHours.map((hour, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className={`text-[10px] font-black uppercase ${hour.peak ? "text-emerald-500" : "text-emerald-900/40 dark:text-emerald-400/40"}`}>
                            {hour.time} {hour.peak && " (Peak)"}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-900/40 dark:text-emerald-400/40">{hour.load}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                           <div 
                              className={`h-full transition-all duration-1000 ${hour.peak ? "bg-emerald-500" : "bg-emerald-200 dark:bg-emerald-900/20"}`} 
                              style={{ width: `${hour.load}%` }} 
                           />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inventory Overview (Read-only for Manager) */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-4xl overflow-hidden shadow-2xl">
                  <div className="p-8 border-b border-slate-100 dark:divide-white/5 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black text-emerald-900 dark:text-emerald-50 uppercase italic tracking-tighter">Supply Availability</h3>
                      <p className="text-[10px] font-black text-emerald-700/50 dark:text-emerald-400/50 uppercase tracking-widest mt-1">Read-only synchronized node data</p>
                    </div>
                    <div className="flex gap-2">
                       <button className="p-2 border border-slate-200 dark:border-white/10 rounded-xl text-emerald-600/40 hover:text-emerald-500 transition-colors"><Layout size={16} /></button>
                       <button className="p-2 border border-slate-200 dark:border-white/10 rounded-xl text-emerald-600/40 hover:text-emerald-500 transition-colors"><Package size={16} /></button>
                    </div>
                  </div>
                  <div className="overflow-x-auto max-h-100">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50/50 dark:bg-white/5">
                          <th className="px-8 py-4 text-left text-[10px] font-black text-emerald-900/40 dark:text-emerald-400/40 uppercase tracking-[0.2em]">Material</th>
                          <th className="px-8 py-4 text-left text-[10px] font-black text-emerald-900/40 dark:text-emerald-400/40 uppercase tracking-[0.2em]">Current Volume</th>
                          <th className="px-8 py-4 text-left text-[10px] font-black text-emerald-900/40 dark:text-emerald-400/40 uppercase tracking-[0.2em]">Safety Margin</th>
                          <th className="px-8 py-4 text-left text-[10px] font-black text-emerald-900/40 dark:text-emerald-400/40 uppercase tracking-[0.2em]">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {ingredients.slice(0, 10).map((ing) => (
                          <tr key={ing.id} className="hover:bg-emerald-50/30 dark:hover:bg-white/5 transition-colors">
                            <td className="px-8 py-4">
                              <div className="flex flex-col">
                                <span className="text-emerald-950 dark:text-emerald-50 font-black uppercase text-xs italic">{ing.name}</span>
                                <span className="text-[8px] text-emerald-700/40 dark:text-emerald-400/40 uppercase font-mono tracking-tighter">SUPPLIER: {ing.supplier || "GLOBAL_SYNC"}</span>
                              </div>
                            </td>
                            <td className="px-8 py-4">
                              <span className="text-xs font-black text-emerald-800 dark:text-emerald-200 font-mono">{ing.quantity} {ing.unit}</span>
                            </td>
                            <td className="px-8 py-4 font-mono text-[10px] text-emerald-700/40 dark:text-emerald-400/40 tracking-tighter">
                              {ing.min_stock_level} {ing.unit}
                            </td>
                            <td className="px-8 py-4">
                               <div className="flex items-center gap-2">
                                  <div className={`w-1.5 h-1.5 rounded-full ${ing.quantity <= ing.min_stock_level ? "bg-rose-500 pulse" : "bg-emerald-500"}`} />
                                  <span className={`text-[10px] font-black uppercase tracking-widest ${ing.quantity <= ing.min_stock_level ? "text-rose-500" : "text-emerald-500"}`}>
                                    {ing.quantity <= ing.min_stock_level ? "DEPLETED" : "SECURE"}
                                  </span>
                               </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Seating Registry (Existing from previous but refined) */}
              <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-4xl overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-slate-100 dark:divide-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl"><Users size={20} /></div>
                    <h3 className="text-xl font-black text-emerald-900 dark:text-emerald-50 uppercase italic tracking-tighter">Live Node Assignments</h3>
                  </div>
                  <button className="px-6 py-2 bg-emerald-950 dark:bg-emerald-50 text-white dark:text-emerald-950 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">Optimize Seating</button>
                </div>
                <div className="overflow-x-auto">
                    {/* ... (Existing table implementation remains consistent) ... */}
                    <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50/50 dark:bg-white/5">
                        <th className="px-8 py-6 text-left text-[10px] font-black text-emerald-900/40 dark:text-emerald-400/40 uppercase tracking-[0.2em]">Customer Node</th>
                        <th className="px-8 py-6 text-left text-[10px] font-black text-emerald-900/40 dark:text-emerald-400/40 uppercase tracking-[0.2em]">Assignment</th>
                        <th className="px-8 py-6 text-left text-[10px] font-black text-emerald-900/40 dark:text-emerald-400/40 uppercase tracking-[0.2em]">Zone</th>
                        <th className="px-8 py-6 text-left text-[10px] font-black text-emerald-900/40 dark:text-emerald-400/40 uppercase tracking-[0.2em]">Status</th>
                        <th className="px-8 py-6 text-right text-[10px] font-black text-emerald-900/40 dark:text-emerald-400/40 uppercase tracking-[0.2em]">View</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {activePopulation.length > 0 ? activePopulation.map((person) => (
                        <tr key={person.id} className="hover:bg-emerald-50/30 dark:hover:bg-white/5 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                              <span className="text-emerald-950 dark:text-emerald-50 font-black uppercase text-sm italic group-hover:text-emerald-500 transition-colors">{person.name}</span>
                              <span className="text-[10px] text-emerald-700/40 dark:text-emerald-400/40 font-mono tracking-tighter">UID_{person.id.toString().padStart(4, "0")}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="px-3 py-1 bg-emerald-500/5 dark:bg-white/5 text-emerald-700 dark:text-emerald-300 text-[9px] font-black rounded-full uppercase border border-emerald-500/20 dark:border-white/10">TABLE_{person.household_location || "N/A"}</span>
                          </td>
                          <td className="px-8 py-6 text-xs font-black text-emerald-700/40 dark:text-emerald-400/40 uppercase italic">
                            {person.household_zone || "UNKNOWN"}
                          </td>
                          <td className="px-8 py-6 text-[10px] font-black text-emerald-500 uppercase flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> IN_SHOP
                          </td>
                          <td className="px-8 py-6 text-right">
                             <ArrowUpRight size={18} className="text-emerald-700/40 group-hover:text-emerald-500 inline transition-colors" />
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="5" className="px-8 py-20 text-center text-emerald-700/40 font-black text-[10px] uppercase tracking-widest italic">No active customer units detected.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
