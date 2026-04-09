import { useEffect, useState, useMemo, useCallback } from "react";
import commonApi from "../../api/common.api";
import PersonModal from "./PersonModal";
import HouseholdModal from "./HouseholdModal";
import LifeEventModal from "./LifeEventModal";
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
      const [peopleRes, housesRes, zonesRes] = await Promise.all([
        commonApi.getPopulation({ zone: selectedZone, status: selectedStatus }),
        commonApi.getHouseholds(),
        commonApi.getZones()
      ]);
      setPeople(Array.isArray(peopleRes.data) ? peopleRes.data : peopleRes.data?.results || []);
      setHouseholds(Array.isArray(housesRes.data) ? housesRes.data : housesRes.data?.results || []);
      setZones(Array.isArray(zonesRes.data) ? zonesRes.data : zonesRes.data?.results || []);
      setError(null);
    } catch {
      setError("Failed to load records from server");
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
        setPeople(people.filter(p => p.id !== id));
      } catch {
        alert("Delete failed");
      }
    }
  };

  if (loading && people.length === 0) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
      <div className="text-center animate-pulse">
        <div className="w-12 h-12 bg-indigo-600 rounded-full mx-auto mb-4" />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Accessing Database...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl font-bold flex items-center justify-between">
            <span>{error}</span>
            <button onClick={fetchPrimaryData} className="text-sm underline decoration-2">Retry Connection</button>
          </div>
        )}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Customer Database</h1>
            <p className="text-indigo-600 font-medium font-mono text-sm uppercase">Smart Coffee Shop // Demand Management</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => {setSelectedHouse(null); setIsHouseModalOpen(true);}} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 shadow-sm transition-all hover:border-indigo-200">
              <UserGroupIcon className="w-5 h-5 text-indigo-500" /> Dining Areas
            </button>
            <button onClick={() => {setSelectedPerson(null); setIsPersonModalOpen(true);}} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">
              <PlusIcon className="w-5 h-5" /> New Entry
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <input type="text" placeholder="Search customer records..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm" />
          </div>
          <select value={selectedZone} onChange={(e) => setSelectedZone(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm font-medium">
            <option value="">All Shop Zones</option>
            {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
          </select>
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm font-medium">
            <option value="Active">Active Customers</option>
            <option value="Archived">History Records</option>
          </select>
        </div>

        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead><tr className="bg-gray-50/50 border-b border-gray-50 uppercase tracking-widest text-[10px] text-gray-400 font-black"><th className="px-8 py-5">Customer Profile</th><th className="px-8 py-5">Traffic Status</th><th className="px-8 py-5">Service Area</th><th className="px-8 py-5 text-right">Operational Actions</th></tr></thead>
              <tbody className="divide-y divide-gray-50">
                {filteredPeople.map((p) => (
                  <tr key={p.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors uppercase leading-none">{p.first_name} {p.last_name}</div>
                      <div className="text-[10px] text-gray-400 font-mono mt-1 opacity-60">REF: {p.id.toString().padStart(6, '0')}</div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${p.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>{p.status}</span>
                    </td>
                    <td className="px-8 py-5 font-medium text-gray-600">{p.zone_name || "LOBBY"}</td>
                    <td className="px-8 py-5 text-right flex justify-end gap-3 invisible group-hover:visible">
                      <button 
                        onClick={() => { setSelectedPerson(p); setIsEventModalOpen(true); }} 
                        className="p-2 hover:bg-amber-50 text-amber-600 rounded-xl transition-all border border-transparent hover:border-amber-100"
                        title="Record Life Event"
                      >
                        <IdentificationIcon className="w-5 h-5" />
                      </button>
                      <button onClick={() => {setSelectedPerson(p); setIsPersonModalOpen(true);}} className="text-indigo-600 font-bold">Edit</button>
                      <button onClick={() => handleDeletePerson(p.id)} className="text-red-500 font-bold">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <PersonModal isOpen={isPersonModalOpen} onClose={() => setIsPersonModalOpen(false)} person={selectedPerson} households={households} zones={zones} onSave={fetchPrimaryData} />
      <HouseholdModal isOpen={isHouseModalOpen} onClose={() => setIsHouseModalOpen(false)} household={selectedHouse} zones={zones} onSave={fetchPrimaryData} />
      <LifeEventModal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} person={selectedPerson} onSave={fetchPrimaryData} />
    </div>
  );
}