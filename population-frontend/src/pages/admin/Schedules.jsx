import { useEffect, useMemo, useState } from "react";
import commonApi from "../../api/common.api";
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";
import {
  PlusIcon,
  CalendarIcon,
  ClockIcon,
  ServerIcon,
  TrashIcon,
  PencilSquareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

const STATUS_COLORS = {
  Pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Aborted: "bg-rose-500/10 text-rose-500 border-rose-500/20",
};

const DEFAULT_FORM = {
  task_name: "",
  schedule_date: "",
  time_window: "",
  node_id: "Node_01",
  status: "Pending",
  priority: 1,
};

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseScheduleDetails = (scheduleTime) => {
  const value = String(scheduleTime || "").trim();
  const isoMatch = value.match(/^(\d{4}-\d{2}-\d{2})(?:[T\s]+(.+))?$/);

  if (isoMatch) {
    return {
      dateKey: isoMatch[1],
      timeLabel: (isoMatch[2] || "All day").trim(),
      raw: value,
    };
  }

  const readableMatch = value.match(
    /\b([A-Z][a-z]{2,8}\s+\d{1,2},\s+\d{4})\b(?:\s*[|-]\s*(.*))?/,
  );

  if (readableMatch) {
    const parsedDate = new Date(readableMatch[1]);
    if (!Number.isNaN(parsedDate.getTime())) {
      return {
        dateKey: toDateKey(parsedDate),
        timeLabel: (readableMatch[2] || "All day").trim(),
        raw: value,
      };
    }
  }

  return {
    dateKey: null,
    timeLabel: value || "Time not set",
    raw: value,
  };
};

const toSchedulePayload = (formData) => ({
  task_name: formData.task_name,
  scheduled_time: formData.schedule_date
    ? `${formData.schedule_date} ${formData.time_window || "All day"}`
    : formData.time_window,
  node_id: formData.node_id,
  status: formData.status,
  priority: Number(formData.priority) || 1,
});

const getApiErrorMessage = (err, fallback) => {
  const data = err?.response?.data;
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  return Object.entries(data)
    .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(", ") : messages}`)
    .join("\n") || fallback;
};

const getFormDataFromItem = (item) => {
  const parsed = parseScheduleDetails(item.scheduled_time);

  return {
    task_name: item.task_name || "",
    schedule_date: parsed.dateKey || "",
    time_window:
      parsed.dateKey && parsed.timeLabel !== "All day" ? parsed.timeLabel : "",
    node_id: item.node_id || "Node_01",
    status: item.status || "Pending",
    priority: item.priority || 1,
  };
};

export default function Schedules() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));

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

  const enrichedSchedules = useMemo(
    () =>
      schedules.map((item) => {
        const parsed = parseScheduleDetails(item.scheduled_time);
        return {
          ...item,
          parsedDateKey: parsed.dateKey,
          parsedTimeLabel: parsed.timeLabel,
          parsedRawTime: parsed.raw,
        };
      }),
    [schedules],
  );

  const schedulesByDate = useMemo(() => {
    return enrichedSchedules.reduce((acc, item) => {
      if (!item.parsedDateKey) return acc;
      if (!acc[item.parsedDateKey]) acc[item.parsedDateKey] = [];
      acc[item.parsedDateKey].push(item);
      return acc;
    }, {});
  }, [enrichedSchedules]);

  const selectedDaySchedules = schedulesByDate[selectedDate] || [];
  const unscheduledItems = enrichedSchedules.filter((item) => !item.parsedDateKey && item.status !== "Completed");

  const monthLabel = calendarMonth.toLocaleDateString([], {
    month: "long",
    year: "numeric",
  });

  const selectedDateLabel = new Date(`${selectedDate}T00:00:00`).toLocaleDateString(
    [],
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  );

  const calendarDays = useMemo(() => {
    const startOfMonth = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth(),
      1,
    );
    const startWeekday = startOfMonth.getDay();
    const firstGridDate = new Date(startOfMonth);
    firstGridDate.setDate(firstGridDate.getDate() - startWeekday);

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(firstGridDate);
      date.setDate(firstGridDate.getDate() + index);

      const dateKey = toDateKey(date);
      return {
        date,
        dateKey,
        isCurrentMonth: date.getMonth() === calendarMonth.getMonth(),
        isToday: dateKey === toDateKey(new Date()),
        isSelected: dateKey === selectedDate,
        count: schedulesByDate[dateKey]?.length || 0,
      };
    });
  }, [calendarMonth, schedulesByDate, selectedDate]);

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      ...DEFAULT_FORM,
      schedule_date: selectedDate,
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(DEFAULT_FORM);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = toSchedulePayload(formData);

      if (editingId) {
        await commonApi.updateSchedule(editingId, payload);
      } else {
        await commonApi.createSchedule(payload);
      }

      closeModal();
      fetchSchedules();
    } catch (err) {
      alert(getApiErrorMessage(err, "Save failed"));
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData(getFormDataFromItem(item));
    setIsModalOpen(true);
  };

  const handleToggleDone = async (item) => {
    try {
      const newStatus = item.status === "Completed" ? "Pending" : "Completed";
      await commonApi.updateSchedule(item.id, { status: newStatus });
      fetchSchedules();
    } catch (err) {
      alert(getApiErrorMessage(err, "Status update failed"));
    }
  };

  const handleAbort = async (id) => {
    if (window.confirm("PROTOCOL_WARNING: Abort this operational thread?")) {
      try {
        await commonApi.updateSchedule(id, { status: "Aborted" });
        fetchSchedules();
      } catch (err) {
        alert(getApiErrorMessage(err, "Abort signal rejected"));
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
    <div className="h-screen overflow-hidden bg-slate-50 dark:bg-linear-to-br dark:from-indigo-950 dark:via-slate-900 dark:to-black transition-colors duration-500 italic">
      <div className="flex w-full h-full relative">
        <Sidebar />
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full">
            <div className="max-w-7xl mx-auto pt-6">
              <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-violet-500 shadow-glow"></span>
                    <span className="px-2 py-0.5 rounded-full bg-violet-600/10 dark:bg-violet-600/20 text-violet-600 dark:text-violet-400 text-[10px] font-black uppercase tracking-widest border border-violet-500/20">
                      Active Tasks
                    </span>
                  </div>
                  <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
                    Operation <span className="text-violet-600 dark:text-violet-400">Timeline</span>
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium tracking-wide max-w-md border-l-2 border-violet-500/20 pl-4">
                    Managing shifts and automated tasks across the Nexus network.
                  </p>
                </div>

                <button
                  onClick={() => {
                    resetForm();
                    setIsModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-6 py-4 bg-violet-600 text-white font-black text-[12px] uppercase tracking-widest rounded-2xl hover:bg-violet-700 shadow-2xl shadow-violet-500/20 transition-all active:scale-95"
                >
                  <PlusIcon className="w-5 h-5" /> New Task
                </button>
              </header>

              <section className="grid grid-cols-1 xl:grid-cols-[1.45fr_0.95fr] gap-8 mb-10">
                <div className="rounded-[2rem] border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 shadow-xl overflow-hidden">
                  <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-slate-100 dark:border-white/5">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-violet-500">
                        Calendar View
                      </p>
                      <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                        {monthLabel}
                      </h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setCalendarMonth(
                            new Date(
                              calendarMonth.getFullYear(),
                              calendarMonth.getMonth() - 1,
                              1,
                            ),
                          )
                        }
                        className="p-2 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-violet-500 hover:text-white transition-all"
                        aria-label="Previous month"
                      >
                        <ChevronLeftIcon className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const today = new Date();
                          setCalendarMonth(
                            new Date(today.getFullYear(), today.getMonth(), 1),
                          );
                          setSelectedDate(toDateKey(today));
                        }}
                        className="px-4 py-2 rounded-2xl bg-violet-600/10 text-violet-600 dark:text-violet-400 text-[10px] font-black uppercase tracking-widest hover:bg-violet-600 hover:text-white transition-all"
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setCalendarMonth(
                            new Date(
                              calendarMonth.getFullYear(),
                              calendarMonth.getMonth() + 1,
                              1,
                            ),
                          )
                        }
                        className="p-2 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-violet-500 hover:text-white transition-all"
                        aria-label="Next month"
                      >
                        <ChevronRightIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-px bg-slate-200/80 dark:bg-white/5">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                      <div
                        key={day}
                        className="bg-slate-50 dark:bg-slate-950/60 px-3 py-3 text-[10px] font-black uppercase tracking-[0.24em] text-slate-400 text-center"
                      >
                        {day}
                      </div>
                    ))}

                    {calendarDays.map((day) => (
                      <button
                        key={day.dateKey}
                        type="button"
                        onClick={() => setSelectedDate(day.dateKey)}
                        className={`min-h-[108px] px-3 py-3 text-left bg-white dark:bg-slate-950/40 transition-all ${
                          day.isSelected
                            ? "ring-2 ring-inset ring-violet-500 bg-violet-50/60 dark:bg-violet-500/10"
                            : "hover:bg-violet-50/60 dark:hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={`text-sm font-black ${
                              day.isCurrentMonth
                                ? "text-slate-900 dark:text-white"
                                : "text-slate-300 dark:text-slate-600"
                            } ${day.isToday ? "text-violet-600 dark:text-violet-400" : ""}`}
                          >
                            {day.date.getDate()}
                          </span>
                          {day.count > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-violet-600 text-white text-[10px] font-black">
                              {day.count}
                            </span>
                          )}
                        </div>

                        <div className="mt-4 space-y-1.5">
                          {(schedulesByDate[day.dateKey] || [])
                            .slice(0, 2)
                            .map((item) => (
                              <div
                                key={item.id}
                                className="truncate rounded-xl bg-slate-100 dark:bg-white/5 px-2.5 py-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-300"
                              >
                                {item.task_name}
                              </div>
                            ))}
                          {day.count > 2 && (
                            <div className="text-[10px] font-black uppercase tracking-widest text-violet-500">
                              +{day.count - 2} more
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-[2rem] border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 shadow-xl p-6">
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-violet-500">
                        Selected Day
                      </p>
                      <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                        {selectedDateLabel}
                      </h2>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-500 flex items-center justify-center">
                      <CalendarIcon className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {selectedDaySchedules.length > 0 ? (
                      selectedDaySchedules.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-3xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/40 p-5"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                                {item.task_name}
                              </h3>
                              <div className="mt-2 flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-bold">
                                <ClockIcon className="w-4 h-4" />
                                {item.parsedTimeLabel}
                              </div>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${
                                STATUS_COLORS[item.status] || STATUS_COLORS.Pending
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>

                          <div className="mt-5 flex flex-wrap justify-between items-center gap-3">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <ServerIcon className="w-4 h-4 text-violet-500" />
                                {item.node_id}
                              </div>
                              <div className="px-2.5 py-1 rounded-full bg-slate-200/60 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                Priority {item.priority}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {item.status !== "Completed" && (
                                <button
                                  type="button"
                                  onClick={() => handleToggleDone(item)}
                                  className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20"
                                >
                                  Mark Done
                                </button>
                              )}
                               <button
                                  type="button"
                                  onClick={() => handleEdit(item)}
                                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-violet-500 transition-all border border-transparent hover:border-violet-500/20"
                                  title="Edit"
                                >
                                  <PencilSquareIcon className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(item.id)}
                                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-rose-500 transition-all border border-transparent hover:border-rose-500/20"
                                  title="Delete"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-3xl border border-dashed border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-slate-950/40 px-5 py-10 text-center">
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                          No tasks scheduled for this day yet.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            resetForm();
                            setIsModalOpen(true);
                          }}
                          className="mt-4 px-4 py-2 rounded-2xl bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-violet-700 transition-all"
                        >
                          Add task for this day
                        </button>
                      </div>
                    )}
                  </div>

                  {unscheduledItems.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5">
                      <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4">
                        Unscheduled Records
                      </h3>
                      <div className="space-y-3">
                        {unscheduledItems.slice(0, 4).map((item) => (
                          <div
                            key={item.id}
                            className="rounded-2xl bg-slate-50 dark:bg-white/5 px-4 py-3 flex justify-between items-center group"
                          >
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">
                                {item.task_name}
                              </p>
                              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1">
                                {item.parsedRawTime || "Time not set"}
                              </p>
                            </div>
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => handleToggleDone(item)}
                                className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20"
                                title="Mark Done"
                              >
                                Done
                              </button>
                              <button
                                type="button"
                                onClick={() => handleEdit(item)}
                                className="p-1 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-violet-500 transition-all border border-transparent hover:border-violet-500/20"
                                title="Edit"
                              >
                                <PencilSquareIcon className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(item.id)}
                                className="p-1 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-rose-500 transition-all border border-transparent hover:border-rose-500/20"
                                title="Delete"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                  <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl shadow-2xl border border-white/5 overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/30 dark:bg-white/5">
                      <h2 className="text-2xl font-black text-gray-800 dark:text-white tracking-tighter uppercase italic">
                        {editingId ? "Modify Task" : "Deploy New Task"}
                      </h2>
                      <button
                        onClick={closeModal}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        x
                      </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-5">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                          Task Definition
                        </label>
                        <input
                          required
                          type="text"
                          name="task_name"
                          placeholder="e.g. System Sync Phase"
                          value={formData.task_name}
                          onChange={(e) =>
                            setFormData({ ...formData, task_name: e.target.value })
                          }
                          className="w-full px-5 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-violet-500 transition-all font-bold text-slate-900 dark:text-white"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                            Schedule Date
                          </label>
                          <input
                            required
                            type="date"
                            name="schedule_date"
                            value={formData.schedule_date}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                schedule_date: e.target.value,
                              })
                            }
                            className="w-full px-5 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-violet-500 transition-all font-bold text-slate-900 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                            Time Window
                          </label>
                          <input
                            type="text"
                            name="time_window"
                            placeholder="08:00 - 10:00"
                            value={formData.time_window}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                time_window: e.target.value,
                              })
                            }
                            className="w-full px-5 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-violet-500 transition-all font-bold text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                            Target Node
                          </label>
                          <select
                            name="node_id"
                            value={formData.node_id}
                            onChange={(e) =>
                              setFormData({ ...formData, node_id: e.target.value })
                            }
                            className="w-full px-5 py-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-violet-500 transition-all font-black text-[10px] uppercase tracking-widest text-slate-500 cursor-pointer appearance-none"
                          >
                            <option value="Node_01">Node_01</option>
                            <option value="Node_02">Node_02</option>
                            <option value="Node_03">Node_03</option>
                            <option value="Node_ALL">Node_ALL</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                            Status
                          </label>
                          <select
                            name="status"
                            value={formData.status}
                            onChange={(e) =>
                              setFormData({ ...formData, status: e.target.value })
                            }
                            className="w-full px-5 py-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-violet-500 transition-all font-black text-[10px] uppercase tracking-widest text-slate-500 cursor-pointer appearance-none"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                            <option value="Aborted">Aborted</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                            Priority
                          </label>
                          <input
                            min="1"
                            max="5"
                            type="number"
                            name="priority"
                            value={formData.priority}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                priority: e.target.value,
                              })
                            }
                            className="w-full px-5 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-violet-500 transition-all font-bold text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 mt-8">
                        <button
                          type="button"
                          onClick={closeModal}
                          className="px-6 py-3 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-8 py-3 bg-violet-600 text-white rounded-xl shadow-lg shadow-violet-500/20 font-black text-[10px] uppercase tracking-widest hover:bg-violet-700 transition active:scale-95"
                        >
                          {editingId ? "Save Changes" : "Deploy Task"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                  <div className="col-span-full rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 p-8 text-center text-slate-500 dark:text-slate-400 font-bold">
                    Loading schedule timeline...
                  </div>
                ) : enrichedSchedules.length > 0 ? (
                  enrichedSchedules.map((item) => (
                    <div
                      key={item.id}
                      className={`p-6 rounded-3xl bg-white dark:bg-slate-900/40 backdrop-blur-xl border hover:border-violet-500/30 transition-all shadow-xl group ${
                        item.status === "Aborted"
                          ? "grayscale opacity-75 border-rose-500/20"
                          : "border-slate-200 dark:border-white/5"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-2xl bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400">
                          <ClockIcon className="w-6 h-6" />
                        </div>
                        <div className="flex gap-2">
                          {item.status !== "Aborted" && item.status !== "Completed" && (
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
                              item.status === "Completed"
                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                : item.status === "Aborted"
                                  ? "bg-slate-200 dark:bg-white/5 text-slate-400 cursor-not-allowed"
                                  : "bg-slate-500/10 text-slate-500 hover:bg-emerald-500/20"
                            }`}
                            disabled={item.status === "Aborted"}
                          >
                            {item.status === "Completed"
                              ? "Done"
                              : item.status === "Aborted"
                                ? "Aborted"
                                : "Mark Done"}
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
                      <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight mb-1">
                        {item.task_name}
                      </h3>
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-bold mb-4">
                        <CalendarIcon className="w-4 h-4" />{" "}
                        {item.parsedDateKey
                          ? `${item.parsedDateKey} - ${item.parsedTimeLabel}`
                          : item.parsedRawTime || "Time not set"}
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-white/5">
                        <div className="flex items-center gap-2">
                          <ServerIcon className="w-3.5 h-3.5 text-violet-500" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {item.node_id}
                          </span>
                        </div>
                        <div className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-[10px] font-bold text-slate-400">
                          PRIORITY: {item.priority}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full rounded-3xl border border-dashed border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/40 p-10 text-center">
                    <p className="text-lg font-black text-slate-900 dark:text-white">
                      No schedules yet.
                    </p>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      Create your first task and it will appear in the calendar above.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
