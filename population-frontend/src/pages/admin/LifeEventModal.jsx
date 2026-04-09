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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Status Update</h2>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-tight">GUEST: {person.first_name} {person.last_name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-200">
            <XMarkIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Update Type</label>
            <select
              value={formData.event_type}
              onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500/20 transition-all font-medium"
            >
              <option value="Birth">Entry (New Customer-Born)</option>
              <option value="Death">Departure (Service End)</option>
              <option value="In-Migration">In-Migration (Walk-in)</option>
              <option value="Out-Migration">Blacklist (Banned)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Effective Time</label>
            <input
              type="date"
              required
              value={formData.event_date}
              onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500/20 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Observation / Notes</label>
            <textarea
              placeholder="Enter context or special instructions..."
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500/20 transition-all font-medium resize-none"
            />
          </div>

          {getWarningMessage() && (
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3 items-start">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 font-medium leading-relaxed">{getWarningMessage()}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading ? "Recording..." : "Save Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
