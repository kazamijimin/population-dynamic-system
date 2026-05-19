import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import commonApi from "../../api/common.api";
import { analyticsApi } from "../../api/analytics.api";
import Topbar from "../../components/layout/Topbar";
import Sidebar from "../../components/layout/Sidebar";
import { 
  Zap, Brain, AlertCircle, Target, TrendingUp, Users, Clock, Plus, 
  BarChart3, ShoppingCart, Activity, Shield, ArrowRight, LayoutDashboard,
  FileText, Download, Filter, Search
} from "lucide-react";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [time, setTime] = useState(new Date());
  const [showSchedule, setShowSchedule] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [isGeneratingIntelligence, setIsGeneratingIntelligence] = useState(false);
  const [intelligenceReport, setIntelligenceReport] = useState(null);
  const [pulseData, setPulseData] = useState([40, 65, 45, 85, 35, 95, 55, 75, 45, 85, 40, 90, 60, 40, 80, 50, 95, 30, 70, 45, 85, 55, 95, 65]);
  const [neuralFeed, setNeuralFeed] = useState([]);
  const [activeStore, setActiveStore] = useState("ALL_NODES");
  const [isExporting, setIsExporting] = useState(false);

  // KPIs and System Indicators
  const [kpis, setKpis] = useState({
    occupancy: { value: "84%", target: "90%", trend: "+2.1%", status: "optimal" },
    salesVelocity: { value: "$12.4k", target: "$10.0k", trend: "+15.4%", status: "optimal" },
    demandDrift: { value: "2.1%", target: "5.0%", trend: "-0.4%", status: "stable" }
  });

  const stores = ["ALL_NODES", "NX-DOWNTOWN-01", "NX-UPTOWN-04", "NX-WEST-09", "NX-EAST-12"];

  const handleExport = async (format) => {
    setIsExporting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsExporting(false);
    alert(`EXFILTRATION_COMPLETE: Report generated and exported as ${format.toUpperCase()}`);
  };

  const systemDefaults = [
    { user: 'Sarah Jenkins', action: 'Restocked Arabica', time: '12m ago', icon: '☕' },
    { user: 'System Bot', action: 'Cache Cleared', time: '45m ago', icon: '🤖' },
    { user: 'Alex Rivera', action: 'New Manager Added', time: '2h ago', icon: '👤' },
  ];

  useEffect(() => {
    // Live clock
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchLatestActivity = async () => {
      try {
        const res = await api.get('/auth/admin/activity-logs/');
        const logData = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        
        const formattedLogs = logData.slice(0, 5).map(log => {
          let icon = '☕';
          const act = (log.action || "").toLowerCase();
          if (act.includes('auth') || act.includes('login')) icon = '👤';
          if (act.includes('inventory') || act.includes('stock')) icon = '📦';
          if (act.includes('simulation') || act.includes('nexus')) icon = '🧠';
          const createdDate = new Date(log.timestamp);
          const diffInMinutes = Math.floor((new Date() - createdDate) / 60000);
          return {
            user: log.username || 'System',
            action: log.action || 'Internal Protocol',
            time: diffInMinutes > 0 ? `${diffInMinutes}m ago` : 'Just now',
            icon: icon
          };
        });
        setNeuralFeed(formattedLogs.length > 0 ? formattedLogs : systemDefaults);
      } catch {
        setNeuralFeed(systemDefaults);
      }
    };

    fetchLatestActivity();
  }, []);

  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setPulseData(prev => {
        const newData = [...prev.slice(1)];
        const lastVal = prev[prev.length - 1];
        const drift = (Math.random() - 0.5) * 20;
        newData.push(Math.max(30, Math.min(95, lastVal + drift)));
        return newData;
      });
    }, 2000);
    return () => clearInterval(pulseInterval);
  }, []);

  const generateMonthlyIntelligence = async () => {
    setIsGeneratingIntelligence(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIntelligenceReport({
      summary: "Significant demand surge predicted for Phase Gamma. Current resource allocation is operating at 92.4% efficiency.",
      risks: ["Inventory depletion on core units within 72 hours.", "Staffing bottleneck during 14:00-16:00 peak interval."],
      recommendations: ["Increase restock frequency by 15%.", "Calibrate simulation core."],
      timestamp: new Date().toLocaleString(),
      reliability: "98.2%"
    });
    setIsGeneratingIntelligence(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-linear-to-br dark:from-indigo-950 dark:via-slate-900 dark:to-black relative overflow-hidden transition-colors duration-500 italic">
      <div className="flex relative z-10 w-full h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <Topbar />
          
          <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto w-full">
            {/* Context Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <LayoutDashboard size={18} className="text-violet-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Sector Dashboard // Node: {activeStore}</span>
                </div>
                <h1 className="text-4xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic">
                  Neural <span className="text-violet-600">Analytics</span>
                </h1>
              </div>

              <div className="flex flex-wrap gap-4 items-center bg-white/50 dark:bg-white/5 backdrop-blur-xl p-2 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl">
                <div className="flex items-center gap-3 px-4 py-2 border-r border-slate-200 dark:border-white/10">
                  <Filter size={14} className="text-violet-500" />
                  <select 
                    value={activeStore} 
                    onChange={(e) => setActiveStore(e.target.value)}
                    className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none dark:text-white"
                  >
                    {stores.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleExport('pdf')} className="p-3 bg-violet-600/10 text-violet-600 rounded-2xl hover:bg-violet-600 hover:text-white transition-all">
                    <Download size={18} />
                  </button>
                  <button onClick={generateMonthlyIntelligence} disabled={isGeneratingIntelligence} className="flex items-center gap-3 px-6 py-3 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all">
                    <Zap size={14} className={isGeneratingIntelligence ? "animate-pulse" : ""} />
                    Sync Intelligence
                  </button>
                </div>
              </div>
            </header>

            {/* KPI Pulse Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[
                { label: 'Current Occupancy', stat: kpis.occupancy, icon: Users, color: 'emerald' },
                { label: 'Sales Velocity', stat: kpis.salesVelocity, icon: TrendingUp, color: 'violet' },
                { label: 'Resource Drift', stat: kpis.demandDrift, icon: Activity, color: 'rose' }
              ].map((kpi, idx) => (
                <div key={idx} className="p-8 rounded-4xl bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 shadow-xl relative overflow-hidden group">
                  <div className={`absolute top-0 right-0 p-8 text-${kpi.color}-500/5 group-hover:scale-125 transition-transform`}>
                    <kpi.icon size={80} />
                  </div>
                  <div className="relative z-10 space-y-4">
                    <div className="flex justify-between items-center">
                      <div className={`p-3 rounded-2xl bg-${kpi.color}-500/10 text-${kpi.color}-500`}>
                        <kpi.icon size={20} />
                      </div>
                      <span className={`text-[10px] font-mono font-black ${kpi.stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>{kpi.stat.trend}</span>
                    </div>
                    <div>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</h3>
                      <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic">{kpi.stat.value}</p>
                    </div>
                    <div className="h-1 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full bg-${kpi.color}-500 transition-all duration-1000`} style={{ width: kpi.stat.value.replace('%', '') + '%' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Trends & Flow Analysis */}
              <div className="xl:col-span-2 space-y-8">
                <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 shadow-2xl relative overflow-hidden">
                  <div className="flex justify-between items-center mb-10">
                    <div className="space-y-1">
                      <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase italic">Customer Flow Trends</h3>
                      <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase font-black">STOCHASTIC_PULSE_MONITOR // ACTIVE</p>
                    </div>
                    <div className="flex gap-4">
                       <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-violet-500"></span><span className="text-[9px] font-black text-slate-400 uppercase font-mono">Real-time</span></div>
                       <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-slate-200 dark:bg-white/10"></span><span className="text-[9px] font-black text-slate-400 uppercase font-mono">Baseline</span></div>
                    </div>
                  </div>

                  <div className="h-64 flex items-end gap-2 px-2">
                    {pulseData.map((h, i) => (
                      <div key={i} className="flex-1 relative group bg-slate-50 dark:bg-white/5 h-full rounded-full overflow-hidden">
                        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-violet-600 to-indigo-400 rounded-full transition-all duration-1000 shadow-glow" style={{ height: `${h}%` }}>
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/40 blur-md rounded-full shadow-glow"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-6 px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
                    <span>08:00</span><span>12:00</span><span>16:00</span><span>20:00</span><span>NOW</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Sales Summary */}
                  <div className="p-8 rounded-4xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Product Performance</h3>
                      <ShoppingCart size={20} className="text-violet-500" />
                    </div>
                    <div className="space-y-6">
                      {[
                        { name: "Single Origin Batch", val: 88, price: "$4.50" },
                        { name: "Cold Brew Extraction", val: 72, price: "$5.00" },
                        { name: "Oat Espresso", val: 94, price: "$4.25" }
                      ].map((item, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                            <span className="text-slate-600 dark:text-white">{item.name}</span>
                            <span className="text-violet-500 font-mono">{item.price}</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-violet-500" style={{ width: `${item.val}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Prediction Matrix */}
                  <div className="p-8 rounded-4xl bg-linear-to-br from-slate-900 to-black text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-violet-600/10 mix-blend-overlay" />
                    <Brain size={120} className="absolute -right-12 -bottom-12 opacity-5 rotate-12" />
                    <h3 className="text-xl font-black uppercase italic tracking-tighter mb-4 relative z-10">Demand Matrix</h3>
                    <p className="text-white/60 text-xs mb-8 font-medium leading-relaxed relative z-10">Neural prediction model suggests a 14.5% drift in inventory depletion for Node-09.</p>
                    <Link to="/admin/simulation" className="block text-center w-full py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all relative z-10">
                      Recalibrate Nodes
                    </Link>
                  </div>
                </div>
              </div>

              {/* Sidebar: Activity & Intel */}
              <div className="space-y-8">
                <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900/60 backdrop-blur-3xl border border-slate-200 dark:border-white/5 shadow-2xl relative overflow-hidden">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-widest uppercase italic">Node Activity</h3>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                  </div>
                  <div className="space-y-8">
                    {neuralFeed.map((item, i) => (
                      <div key={i} className="flex gap-4 animate-in slide-in-from-right-4 duration-500">
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-lg">{item.icon}</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase italic truncate">{item.user}</h4>
                          <p className="text-[9px] text-slate-500 font-bold uppercase truncate">{item.action}</p>
                          <span className="text-[8px] text-slate-400 font-mono tracking-widest uppercase">{item.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {intelligenceReport ? (
                   <div className="p-8 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/20 backdrop-blur-md animate-in zoom-in duration-500">
                     <div className="flex items-center gap-3 mb-6">
                        <Brain className="text-amber-500" size={20} />
                        <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest">NEXUS_INTEL</h3>
                     </div>
                     <p className="text-[11px] text-slate-600 dark:text-slate-300 font-bold uppercase leading-relaxed mb-6 italic">
                       {intelligenceReport.summary}
                     </p>
                     <button onClick={() => setIntelligenceReport(null)} className="w-full py-4 bg-amber-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-amber-500/20 transition-all active:scale-95">
                       Acknowledge Signal
                     </button>
                   </div>
                ) : (
                  <div onClick={generateMonthlyIntelligence} className="p-10 rounded-[2.5rem] bg-linear-to-br from-violet-600 to-indigo-700 shadow-2xl shadow-violet-500/20 group cursor-pointer relative overflow-hidden hover:scale-[1.02] active:scale-95 transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform" />
                    <Zap className="text-white/20 absolute -right-4 -bottom-4 rotate-12" size={80} />
                    <h3 className="text-xl font-black text-white tracking-widest uppercase italic mb-6 relative z-10">Run Neural Analysis</h3>
                    <div className="flex justify-between items-center relative z-10">
                      <span className="text-[10px] font-black text-white/60 tracking-[0.2em]">GENERATE_REPORT</span>
                      <ArrowRight className="text-white group-hover:translate-x-2 transition-transform" size={20} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
