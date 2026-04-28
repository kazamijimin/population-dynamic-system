import { useState, useEffect, useCallback, useMemo } from "react";
import { adminApi } from "../../api/users.api";
import { simulationApi } from "../../api/simulation.api";
import { commonApi } from "../../api/common.api";
import Topbar from "../../components/layout/Topbar";
import Sidebar from "../../components/layout/Sidebar";
import { 
  Activity, 
  Clock, 
  Search, 
  Filter, 
  RefreshCw,
  ShoppingBag,
  Package,
  Zap,
  User,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, order, update, restock
  const [error, setError] = useState(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      // We'll aggregate logs from multiple sources or use the activity log endpoint if it exists
      const res = await adminApi.getActivityLogs();
      const logData = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setLogs(logData);
      setError(null);
    } catch (err) {
      setError("LOG_DATA_STREAM_OFFLINE");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = 
        log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === "all" || log.action_type?.toLowerCase() === filterType;
      
      return matchesSearch && matchesType;
    });
  }, [logs, searchTerm, filterType]);

  const getLogIcon = (action) => {
    if (!action) return <Activity className="text-indigo-400" size={18} />;
    const act = action.toLowerCase();
    if (act.includes("order")) return <ShoppingBag className="text-emerald-500" size={18} />;
    if (act.includes("restock")) return <Package className="text-amber-500" size={18} />;
    if (act.includes("update") || act.includes("docking")) return <RefreshCw className="text-violet-500" size={18} />;
    if (act.includes("login") || act.includes("auth") || act.includes("registration")) return <User className="text-slate-400" size={18} />;
    return <Activity className="text-indigo-400" size={18} />;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 italic">
      <div className="flex w-full h-screen relative">
        <Sidebar />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="h-px w-12 bg-rose-500/50"></div>
                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em] italic">System Monitoring</span>
                  </div>
                  <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
                    Activity <span className="text-rose-500">Logs</span>
                  </h1>
                </div>
                <button 
                  onClick={fetchLogs}
                  className="flex items-center gap-3 px-6 py-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
                >
                  <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                  Rescan Node
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-4xl shadow-xl">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Total Interactions</h3>
                  <div className="flex items-end gap-3 text-4xl font-black italic text-slate-900 dark:text-white">
                    {logs.length}
                    <Activity className="text-rose-500 mb-2" size={20} />
                  </div>
                </div>
                <div className="p-8 bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-4xl shadow-xl">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Recent Criticals</h3>
                  <div className="flex items-end gap-3 text-4xl font-black italic text-rose-500">
                    {logs.filter(l => l.is_critical).length}
                    <AlertCircle className="mb-2" size={20} />
                  </div>
                </div>
                <div className="p-8 bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-4xl shadow-xl">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Operations Synced</h3>
                  <div className="flex items-end gap-3 text-4xl font-black italic text-emerald-500">
                    100%
                    <CheckCircle className="mb-2" size={20} />
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl rounded-4xl border border-slate-200 dark:border-white/5 p-8 shadow-xl">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text"
                      placeholder="SCAN_LOG_ARCHIVES..."
                      className="w-full bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-rose-500 rounded-2xl pl-16 pr-6 py-4 outline-none font-bold text-sm transition-all"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-3">
                    {['all', 'order', 'update', 'restock'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                          filterType === type 
                          ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-500/20' 
                          : 'bg-white dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/10 hover:border-rose-500/50'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Log Feed */}
              <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-white/5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50/50 dark:bg-white/5">
                        <th className="px-8 py-6">Interaction Node</th>
                        <th className="px-8 py-6">Action Protocol</th>
                        <th className="px-8 py-6">User Identity</th>
                        <th className="px-8 py-6 text-right">Temporal Hash</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                      {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <tr key={i} className="animate-pulse">
                            <td colSpan="4" className="px-8 py-10 h-16">
                              <div className="h-4 bg-slate-100 dark:bg-white/5 rounded-full w-3/4"></div>
                            </td>
                          </tr>
                        ))
                      ) : filteredLogs.length > 0 ? (
                        filteredLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-rose-500/[0.02] transition-colors group">
                            <td className="px-8 py-8">
                              <div className="flex items-center gap-4">
                                <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-xl group-hover:scale-110 group-hover:bg-rose-500/10 group-hover:text-rose-500 transition-all">
                                  {getLogIcon(log.action)}
                                </div>
                                <div>
                                  <div className="font-black italic text-sm text-slate-900 dark:text-white uppercase tracking-tight">
                                    {log.action}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                    {log.details || "SYSTEM_GENERATED_LOG"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-8">
                              <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                                log.is_critical 
                                ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-sm shadow-rose-500/10' 
                                : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10'
                              }`}>
                                {log.action_type || "GENERAL"}
                              </span>
                            </td>
                            <td className="px-8 py-8">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center text-[8px] text-white font-black uppercase">
                                  {log.user?.charAt(0) || 'S'}
                                </div>
                                <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                                  {log.user || "Sy_Stem"}
                                </span>
                              </div>
                            </td>
                            <td className="px-8 py-8 text-right font-mono text-[10px] text-slate-400">
                              <div className="flex items-center justify-end gap-2">
                                <Clock size={12} />
                                {new Date(log.timestamp).toLocaleString()}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-8 py-32 text-center">
                            <div className="flex flex-col items-center gap-4 opacity-40">
                              <Zap size={48} className="text-slate-300" />
                              <p className="font-black text-[10px] uppercase tracking-[0.3em] italic">No historical logs detected in this node.</p>
                            </div>
                          </td>
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
