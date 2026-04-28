import { useState, useEffect, useCallback } from "react";
import * as inventoryApi from "../../api/inventory.api";
import Topbar from "../../components/layout/Topbar";
import Sidebar from "../../components/layout/Sidebar";
import { 
  Package, ShoppingCart, AlertTriangle, CheckCircle, 
  ArrowUpRight, RefreshCw, Plus, Search, Filter, 
  ChevronRight, Truck, Info, History, Zap
} from "lucide-react";

export default function ManagerInventory() {
  const [ingredients, setIngredients] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // all, low, tracking

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [ingRes, lsRes] = await Promise.all([
        inventoryApi.getIngredients(),
        inventoryApi.getLowStockIngredients()
      ]);
      setIngredients(ingRes?.results || ingRes || []);
      setLowStock(lsRes?.results || lsRes || []);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredIngredients = ingredients.filter(ing => 
    ing.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (activeTab === "all" || (activeTab === "low" && ing.quantity <= ing.min_stock_level))
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
                  <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">Supply <span className="text-emerald-600 dark:text-emerald-400">Vault</span></h1>
                  <div className="flex items-center gap-3 bg-white dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-full px-4 py-1.5 w-fit shadow-sm">
                    <Package size={14} className="text-emerald-500 animate-pulse" />
                    <p className="text-[10px] font-black text-slate-500 dark:text-emerald-300 uppercase tracking-[0.3em] font-mono">SUPPLY_OVERSIGHT // NODE_SYNC: ACTIVE</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={fetchData} className="p-4 bg-white dark:bg-white/5 text-slate-400 rounded-2xl border border-slate-200 dark:border-white/10 hover:text-emerald-500 transition-all">
                    <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                  </button>
                  <button className="flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-emerald-500 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-500/20">
                    <Plus size={18} /> New Request
                  </button>
                </div>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 rounded-4xl bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 shadow-xl flex items-center justify-between group">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Stockpiles</p>
                    <h3 className="text-4xl font-black text-slate-900 dark:text-white italic tracking-tighter">{ingredients.length}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500"><Package size={24} /></div>
                </div>
                <div className="p-8 rounded-4xl bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 shadow-xl flex items-center justify-between group">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Depletion Warning</p>
                    <h3 className="text-4xl font-black text-rose-500 italic tracking-tighter">{lowStock.length}</h3>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500"><AlertTriangle size={24} /></div>
                </div>
                <div className="p-8 rounded-4xl bg-emerald-600 text-white shadow-2xl relative overflow-hidden group">
                  <Truck size={80} className="absolute -right-8 -bottom-8 opacity-10" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Supply Chain Status</p>
                    <h3 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Secure</h3>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <CheckCircle size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">All protocols normalized</span>
                  </div>
                </div>
              </div>

              {/* Inventory Management Area */}
              <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-4xl overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex gap-4">
                    <button onClick={() => setActiveTab("all")} className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === "all" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" : "bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-emerald-500"}`}>All Stock</button>
                    <button onClick={() => setActiveTab("low")} className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === "low" ? "bg-rose-500 text-white shadow-lg shadow-rose-500/20" : "bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-rose-500"}`}>Critical Only</button>
                    <button onClick={() => setActiveTab("tracking")} className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === "tracking" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" : "bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-emerald-500"}`}>Restock Logs</button>
                  </div>
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-2 text-xs font-black uppercase outline-none focus:border-emerald-500 dark:text-white"
                      placeholder="SCAN MATERIAL..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="overflow-x-auto min-h-100">
                  {activeTab === "tracking" ? (
                    <div className="p-20 text-center space-y-4">
                       <History size={48} className="mx-auto text-slate-200 dark:text-white/10" />
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">No supply chain movements recorded in current epoch.</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50/50 dark:bg-white/5">
                          <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Supply Node</th>
                          <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Volume Level</th>
                          <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Safety Range</th>
                          <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Supplier Info</th>
                          <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {filteredIngredients.length > 0 ? filteredIngredients.map((ing) => (
                           <tr key={ing.id} className="hover:bg-slate-50/30 dark:hover:bg-white/5 transition-colors group">
                            <td className="px-8 py-6">
                              <div className="flex flex-col">
                                <span className="text-slate-900 dark:text-white font-black uppercase text-sm italic group-hover:text-emerald-500 transition-colors">{ing.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">MAT_{ing.id.toString().padStart(4, "0")}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-black text-slate-900 dark:text-white font-mono">{ing.quantity} {ing.unit}</span>
                                <div className="h-1 w-12 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                                   <div 
                                      className={`h-full ${ing.quantity <= ing.min_stock_level ? "bg-rose-500" : "bg-emerald-500"}`} 
                                      style={{ width: `${Math.min((ing.quantity / (ing.min_stock_level * 2)) * 100, 100)}%` }} 
                                   />
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{ing.min_stock_level} {ing.unit} MIN</span>
                            </td>
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-2">
                                  <div className="p-1 px-2 border border-slate-200 dark:border-white/10 text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                    {ing.supplier || "DEFAULT_SYNC"}
                                  </div>
                               </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                               <button className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all">
                                  <ArrowUpRight size={16} />
                               </button>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan="5" className="px-8 py-20 text-center text-slate-400 font-black text-[10px] uppercase tracking-widest">No matching supply nodes found in vault.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Suggestion & Plans Area */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 rounded-4xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-4 mb-6 text-emerald-500">
                      <Zap size={24} />
                      <h3 className="text-xl font-black uppercase italic tracking-tighter">AI Restock Calibration</h3>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest leading-relaxed">
                      Nexus_AI suggests prioritizing <span className="text-emerald-500">Coffee Beans</span> and <span className="text-emerald-500">Milk</span> based on tomorrow's predicted peak at 18:00.
                    </p>
                  </div>
                  <div className="mt-8 flex gap-3">
                     <button className="flex-1 py-3 border border-slate-200 dark:border-white/10 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">Dismiss</button>
                     <button className="flex-1 py-3 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg">Confirm Plan</button>
                  </div>
                </div>

                <div className="p-8 rounded-4xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 shadow-xl flex items-center justify-between">
                   <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Info size={16} className="text-emerald-500" />
                        <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase italic">Supplier Directory</h4>
                      </div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Access read-only contact logs and delivery protocols for your assigned supply nodes.</p>
                      <button className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest hover:translate-x-2 transition-transform">
                        Launch Directory <ChevronRight size={14} />
                      </button>
                   </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
