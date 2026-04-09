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
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">{person ? "Edit Resident" : "New Resident"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">First Name</label>
            <input required type="text" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name</label>
            <input required type="text" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Birth Date</label>
            <input required type="date" value={formData.birth_date} onChange={e => setFormData({...formData, birth_date: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Gender</label>
            <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Household</label>
            <select value={formData.household} onChange={e => setFormData({...formData, household: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none">
              <option value="">None / Floating</option>
              {households.map(h => <option key={h.id} value={h.id}>{h.house_number} ({h.head_of_family_name})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Zone (Barangay/Area)</label>
            <select value={formData.zone} onChange={e => setFormData({...formData, zone: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none">
              <option value="">Unassigned</option>
              {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 md:col-span-2 mt-4 bg-gray-50 p-4 rounded-lg">
            <input type="checkbox" id="manual" checked={formData.is_manually_updated} onChange={e => setFormData({...formData, is_manually_updated: e.target.checked})} />
            <label htmlFor="manual" className="text-sm font-medium text-gray-800">
              Manual Override (Prevents automated system updates from correcting this record)
            </label>
          </div>

          <div className="md:col-span-2 flex justify-end gap-3 mt-8">
            <button type="button" onClick={onClose} className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition font-medium">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md font-medium">
              {person ? "Save Changes" : "Create Resident"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
