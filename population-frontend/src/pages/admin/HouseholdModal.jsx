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
    <div className="ds-modal-backdrop">
      <div className="ds-modal max-w-lg">
        <div className="ds-modal-header">
          <div>
            <p className="ds-eyebrow mb-1">Area Management</p>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {household ? "Manage Dining Area" : "New Dining Area"}
            </h2>
          </div>
          <button onClick={onClose} className="ds-btn ds-btn-ghost ds-btn-icon rounded-2xl" aria-label="Close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="ds-modal-body space-y-5">
          <div className="ds-field">
            <label className="ds-label">Table / Space Number</label>
            <input
              required
              type="text"
              value={formData.house_number}
              onChange={(e) => setFormData({ ...formData, house_number: e.target.value })}
              className="ds-input"
              placeholder="e.g. Table 01"
            />
          </div>

          <div className="ds-field">
            <label className="ds-label">Section / Floor</label>
            <input
              required
              type="text"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              className="ds-input"
              placeholder="e.g. Mezzanine"
            />
          </div>

          <div className="ds-field">
            <label className="ds-label">Shop Zone</label>
            <select
              required
              value={formData.zone}
              onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
              className="ds-select"
            >
              <option value="">Select Cafe Zone</option>
              {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
            </select>
          </div>

          <div className="ds-modal-footer -mx-6 -mb-5 mt-6">
            <button type="button" onClick={onClose} className="ds-btn ds-btn-secondary">Cancel</button>
            <button type="submit" className="ds-btn ds-btn-primary">
              {household ? "Update Area" : "Create Area"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
