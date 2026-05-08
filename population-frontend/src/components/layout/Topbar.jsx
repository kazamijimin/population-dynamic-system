import { useContext, useMemo } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Bell, LogOut, MoonStar, Search, Sparkles, SunMedium } from "lucide-react";
import { AuthContext } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";

const quickLinks = {
  admin: [
    { label: "Overview", path: "/admin/dashboard" },
    { label: "Inventory", path: "/admin/inventory" },
    { label: "Reports", path: "/admin/reports" },
    { label: "Access", path: "/admin/users" },
  ],
  manager: [
    { label: "Overview", path: "/manager/dashboard" },
    { label: "Flow", path: "/manager/flow" },
    { label: "Sales", path: "/manager/sales" },
    { label: "Reports", path: "/manager/reports" },
  ],
  staff: [
    { label: "Terminal", path: "/staff/terminal" },
    { label: "Profile", path: "/staff/profile" },
  ],
};

const roleLabels = {
  admin: "Administrator",
  manager: "Manager",
  staff: "Staff",
};

const roleTheme = {
  admin: {
    accentGradient: "from-violet-600 to-fuchsia-500",
    accentText: "text-violet-500",
    accentHover: "hover:text-violet-700",
    navActive: "bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-[0_14px_26px_-18px_rgba(124,58,237,0.72)]",
    navIdle: "text-slate-500 hover:text-violet-700 hover:bg-white dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/8",
    dot: "bg-violet-500",
  },
  manager: {
    accentGradient: "from-emerald-600 to-teal-500",
    accentText: "text-emerald-500",
    accentHover: "hover:text-emerald-700",
    navActive: "bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-[0_14px_26px_-18px_rgba(16,185,129,0.72)]",
    navIdle: "text-slate-500 hover:text-emerald-700 hover:bg-white dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/8",
    dot: "bg-emerald-500",
  },
  staff: {
    accentGradient: "from-amber-500 to-orange-500",
    accentText: "text-amber-500",
    accentHover: "hover:text-amber-700",
    navActive: "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_14px_26px_-18px_rgba(245,158,11,0.72)]",
    navIdle: "text-slate-500 hover:text-amber-700 hover:bg-white dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/8",
    dot: "bg-amber-500",
  },
};

export default function Topbar() {
  const { currentUser, handleLogout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const role = currentUser?.role || "staff";
  const isDark = theme === "dark";
  const links = quickLinks[role] || quickLinks.staff;
  const homePath = links[0]?.path || "/login";
  const colors = roleTheme[role] || roleTheme.admin;

  const initials = useMemo(() => {
    const source =
      currentUser?.first_name ||
      currentUser?.username ||
      currentUser?.email ||
      roleLabels[role];
    return String(source)
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [currentUser, role]);

  const handleExit = async () => {
    try {
      await handleLogout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      navigate("/login");
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 dark:border-white/8 bg-white/88 dark:bg-slate-950/82 backdrop-blur-2xl px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <Link to={homePath} className="flex items-center gap-3 xl:hidden">
            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${colors.accentGradient} text-white flex items-center justify-center shadow-[0_16px_28px_-18px_rgba(124,58,237,0.68)]`}>
              <Sparkles size={20} />
            </div>
            <div>
              <p className={`text-[11px] uppercase tracking-[0.24em] font-semibold ${colors.accentText}`}>
                Population
              </p>
              <p className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">
                Neural Hub
              </p>
            </div>
          </Link>

          <div className="hidden xl:flex items-center gap-2 rounded-[22px] border border-slate-200/80 dark:border-white/8 bg-slate-50/90 dark:bg-white/5 p-1.5">
            {links.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 h-10 inline-flex items-center rounded-2xl text-sm font-semibold transition-all ${
                    active
                      ? colors.navActive
                      : colors.navIdle
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative min-w-0 md:w-[280px] lg:w-[340px]">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              className="ds-search h-11 pl-11 pr-4 rounded-2xl"
              placeholder="Search dashboards, people, or records..."
            />
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              type="button"
              className="ds-btn ds-btn-secondary ds-btn-icon rounded-2xl"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {isDark ? <SunMedium size={18} /> : <MoonStar size={18} />}
            </button>

            <button
              type="button"
              className="relative ds-btn ds-btn-secondary ds-btn-icon rounded-2xl"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className={`absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full ${colors.dot} border-2 border-white dark:border-slate-950`} />
            </button>

            <div className="flex items-center gap-3 rounded-[22px] border border-slate-200/80 dark:border-white/8 bg-white dark:bg-white/5 px-3 py-2 shadow-[0_12px_24px_-24px_rgba(15,23,42,0.4)]">
              <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${colors.accentGradient} text-white flex items-center justify-center font-bold shadow-[0_16px_28px_-18px_rgba(124,58,237,0.68)]`}>
                {initials || "U"}
              </div>
              <div className="hidden sm:block leading-tight">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {currentUser?.username || "Workspace User"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {roleLabels[role]}
                </p>
              </div>
              <button
                type="button"
                onClick={handleExit}
                className="ds-btn ds-btn-ghost ds-btn-icon rounded-2xl"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
