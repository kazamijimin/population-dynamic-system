import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Menu, X } from "lucide-react";

export default function Sidebar() {
  const { currentUser } = useAuth();
  const [time, setTime] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [liveSuggestions, setLiveSuggestions] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Real-time SSE Connection
  useEffect(() => {
    if (!currentUser?.role) return;

    // Connect to the Django SSE stream
    const eventSource = new EventSource(`http://localhost:8000/api/common/stream-suggestions/?role=${currentUser.role}`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLiveSuggestions(data.suggestions);
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => eventSource.close();
  }, [currentUser?.role]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const isAdmin = currentUser?.role === 'admin';
  const isManager = currentUser?.role === 'manager';

  const navItems = [
    // Admin Routes
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊", roles: ["admin"] },
    { label: "Inventory", path: "/admin/inventory", icon: "📦", roles: ["admin"] },
    { label: "Customers", path: "/admin/customers", icon: "👥", roles: ["admin"] },
    { label: "Reports", path: "/admin/reports", icon: "📈", roles: ["admin"] },
    { label: "Schedule", path: "/admin/schedules", icon: "📅", roles: ["admin"] },
    { label: "Simulation", path: "/admin/simulation", icon: "🧪", roles: ["admin"] },
    { label: "Monitoring", path: "/admin/activity", icon: "📡", roles: ["admin"] },
    { label: "Access", path: "/admin/users", icon: "🔐", roles: ["admin"] },
    
    // Manager Routes
    { label: "Dashboard", path: "/manager/dashboard", icon: "📊", roles: ["manager"] },
    { label: "Customer Flow", path: "/manager/flow", icon: "🌊", roles: ["manager"] },
    { label: "Sales", path: "/manager/sales", icon: "💰", roles: ["manager"] },
    { label: "Inventory", path: "/manager/inventory", icon: "📦", roles: ["manager"] },
    { label: "Node Control", path: "/manager/simulation", icon: "🖥️", roles: ["manager"] },
    { label: "Reports", path: "/manager/reports", icon: "📈", roles: ["manager"] },
    { label: "Profile", path: "/manager/profile", icon: "👤", roles: ["manager"] },

    // Staff Routes
    { label: "Terminal", path: "/staff/terminal", icon: "☕", roles: ["staff"] },
    { label: "ID Profile", path: "/staff/profile", icon: "👤", roles: ["staff"] },
  ];

  const isStaff = currentUser?.role === 'staff';
  const themeColor = isManager ? "emerald" : (isStaff ? "amber" : "violet");
  const activeClass = isManager 
    ? "bg-emerald-600 dark:bg-emerald-600/10 text-white dark:text-emerald-400 border-emerald-500/20 shadow-emerald-500/5 shadow-lg" 
    : isStaff
      ? "bg-amber-600 dark:bg-amber-600/10 text-white dark:text-amber-400 border-amber-500/20 shadow-amber-500/5 shadow-lg"
      : "bg-violet-600 dark:bg-violet-600/10 text-white dark:text-violet-400 border-violet-500/20 shadow-violet-500/5 shadow-lg";
  const hoverClass = isManager 
    ? "hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400" 
    : isStaff
      ? "hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400"
      : "hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-400";
  const textClass = isManager 
    ? "text-emerald-900/40 dark:text-emerald-400/40" 
    : isStaff
      ? "text-amber-900/40 dark:text-amber-400/40"
      : "text-violet-900/40 dark:text-violet-400/40";

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`lg:hidden fixed bottom-6 right-6 z-100 w-14 h-14 ${isManager ? 'bg-emerald-600 shadow-emerald-500/40' : (isStaff ? 'bg-amber-600 shadow-amber-500/40' : 'bg-violet-600 shadow-violet-500/40')} text-white rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-all border-4 border-white dark:border-slate-800`}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`fixed lg:sticky top-0 left-0 z-50 flex flex-col w-64 h-screen ${isManager ? 'bg-emerald-50/80 dark:bg-emerald-950/20' : isStaff ? 'bg-amber-50/80 dark:bg-amber-950/20' : 'bg-white/80 dark:bg-slate-900/50'} backdrop-blur-xl border-r ${isManager ? 'border-emerald-500/10' : isStaff ? 'border-amber-500/10' : 'border-slate-200 dark:border-white/5'} p-6 shadow-2xl transition-all duration-300 shrink-0 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center gap-3 mb-10">
          <div className={`w-10 h-10 ${isManager ? 'bg-emerald-600 shadow-emerald-500/20' : isStaff ? 'bg-amber-600 shadow-amber-500/20' : 'bg-violet-600 shadow-violet-500/20'} rounded-xl flex items-center justify-center shadow-lg`}>
            <span className="text-xl text-white">{isManager ? "🌿" : (isStaff ? "☕" : "⚡")}</span>
          </div>
          <h2 className={`text-xl font-black ${isManager ? 'text-emerald-950 dark:text-emerald-50' : isStaff ? 'text-amber-950 dark:text-amber-50' : 'text-slate-900 dark:text-white'} tracking-tighter uppercase italic`}>
            Supply<span className={isManager ? "text-emerald-500" : (isStaff ? "text-amber-500" : "text-violet-500")}>Hub</span>
          </h2>
        </div>

        <nav className="flex flex-col gap-2 overflow-y-auto">
          {navItems.filter(item => item.roles.includes(currentUser?.role)).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest cursor-pointer group ${
                  isActive
                    ? `${activeClass} border`
                    : `${textClass} ${hoverClass}`
                }`}
              >
                <span className={`text-base leading-none ${!isActive && "opacity-50 group-hover:opacity-100 transition-opacity"}`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className={`mt-auto space-y-6 pt-6 border-t ${isManager ? 'border-emerald-500/10' : isStaff ? 'border-amber-500/10' : 'border-slate-200 dark:border-white/5'}`}>
          {/* AI Recommendations Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${isManager ? 'text-emerald-500/40' : isStaff ? 'text-amber-500/40' : 'text-violet-500/40'}`}>Nexus_AI Suggestions</p>
              <div className="flex gap-1">
                <div className={`w-1 h-1 rounded-full animate-ping ${isManager ? 'bg-emerald-500' : isStaff ? 'bg-amber-500' : 'bg-violet-500'}`}></div>
                <span className="text-[7px] font-bold opacity-30 uppercase">Live</span>
              </div>
            </div>
            
            {(liveSuggestions.length > 0 ? liveSuggestions : (isAdmin ? [
              { title: "Scale Node_02", desc: "Projected 20% surge in sector B. Recommend increasing compute share.", color: "violet" },
              { title: "Audit Required", desc: "Divergence detected in historical sales vs inventory depletion.", color: "fuchsia" }
            ] : isManager ? [
              { title: "Restock Event", desc: "Coffee Beans at 12%. Automated supply chain request pending.", color: "emerald" },
              { title: "Peak Flow: 14:00", desc: "Staffing levels optimal for upcoming traffic wave.", color: "teal" }
            ] : isStaff ? [
              { title: "Expedite Wave", desc: "Queue growing. Recommend activating secondary brew node.", color: "amber" },
              { title: "Prep Priority", desc: "Low on \"Iced Latte\" bases. Batch prep suggested now.", color: "orange" }
            ] : [])).map((sug, idx) => (
              <div key={idx} className={`p-4 bg-${sug.color || (isManager ? 'emerald' : isStaff ? 'amber' : 'violet')}-500/5 rounded-2xl border border-${sug.color || (isManager ? 'emerald' : isStaff ? 'amber' : 'violet')}-500/10 group cursor-help hover:bg-${sug.color || (isManager ? 'emerald' : isStaff ? 'amber' : 'violet')}-500/10 transition-all animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                <p className={`text-[10px] font-black text-${sug.color || (isManager ? 'emerald' : isStaff ? 'amber' : 'violet')}-600 dark:text-${sug.color || (isManager ? 'emerald' : isStaff ? 'amber' : 'violet')}-400 uppercase italic mb-1`}>{sug.title}</p>
                <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium leading-tight">{sug.desc}</p>
              </div>
            ))}
          </div>

          <div>
            <p className={`text-[10px] font-black ${isManager ? 'text-emerald-600/40 dark:text-emerald-400/40' : isStaff ? 'text-amber-600/40 dark:text-amber-400/40' : 'text-slate-400 dark:text-slate-600'} uppercase tracking-widest mb-1`}>
              System Entropy
            </p>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 ${isManager ? 'bg-emerald-500 shadow-emerald-500/50' : isStaff ? 'bg-amber-500 shadow-amber-500/50' : 'bg-violet-500 shadow-violet-500/50'} rounded-full animate-pulse shadow-glow`}></div>
              <p className={`text-xs font-mono font-bold ${isManager ? 'text-emerald-700/60 dark:text-emerald-400/60' : isStaff ? 'text-amber-700/60 dark:text-amber-400/60' : 'text-slate-500 dark:text-slate-400'}`}>
                {time.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
        />
      )}
    </>
  );
}
