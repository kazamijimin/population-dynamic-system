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
      alert("Error saving household");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">{household ? "Edit Household" : "New Household"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">House Number</label>
            <input required type="text" value={formData.house_number} onChange={e => setFormData({...formData, house_number: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Street / Landmark</label>
            <input required type="text" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Geographic Zone</label>
            <select required value={formData.zone} onChange={e => setFormData({...formData, zone: e.target.value})} className="w-full px-4 py-2 border rounded-lg outline-none">
              <option value="">Select Zone</option>
              {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button type="button" onClick={onClose} className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition font-medium">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-md font-medium">
              Save Household
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
