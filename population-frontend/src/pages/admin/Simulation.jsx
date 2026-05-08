import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { simulationApi } from "../../api/simulation.api";
import { useAuth } from "../../hooks/UseAuth";
import Topbar from "../../components/layout/Topbar";
import Sidebar from "../../components/layout/Sidebar";
import { Settings, Users, ArrowRight, Save, Trash2, Plus, AlertCircle, Info, Calendar, Zap, Sun, Umbrella, Brain, Cpu, Shield } from "lucide-react";

export default function Simulation() {
  const { currentUser } = useAuth();
  const [parameters, setParameters] = useState([]);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState("registry");

  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'manager';
  const canDelete = currentUser?.role === 'admin';
  const canAdd = currentUser?.role === 'admin';

  const [newParameter, setNewParameter] = useState({
    name: "", key: "", value: 0, unit: "", parameter_type: "customer_flow", is_active: true
  });

  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);
  const [simSummary, setSimSummary] = useState(null);
  const [hourlyStats, setHourlyStats] = useState([]);

  const runSimulation = async () => {
    setIsSimulating(true);
    setSimulationStep(0);
    setSimSummary(null);
    setHourlyStats([]);

    const hours = [
      { h: "8AM", type: "low", base: 10 },
      { h: "10AM", type: "low", base: 15 },
      { h: "12PM", type: "medium", base: 45 },
      { h: "2PM", type: "medium", base: 40 },
      { h: "4PM", type: "PEAK", base: 95 },
      { h: "5PM", type: "PEAK", base: 110 },
      { h: "7PM", type: "medium", base: 55 },
      { h: "9PM", type: "low", base: 20 },
    ];

    const activeMultipliers = multipliers.filter(m => m.is_active);
    const globalMultiplier = activeMultipliers.length > 0 
      ? activeMultipliers.reduce((acc, m) => acc + m.value, 0) / activeMultipliers.length 
      : 1.0;

    let localHourly = [];
    
    for (let i = 0; i < hours.length; i++) {
      setSimulationStep(Math.round(((i + 1) / hours.length) * 100));
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const randomFactor = 0.9 + (Number(new Date().getTime() % 100) / 500);
      const count = Math.round(hours[i].base * globalMultiplier * randomFactor);
      localHourly.push({ hour: hours[i].h, count, type: hours[i].type });
      setHourlyStats([...localHourly]);
    }

    const peakLoad = Math.max(...localHourly.map(h => h.count));
    const avgLoad = Math.round(localHourly.reduce((acc, h) => acc + h.count, 0) / localHourly.length);
    const riskLevel = peakLoad > 100 ? "CRITICAL" : peakLoad > 60 ? "BUSY" : "NORMAL";

    setTimeout(() => {
      setIsSimulating(false);
      setSimSummary({
        peak: peakLoad,
        avg: avgLoad,
        risk: riskLevel,
        impact: Math.round((globalMultiplier - 1) * 100),
        timestamp: new Date().toLocaleTimeString()
      });
    }, 500);
  };

  const multipliers = parameters.filter(p => 
    p.key.includes('multiplier') || 
    p.key.includes('seasonal') || 
    p.key.includes('weather') || 
    p.key.includes('weekend') || 
    p.key.includes('holiday') || 
    p.key.includes('promo') ||
    p.key.includes('event')
  ).sort((a, b) => a.id - b.id);

  const registryParameters = parameters.filter(p => !multipliers.find(m => m.id === p.id)).sort((a, b) => a.id - b.id);

  const getIcon = (key) => {
    const k = key.toLowerCase();
    if (k.includes('sun') || k.includes('summer')) return <Sun size={16} />;
    if (k.includes('rain') || k.includes('weather')) return <Umbrella size={16} />;
    if (k.includes('weekend') || k.includes('holiday')) return <Calendar size={16} />;
    if (k.includes('promo') || k.includes('event')) return <Zap size={16} />;
    return <Settings size={16} />;
  };

  const fetchParameters = useCallback(async () => {
    try {
      const res = await simulationApi.getParameters();
      const data = res.data;
      const finalData = Array.isArray(data) ? data : (data?.results || []);
      setParameters(finalData);
    } catch (_) { setError("Registry offline."); }
  }, []);

  useEffect(() => { 
    let isMounted = true;
    const load = async () => { if (isMounted) await fetchParameters(); };
    load();
    return () => { isMounted = false; };
  }, [fetchParameters]);

  const handleUpdate = async (id, updatedData) => {
    try {
      await simulationApi.updateParameter(id, { ...updatedData, value: parseFloat(updatedData.value) });
      fetchParameters();
    } catch { setError("Lock confirmed."); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Purge?")) {
      try { await simulationApi.deleteParameter(id); await fetchParameters(); } catch { setError("Restricted."); }
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await simulationApi.createParameter(newParameter);
      setShowAddModal(false);
      fetchParameters();
    } catch { setError("Invalid."); }
  };

  return (
    <div className="min-h-screen italic bg-slate-50 dark:bg-slate-900">
      <div className="flex w-full h-screen">
        <Sidebar title="Sim Core" />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-5xl font-black italic uppercase">Simulation Core</h1>
              {canAdd && (
                <button 
                  onClick={() => setShowAddModal(true)} 
                  className="px-8 py-4 bg-violet-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:translate-y-[-2px] transition-all"
                >
                  Add Parameter
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-8 rounded-4xl bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700">
                <h3 className="text-xs font-black uppercase text-slate-400 mb-2">Nexus Engine</h3>
                <div className="flex items-center gap-3">
                  <Cpu className="text-violet-600" size={24} />
                  <span className="text-2xl font-black italic">ACTIVE</span>
                </div>
              </div>
              <div className="p-8 rounded-4xl bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-slate-700">
                <h3 className="text-xs font-black uppercase text-slate-400 mb-2">Entity Count</h3>
                <div className="flex items-center gap-3">
                  <Users className="text-indigo-600" size={24} />
                  <span className="text-2xl font-black italic">{parameters.length}</span>
                </div>
              </div>
              <div className="p-8 rounded-4xl bg-violet-600 text-white shadow-2xl overflow-hidden relative group">
                <div className={`absolute inset-0 bg-white/10 transition-opacity duration-300 ${isSimulating ? "opacity-100" : "opacity-0"}`} />
                <h3 className="text-xs font-black uppercase text-violet-200 mb-2 relative z-10 flex justify-between items-center">
                  Pressure Test
                  {simSummary && !isSimulating && <span className="text-[8px] opacity-60">{simSummary.timestamp}</span>}
                </h3>
                <button 
                  onClick={runSimulation} 
                  disabled={isSimulating}
                  className="w-full py-4 bg-white text-violet-600 rounded-2xl font-black flex items-center justify-center gap-3 relative z-10 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSimulating ? (
                    <>
                      <Zap size={20} className="animate-pulse" />
                      <span>{simulationStep}% SYNC</span>
                    </>
                  ) : (
                    <>
                      <Zap size={20} />
                      <span>INITIATE</span>
                    </>
                  )}
                </button>

                {simSummary && !isSimulating && (
                  <div className="mt-6 pt-6 border-t border-white/10 animate-in fade-in slide-in-from-top-2 duration-500 relative z-10">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-[8px] font-black uppercase text-violet-300 mb-1 tracking-widest">Peak Cust/Hr</p>
                        <p className="text-xl font-black italic">{simSummary.peak}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black uppercase text-violet-300 mb-1 tracking-widest">Avg Load</p>
                        <p className="text-xl font-black italic">{simSummary.avg}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-6">
                      <p className="text-[8px] font-black uppercase text-violet-300/40 tracking-[0.2em]">Flow Projection Graph</p>
                      <div className="flex items-end gap-1.5 h-16">
                        {hourlyStats.map((s, idx) => (
                          <div 
                            key={idx} 
                            className={`flex-1 rounded-t-sm relative group transition-all duration-500 ${s.type === 'PEAK' ? 'bg-white' : 'bg-white/30'}`} 
                            style={{ height: `${Math.min(100, (s.count / 140) * 100)}%` }}
                          >
                            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-violet-900 border border-white/20 px-1.5 py-0.5 rounded text-[8px] opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                              {s.hour}: {s.count}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between text-[7px] font-black text-violet-300/30 uppercase tracking-widest px-0.5">
                        <span>8AM</span>
                        <span>4PM</span>
                        <span>9PM</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${simSummary.risk === 'CRITICAL' ? 'bg-rose-400' : simSummary.risk === 'BUSY' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                        <span className="text-[9px] font-black uppercase tracking-tighter">{simSummary.risk} STATUS</span>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-tighter opacity-60">Impact: {simSummary.impact > 0 ? `+${simSummary.impact}%` : `${simSummary.impact}%`}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-4xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-700">
              <div className="p-8 flex gap-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                <button 
                  onClick={() => setActiveTab('registry')} 
                  className={`px-8 py-3 rounded-xl font-black uppercase text-xs tracking-tighter transition-all ${activeTab === 'registry' ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Registry
                </button>
                <button 
                  onClick={() => setActiveTab('multipliers')} 
                  className={`px-8 py-3 rounded-xl font-black uppercase text-xs tracking-tighter transition-all ${activeTab === 'multipliers' ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Multipliers
                </button>
              </div>

              <div className="p-8">
                {error && (
                  <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-2xl flex items-center gap-3 font-black text-xs uppercase italic">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                {activeTab === "registry" ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-[10px] uppercase font-black text-slate-400 border-b border-slate-100 dark:border-slate-700">
                          <th className="text-left pb-4">Parameter ID</th>
                          <th className="text-left pb-4">Magnitude</th>
                          <th className="text-right pb-4">Protocol</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                        {registryParameters.map(p => (
                          <tr key={p.id} className="group">
                            <td className="py-6 pr-4">
                              <div className="font-black uppercase italic text-sm tracking-tight">{p.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{p.key}</div>
                            </td>
                            <td className="py-6">
                              <input 
                                type="number" 
                                defaultValue={p.value} 
                                disabled={!canEdit}
                                onBlur={e => handleUpdate(p.id, {...p, value: e.target.value})}
                                className={`bg-slate-50 dark:bg-slate-900 rounded-xl px-4 py-2 font-black italic text-violet-600 w-32 border border-transparent focus:border-violet-600 outline-none ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`} 
                              />
                            </td>
                            <td className="py-6 text-right">
                              {canDelete && (
                                <button 
                                  onClick={() => handleDelete(p.id)} 
                                  className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                >
                                  <Trash2 size={18} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {multipliers.map(m => (
                      <div key={m.id} className="p-8 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-700 group hover:border-violet-600 transition-all">
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-violet-500/10 rounded-lg text-violet-600">
                              {getIcon(m.key)}
                            </div>
                            <h4 className="font-black uppercase italic text-xs tracking-tight text-slate-400">{m.name}</h4>
                          </div>
                          <span className="text-2xl font-black italic text-violet-600">x{Number(m.value).toFixed(1)}</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="3" 
                          step="0.1" 
                          defaultValue={m.value} 
                          disabled={!canEdit}
                          onMouseUp={e => handleUpdate(m.id, {...m, value: e.target.value})} 
                          className={`w-full accent-violet-600 cursor-pointer ${!canEdit ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`} 
                        />
                        <div className="mt-4 flex justify-between text-[10px] font-black uppercase text-slate-300">
                          <span>{m.key}</span>
                          {canDelete && (
                            <button 
                              onClick={() => handleDelete(m.id)}
                              className="text-rose-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {showAddModal && canAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
          <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] w-full max-w-lg shadow-2xl border border-white/20">
            <h2 className="text-3xl font-black uppercase italic mb-8 tracking-tighter">New Parameter</h2>
            <form onSubmit={handleCreate} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">Label</label>
                <input 
                  required
                  placeholder="e.g. VISITOR_DENSITY" 
                  onChange={e => setNewParameter({...newParameter, name: e.target.value})} 
                  className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl font-black italic border-2 border-transparent focus:border-violet-600 outline-none transition-all" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 ml-1">System Key</label>
                <input 
                  required
                  placeholder="e.g. visitor_multiplier" 
                  onChange={e => setNewParameter({...newParameter, key: e.target.value})} 
                  className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl font-mono text-xs border-2 border-transparent focus:border-violet-600 outline-none transition-all" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)} 
                  className="p-5 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-50 transition-all"
                >
                  Abort
                </button>
                <button 
                  type="submit" 
                  className="p-5 bg-violet-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-violet-200 hover:translate-y-[-2px] transition-all"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
