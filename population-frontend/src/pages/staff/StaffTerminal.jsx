import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import Topbar from "../../components/layout/Topbar";
import Sidebar from "../../components/layout/Sidebar";
import { 
  ShoppingCart, Package, Clock, CheckCircle, 
  Plus, Search, Filter, ChevronRight, 
  AlertCircle, Loader2, ArrowRight, User,
  Calendar, Zap, Coffee, Activity, TrendingUp, Users, Play, Pause, RotateCcw
} from "lucide-react";

export default function StaffTerminal() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([
    { id: "ORD-7721", items: "2x Espresso, 1x Croissant", status: "pending", time: "10:45 AM", total: "$12.50" },
    { id: "ORD-7722", items: "1x Matcha Latte", status: "completed", time: "10:42 AM", total: "$5.50" },
    { id: "ORD-7723", items: "1x Americano, 2x Muffin", status: "pending", time: "10:48 AM", total: "$10.00" },
  ]);
  const [products, setProducts] = useState([
    { id: 1, name: "Espresso Beans", stock: "High", available: true },
    { id: 2, name: "Whole Milk", stock: "Medium", available: true },
    { id: 3, name: "Oat Milk", stock: "Low", available: true },
    { id: 4, name: "Croissants", stock: "Out of Stock", available: false },
  ]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("orders"); // orders, inventory, flow
  const [isSimulating, setIsSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [simResult, setSimResult] = useState(null);

  const startSimulation = async () => {
    setIsSimulating(true);
    setSimResult(null);
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(r => setTimeout(r, 100));
      setSimProgress(i);
    }
    setIsSimulating(false);
    setSimResult({
      expectedLoad: "HIGH (1.4x)",
      peakHour: "12:30 PM",
      suggestedPrep: "Pre-grind 2kg beans, Heat oven +10°C",
      risk: "WAIT_TIME_ELEVATED"
    });
  };

  return (
    <div className="min-h-screen bg-amber-50/30 dark:bg-slate-950 dark:bg-linear-to-br dark:from-slate-900 dark:via-slate-950 dark:to-amber-950/20 transition-colors duration-500 italic">
      <div className="flex relative z-10 w-full h-screen">
        <Sidebar roles={["staff"]} />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 relative z-10">
            <div className="max-w-7xl mx-auto space-y-8">
              
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                  <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
                    Staff <span className="text-amber-500 dark:text-amber-400">Terminal</span>
                  </h1>
                  <div className="flex items-center gap-3 bg-white dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-full px-4 py-1.5 w-fit shadow-sm">
                    <Activity size={14} className="text-amber-500 animate-pulse" />
                    <p className="text-[10px] font-black text-slate-500 dark:text-amber-300 uppercase tracking-[0.3em] font-mono">
                      NODE_OPERATIONS // STATUS: ONLINE
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button onClick={startSimulation} disabled={isSimulating} className="group flex items-center gap-3 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-xl disabled:opacity-50">
                    <Play size={18} className={isSimulating ? "animate-spin" : ""} />
                    {isSimulating ? `Syncing_${simProgress}%` : "Run Flow Check"}
                  </button>
                  <button className="group flex items-center gap-3 px-8 py-4 bg-amber-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-amber-600 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-amber-500/20">
                    <Plus size={18} /> New Entry
                  </button>
                </div>
              </div>

              {/* Simulation Insights (Conditional) */}
              {simResult && (
                <div className="p-8 rounded-4xl bg-linear-to-r from-amber-500 to-orange-600 text-white shadow-2xl animate-in zoom-in duration-500 relative overflow-hidden">
                   <TrendingUp size={120} className="absolute -right-10 -bottom-10 opacity-20 rotate-12" />
                   <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                     <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Local Projection</p>
                        <h3 className="text-3xl font-black italic tracking-tighter uppercase">Next Wave: {simResult.peakHour}</h3>
                     </div>
                     <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                        <p className="text-[9px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                           <Zap size={14} /> AI Recommendation
                        </p>
                        <p className="text-xs font-bold italic leading-relaxed">{simResult.suggestedPrep}</p>
                     </div>
                     <div className="flex flex-col items-end gap-2">
                        <span className="px-4 py-1.5 bg-black/20 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                          {simResult.risk}
                        </span>
                        <p className="text-[10px] font-mono opacity-60 uppercase">SYNC_ID: {Math.random().toString(36).substring(7).toUpperCase()}</p>
                     </div>
                   </div>
                </div>
              )}

              {/* Status Ribbon */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: "Active Orders", value: "12", icon: <Clock size={20} />, color: "amber" },
                  { label: "Staff on Desk", value: "3 Units", icon: <Users size={20} />, color: "indigo" },
                  { label: "Supply Health", icon: <Package size={20} />, value: "Optimal", color: "emerald" },
                  { label: "Shift Progress", value: "05:12h", icon: <Activity size={20} />, color: "rose" }
                ].map((stat, i) => (
                  <div key={i} className="p-6 rounded-3xl bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 shadow-lg flex items-center justify-between group hover:border-amber-500/30 transition-all">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                      <p className="text-2xl font-black text-slate-900 dark:text-white italic">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-2xl bg-slate-50 dark:bg-white/5 text-${stat.color}-500 group-hover:scale-110 transition-transform`}>
                      {stat.icon}
                    </div>
                  </div>
                ))}
              </div>

              {/* Main Workspace */}
              <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-4xl overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setActiveTab("orders")}
                      className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'orders' ? 'bg-amber-500 text-white shadow-lg' : 'bg-slate-50 dark:bg-white/5 text-slate-400'}`}
                    >
                      Active Queue
                    </button>
                    <button 
                      onClick={() => setActiveTab("inventory")}
                      className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'inventory' ? 'bg-amber-500 text-white shadow-lg' : 'bg-slate-50 dark:bg-white/5 text-slate-400'}`}
                    >
                      Local Stock
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                  {activeTab === 'orders' ? (
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50/50 dark:bg-white/5">
                          <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sequence</th>
                          <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Order Details</th>
                          <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timestamp</th>
                          <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-amber-500/5 transition-colors group">
                            <td className="px-8 py-6">
                              <span className="text-slate-900 dark:text-white font-black uppercase text-sm italic tracking-tighter font-mono">{order.id}</span>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex flex-col">
                                <span className="text-slate-600 dark:text-slate-300 text-xs font-bold uppercase">{order.items}</span>
                                <span className="text-[10px] text-amber-500 font-mono uppercase tracking-widest">{order.total}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-2">
                                <Clock size={12} className="text-slate-400" />
                                <span className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{order.time}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <button className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${order.status === 'completed' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10' : 'text-amber-500 border-amber-500/20 bg-amber-500/10 hover:bg-amber-500 hover:text-white active:scale-95 shadow-sm'}`}>
                                {order.status === 'completed' ? 'Signal Complete' : 'Execute Order'}
                              </button>
                              <button className="ml-2 p-2.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all">
                                 <RotateCcw size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {products.map(product => (
                        <div key={product.id} className={`p-6 rounded-3xl border transition-all ${product.available ? 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5' : 'bg-rose-500/5 border-rose-500/20 opacity-60'}`}>
                          <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-2xl ${product.available ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'}`}>
                              <Package size={20} />
                            </div>
                            <div className={`w-4 h-4 rounded-full ${product.available ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-rose-500'}`} />
                          </div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase italic mb-1">{product.name}</h4>
                          <p className={`text-[10px] font-black uppercase tracking-widest ${product.stock === 'High' ? 'text-emerald-500' : product.stock === 'Low' ? 'text-amber-500' : 'text-rose-500'}`}>
                             NODE_STOCK: {product.stock}
                          </p>
                          <button className="w-full mt-6 py-3 bg-white dark:bg-slate-800 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl border border-slate-200 dark:border-white/10 hover:border-amber-500 transition-all text-slate-600 dark:text-slate-200 shadow-sm active:scale-95">
                             Toggle Node Availability
                          </button>
                        </div>
                      ))}
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
