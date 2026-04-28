import { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function Topbar() {
  const { currentUser, handleLogout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const handleExit = async () => {
    try {
      await handleLogout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/login');
    }
  };

  return (
    <nav className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 px-8 py-3 flex items-center justify-between sticky top-0 z-50 transition-colors duration-300">
      <div className="flex items-center gap-8">
        <Link to="/admin/dashboard" className="text-xl font-black tracking-tighter text-slate-900 dark:text-white group flex items-center gap-2">
          <div className="w-10 h-10 bg-violet-600 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-all shadow-lg shadow-violet-500/30">
            <span className="text-xl">⚡</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[14px] uppercase italic">Supply</span>
            <span className="text-[10px] text-violet-600 dark:text-violet-400 font-bold uppercase tracking-widest">Nexus Hub</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/10">
          {[
            { label: 'Dashboard', path: '/admin/dashboard', icon: '📊', roles: ['admin', 'manager', 'staff'] },
            { label: 'Inventory', path: '/admin/inventory', icon: '📦', roles: ['admin', 'manager'] },
            { label: 'Customers', path: '/admin/customers', icon: '👥', roles: ['admin', 'manager'] },
            { label: 'Staff', path: '/admin/users', icon: '🔒', roles: ['admin'] },
          ].filter(item => item.roles.includes(currentUser?.role)).map((item) => (
            <Link 
              key={item.path}
              to={item.path} 
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                window.location.pathname === item.path 
                ? 'bg-white dark:bg-violet-600 text-violet-600 dark:text-white shadow-sm' 
                : 'text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-white/50 dark:hover:bg-white/5'
              }`}
            >
              <span className="text-sm">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-3 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:scale-110 active:scale-95 transition-all shadow-inner"
        >
          {isDark ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.071 16.071l.707.707M7.929 7.929l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        <div className="h-8 w-[1px] bg-slate-200 dark:bg-white/10" />

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Authenticated</p>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">{currentUser?.username || 'Root Admin'}</p>
          </div>
          
          <button 
            onClick={handleExit}
            className="group w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-rose-600 dark:hover:bg-rose-600 text-slate-400 dark:text-slate-400 hover:text-white dark:hover:text-white border border-slate-200 dark:border-white/10 hover:border-rose-500 transition-all shadow-xl active:scale-90"
            title="Secure Logout"
          >
            <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
