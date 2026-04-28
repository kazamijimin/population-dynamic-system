import { useState, useEffect, useCallback } from "react";
import * as inventoryApi from "../../api/inventory.api";
import { commonApi } from "../../api/common.api";
import Topbar from "../../components/layout/Topbar";
import Sidebar from "../../components/layout/Sidebar";
import { 
  BarChart3, TrendingUp, TrendingDown, DollarSign, 
  Clock, Package, AlertTriangle, ArrowUpRight, 
  FileText, Download, Calendar, Activity, Zap
} from "lucide-react";

export default function ManagerReports() {
  const [activePopulation, setActivePopulation] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mocked sales data for the day
  const dailySales = [
    { name: "Coffee", sales: 42, growth: 12 },
    { name: "Tea", sales: 18, growth: -5 },
    { name: "Pastry", sales: 29, growth: 8 },
    { name: "Sandwich", sales: 34, growth: 15 },
    { name: "Juice", sales: 12, growth: -2 },
  ];

  const fetchReportData = useCallback(async () => {
    try {
      const [pRes, lsRes] = await Promise.all([
        commonApi.getPopulation({ status: "Active" }),
        inventoryApi.getLowStockIngredients()
      ]);
      setActivePopulation(pRes.data?.results || pRes.data || []);
      setLowStock(lsRes?.results || lsRes || []);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  console.log("LOADING_STATUS:", loading);

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
                  <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">Shop <span className="text-emerald-600 dark:text-emerald-400">Reports</span></h1>
                  <div className="flex items-center gap-3 bg-white dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-full px-4 py-1.5 w-fit shadow-sm">
                    <FileText size={14} className="text-emerald-500 animate-pulse" />
                    <p className="text-[10px] font-black text-slate-500 dark:text-emerald-300 uppercase tracking-[0.3em] font-mono">FINANCIAL_OVERSIGHT // SHIFT: {new Date().toLocaleDateString()} // AM_PEAK: COMPLETED</p>
                  </div>
                </div>
                <button className="flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-500/20">
                  <Download size={18} /> Export Daily Audit
                </button>
              </div>

              {/* Main Report Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Simulated Revenue */}
                <div className="p-8 rounded-4xl bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 shadow-xl flex flex-col justify-between group overflow-hidden relative">
                   <div className="flex items-center gap-3 mb-6 text-emerald-500">
                      <div className="p-3 bg-emerald-500/10 rounded-2xl"><DollarSign size={20} /></div>
                      <span className="text-[10px] font-black uppercase tracking-widest">Revenue Today</span>
                   </div>
                   <h3 className="text-5xl font-black text-slate-900 dark:text-white italic tracking-tighter">$1,248.50</h3>
                   <div className="mt-4 flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                      <TrendingUp size={14} /> +18.4% VS LAST SHIFT
                   </div>
                </div>

                <div className="p-8 rounded-4xl bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 shadow-xl flex flex-col justify-between group overflow-hidden relative">
                   <div className="flex items-center gap-3 mb-6 text-emerald-600">
                      <div className="p-3 bg-emerald-500/10 rounded-2xl"><BarChart3 size={20} /></div>
                      <span className="text-[10px] font-black uppercase tracking-widest">Daily Average Demand</span>
                   </div>
                   <h3 className="text-5xl font-black text-slate-900 dark:text-white italic tracking-tighter">84.2%</h3>
                   <div className="mt-4 flex items-center gap-2 text-rose-500 text-[10px] font-black uppercase tracking-widest">
                      <TrendingDown size={14} /> -2.1% VS LAST SHIFT
                   </div>
                </div>

                <div className="p-8 rounded-4xl bg-emerald-600 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
                   <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-white/10 rounded-2xl"><Activity size={20} /></div>
                      <span className="text-[10px] font-black uppercase tracking-widest">Customer Volume</span>
                   </div>
                   <h3 className="text-5xl font-black text-white italic tracking-tighter">184</h3>
                   <div className="mt-4 flex items-center gap-2 text-white/70 text-[10px] font-black uppercase tracking-widest">
                      TOTAL VISITORS DETECTED
                   </div>
                </div>

                <div className="p-8 rounded-4xl bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 shadow-xl flex flex-col justify-between group overflow-hidden relative">
                <div className="flex items-center gap-3 mb-6 text-rose-500">
                      <div className="p-3 bg-rose-500/10 rounded-2xl"><Package size={20} /></div>
                      <span className="text-[10px] font-black uppercase tracking-widest">Supply Warnings</span>
                   </div>
                   <h3 className="text-5xl font-black text-slate-900 dark:text-white italic tracking-tighter">{lowStock.length}</h3>
                   <div className="mt-4 flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                      NODE_DEPLETION_ALERTS
                   </div>
                </div>
              </div>

              {/* Product Demand Matrix */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-4xl overflow-hidden shadow-2xl">
                   <div className="p-8 border-b border-slate-100 dark:divide-white/5 flex items-center justify-between">
                      <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Product Demand Matrix</h3>
                      <button className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest hover:translate-x-2 transition-transform">
                        Launch Real-time Demand Engine <ArrowUpRight size={14} />
                      </button>
                   </div>
                   <div className="overflow-x-auto min-h-75">
                      <table className="w-full">
                         <thead>
                            <tr className="bg-slate-50/50 dark:bg-white/5">
                               <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Product Node</th>
                               <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Demand Cycle</th>
                               <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Market Shift</th>
                               <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sync</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {dailySales.map((item, idx) => (
                               <tr key={idx} className="hover:bg-slate-50/30 dark:hover:bg-white/5 transition-colors group">
                                  <td className="px-8 py-6">
                                     <span className="text-slate-900 dark:text-white font-black uppercase text-sm italic group-hover:text-emerald-500 transition-colors">{item.name}</span>
                                  </td>
                                  <td className="px-8 py-6">
                                     <div className="flex items-center gap-3">
                                        <div className="h-1.5 w-full max-w-30 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                           <div className={`h-full bg-emerald-500 transition-all duration-1000`} style={{ width: `${item.sales * 2}%` }} />
                                        </div>
                                        <span className="text-[10px] font-mono text-slate-400 font-black uppercase tracking-widest">{item.sales} UNITS</span>
                                     </div>
                                  </td>
                                  <td className="px-8 py-6">
                                     <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${item.growth > 0 ? "text-emerald-500" : "text-rose-500"}`}>
                                        {item.growth > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                        {Math.abs(item.growth)}% SHIFT
                                     </div>
                                  </td>
                                  <td className="px-8 py-6 text-right">
                                     <div className="w-2 h-2 rounded-full bg-emerald-500/20 mx-auto" />
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>

                {/* Simulated Peak Hour Intelligence */}
                <div className="p-8 rounded-4xl bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 shadow-xl flex flex-col justify-between">
                   <div>
                      <div className="flex items-center gap-4 mb-8 text-emerald-500">
                        <Zap size={24} />
                        <h3 className="text-xl font-black uppercase italic tracking-tighter">Peak Analysis</h3>
                      </div>
                      <div className="space-y-6">
                         <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Highest Traffic Protocol</p>
                            <p className="text-sm font-black text-slate-900 dark:text-white uppercase italic">12:30 PM - 1:45 PM</p>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">{activePopulation.length} Active Nodes Observed</p>
                         </div>

                         <div className="p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Busiest Zone Detection</p>
                            <p className="text-sm font-black text-slate-900 dark:text-white uppercase italic">Main Seating Hall</p>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">Node Efficiency: 92.4%</p>
                         </div>
                      </div>
                   </div>
                   <button className="mt-8 w-full py-4 border border-emerald-500 text-emerald-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-xl shadow-emerald-500/10">
                      View Shift Summary
                   </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
