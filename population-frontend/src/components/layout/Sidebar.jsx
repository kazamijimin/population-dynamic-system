import { Link, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../hooks/UseAuth";
import {
  Activity,
  Bot,
  Boxes,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  Menu,
  PanelLeftClose,
  ShieldCheck,
  Sparkles,
  UserCircle2,
  Users,
  Waves,
  X,
} from "lucide-react";

const roleTheme = {
  admin: {
    accentText: "text-violet-500",
    accentTextStrong: "text-violet-700 dark:text-violet-300",
    accentSoft: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300",
    accentGradient: "from-violet-600 to-fuchsia-500",
    activeGradient: "from-violet-600 to-fuchsia-500",
    hoverBg: "hover:bg-violet-50 dark:hover:bg-white/6",
    hoverText: "hover:text-violet-700",
    cardBorder: "border-violet-200/80 dark:border-violet-400/10",
  },
  manager: {
    accentText: "text-emerald-500",
    accentTextStrong: "text-emerald-700 dark:text-emerald-300",
    accentSoft: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
    accentGradient: "from-emerald-600 to-teal-500",
    activeGradient: "from-emerald-600 to-teal-500",
    hoverBg: "hover:bg-emerald-50 dark:hover:bg-white/6",
    hoverText: "hover:text-emerald-700",
    cardBorder: "border-emerald-200/80 dark:border-emerald-400/10",
  },
  staff: {
    accentText: "text-amber-500",
    accentTextStrong: "text-amber-700 dark:text-amber-300",
    accentSoft: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
    accentGradient: "from-amber-500 to-orange-500",
    activeGradient: "from-amber-500 to-orange-500",
    hoverBg: "hover:bg-amber-50 dark:hover:bg-white/6",
    hoverText: "hover:text-amber-700",
    cardBorder: "border-amber-200/80 dark:border-amber-400/10",
  },
};

const navConfig = {
  admin: [
    { label: "Overview", path: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Inventory", path: "/admin/inventory", icon: Boxes },
    { label: "Customers", path: "/admin/customers", icon: Users },
    { label: "Reports", path: "/admin/reports", icon: ClipboardList },
    { label: "Schedules", path: "/admin/schedules", icon: CalendarDays },
    { label: "Simulation", path: "/admin/simulation", icon: Sparkles },
    { label: "Monitoring", path: "/admin/activity", icon: Activity },
    { label: "Access", path: "/admin/users", icon: ShieldCheck },
  ],
  manager: [
    { label: "Overview", path: "/manager/dashboard", icon: LayoutDashboard },
    { label: "Customer Flow", path: "/manager/flow", icon: Waves },
    { label: "Sales", path: "/manager/sales", icon: Activity },
    { label: "Inventory", path: "/manager/inventory", icon: Boxes },
    { label: "Node Control", path: "/manager/simulation", icon: Sparkles },
    { label: "Reports", path: "/manager/reports", icon: ClipboardList },
    { label: "Profile", path: "/manager/profile", icon: UserCircle2 },
  ],
  staff: [
    { label: "Terminal", path: "/staff/terminal", icon: LayoutDashboard },
    { label: "Profile", path: "/staff/profile", icon: UserCircle2 },
  ],
};

const defaultSuggestions = {
  admin: [
    "Review demand spikes before the next simulation run.",
    "Two monitoring logs need triage in the access console.",
  ],
  manager: [
    "Low-stock materials are trending toward depletion this afternoon.",
    "Customer flow suggests preparing an extra peak-hour staffing block.",
  ],
  staff: [
    "Queue pressure is rising. Prep the most requested items first.",
    "One profile update is still pending confirmation.",
  ],
};

export default function Sidebar() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const [time, setTime] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);
  const [liveSuggestions, setLiveSuggestions] = useState([]);

  const role = currentUser?.role || "staff";
  const navItems = navConfig[role] || navConfig.staff;
  const dashboardPath = navItems[0]?.path || "/login";
  const theme = roleTheme[role] || roleTheme.admin;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!currentUser?.role) return undefined;

    const eventSource = new EventSource(
      `http://localhost:8000/api/common/stream-suggestions/?role=${currentUser.role}`
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const suggestions = Array.isArray(data?.suggestions) ? data.suggestions : [];
      setLiveSuggestions(suggestions);
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => eventSource.close();
  }, [currentUser?.role]);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const suggestions = useMemo(() => {
    if (liveSuggestions.length > 0) {
      return liveSuggestions
        .map((item) => (typeof item === "string" ? item : item?.title || item?.desc))
        .filter(Boolean)
        .slice(0, 2);
    }
    return defaultSuggestions[role] || defaultSuggestions.staff;
  }, [liveSuggestions, role]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`lg:hidden fixed bottom-5 right-5 z-[80] w-14 h-14 rounded-2xl bg-gradient-to-br ${theme.accentGradient} text-white shadow-[0_18px_40px_-18px_rgba(124,58,237,0.75)] flex items-center justify-center border border-white/60`}
        aria-label={isOpen ? "Close navigation" : "Open navigation"}
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <aside
        className={`fixed lg:sticky top-0 left-0 z-[70] h-screen w-[290px] shrink-0 border-r border-slate-200/80 dark:border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,255,0.94))] dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(9,13,24,0.95))] backdrop-blur-2xl shadow-[0_24px_60px_-40px_rgba(124,58,237,0.28)] px-5 py-5 flex flex-col transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between gap-3 px-2 pb-5 border-b border-slate-200/70 dark:border-white/8">
          <Link to={dashboardPath} className="flex items-center gap-3 min-w-0">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${theme.accentGradient} text-white flex items-center justify-center shadow-[0_18px_30px_-18px_rgba(124,58,237,0.7)]`}>
              <Sparkles size={22} />
            </div>
            <div className="min-w-0">
              <p className={`text-[11px] uppercase tracking-[0.28em] font-semibold ${theme.accentText}`}>
                Population
              </p>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                Neural Hub
              </h2>
            </div>
          </Link>

          <div className="hidden lg:flex w-10 h-10 rounded-xl items-center justify-center text-slate-400 bg-white/80 dark:bg-white/5 border border-slate-200/70 dark:border-white/8">
            <PanelLeftClose size={16} />
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <div className="px-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
              Workspace
            </p>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center gap-3 rounded-2xl px-3.5 py-3 transition-all ${
                    isActive
                      ? `bg-gradient-to-r ${theme.activeGradient} text-white shadow-[0_18px_32px_-20px_rgba(124,58,237,0.72)]`
                      : `text-slate-600 ${theme.hoverText} ${theme.hoverBg} dark:text-slate-300 dark:hover:text-white`
                  }`}
                >
                  <span
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isActive
                        ? "bg-white/18 text-white"
                        : `${theme.accentSoft} dark:bg-white/6`
                    }`}
                  >
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold tracking-tight">{item.label}</p>
                  </div>
                  <ChevronRight
                    size={16}
                    className={`transition-transform ${isActive ? "opacity-100" : "opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0"}`}
                  />
                </Link>
              );
            })}
          </nav>
        </div>

        <div className={`mt-6 rounded-[28px] border ${theme.cardBorder} bg-[radial-gradient(circle_at_top_left,rgba(167,139,250,0.22),transparent_42%),linear-gradient(145deg,rgba(255,255,255,0.96),rgba(245,243,255,0.92))] dark:bg-[radial-gradient(circle_at_top_left,rgba(167,139,250,0.18),transparent_42%),linear-gradient(145deg,rgba(28,20,50,0.82),rgba(15,23,42,0.82))] p-5 shadow-[0_18px_36px_-28px_rgba(124,58,237,0.45)]`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className={`text-[11px] uppercase tracking-[0.22em] font-semibold ${theme.accentText}`}>
                Nexus AI
              </p>
              <h3 className="text-base font-bold text-slate-950 dark:text-white">
                Live Suggestions
              </h3>
            </div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {suggestions.map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="rounded-2xl bg-white/88 dark:bg-white/6 border border-white/70 dark:border-white/8 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 shadow-[0_12px_24px_-24px_rgba(124,58,237,0.45)]"
              >
                {item}
              </div>
            ))}
          </div>

          <Link
            to={dashboardPath}
            className={`mt-4 inline-flex items-center gap-2 text-sm font-semibold ${theme.accentTextStrong}`}
          >
            Open dashboard
            <ChevronRight size={16} />
          </Link>
        </div>

        <div className="mt-auto space-y-4 pt-6">
          <div className="rounded-3xl border border-slate-200/80 dark:border-white/8 bg-white/85 dark:bg-white/5 px-4 py-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl ${theme.accentSoft} flex items-center justify-center`}>
                <Bot size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  System Sync
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[60] bg-slate-950/35 backdrop-blur-sm lg:hidden"
        />
      )}
    </>
  );
}
