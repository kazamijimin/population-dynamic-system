import React, { useState, useEffect } from "react";
import commonApi from "../../api/common.api";

export default function PersonModal({ isOpen, onClose, person, households, zones, onSave }) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    middle_name: "",
    birth_date: "",
    gender: "Male",
    civil_status: "Single",
    employment_status: "Unemployed",
    household: "",
    zone: "",
    status: "Active",
    is_manually_updated: false
  });

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (person) {
          setFormData({
            ...person,
            household: person.household || "",
            zone: person.zone || ""
          });
        } else {
          setFormData({
            first_name: "",
            last_name: "",
            middle_name: "",
            birth_date: "",
            gender: "Male",
            civil_status: "Single",
            employment_status: "Unemployed",
            household: "",
            zone: "",
            status: "Active",
            is_manually_updated: false
          });
        }
      }, 0);
    }
  }, [person, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (person?.id) {
        await commonApi.updatePerson(person.id, formData);
      } else {
        await commonApi.createPerson(formData);
      }
      onSave();
      onClose();
    } catch (err) {
      alert("Error saving resident: " + (err.response?.data?.detail || "Unknown error"));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">{person ? "Manage Guest" : "Register Guest"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">First Name</label>
            <input required type="text" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name</label>
            <input required type="text" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Arrival Date (Birth)</label>
            <input required type="date" value={formData.birth_date} onChange={e => setFormData({...formData, birth_date: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all shadow-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Gender</label>
            <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-amber-500 transition-all shadow-sm">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Dining Table / Area</label>
            <select required value={formData.household} onChange={e => setFormData({...formData, household: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-amber-500 transition-all shadow-sm">
              <option value="">Select Table/Area</option>
              {households.map(h => <option key={h.id} value={h.id}>Table {h.location_id}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Shop Zone</label>
            <select value={formData.zone} onChange={e => setFormData({...formData, zone: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-amber-500 transition-all shadow-sm">
              <option value="">(Inherited from Table)</option>
              {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 md:col-span-2 mt-4 bg-amber-50/50 p-4 rounded-xl border border-amber-100">
            <input type="checkbox" id="manual" checked={formData.is_manually_updated} onChange={e => setFormData({...formData, is_manually_updated: e.target.checked})} className="accent-amber-600" />
            <label htmlFor="manual" className="text-xs font-semibold text-amber-900 uppercase tracking-wide">
              Priority Lock (System won't auto-calculate this guest)
            </label>
          </div>

          <div className="md:col-span-2 flex justify-end gap-3 mt-8">
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition font-bold text-sm uppercase">Cancel</button>
            <button type="submit" className="px-8 py-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition shadow-lg shadow-amber-100 font-bold text-sm uppercase">
              {person ? "Update Record" : "Confirm Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
