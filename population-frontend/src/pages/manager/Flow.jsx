import { useState, useEffect, useCallback } from "react";
import { commonApi } from "../../api/common.api";
import { analyticsApi } from "../../api/analytics.api";
import Topbar from "../../components/layout/Topbar";
import Sidebar from "../../components/layout/Sidebar";
import { 
  Waves, Calendar, Search, Filter, TrendingUp, 
  ArrowRight, Users, ShoppingBag, Zap, AlertCircle,
  Play, BarChart3, Clock, CalendarDays, Brain, Sparkles,
  ArrowDownCircle, Package, Users2
} from "lucide-react";

export default function CustomerFlow() {
  const [activeScenario, setActiveScenario] = useState("normal");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const scenarios = {
    normal: { name: "Normal Day", color: "emerald", icon: <Sun className="text-emerald-500" /> },
    peak: { name: "Peak Hours", color: "amber", icon: <Clock className="text-amber-500" /> },
    weekend: { name: "Weekend Surge", color: "indigo", icon: <CalendarDays className="text-indigo-500" /> },
    promo: { name: "Promo Day", color: "rose", icon: <Sparkles className="text-rose-500" /> }
  };

  const runSimulation = async () => {
    setIsSimulating(true);
    setSimProgress(0);
    
    // Smooth progress animation
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(r => setTimeout(r, 80));
      setSimProgress(i);
    }

    // Mocked dynamic results based on scenario
    const multiplier = activeScenario === "peak" ? 1.8 : activeScenario === "weekend" ? 1.5 : activeScenario === "promo" ? 2.2 : 1.0;
    
    setTimeout(() => {
      setResults({
        totalVisitors: Math.round(450 * multiplier),
        peakOccupancy: Math.round(92 * (multiplier > 1.5 ? 0.98 : 0.75)),
        predictedSales: (12400 * multiplier).toFixed(2),
        topProducts: [
          { name: "Signature Espresso", demand: Math.round(180 * multiplier), inventory: 45 },
          { name: "Matcha Latte", demand: Math.round(120 * multiplier), inventory: 15 },
          { name: "Avocado Toast", demand: Math.round(85 * multiplier), inventory: 30 }
        ],
        staffing: {
          recommended: Math.round(4 * multiplier),
          current: 3,
          gap: Math.max(0, Math.round(4 * multiplier) - 3)
        }
      });
      setIsSimulating(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-emerald-50/30 dark:bg-linear-to-br dark:from-emerald-950 dark:via-slate-900 dark:to-black relative overflow-hidden transition-colors duration-500 italic">
      <div className="flex relative z-10 w-full h-screen">
        <Sidebar role="manager" />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 relative z-10">
            <div className="max-w-7xl mx-auto space-y-8">
              
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                  <h1 className="text-5xl md:text-6xl font-black text-emerald-900 dark:text-emerald-50 tracking-tighter uppercase italic leading-none">
                    Customer <span className="text-emerald-600 dark:text-emerald-400">Flow</span>
                  </h1>
                  <div className="flex items-center gap-3 bg-white dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-full px-4 py-1.5 w-fit shadow-sm">
                    <Waves size={14} className="text-emerald-500 animate-pulse" />
                    <p className="text-[10px] font-black text-emerald-900/60 dark:text-emerald-300 uppercase tracking-[0.3em] font-mono">
                      PREDICTIVE_MODELS // ENGINE: NEXUS_V4
                    </p>
                  </div>
                </div>
              </div>

              {/* Simulation Controls */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                  <div className="p-8 rounded-4xl bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 shadow-xl">
                    <h3 className="text-xl font-black text-emerald-900 dark:text-emerald-50 uppercase italic tracking-tighter mb-6">Select Scenario</h3>
                    <div className="space-y-3">
                      {Object.entries(scenarios).map(([key, config]) => (
                        <button
                          key={key}
                          onClick={() => setActiveScenario(key)}
                          className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl border-2 transition-all ${
                            activeScenario === key 
                              ? `bg-${config.color}-500/10 border-${config.color}-500/50 text-${config.color}-600` 
                              : "bg-slate-50 dark:bg-white/5 border-transparent text-slate-400 hover:border-slate-200"
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm`}>
                              {key === "normal" && <Sun className={activeScenario === key ? "text-emerald-500" : "text-slate-400"} size={20} />}
                              {key === "peak" && <Clock className={activeScenario === key ? "text-amber-500" : "text-slate-400"} size={20} />}
                              {key === "weekend" && <CalendarDays className={activeScenario === key ? "text-indigo-500" : "text-slate-400"} size={20} />}
                              {key === "promo" && <Sparkles className={activeScenario === key ? "text-rose-500" : "text-slate-400"} size={20} />}
                            </div>
                            <span className="font-black text-xs uppercase tracking-widest">{config.name}</span>
                          </div>
                          {activeScenario === key && <CheckCircle size={16} />}
                        </button>
                      ))}
                    </div>

                    <div className="mt-8 space-y-4">
                      <label className="text-[10px] font-black text-emerald-900/40 dark:text-emerald-400/40 uppercase tracking-[0.2em]">Projection Range</label>
                      <div className="grid grid-cols-2 gap-4">
                        <input type="date" className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-[10px] font-black uppercase outline-none focus:border-emerald-500 text-emerald-900 dark:text-emerald-50" />
                        <input type="date" className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-[10px] font-black uppercase outline-none focus:border-emerald-500 text-emerald-900 dark:text-emerald-50" />
                      </div>
                    </div>

                    <button 
                      onClick={runSimulation}
                      disabled={isSimulating}
                      className="mt-8 w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-emerald-500 transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3"
                    >
                      {isSimulating ? (
                        <>
                          <RefreshCw size={18} className="animate-spin" />
                          Running {simProgress}%
                        </>
                      ) : (
                        <>
                          <Play size={18} />
                          Initiate Projection
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-8">
                  {results ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                      {/* Simulation Overview Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-8 rounded-4xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 shadow-xl text-center">
                          <p className="text-[10px] font-black text-emerald-900/40 dark:text-emerald-400/40 uppercase tracking-widest mb-2">Predicted Visitors</p>
                          <h4 className="text-5xl font-black text-emerald-900 dark:text-emerald-50 italic tracking-tighter">{results.totalVisitors}</h4>
                        </div>
                        <div className="p-8 rounded-4xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 shadow-xl text-center">
                          <p className="text-[10px] font-black text-emerald-900/40 dark:text-emerald-400/40 uppercase tracking-widest mb-2">Max Wait Time</p>
                          <h4 className="text-5xl font-black text-emerald-900 dark:text-emerald-50 italic tracking-tighter">{activeScenario === "peak" || activeScenario === "promo" ? "12m" : "4m"}</h4>
                        </div>
                        <div className="p-8 rounded-4xl bg-emerald-600 text-white shadow-xl text-center">
                          <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-2">Est. Daily Revenue</p>
                          <h4 className="text-4xl font-black italic tracking-tighter">${results.predictedSales}</h4>
                        </div>
                      </div>

                      {/* Product Demand Matrix */}
                      <div className="p-8 rounded-4xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 shadow-xl">
                        <div className="flex items-center justify-between mb-8">
                          <h3 className="text-xl font-black text-emerald-900 dark:text-emerald-50 uppercase italic tracking-tighter">Demand Prediction Matrix</h3>
                          <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500"><BarChart3 size={20} /></div>
                        </div>
                        <div className="space-y-6">
                          {results.topProducts.map((product, idx) => (
                            <div key={idx} className="space-y-3">
                              <div className="flex justify-between items-end">
                                <div>
                                  <p className="text-sm font-black text-emerald-900 dark:text-emerald-50 uppercase italic">{product.name}</p>
                                  <p className="text-[10px] font-black text-emerald-900/40 dark:text-emerald-400/40 uppercase tracking-widest">Expected Orders: {product.demand}</p>
                                </div>
                                <div className="text-right">
                                  <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${product.inventory < product.demand ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                                    {product.inventory < product.demand ? "Stock Shortage Predicted" : "Inventory Buffer Secure"}
                                  </span>
                                </div>
                              </div>
                              <div className="h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(product.inventory / product.demand) * 100}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Staffing Recommendations */}
                      <div className="p-8 rounded-4xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 flex items-center justify-center text-amber-500"><Users2 size={32} /></div>
                          <div>
                            <h3 className="text-2xl font-black text-emerald-900 dark:text-emerald-50 uppercase italic tracking-tighter">Staffing Optimization</h3>
                            <p className="text-xs font-black text-emerald-900/40 dark:text-emerald-400/40 uppercase tracking-widest">Recommended Deployment: {results.staffing.recommended} Units</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {results.staffing.gap > 0 ? (
                            <div className="px-6 py-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3">
                              <AlertCircle className="text-rose-500" size={18} />
                              <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Staffing Gap: {results.staffing.gap} Unit(s)</span>
                            </div>
                          ) : (
                            <div className="px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
                              <CheckCircle className="text-emerald-500" size={18} />
                              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Roster Optimized</span>
                            </div>
                          )}
                          <button className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-500 transition-all">Adjust Roster</button>
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="h-[600px] border-2 border-dashed border-slate-200 dark:border-white/5 rounded-4xl flex flex-col items-center justify-center text-center p-12 space-y-4">
                      <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-300 dark:text-white/10">
                        <Brain size={40} />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Awaiting Projection Parameters</h3>
                      <p className="text-sm font-black text-slate-400 uppercase tracking-widest max-w-sm">Select a scenario and time range to initialize the neural flow simulation.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

// Sub-components
function Sun({ className, size }) { return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M4.93 19.07l1.41-1.41"/><path d="M17.66 6.34l1.41-1.41"/></svg>; }
function RefreshCw({ className, size }) { return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>; }
function CheckCircle({ className, size }) { return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>; }
