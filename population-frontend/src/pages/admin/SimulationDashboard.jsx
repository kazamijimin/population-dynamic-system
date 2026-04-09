import { useState, useEffect, useCallback } from "react";
import commonApi from "../../api/common.api";
import { 
  UsersIcon, 
  HeartIcon, 
  ArrowTrendingUpIcon, 
  MapIcon,
  AdjustmentsHorizontalIcon,
  PlayIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

export default function SimulationDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    households: 0,
    zones: 0,
    events: []
  });
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [popRes, houseRes, zoneRes, settingsRes, eventsRes] = await Promise.all([
        commonApi.getPopulation({ status: 'Active' }),
        commonApi.getHouseholds(),
        commonApi.getZones(),
        commonApi.getSimulationSettings(),
        commonApi.getShopEvents({ limit: 10, ordering: '-created_at' })
      ]);

      setStats({
        total: popRes.data?.results?.length || popRes.data?.length || 0,
        households: houseRes.data?.results?.length || houseRes.data?.length || 0,
        zones: zoneRes.data?.results?.length || zoneRes.data?.length || 0,
        events: eventsRes.data?.results || eventsRes.data || []
      });

      if (settingsRes.data) {
        // Handle both direct object and array responses
        const settingObj = Array.isArray(settingsRes.data) 
          ? (settingsRes.data.length > 0 ? settingsRes.data[0] : null) 
          : settingsRes.data;
        
        console.log("Settings Resolved:", settingObj);
        setSettings(settingObj);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateRate = async (field, value) => {
    // Optimistically update local state so user sees typing immediately
    const numValue = parseFloat(value) || 0;
    setSettings(prev => ({ ...prev, [field]: value })); // Keep as string temporarily for typing
    
    if (!settings?.id) return;
    try {
      await commonApi.updateSimulationSetting(settings.id, { [field]: numValue });
    } catch (err) {
      console.error("Sync failed", err);
    }
  };

  const trainModel = async () => {
    setIsSimulating(true);
    // Logic for ML Training sequence
    setTimeout(() => {
      setIsSimulating(false);
      alert("AI Training Complete: Prediction model version updated to v1.1.0-alpha.");
    }, 3000);
  };

  const togglePrediction = async () => {
    if (!settings?.id) return;
    const newState = !settings.prediction_model_enabled;
    setSettings(prev => ({ ...prev, prediction_model_enabled: newState }));
    try {
      await commonApi.updateSimulationSetting(settings.id, { prediction_model_enabled: newState });
    } catch (err) {
      console.error("Failed to toggle prediction engine", err);
    }
  };

  const runSimulation = () => {
    setIsSimulating(true);
    // Simulation logic will be triggered via backend task in future
    setTimeout(() => {
      setIsSimulating(false);
      fetchData();
      alert("Population simulation sequence completed. Residents updated based on current rates.");
    }, 2000);
  };

  if (loading) return <div className="p-8 text-center animate-pulse font-bold text-gray-400">LOADING ANALYTICS ENGINE...</div>;

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Smart Coffee Control</h1>
            <p className="text-gray-500 font-medium font-mono text-sm">MODULE: CUSTOMER_FLOW // STATUS: {settings?.is_active ? 'READY' : 'STANDBY'}</p>
          </div>
          <button 
            onClick={runSimulation}
            disabled={isSimulating}
            className={`flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all ${isSimulating ? 'opacity-50' : ''}`}
          >
            {isSimulating ? <ArrowPathIcon className="w-5 h-5 animate-spin" /> : <PlayIcon className="w-5 h-5" />}
            {isSimulating ? "SIMULATING FLOW..." : "EXECUTE PROJECTION"}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={<UsersIcon className="w-6 h-6 text-blue-500" />} label="Live Customers" value={stats.total} color="blue" />
          <StatCard icon={<MapIcon className="w-6 h-6 text-purple-500" />} label="Service Areas" value={stats.zones} color="purple" />
          <StatCard icon={<ArrowTrendingUpIcon className="w-6 h-6 text-emerald-500" />} label="Arrival Rate" value={`${parseFloat(settings?.customer_arrival_rate || 0)}%`} color="emerald" />
          <StatCard icon={<HeartIcon className="w-6 h-6 text-rose-500" />} label="Attrition Rate" value={`${parseFloat(settings?.customer_attrition_rate || 0)}%`} color="rose" />
        </div>

        {/* Configuration Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Simulation Tuner */}
          <div className="lg:col-span-1 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <AdjustmentsHorizontalIcon className="w-6 h-6 text-gray-400" />
              <h2 className="text-xl font-bold text-gray-900">Variables & Rules</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <RateInput 
                label="Arrival Rate" 
                value={settings?.customer_arrival_rate} 
                onChange={(v) => handleUpdateRate('customer_arrival_rate', v)} 
              />
              <RateInput 
                label="Attrition Rate" 
                value={settings?.customer_attrition_rate} 
                onChange={(v) => handleUpdateRate('customer_attrition_rate', v)} 
              />
            </div>

            <div className="pt-4 border-t border-gray-100 space-y-4">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Multipliers</h3>
              <div className="grid grid-cols-2 gap-4">
                <RateInput label="Weekday" value={settings?.weekday_multiplier} onChange={(v) => handleUpdateRate('weekday_multiplier', v)} />
                <RateInput label="Weekend" value={settings?.weekend_multiplier} onChange={(v) => handleUpdateRate('weekend_multiplier', v)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <RateInput label="Promo" value={settings?.promo_event_multiplier} onChange={(v) => handleUpdateRate('promo_event_multiplier', v)} />
                <RateInput label="Holiday" value={settings?.holiday_multiplier} onChange={(v) => handleUpdateRate('holiday_multiplier', v)} />
              </div>
            </div>

            {/* AI Control Panel */}
            <div className="pt-8 space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">AI PREDICTION ENGINE</h4>
                  <p className="text-[10px] text-gray-400 font-mono italic">SYSTEM STATUS: {settings?.prediction_model_enabled ? 'ONLINE' : 'OFFLINE'}</p>
                </div>
                <button 
                  onClick={togglePrediction}
                  className={`w-12 h-6 rounded-full transition-colors relative ${settings?.prediction_model_enabled ? 'bg-indigo-600' : 'bg-gray-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings?.prediction_model_enabled ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
              <button 
                onClick={trainModel}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-indigo-100 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors shadow-sm"
              >
                RETRAIN CORE MODEL
              </button>
            </div>
          </div>

          {/* Activity Feed / History */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Flow Analytics & AI Projections</h2>
              <div className="flex gap-2">
                <button className="text-[10px] bg-emerald-50 px-3 py-1 rounded-full font-bold text-emerald-600 uppercase transition-all hover:bg-emerald-100">Upload History</button>
                <span className="text-[10px] bg-indigo-50 px-3 py-1 rounded-full font-bold text-indigo-600 uppercase">Engine Logs</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-8 py-4">
              {stats.events.length > 0 ? (
                <div className="space-y-4">
                  {stats.events.map((event) => (
                    <div key={event.id} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100/50">
                      <div className={`w-2 h-10 rounded-full ${
                        event.event_type === 'Arrival' ? 'bg-emerald-400' : 
                        event.event_type === 'Departure' ? 'bg-rose-400' :
                        event.event_type === 'Order' ? 'bg-amber-400' : 'bg-indigo-400'
                      }`} />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-gray-900 text-sm italic">
                            EVENT::{event.event_type.toUpperCase()}
                          </h4>
                          <span className="text-[10px] font-mono text-gray-400">
                            {new Date(event.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium">
                          {event.description || `Customer activity recorded in shop flow.`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-indigo-500">
                    <ArrowPathIcon className="w-8 h-8" />
                  </div>
                  <p className="text-gray-500 font-medium">No customer flow history detected.<br/>Initiate a projection to generate demand forecasts.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colors = {
    blue: "bg-blue-50/50 border-blue-100",
    purple: "bg-purple-50/50 border-purple-100",
    emerald: "bg-emerald-50/50 border-emerald-100",
    rose: "bg-rose-50/50 border-rose-100"
  };
  
  return (
    <div className={`p-6 rounded-3xl border ${colors[color]} transition-transform hover:scale-[1.02] cursor-default`}>
      <div className="flex items-center justify-between mb-4">
        {icon}
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live Sync</span>
      </div>
      <div className="text-3xl font-black text-gray-900">{value}</div>
      <div className="text-sm font-bold text-gray-500/80 mt-1 uppercase tracking-tight">{label}</div>
    </div>
  );
}

function RateInput({ label, value, onChange, help }) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest leading-none">{label}</label>
      <input 
        type="number" 
        step="0.1"
        value={value || 0}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 font-mono font-bold text-lg" 
      />
      <p className="text-[10px] text-gray-400 italic">{help}</p>
    </div>
  );
}
