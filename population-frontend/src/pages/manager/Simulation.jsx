import { useState, useEffect, useCallback } from "react";
import { commonApi } from "../../api/common.api";
import Topbar from "../../components/layout/Topbar";
import Sidebar from "../../components/layout/Sidebar";
import { 
  Users, MapPin, Layout, Activity, ArrowUpRight, Plus, 
  Search, Filter, CheckCircle, Clock, MoreVertical, 
  Monitor, Info, Zap
} from "lucide-react";

export default function ManagerSimulation() {
  const [households, setHouseholds] = useState([]);
  const [activePopulation, setActivePopulation] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [hRes, pRes, zRes] = await Promise.all([
        commonApi.getHouseholds(),
        commonApi.getPopulation({ status: "Active" }),
        commonApi.getZones()
      ]);
      setHouseholds(hRes.data?.results || hRes.data || []);
      setActivePopulation(pRes.data?.results || pRes.data || []);
      setZones(zRes.data?.results || zRes.data || []);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  console.log("LOAD_SYNC:", loading);

  const filteredHouseholds = households.filter(h => 
    h.location_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.zone_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-linear-to-br dark:from-emerald-950 dark:via-slate-900 dark:to-black relative overflow-hidden transition-colors duration-500 italic">
      <div className="flex relative z-10 w-full h-screen">
        <Sidebar role="manager" />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 relative z-10">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Header Section */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                  <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">Node <span className="text-emerald-600 dark:text-emerald-400">Control</span></h1>
                  <div className="flex items-center gap-3 bg-white dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-full px-4 py-1.5 w-fit shadow-sm">
                    <Monitor size={14} className="text-emerald-500 animate-pulse" />
                    <p className="text-[10px] font-black text-slate-500 dark:text-emerald-300 uppercase tracking-[0.3em] font-mono">SEATING_GRID // NODE_POOL: {households.length} // ACTIVE: {activePopulation.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-emerald-500 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-500/20">
                    <Plus size={18} /> Initialize Node
                  </button>
                </div>
              </div>

              {/* Grid Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 {zones.map(zone => {
                    const zoneNodes = households.filter(h => h.zone_name === zone.name);
                    const zoneActive = activePopulation.filter(p => p.household_zone === zone.name).length;
                    const zoneCap = zoneNodes.reduce((a, b) => a + (b.capacity || 0), 0);
                    return (
                       <div key={zone.id} className="p-6 rounded-3xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-xl group hover:border-emerald-500 transition-all">
                          <div className="flex justify-between items-start mb-4">
                             <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500"><MapPin size={20} /></div>
                             <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{zoneActive}/{zoneCap} Cap</span>
                          </div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase italic">{zone.name}</h4>
                          <div className="mt-4 h-1 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                             <div className="h-full bg-emerald-500" style={{ width: `${(zoneActive/Math.max(zoneCap, 1))*100}%` }} />
                          </div>
                       </div>
                    );
                 })}
              </div>

              {/* Seating Grid Manager */}
              <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-4xl overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Seating Topology Manager</h3>
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-2 text-xs font-black uppercase outline-none focus:border-emerald-500 dark:text-white"
                      placeholder="SEARCH NODE_ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="overflow-x-auto min-h-100">
                   <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50/50 dark:bg-white/5">
                          <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Node Identifier</th>
                          <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Zone Allocation</th>
                          <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Node Load</th>
                          <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Health Status</th>
                          <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Command</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                         {filteredHouseholds.map(h => {
                            const currentLoad = activePopulation.filter(p => p.household_location === h.location_id).length;
                            return (
                               <tr key={h.id} className="hover:bg-slate-50/30 dark:hover:bg-white/5 transition-colors group">
                                  <td className="px-8 py-6">
                                     <div className="flex flex-col">
                                        <span className="text-slate-900 dark:text-white font-black uppercase text-sm italic group-hover:text-emerald-500 transition-colors">{h.location_id}</span>
                                        <span className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">ADDR: {h.address || "GRID_INTERNAL"}</span>
                                     </div>
                                  </td>
                                  <td className="px-8 py-6">
                                     <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-black rounded-full uppercase tracking-widest border border-emerald-500/20">{h.zone_name}</span>
                                  </td>
                                  <td className="px-8 py-6">
                                     <span className="text-sm font-black text-slate-900 dark:text-white font-mono">{currentLoad} / {h.capacity}</span>
                                  </td>
                                  <td className="px-8 py-6">
                                     <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${currentLoad >= h.capacity ? "bg-amber-500" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"}`} />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{currentLoad >= h.capacity ? "SATURATED" : "AVAILABLE"}</span>
                                     </div>
                                  </td>
                                  <td className="px-8 py-6 text-right">
                                     <button className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"><MoreVertical size={16} /></button>
                                  </td>
                               </tr>
                            );
                         })}
                      </tbody>
                   </table>
                </div>
              </div>

              {/* AI Distribution Insights */}
              <div className="p-8 rounded-4xl bg-emerald-600 text-white shadow-2xl relative overflow-hidden group border border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
                  <div>
                    <div className="flex items-center gap-4 mb-4 text-white">
                      <Zap size={24} className="animate-pulse" />
                      <h3 className="text-2xl font-black uppercase italic tracking-tighter">AI Topology Insights</h3>
                    </div>
                    <p className="text-white/80 text-xs font-black uppercase tracking-widest leading-relaxed max-w-xl">
                      Current node distribution suggests an efficiency rating of 88.4%. Suggest shifting temporary seating protocol to <span className="text-white italic">Outdoor Zone</span> for next peak at 18:00.
                    </p>
                  </div>
                  <button className="px-8 py-4 bg-white text-emerald-600 rounded-2xl font-black text-[10px] uppercase tracking-widest whitespace-nowrap hover:scale-105 active:scale-95 transition-all">Apply Distribution</button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
