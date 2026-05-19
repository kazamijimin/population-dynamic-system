import { useEffect, useState, useMemo, useCallback } from "react";
import commonApi from "../../api/common.api";
import PersonModal from "./PersonModal";
import HouseholdModal from "./HouseholdModal";
import LifeEventModal from "./LifeEventModal";
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";
import {
  PlusIcon,
  UserGroupIcon,
  BookOpenIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowPathIcon,
  MapPinIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

const toArray = (data) => (Array.isArray(data) ? data : data?.results || []);

const formatZoneName = (name) =>
  String(name || "Unassigned")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function Population() {
  const [people, setPeople] = useState([]);
  const [households, setHouseholds] = useState([]);
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Active");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
  const [isHouseModalOpen, setIsHouseModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedHouse, setSelectedHouse] = useState(null);

  const fetchPrimaryData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [housesRes, zonesRes] = await Promise.all([
        commonApi.getHouseholds(),
        commonApi.getZones(),
      ]);

      const zoneArray = toArray(zonesRes.data);
      const householdArray = toArray(housesRes.data);
      setZones(zoneArray);
      setHouseholds(householdArray);

      const peopleRes = await commonApi.getPopulation({
        zone: selectedZone,
        status: selectedStatus || undefined,
      });
      setPeople(toArray(peopleRes.data));
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Unable to load customer records.");
    } finally {
      setLoading(false);
    }
  }, [selectedZone, selectedStatus]);

  useEffect(() => {
    fetchPrimaryData();
  }, [fetchPrimaryData]);

  const filteredPeople = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return people;
    return people.filter((person) =>
      [
        person.first_name,
        person.middle_name,
        person.last_name,
        person.location_name,
        person.zone_name,
        person.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [people, search]);

  const activeCustomers = people.filter((person) => person.status === "Active").length;
  const occupiedAreas = households.filter((house) => Number(house.member_count || 0) > 0).length;
  const availableAreas = households.filter(
    (house) => house.status === "available" && Number(house.member_count || 0) < Number(house.capacity || 0),
  ).length;

  const openPersonModal = (person = null) => {
    setSelectedPerson(person);
    setIsPersonModalOpen(true);
  };

  const openHouseholdModal = async (household = null) => {
    try {
      const zonesRes = await commonApi.getZones();
      setZones(toArray(zonesRes.data));
      setSelectedHouse(household);
      setIsHouseModalOpen(true);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Unable to load cafe zones.");
    }
  };

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleDeletePerson = async (id) => {
    if (!window.confirm("Delete this customer record?")) return;
    try {
      await commonApi.deletePerson(id);
      setPeople((current) => current.filter((person) => person.id !== id));
      showSuccess("Customer successfully deleted.");
    } catch (err) {
      setError(err.response?.data?.detail || "Delete failed.");
    }
  };

  const handleDeleteHousehold = async (id) => {
    if (!window.confirm("Delete this dining area? Customers assigned to it may block deletion.")) return;
    try {
      await commonApi.deleteHousehold(id);
      setHouseholds((current) => current.filter((house) => house.id !== id));
      showSuccess("Dining area successfully deleted.");
    } catch (err) {
      setError(err.response?.data?.detail || "Dining area deletion failed.");
    }
  };

  const getZoneDisplay = (person) => person.zone_name || "Unassigned";

  return (
    <div className="h-screen w-full bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-hidden">
      <div className="flex w-full h-full">
        <Sidebar />
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
              <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-5 pt-3">
                <div>
                  <p className="text-[11px] font-black text-violet-600 uppercase tracking-[0.35em]">
                    Customer Records
                  </p>
                  <h1 className="mt-2 text-4xl lg:text-5xl font-black text-slate-950 dark:text-white tracking-tight uppercase">
                    Customer Database
                  </h1>
                  <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                    Manage guest records, dining tables, shop zones, and customer activity.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => fetchPrimaryData()}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-200 font-black text-xs uppercase tracking-widest shadow-sm hover:border-violet-300"
                  >
                    <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                  </button>
                  <button
                    type="button"
                    onClick={() => openHouseholdModal()}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-200 font-black text-xs uppercase tracking-widest shadow-sm hover:border-violet-300"
                  >
                    <UserGroupIcon className="w-4 h-4 text-violet-500" />
                    Add Dining Area
                  </button>
                  <button
                    type="button"
                    onClick={() => openPersonModal()}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-violet-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-violet-500/20 hover:bg-violet-700"
                    disabled={households.length === 0}
                    title={households.length === 0 ? "Create a dining area first" : "Register customer"}
                  >
                    <PlusIcon className="w-4 h-4" />
                    New Entry
                  </button>
                </div>
              </header>

              {success && (
                <div className="flex items-start justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                  <span>{success}</span>
                  <button type="button" onClick={() => setSuccess(null)} className="font-black hover:text-emerald-900 dark:hover:text-white">
                    x
                  </button>
                </div>
              )}

              {error && (
                <div className="flex items-start justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                  <span>{error}</span>
                  <button type="button" onClick={() => setError(null)} className="font-black hover:text-rose-900 dark:hover:text-white">
                    x
                  </button>
                </div>
              )}

              <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard label="Active Customers" value={activeCustomers} icon={UsersIcon} />
                <StatCard label="Dining Areas" value={households.length} icon={UserGroupIcon} />
                <StatCard label="Available Areas" value={availableAreas} icon={MapPinIcon} />
                <StatCard label="Occupied Areas" value={occupiedAreas} icon={BookOpenIcon} />
              </section>

              <section className="grid grid-cols-1 xl:grid-cols-[0.85fr_1.6fr] gap-6">
                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-violet-500">
                        Dining Areas
                      </p>
                      <h2 className="text-lg font-black text-slate-950 dark:text-white">Tables & Zones</h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => openHouseholdModal()}
                      className="px-3 py-2 rounded-xl bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest"
                    >
                      Add
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[520px] overflow-y-auto">
                    {households.length === 0 ? (
                      <EmptyState
                        title="No dining areas yet"
                        description="Create tables before adding customer records."
                        actionLabel="Create Dining Area"
                        onAction={() => openHouseholdModal()}
                      />
                    ) : (
                      households.map((house) => (
                        <div key={house.id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/60">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-base font-black text-slate-950 dark:text-white">
                                {house.location_id}
                              </h3>
                              <p className="mt-1 text-xs font-semibold text-slate-500">
                                {formatZoneName(house.zone_name)} {house.section_label ? `- ${house.section_label}` : ""}
                              </p>
                            </div>
                            <span className="px-2.5 py-1 rounded-full bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-300 text-[10px] font-black uppercase">
                              {house.area_type || "table"}
                            </span>
                          </div>

                          <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                            <Metric label="Seats" value={house.capacity} />
                            <Metric label="Guests" value={house.member_count || 0} />
                            <Metric label="Status" value={house.status || "available"} />
                          </div>

                          <div className="mt-4 flex gap-2">
                            <button
                              type="button"
                              onClick={() => openHouseholdModal(house)}
                              className="flex-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-200 text-[10px] font-black uppercase tracking-widest hover:bg-violet-50 hover:text-violet-600"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteHousehold(house.id)}
                              className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-300 text-[10px] font-black uppercase tracking-widest"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-[1fr_220px_220px] gap-3">
                    <input
                      type="text"
                      placeholder="Search customers, areas, status..."
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-400 font-semibold text-slate-900 dark:text-white"
                    />
                    <select
                      value={selectedZone}
                      onChange={(event) => setSelectedZone(event.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none font-black text-xs uppercase tracking-widest text-slate-500"
                    >
                      <option value="">All Shop Zones</option>
                      {zones.map((zone) => (
                        <option key={zone.id} value={zone.id}>
                          {formatZoneName(zone.name)}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedStatus}
                      onChange={(event) => setSelectedStatus(event.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none font-black text-xs uppercase tracking-widest text-slate-500"
                    >
                      <option value="">All Statuses</option>
                      <option value="Active">Active Customers</option>
                      <option value="Archived">History Records</option>
                      <option value="Deactivated">Deactivated</option>
                    </select>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-100 dark:border-slate-800">
                          <th className="px-6 py-4 text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                            Customer
                          </th>
                          <th className="px-6 py-4 text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                            Table / Zone
                          </th>
                          <th className="px-6 py-4 text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                            Status
                          </th>
                          <th className="px-6 py-4 text-right text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {loading ? (
                          <tr>
                            <td colSpan="4" className="px-6 py-20 text-center text-slate-400 font-bold">
                              Loading customer records...
                            </td>
                          </tr>
                        ) : filteredPeople.length > 0 ? (
                          filteredPeople.map((person) => (
                            <tr key={person.id} className="hover:bg-violet-50/40 dark:hover:bg-slate-800/60">
                              <td className="px-6 py-5">
                                <div className="font-black text-slate-950 dark:text-white">
                                  {person.first_name} {person.last_name}
                                </div>
                                <div className="mt-1 text-[11px] text-slate-400 font-mono">
                                  REF {String(person.id).padStart(6, "0")}
                                </div>
                              </td>
                              <td className="px-6 py-5">
                                <div className="font-bold text-slate-700 dark:text-slate-200">
                                  {person.location_name || "No table"}
                                </div>
                                <div className="mt-1 text-[11px] text-slate-400 uppercase tracking-widest">
                                  {formatZoneName(getZoneDisplay(person))}
                                </div>
                              </td>
                              <td className="px-6 py-5">
                                <span
                                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                    person.status === "Active"
                                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                                      : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300"
                                  }`}
                                >
                                  {person.status}
                                </span>
                              </td>
                              <td className="px-6 py-5">
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedPerson(person);
                                      setIsEventModalOpen(true);
                                    }}
                                    className="p-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100"
                                    title="Record event"
                                  >
                                    <BookOpenIcon className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openPersonModal(person)}
                                    className="p-2 rounded-xl bg-violet-50 text-violet-600 hover:bg-violet-100"
                                    title="Edit customer"
                                  >
                                    <PencilSquareIcon className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeletePerson(person.id)}
                                    className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100"
                                    title="Delete customer"
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4">
                              <EmptyState
                                title="No customer records found"
                                description={
                                  households.length === 0
                                    ? "Create a dining area first, then add a customer record."
                                    : "Add a customer or adjust the filters."
                                }
                                actionLabel={households.length === 0 ? "Create Dining Area" : "New Entry"}
                                onAction={households.length === 0 ? () => openHouseholdModal() : () => openPersonModal()}
                              />
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>

      <PersonModal
        isOpen={isPersonModalOpen}
        onClose={() => setIsPersonModalOpen(false)}
        person={selectedPerson}
        households={households}
        zones={zones}
        onSave={(msg) => {
          fetchPrimaryData();
          if (msg) showSuccess(msg);
        }}
      />
      <HouseholdModal
        isOpen={isHouseModalOpen}
        onClose={() => setIsHouseModalOpen(false)}
        household={selectedHouse}
        zones={zones}
        onSave={(msg) => {
          fetchPrimaryData();
          if (msg) showSuccess(msg);
        }}
      />
      <LifeEventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        person={selectedPerson}
        onSave={fetchPrimaryData}
      />
    </div>
  );
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">{value}</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-300 flex items-center justify-center">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 px-3 py-2">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-1 text-xs font-black text-slate-800 dark:text-slate-100 uppercase truncate">{value}</p>
    </div>
  );
}

function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto w-14 h-14 rounded-3xl bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-300 flex items-center justify-center">
        <UserGroupIcon className="w-7 h-7" />
      </div>
      <h3 className="mt-5 text-lg font-black text-slate-950 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">{description}</p>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 px-5 py-3 rounded-xl bg-violet-600 text-white text-xs font-black uppercase tracking-widest hover:bg-violet-700"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
