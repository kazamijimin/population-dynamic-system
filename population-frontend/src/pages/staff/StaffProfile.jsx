import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/UseAuth";
import { updateProfile, fetchActivityHistory } from "../../api/users.api";
import Topbar from "../../components/layout/Topbar";
import Sidebar from "../../components/layout/Sidebar";
import { 
  User, Mail, Shield, Clock, Camera, Edit3, 
  CheckCircle, LogOut, Key, Globe, Bell, 
  History, Monitor, AlertCircle, Loader2
} from "lucide-react";

export default function StaffProfile() {
  const { currentUser, logout, checkAuthStatus } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activityHistory, setActivityHistory] = useState([]);
  
  const [profileData, setProfileData] = useState({
    username: currentUser?.username || "",
    email: currentUser?.email || "",
    role: currentUser?.role || "",
    joined: currentUser?.date_joined ? new Date(currentUser.date_joined).toLocaleDateString() : "---",
    terminal: "STATION-FRONT-04" 
  });

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setIsLoading(true);
        await checkAuthStatus();
        try {
          const history = await fetchActivityHistory();
          setActivityHistory(Array.isArray(history) ? history : []);
        } catch (err) {
          setActivityHistory([]);
        }
      } catch (err) {
        setError("System failed to synchronize identity state.");
      } finally {
        setIsLoading(false);
      }
    };
    loadProfileData();
  }, []);

  useEffect(() => {
    if (currentUser) {
      setProfileData(prev => ({
        ...prev,
        username: currentUser.username,
        email: currentUser.email,
        role: currentUser.role,
        joined: currentUser.date_joined ? new Date(currentUser.date_joined).toLocaleDateString() : "---"
      }));
    }
  }, [currentUser]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      await updateProfile({
        username: profileData.username,
        email: profileData.email
      });
      await checkAuthStatus();
      setIsEditing(false);
    } catch (err) {
      setError(err?.response?.data?.detail || "Authorization failure: Identity lock confirmed.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 font-mono italic">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="text-amber-500 animate-spin" size={48} />
          <p className="text-amber-500 text-[10px] uppercase tracking-[0.3em] animate-pulse">Syncing_Staff_ID...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50/20 dark:bg-slate-950 dark:bg-linear-to-br transition-colors duration-500 italic">
      <div className="flex relative z-10 w-full h-screen">
        <Sidebar roles={["staff"]} />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 relative z-10">
            <div className="max-w-5xl mx-auto space-y-8">
              
              {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-4 text-rose-500 animate-in slide-in-from-top-4 duration-500">
                  <AlertCircle size={20} />
                  <p className="text-xs font-black uppercase tracking-widest">{error}</p>
                </div>
              )}

              {/* Profile Header */}
              <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-4xl bg-amber-500 shadow-amber-500/20 shadow-2xl flex items-center justify-center text-white overflow-hidden border-4 border-white dark:border-slate-800">
                    <User size={64} />
                  </div>
                </div>

                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-4">
                    {isEditing ? (
                      <input 
                        className="text-4xl font-black bg-transparent border-b-2 border-amber-500 text-slate-900 dark:text-white uppercase italic tracking-tighter outline-none w-full"
                        value={profileData.username}
                        onChange={e => setProfileData({...profileData, username: e.target.value})}
                      />
                    ) : (
                      <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                        {profileData.username}
                      </h1>
                    )}
                    <span className="px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border bg-amber-500/10 text-amber-500 border-amber-500/20">
                      {profileData.role}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-2 text-slate-400 font-mono text-[10px] uppercase italic">
                      <Mail size={14} /> {profileData.email}
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 font-mono text-[10px] uppercase italic">
                      <Monitor size={14} /> {profileData.terminal}
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 font-mono text-[10px] uppercase italic">
                      <Clock size={14} /> Joined {profileData.joined}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                   <button 
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    disabled={isSaving}
                    className="flex items-center gap-3 px-6 py-4 bg-amber-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-amber-500 transition-all hover:scale-105 shadow-xl disabled:opacity-50 italic"
                   >
                     {isSaving ? <Loader2 size={18} className="animate-spin" /> : (isEditing ? <CheckCircle size={18} /> : <Edit3 size={18} />)}
                     {isEditing ? "Save ID" : "Edit Profile"}
                   </button>
                   <button 
                    onClick={logout}
                    className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-xl italic"
                   >
                     <LogOut size={20} />
                   </button>
                </div>
              </div>

              {/* Settings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Identity Shield */}
                <div className="p-8 rounded-4xl bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 shadow-xl">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
                      <Shield size={24} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Security Protocol</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">Station Passcode</label>
                       <div className="relative">
                         <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                         <input 
                          type="password" 
                          disabled={!isEditing}
                          defaultValue="********"
                          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold focus:border-amber-500 outline-none transition-all dark:text-white"
                         />
                       </div>
                    </div>
                  </div>
                </div>

                {/* Notifications & System */}
                <div className="p-8 rounded-4xl bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 shadow-xl">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
                      <Bell size={24} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Comms Channel</h3>
                  </div>

                  <div className="space-y-4">
                    {["Order Queue Alert", "Supplies Critical", "Break Notifications"].map((pref, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-amber-500/20">
                        <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest italic">{pref}</span>
                        <input type="checkbox" defaultChecked className="w-5 h-5 accent-amber-500" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Activity History */}
              <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-4xl overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <History size={20} className="text-amber-500" />
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Event Log</h3>
                  </div>
                </div>
                <div className="overflow-x-auto min-h-[200px]">
                   <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50/50 dark:bg-white/5">
                          <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Signal</th>
                          <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {activityHistory.length > 0 ? activityHistory.map((log, i) => (
                           <tr key={i} className="hover:bg-amber-500/5 transition-colors group">
                             <td className="px-8 py-6">
                               <div className="flex items-center gap-3">
                                 <div className="w-2 h-2 rounded-full bg-amber-500" />
                                 <span className="text-slate-900 dark:text-white font-black uppercase text-xs italic tracking-tighter font-mono">{log.action || 'SIGNAL_SENT'}</span>
                               </div>
                             </td>
                             <td className="px-8 py-6">
                               <span className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{new Date(log.timestamp).toLocaleString()}</span>
                             </td>
                           </tr>
                        )) : (
                          <tr>
                            <td colSpan="2" className="px-8 py-12 text-center text-slate-400 font-black text-[10px] uppercase tracking-widest opacity-40 italic">
                               Neural buffer empty. No recent activity.
                            </td>
                          </tr>
                        )}
                      </tbody>
                   </table>
                </div>
              </div>

            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
