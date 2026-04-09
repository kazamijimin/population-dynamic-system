import React, { useState, useEffect } from "react";
import commonApi from "../../api/common.api";

export default function HouseholdModal({ isOpen, onClose, household, zones, onSave }) {
  const [formData, setFormData] = useState({
    house_number: "",
    street: "",
    zone: "",
    head_of_family: ""
  });

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (household) {
          setFormData({
            house_number: household.house_number || "",
            street: household.street || "",
            zone: household.zone || "",
            head_of_family: household.head_of_family || ""
          });
        } else {
          setFormData({ house_number: "", street: "", zone: "", head_of_family: "" });
        }
      }, 0);
    }
  }, [household, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (household?.id) {
        await commonApi.updateHousehold(household.id, formData);
      } else {
        await commonApi.createHousehold(formData);
      }
      onSave();
      onClose();
    } catch {
      alert("Error saving area");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">{household ? "Manage Dining Area" : "New Dining Area"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Table / Space Number</label>
            <input required type="text" value={formData.house_number} onChange={e => setFormData({...formData, house_number: e.target.value})} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm" placeholder="e.g. Table 01" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Section / Floor</label>
            <input required type="text" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm" placeholder="e.g. Mezzanine" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Shop Zone</label>
            <select required value={formData.zone} onChange={e => setFormData({...formData, zone: e.target.value})} className="w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm">
              <option value="">Select Cafe Zone</option>
              {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition font-bold text-sm uppercase">Cancel</button>
            <button type="submit" className="px-8 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-100 font-bold text-sm uppercase">
              {household ? "Update Area" : "Create Area"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
