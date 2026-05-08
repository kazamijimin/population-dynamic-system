import { useState, useEffect } from "react";
import commonApi from "../../api/common.api";
import { XMarkIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export default function LifeEventModal({ isOpen, onClose, person, onSave }) {
  const [formData, setFormData] = useState({
    event_type: "Birth",
    event_date: new Date().toISOString().split("T")[0],
    description: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        event_type: "In-Migration",
        event_date: new Date().toISOString().split("T")[0],
        description: "",
      });
    }
  }, [isOpen]);

  if (!isOpen || !person) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await commonApi.recordEvent({
        ...formData,
        person: person.id,
      });
      onSave();
      onClose();
    } catch {
      alert("Failed to record life event. Please check the data.");
    } finally {
      setLoading(false);
    }
  };

  const getWarningMessage = () => {
    if (formData.event_type === "Death") return "This will mark the customer as Departed and remove them from live counts.";
    if (formData.event_type === "Out-Migration") return "This will archive the customer record (Blacklisted).";
    return null;
  };

  return (
    <div className="ds-modal-backdrop">
      <div className="ds-modal max-w-md">
        <div className="ds-modal-header">
          <div>
            <p className="ds-eyebrow mb-1">Status Update</p>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Status Update</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-tight">
              Guest: {person.first_name} {person.last_name}
            </p>
          </div>
          <button onClick={onClose} className="ds-btn ds-btn-ghost ds-btn-icon rounded-2xl">
            <XMarkIcon className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="ds-modal-body space-y-5">
          <div className="ds-field">
            <label className="ds-label">Update Type</label>
            <select
              value={formData.event_type}
              onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
              className="ds-select"
            >
              <option value="Birth">Entry (New Customer-Born)</option>
              <option value="Death">Departure (Service End)</option>
              <option value="In-Migration">In-Migration (Walk-in)</option>
              <option value="Out-Migration">Blacklist (Banned)</option>
            </select>
          </div>

          <div className="ds-field">
            <label className="ds-label">Effective Time</label>
            <input
              type="date"
              required
              value={formData.event_date}
              onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
              className="ds-input"
            />
          </div>

          <div className="ds-field">
            <label className="ds-label">Observation / Notes</label>
            <textarea
              placeholder="Enter context or special instructions..."
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="ds-textarea resize-none"
            />
          </div>

          {getWarningMessage() && (
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3 items-start">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 font-medium leading-relaxed">{getWarningMessage()}</p>
            </div>
          )}

          <div className="ds-modal-footer -mx-6 -mb-5 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="ds-btn ds-btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`ds-btn ds-btn-primary flex-1 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading ? "Recording..." : "Save Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
