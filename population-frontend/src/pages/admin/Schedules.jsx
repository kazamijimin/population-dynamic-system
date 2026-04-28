import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import commonApi from "../../api/common.api";
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";
import { PlusIcon, CalendarIcon, ClockIcon, ServerIcon, TrashIcon, PencilSquareIcon } from "@heroicons/react/24/outline";

export default function Schedules() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    task_name: "",
    scheduled_time: "",
    node_id: "Node_01",
    status: "Pending",
    priority: 1
  });

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const res = await commonApi.getSchedules();
      setSchedules(Array.isArray(res.data) ? res.data : res.data?.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await commonApi.updateSchedule(editingId, {
          task_name: formData.task_name,
          scheduled_time: formData.scheduled_time,
          node_id: formData.node_id,
          status: formData.status,
          priority: formData.priority
        });
      } else {
        await commonApi.createSchedule(formData);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({
        task_name: "",
        scheduled_time: "",
        node_id: "Node_01",
        status: "Pending",
        priority: 1
      });
      fetchSchedules();
    } catch (err) {
      alert("Save failed");
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      task_name: item.task_name,
      scheduled_time: item.scheduled_time,
      node_id: item.node_id,
      status: item.status,
      priority: item.priority
    });
    setIsModalOpen(true);
  };

  const handleToggleDone = async (item) => {
    try {
      const newStatus = item.status === "Completed" ? "Pending" : "Completed";
      await commonApi.updateSchedule(item.id, { status: newStatus });
      fetchSchedules();
    } catch (err) {
      alert("Status update failed");
    }
  };

  const handleAbort = async (id) => {
    if (window.confirm("PROTOCOL_WARNING: Abort this operational thread?")) {
      try {
        await commonApi.updateSchedule(id, { status: "Aborted" });
        fetchSchedules();
      } catch (err) {
        alert("Abort signal rejected");
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("IRREVERSIBLE: Delete this task from the timeline?")) {
      try {
        await commonApi.deleteSchedule(id);
        fetchSchedules();
      } catch (err) {
        alert("Deletion failed");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-linear-to-br dark:from-indigo-950 dark:via-slate-900 dark:to-black transition-colors duration-500 italic">
      <div className="flex w-full h-screen relative">
        <Sidebar />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full">
            <div className="max-w-7xl mx-auto pt-6">
              <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-violet-500 shadow-glow"></span>
                    <span className="px-2 py-0.5 rounded-full bg-violet-600/10 dark:bg-violet-600/20 text-violet-600 dark:text-violet-400 text-[10px] font-black uppercase tracking-widest border border-violet-500/20">Active Tasks</span>
                  </div>
                  <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
                    Operation <span className="text-violet-600 dark:text-violet-400">Timeline</span>
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium tracking-wide max-w-md border-l-2 border-violet-500/20 pl-4">
                    Managing shifts and automated tasks across the Nexus network.
                  </p>
                </div>

                <button onClick={() => { setEditingId(null); setIsModalOpen(true); }} className="flex items-center gap-2 px-6 py-4 bg-violet-600 text-white font-black text-[12px] uppercase tracking-widest rounded-2xl hover:bg-violet-700 shadow-2xl shadow-violet-500/20 transition-all active:scale-95">
                  <PlusIcon className="w-5 h-5" /> New Task
                </button>
              </header>

          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl border border-white/5 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/30 dark:bg-white/5">
                  <h2 className="text-2xl font-black text-gray-800 dark:text-white tracking-tighter uppercase italic">{editingId ? 'Modify Task' : 'Deploy New Task'}</h2>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-8 space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Task Definition</label>
                    <input 
                      required 
                      type="text" 
                      name="task_name"
                      placeholder="e.g. System Sync Phase"
                      value={formData.task_name} 
                      onChange={e => setFormData({...formData, task_name: e.target.value})} 
                      className="w-full px-5 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-violet-500 transition-all font-bold text-slate-900 dark:text-white" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time Window</label>
                      <input 
                        required 
                        type="text" 
                        name="scheduled_time"
                        placeholder="08:00 - 10:00"
                        value={formData.scheduled_time} 
                        onChange={e => setFormData({...formData, scheduled_time: e.target.value})} 
                        className="w-full px-5 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-violet-500 transition-all font-bold text-slate-900 dark:text-white" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Node</label>
                      <select 
                        name="node_id"
                        value={formData.node_id} 
                        onChange={e => setFormData({...formData, node_id: e.target.value})} 
                        className="w-full px-5 py-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-violet-500 transition-all font-black text-[10px] uppercase tracking-widest text-slate-500 cursor-pointer appearance-none"
                      >
                        <option value="Node_01">Node_01</option>
                        <option value="Node_02">Node_02</option>
                        <option value="Node_03">Node_03</option>
                        <option value="Node_ALL">Node_ALL</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-8">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition">Cancel</button>
                    <button type="submit" className="px-8 py-3 bg-violet-600 text-white rounded-xl shadow-lg shadow-violet-500/20 font-black text-[10px] uppercase tracking-widest hover:bg-violet-700 transition active:scale-95">
                      {editingId ? 'Save Changes' : 'Deploy Task'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schedules.map((item) => (
              <div key={item.id} className={`p-6 rounded-3xl bg-white dark:bg-slate-900/40 backdrop-blur-xl border hover:border-violet-500/30 transition-all shadow-xl group ${
                item.status === 'Aborted' ? 'grayscale opacity-75 border-rose-500/20' : 'border-slate-200 dark:border-white/5'
              }`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-2xl bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400">
                    <ClockIcon className="w-6 h-6" />
                  </div>
                  <div className="flex gap-2">
                    {item.status !== 'Aborted' && item.status !== 'Completed' && (
                      <button 
                        onClick={() => handleAbort(item.id)}
                        className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white"
                      >
                        Abort
                      </button>
                    )}
                    <button 
                      onClick={() => handleToggleDone(item)}
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                        item.status === 'Completed' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 
                        item.status === 'Aborted' ? 'bg-slate-200 dark:bg-white/5 text-slate-400 cursor-not-allowed' :
                        'bg-slate-500/10 text-slate-500 hover:bg-emerald-500/20'
                      }`}
                      disabled={item.status === 'Aborted'}
                    >
                      {item.status === 'Completed' ? '✓ Done' : item.status === 'Aborted' ? 'Aborted' : 'Mark Done'}
                    </button>
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-1 px-2 rounded-lg bg-violet-500/10 text-violet-500 hover:bg-violet-500 hover:text-white transition-all"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 px-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight mb-1">{item.task_name}</h3>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-bold mb-4">
                 <CalendarIcon className="w-4 h-4" /> {item.scheduled_time}
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-2">
                    <ServerIcon className="w-3.5 h-3.5 text-violet-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.node_id}</span>
                  </div>
                  <div className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-[10px] font-bold text-slate-400">
                    PRIORITY: {item.priority}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  </div>
</div>
);
}

