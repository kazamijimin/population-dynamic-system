import { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import commonApi from "../../api/common.api";
import PersonModal from "./PersonModal";
import HouseholdModal from "./HouseholdModal";
import LifeEventModal from "./LifeEventModal";
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";
import { PlusIcon, UserGroupIcon, IdentificationIcon, BookOpenIcon } from "@heroicons/react/24/outline";

export default function Population() {
  const [people, setPeople] = useState([]);
  const [households, setHouseholds] = useState([]);
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Active");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
  const [isHouseModalOpen, setIsHouseModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedHouse, setSelectedHouse] = useState(null);

  const fetchPrimaryData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [peopleRes, housesRes, zonesRes] = await Promise.all([
        commonApi.getPopulation({ zone: selectedZone, status: selectedStatus }),
        commonApi.getHouseholds(),
        commonApi.getZones()
      ]);
      console.log("Population Data:", peopleRes.data);
      const populationArray = Array.isArray(peopleRes.data) ? peopleRes.data : (peopleRes.data?.results || []);
      setPeople(populationArray);
      setHouseholds(Array.isArray(housesRes.data) ? housesRes.data : housesRes.data?.results || []);
      setZones(Array.isArray(zonesRes.data) ? zonesRes.data : zonesRes.data?.results || []);
    } catch (err) {
      console.error("API Failure Details:", err);
      setError(`Protocol link failed: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  }, [selectedZone, selectedStatus]);

  useEffect(() => {
    fetchPrimaryData();
  }, [fetchPrimaryData]);

  const filteredPeople = useMemo(() => {
    if (!Array.isArray(people)) return [];
    return people.filter((p) =>
      `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase())
    );
  }, [people, search]);

  const handleDeletePerson = async (id) => {
    if (confirm("Permanently delete this customer record?")) {
      try {
        await commonApi.deletePerson(id);
        setPeople(prev => prev.filter(p => p.id !== id));
      } catch {
        alert("Delete failed");
      }
    }
  };

  const getZoneDisplay = (p) => {
    if (p.household?.zone?.name) return p.household.zone.name;
    if (p.zone_name) return p.zone_name;
    return "LOBBY";
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-linear-to-br dark:from-indigo-950 dark:via-slate-900 dark:to-black relative overflow-hidden transition-colors duration-500 italic">
      <div className="flex relative z-10 w-full h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <Topbar />
          <div className="flex-1 overflow-y-auto p-4 md:p-8 w-full">
            <div className="max-w-7xl mx-auto space-y-8 pt-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                  <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">Customer <span className="text-violet-600 dark:text-violet-400">Database</span></h1>
                  <p className="text-violet-600 dark:text-violet-300 font-medium font-mono text-sm uppercase tracking-widest opacity-80 decoration-violet-500/30 underline decoration-2">Module_Traffic_Control // Sec_Lvl: Admin</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => {setSelectedHouse(null); setIsHouseModalOpen(true);}} className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-200 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 shadow-sm transition-all hover:border-violet-200 dark:hover:border-violet-500/30">
                    <UserGroupIcon className="w-4 h-4 text-violet-500" /> Dining Areas
                  </button>
                  <button onClick={() => {setSelectedPerson(null); setIsPersonModalOpen(true);}} className="flex items-center gap-2 px-5 py-3 bg-violet-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-violet-700 shadow-xl shadow-violet-500/20 transition-all active:scale-95">
                    <PlusIcon className="w-4 h-4" /> New Entry
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2">
                <input type="text" placeholder="Search customer records..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full px-5 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-4 focus:ring-violet-500/5 transition-all shadow-sm font-bold text-slate-900 dark:text-white text-sm" />
              </div>
              <select value={selectedZone} onChange={(e) => setSelectedZone(e.target.value)} className="w-full px-5 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-4 focus:ring-violet-500/5 transition-all shadow-sm font-black text-[10px] uppercase tracking-widest text-slate-400 cursor-pointer appearance-none">
                <option value="">All Shop Zones</option>
                {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
              </select>
              <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-5 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-4 focus:ring-violet-500/5 transition-all shadow-sm font-black text-[10px] uppercase tracking-widest text-slate-400 cursor-pointer appearance-none">
                <option value="Active">Active Customers</option>
                <option value="Archived">History Records</option>
              </select>
            </div>

            <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl rounded-4xl border border-slate-100 dark:border-white/5 shadow-xl overflow-hidden">
              <div className="overflow-x-auto min-h-75">
                <table className="min-w-full text-sm text-left">
                  <thead><tr className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-50 dark:border-white/5 uppercase tracking-[0.2em] text-[10px] text-slate-400 font-black"><th className="px-8 py-5">Customer Profile</th><th className="px-8 py-5">Traffic Status</th><th className="px-8 py-5">Service Area</th><th className="px-8 py-5 text-right">Operational Actions</th></tr></thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                    {filteredPeople.length > 0 ? filteredPeople.map((p) => (
                      <tr key={p.id} className="hover:bg-violet-50/30 dark:hover:bg-white/5 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="font-black text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors uppercase italic leading-none">{p.first_name} {p.last_name}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-1 opacity-60">REF: {p.id.toString().padStart(6, '0')}</div>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${p.status === "Active" ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20" : "bg-slate-100 dark:bg-white/5 text-slate-500"}`}>{p.status}</span>
                        </td>
                        <td className="px-8 py-5 font-bold uppercase text-[10px] tracking-widest text-slate-500 dark:text-slate-400">{getZoneDisplay(p)}</td>
                        <td className="px-8 py-5 text-right flex justify-end gap-3 invisible group-hover:visible transition-all">
                          <button 
                            onClick={() => { setSelectedPerson(p); setIsEventModalOpen(true); }} 
                            className="p-2 hover:bg-amber-50 dark:hover:bg-amber-500/10 text-amber-600 rounded-xl transition-all border border-transparent hover:border-amber-100 dark:hover:border-amber-500/20"
                            title="Record Life Event"
                          >
                            <BookOpenIcon className="w-4 h-4" />
                          </button>
                          <button onClick={() => {setSelectedPerson(p); setIsPersonModalOpen(true);}} className="p-2 hover:bg-violet-50 dark:hover:bg-violet-500/10 text-violet-600 rounded-xl transition-all border border-transparent hover:border-violet-100 dark:hover:border-violet-500/20">Edit</button>
                          <button onClick={() => handleDeletePerson(p.id)} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-500 rounded-xl transition-all border border-transparent hover:border-rose-100 dark:hover:border-rose-500/20 font-black text-[10px] uppercase tracking-widest">Delete</button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="4" className="px-8 py-20 text-center text-slate-400 font-black text-[10px] uppercase tracking-widest italic opacity-40 leading-relaxed">System scan complete.<br/>No customer records detected in current matrix.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <PersonModal isOpen={isPersonModalOpen} onClose={() => setIsPersonModalOpen(false)} person={selectedPerson} households={households} zones={zones} onSave={fetchPrimaryData} />
      <HouseholdModal isOpen={isHouseModalOpen} onClose={() => setIsHouseModalOpen(false)} household={selectedHouse} zones={zones} onSave={fetchPrimaryData} />
      <LifeEventModal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} person={selectedPerson} onSave={fetchPrimaryData} />
    </div>
  </div>
);
}