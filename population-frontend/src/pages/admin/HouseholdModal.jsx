import React, { useMemo, useState, useEffect } from "react";
import commonApi from "../../api/common.api";

const FALLBACK_ZONES = [
  { id: "counter", name: "Counter" },
  { id: "seating", name: "Seating Area" },
  { id: "pickup", name: "Pickup Zone" },
  { id: "kitchen", name: "Kitchen" },
  { id: "outdoor", name: "Outdoor Terrace" },
];

export default function HouseholdModal({ isOpen, onClose, household, zones, onSave }) {
  const zoneOptions = useMemo(() => (zones?.length ? zones : FALLBACK_ZONES), [zones]);
  const [formData, setFormData] = useState({
    location_id: "",
    zone: "",
    area_type: "table",
    section_label: "",
    status: "available",
    capacity: 4,
    is_reservable: true,
    priority: 1,
    notes: ""
  });

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (household) {
          setFormData({
            location_id: household.location_id || "",
            zone: household.zone || "",
            area_type: household.area_type || "table",
            section_label: household.section_label || "",
            status: household.status || "available",
            capacity: household.capacity || 4,
            is_reservable: household.is_reservable ?? true,
            priority: household.priority || 1,
            notes: household.notes || ""
          });
        } else {
          setFormData({
            location_id: "",
            zone: zoneOptions[0]?.id || "",
            area_type: "table",
            section_label: "",
            status: "available",
            capacity: 4,
            is_reservable: true,
            priority: 1,
            notes: ""
          });
        }
      }, 0);
    }
  }, [household, isOpen, zoneOptions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let zoneValue = formData.zone || null;
      if (zoneValue && Number.isNaN(Number(zoneValue))) {
        const zonesRes = await commonApi.getZones();
        const existingZone = (Array.isArray(zonesRes.data) ? zonesRes.data : zonesRes.data?.results || [])
          .find((zone) => zone.name === zoneValue);
        if (existingZone) {
          zoneValue = existingZone.id;
        } else {
          const zoneRes = await commonApi.createZone({
            name: zoneValue,
            description: `${zoneValue} cafe zone`,
          });
          zoneValue = zoneRes.data?.id || zoneValue;
        }
      }

      const payload = {
        location_id: formData.location_id,
        zone: zoneValue,
        area_type: formData.area_type,
        section_label: formData.section_label,
        status: formData.status,
        capacity: Number(formData.capacity) || 1,
        is_reservable: formData.is_reservable,
        priority: Number(formData.priority) || 1,
        notes: formData.notes,
      };
      if (household?.id) {
        await commonApi.updateHousehold(household.id, payload);
      } else {
        await commonApi.createHousehold(payload);
      }
      onSave(household?.id ? "Dining area updated successfully!" : "Dining area created successfully!");
      onClose();
    } catch (err) {
      const data = err.response?.data;
      const message = data?.detail || Object.entries(data || {})
        .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(", ") : messages}`)
        .join("\n") || "Error saving area";
      alert(message);
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
          <button type="button" onClick={onClose} className="ds-btn ds-btn-ghost ds-btn-icon rounded-2xl" aria-label="Close">
            x
          </button>
        </div>

        <form onSubmit={handleSubmit} className="ds-modal-body space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="ds-field">
              <label className="ds-label">Table / Space Number</label>
              <input
                required
                type="text"
                value={formData.location_id}
                onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                className="ds-input"
                placeholder="e.g. T05"
              />
            </div>

            <div className="ds-field">
              <label className="ds-label">Seat Capacity</label>
              <input
                required
                min="1"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="ds-input"
                placeholder="4"
              />
            </div>
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
              {zoneOptions.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="ds-field">
              <label className="ds-label">Area Type</label>
              <select
                value={formData.area_type}
                onChange={(e) => setFormData({ ...formData, area_type: e.target.value })}
                className="ds-select"
              >
                <option value="table">Dining Table</option>
                <option value="bar">Bar Counter</option>
                <option value="booth">Booth</option>
                <option value="pickup">Pickup Area</option>
                <option value="storage">Storage Area</option>
              </select>
            </div>

            <div className="ds-field">
              <label className="ds-label">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="ds-select"
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="ds-field">
              <label className="ds-label">Section / Floor</label>
              <input
                type="text"
                value={formData.section_label}
                onChange={(e) => setFormData({ ...formData, section_label: e.target.value })}
                className="ds-input"
                placeholder="e.g. Main Floor"
              />
            </div>

            <div className="ds-field">
              <label className="ds-label">Priority</label>
              <input
                min="1"
                max="5"
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="ds-input"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 bg-violet-50 dark:bg-violet-500/10 p-4 rounded-2xl border border-violet-100 dark:border-violet-400/10">
            <input
              id="is_reservable"
              type="checkbox"
              checked={formData.is_reservable}
              onChange={(e) => setFormData({ ...formData, is_reservable: e.target.checked })}
              className="accent-violet-600"
            />
            <label htmlFor="is_reservable" className="text-xs font-semibold text-violet-900 dark:text-violet-200 uppercase tracking-wide">
              Accepts reservations and guest assignment
            </label>
          </div>

          <div className="ds-field">
            <label className="ds-label">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="ds-input min-h-24 resize-y"
              placeholder="Optional table notes, maintenance details, or access instructions"
            />
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
