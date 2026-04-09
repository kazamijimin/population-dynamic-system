import { useEffect, useState, useMemo, useCallback } from "react";
import commonApi from "../../api/common.api";
import PersonModal from "./PersonModal";
import HouseholdModal from "./HouseholdModal";
import { PlusIcon, UserGroupIcon, MapPinIcon } from "@heroicons/react/24/outline";

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
    if (confirm("Permanently delete this resident record?")) {
      try {
        await commonApi.deletePerson(id);
        setPeople(people.filter(p => p.id !== id));
      } catch {
        alert("Delete failed");
      }
    }
  };

  const handleArchive = async (id) => {
    try {
      await commonApi.archivePerson(id);
      fetchPrimaryData();
    } catch {
      alert("Archive failed");
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
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Resident Database</h1>
            <p className="text-gray-500 font-medium font-mono text-sm">PROPRIETARY // POPULATION DYNAMICS ENGINE</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => {setSelectedHouse(null); setIsHouseModalOpen(true);}} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 shadow-sm">
              <UserGroupIcon className="w-5 h-5 text-indigo-500" /> Households
            </button>
            <button onClick={() => {setSelectedPerson(null); setIsPersonModalOpen(true);}} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-md">
              <PlusIcon className="w-5 h-5" /> New Resident
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <input type="text" placeholder="Quick search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none" />
          </div>
          <select value={selectedZone} onChange={(e) => setSelectedZone(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none">
            <option value="">All Zones</option>
            {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
          </select>
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none">
            <option value="Active">Active Residents</option>
            <option value="Archived">Archived Records</option>
          </select>
        </div>

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead><tr className="bg-gray-50 border-b border-gray-100 uppercase tracking-wider text-gray-500 font-bold"><th className="px-8 py-4">Resident</th><th className="px-8 py-4">Status</th><th className="px-8 py-4">Zone</th><th className="px-8 py-4 text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-gray-50">
                {filteredPeople.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-4 font-bold">{p.first_name} {p.last_name}</td>
                    <td className="px-8 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${p.status === "Active" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{p.status}</span>
                    </td>
                    <td className="px-8 py-4">{p.zone_name || "N/A"}</td>
                    <td className="px-8 py-4 text-right flex justify-end gap-3">
                      <button onClick={() => handleArchive(p.id)} className="text-amber-600 font-bold">
                        {p.status === "Active" ? "Archive" : "Unarchive"}
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
    </div>
  );
}