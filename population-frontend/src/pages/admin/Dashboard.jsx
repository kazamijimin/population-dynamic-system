import { useEffect, useState } from "react";
import api from "../../api/axios";
import Topbar from "../../components/layout/Topbar";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [time, setTime] = useState(new Date());

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch backend data with auto refresh
  useEffect(() => {
    const fetchData = () => {
      setLoading(true);
      api.get("/health/")
        .then(res => {
          setData(res.data);
          setError(null);
        })
        .catch(err => {
          console.error(err);
          setError(err.message || "Failed to connect to backend");
        })
        .finally(() => setLoading(false));
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gradient-to-br dark:from-indigo-950 dark:via-slate-900 dark:to-black relative overflow-hidden transition-colors duration-500">
      <Topbar />
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-40 dark:opacity-100 italic transition-opacity">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      </div>

      {/* Content wrapper */}
      <div className="flex relative z-10">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border-r border-slate-200 dark:border-white/5 p-6 shadow-2xl transition-colors">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
              <span className="text-xl text-white">⚡</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
              Supply<span className="text-violet-500">Hub</span>
            </h2>
          </div>

          <nav className="flex flex-col gap-2">
            <a onClick={() => window.location.href='/admin/dashboard'} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-violet-600 dark:bg-violet-600/10 text-white dark:text-violet-400 border border-violet-500/20 font-black text-[10px] uppercase tracking-widest cursor-pointer shadow-lg shadow-violet-500/5">
              <span className="text-base leading-none">📊</span> Dashboard
            </a>
            <a onClick={() => window.location.href='/admin/inventory'} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-white transition-all font-black text-[10px] uppercase tracking-widest cursor-pointer group">
              <span className="text-base leading-none opacity-50 group-hover:opacity-100 transition-opacity">📦</span> Inventory
            </a>
            <a onClick={() => window.location.href='/admin/customers'} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-white transition-all font-black text-[10px] uppercase tracking-widest cursor-pointer group">
              <span className="text-base leading-none opacity-50 group-hover:opacity-100 transition-opacity">👥</span> Customers
            </a>
            <a onClick={() => window.location.href='/admin/reports'} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-white transition-all font-black text-[10px] uppercase tracking-widest cursor-pointer group">
              <span className="text-base leading-none opacity-50 group-hover:opacity-100 transition-opacity">📈</span> Reports
            </a>
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-200 dark:border-white/5">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1">System Entropy</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse shadow-glow"></div>
              <p className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                {time.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
          {/* Header */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-violet-500 shadow-glow"></span>
                <span className="px-2 py-0.5 rounded-full bg-violet-600/10 dark:bg-violet-600/20 text-violet-600 dark:text-violet-400 text-[10px] font-black uppercase tracking-widest border border-violet-500/20">System Live</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none drop-shadow-2xl">
                Supply Chain <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400 drop-shadow-none">Nexus</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium tracking-wide max-w-md border-l-2 border-violet-500/20 pl-4">
                Real-time synchronization across all coffee shop nodes.
              </p>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <button className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all font-black text-[12px] uppercase tracking-widest shadow-xl group">
                <span className="opacity-50 group-hover:opacity-100 transition-opacity">📅</span> Schedule
              </button>
              <button className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-black text-[12px] uppercase tracking-widest shadow-2xl shadow-violet-500/20 hover:scale-[1.02] active:scale-95 transition-all">
                <span>🚀</span> Deploy Change
              </button>
            </div>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Total Customers', value: data?.population || '12,847', trend: '+12.5%', color: 'from-violet-500 to-indigo-500', icon: '👥' },
              { label: 'Active Monitors', value: data?.simulations || '3', trend: '+8.2%', color: 'from-fuchsia-500 to-pink-500', icon: '🔬' },
              { label: 'Stock Items', value: data?.inventory || '156', trend: '+15.1%', color: 'from-blue-500 to-indigo-500', icon: '📦' },
              { label: 'Demand Forecasts', value: data?.reports || '24', trend: '-0.4%', color: 'from-violet-600 to-fuchsia-600', icon: '📊' },
            ].map((stat, idx) => (
              <div key={idx} className="group p-6 rounded-[2rem] bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 hover:border-violet-500/30 transition-all shadow-xl dark:shadow-2xl hover:shadow-violet-500/5 overflow-hidden relative">
                <div className={`absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-5 blur-2xl group-hover:opacity-10 transition-opacity`}></div>
                
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
                    {stat.icon}
                  </div>
                  <span className={`px-2 py-1 rounded-lg bg-slate-50 dark:bg-white/5 ${stat.trend.startsWith('+') ? 'text-violet-600 dark:text-violet-400' : 'text-pink-600 dark:text-pink-400'} text-[10px] font-black font-mono`}>
                    {stat.trend}
                  </span>
                </div>
                
                <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{stat.label}</h3>
                <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Main Visual/Chart Area */}
            <div className="xl:col-span-2 space-y-8">
              <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-950/40 backdrop-blur-3xl border border-slate-200 dark:border-white/5 shadow-xl dark:shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600 opacity-[0.03] blur-[100px] -mr-32 -mt-32"></div>
                
                <div className="flex justify-between items-end mb-10">
                  <div>
                    <h3 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Real-time Oscillations</h3>
                    <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Supply Pulse</h4>
                  </div>
                  <div className="flex gap-2">
                    <span className="w-6 h-1 bg-violet-500 rounded-full"></span>
                    <span className="w-2 h-1 bg-slate-200 dark:bg-white/10 rounded-full"></span>
                    <span className="w-2 h-1 bg-slate-200 dark:bg-white/10 rounded-full"></span>
                  </div>
                </div>

                {/* Mock Graph */}
                <div className="h-64 flex items-end gap-1.5 px-2">
                  {[40, 65, 45, 90, 75, 55, 85, 40, 65, 45, 90, 75, 55, 85, 100, 60, 40, 65, 45, 90, 75, 55, 85, 40, 65, 45, 90].map((h, i) => (
                    <div key={i} className="flex-1 relative group bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden" 
                         style={{ height: '100%', minWidth: '4px' }}>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-violet-600 to-indigo-400 rounded-full transition-all duration-1000 group-hover:from-fuchsia-500 group-hover:to-violet-400" 
                           style={{ height: `${h}%` }}>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/20 blur-md rounded-full shadow-glow animate-pulse"></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-6 px-2 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                  <span>00:00</span>
                  <span>06:00</span>
                  <span>12:00</span>
                  <span>18:00</span>
                  <span>NOW</span>
                </div>
              </div>

              {/* Bottom Actions Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 rounded-[2rem] bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 hover:border-violet-500/20 transition-all group overflow-hidden relative shadow-xl dark:shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="text-3xl mb-4 block group-hover:scale-125 transition-transform origin-left">📦</span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic mb-2">Inventory Drift</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 font-medium">Auto-replenishment detected potential shortfall in 4 locations.</p>
                  <button 
                    onClick={() => window.location.href='/admin/inventory'}
                    className="w-full py-4 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-violet-600 hover:text-white transition-all relative z-10"
                  >
                    Manage Stock
                  </button>
                </div>

                <div className="p-8 rounded-[2rem] bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 hover:border-fuchsia-500/20 transition-all group overflow-hidden relative shadow-xl dark:shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="text-3xl mb-4 block group-hover:scale-125 transition-transform origin-left">👥</span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic mb-2">Customer Flow</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 font-medium">Predictive modeling suggests 22% spike in dinner traffic.</p>
                  <button 
                    onClick={() => window.location.href='/admin/customers'}
                    className="w-full py-4 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-fuchsia-600 hover:text-white transition-all relative z-10"
                  >
                    View Profiles
                  </button>
                </div>
              </div>
            </div>

            {/* Neural Feed Sidebar Area */}
            <div className="space-y-6">
              <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900/60 backdrop-blur-3xl border border-slate-200 dark:border-white/5 shadow-xl dark:shadow-2xl relative overflow-hidden">
                 <div className="flex items-center justify-between mb-8">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-widest uppercase italic">Neural Feed</h3>
                  <span className="animate-pulse w-2 h-2 bg-violet-500 rounded-full shadow-glow"></span>
                </div>

                <div className="space-y-6">
                  {[
                    { user: 'Sarah Jenkins', action: 'Restocked Arabica', time: '12m ago', icon: '☕' },
                    { user: 'System Bot', action: 'Cache Cleared', time: '45m ago', icon: '🤖' },
                    { user: 'Alex Rivera', action: 'New Manager Added', time: '2h ago', icon: '👤' },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 group cursor-default">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex-shrink-0 flex items-center justify-center text-sm shadow-inner group-hover:bg-violet-600/20 transition-colors">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white tracking-wide uppercase italic group-hover:text-violet-400 transition-colors">{item.user}</h4>
                        <p className="text-[11px] text-slate-500 font-bold">{item.action}</p>
                        <span className="text-[9px] text-slate-400 dark:text-slate-600 font-mono tracking-tighter">{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-10 py-4 rounded-xl border border-slate-200 dark:border-white/5 text-slate-400 hover:text-violet-600 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-white/5 transition-all font-black text-[10px] uppercase tracking-[0.2em]">
                  View Full Audit
                </button>
              </div>

              <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-violet-600 to-indigo-700 shadow-2xl shadow-violet-500/10 group cursor-pointer relative overflow-hidden active:scale-95 transition-all">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform"></div>
                <h3 className="text-lg font-black text-white tracking-tighter uppercase italic leading-tight mb-2">Generate Monthly Intelligence</h3>
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-6">AI Prediction Report</p>
                <div className="flex justify-between items-center">
                  <span className="text-white/90 text-sm font-black tracking-widest">RUN ANALYSIS</span>
                  <span className="group-hover:translate-x-2 transition-transform text-white">➡️</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

