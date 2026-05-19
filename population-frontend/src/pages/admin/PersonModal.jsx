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
            household: households[0]?.id || "",
            zone: households[0]?.zone || "",
            status: "Active",
            is_manually_updated: false
          });
        }
      }, 0);
    }
  }, [person, isOpen, households]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { zone, ...payload } = formData;
      if (person?.id) {
        await commonApi.updatePerson(person.id, payload);
      } else {
        await commonApi.createPerson(payload);
      }
      onSave(person?.id ? "Guest record updated successfully!" : "Guest record created successfully!");
      onClose();
    } catch (err) {
      const data = err.response?.data;
      const message = data?.detail || Object.entries(data || {})
        .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(", ") : messages}`)
        .join("\n") || "Unknown error";
      alert("Error saving customer: " + message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="ds-modal-backdrop">
      <div className="ds-modal max-w-2xl">
        <div className="ds-modal-header">
          <div>
            <p className="ds-eyebrow mb-1">Customer Records</p>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {person ? "Manage Guest" : "Register Guest"}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="ds-btn ds-btn-ghost ds-btn-icon rounded-2xl" aria-label="Close">
            x
          </button>
        </div>

        <form onSubmit={handleSubmit} className="ds-modal-body grid grid-cols-1 md:grid-cols-2 gap-5 max-h-[70vh] overflow-y-auto">
          <div className="ds-field">
            <label className="ds-label">First Name</label>
            <input required type="text" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} className="ds-input" />
          </div>
          <div className="ds-field">
            <label className="ds-label">Last Name</label>
            <input required type="text" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} className="ds-input" />
          </div>
          <div className="ds-field">
            <label className="ds-label">Arrival Date (Birth)</label>
            <input required type="date" value={formData.birth_date} onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })} className="ds-input" />
          </div>
          <div className="ds-field">
            <label className="ds-label">Gender</label>
            <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="ds-select">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="ds-field">
            <label className="ds-label">Dining Table / Area</label>
            <select
              required
              value={formData.household}
              onChange={(e) => {
                const selectedHousehold = households.find((h) => String(h.id) === e.target.value);
                setFormData({ ...formData, household: e.target.value, zone: selectedHousehold?.zone || "" });
              }}
              className="ds-select"
              disabled={households.length === 0}
            >
              <option value="">{households.length === 0 ? "No tables available" : "Select Table/Area"}</option>
              {households.map((h) => <option key={h.id} value={h.id}>Table {h.location_id}</option>)}
            </select>
            {households.length === 0 && (
              <p className="mt-2 text-xs font-semibold text-amber-600">
                Create a dining area first, then reopen this form.
              </p>
            )}
          </div>
          <div className="ds-field">
            <label className="ds-label">Shop Zone</label>
            <select value={formData.zone} onChange={(e) => setFormData({ ...formData, zone: e.target.value })} className="ds-select" disabled>
              <option value="">(Inherited from Table)</option>
              {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3 md:col-span-2 mt-2 bg-violet-50 dark:bg-violet-500/10 p-4 rounded-2xl border border-violet-100 dark:border-violet-400/10">
            <input type="checkbox" id="manual" checked={formData.is_manually_updated} onChange={(e) => setFormData({ ...formData, is_manually_updated: e.target.checked })} className="accent-violet-600" />
            <label htmlFor="manual" className="text-xs font-semibold text-violet-900 dark:text-violet-200 uppercase tracking-wide">
              Priority Lock (System won&apos;t auto-calculate this guest)
            </label>
          </div>

          <div className="md:col-span-2 ds-modal-footer -mx-6 -mb-5 mt-6">
            <button type="button" onClick={onClose} className="ds-btn ds-btn-secondary">Cancel</button>
            <button type="submit" className="ds-btn ds-btn-primary" disabled={households.length === 0}>
              {person ? "Update Record" : "Confirm Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
