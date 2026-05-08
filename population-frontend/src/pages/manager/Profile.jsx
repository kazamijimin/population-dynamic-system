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

export default function Profile() {
  const { currentUser, logout, checkAuthStatus } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activityHistory, setActivityHistory] = useState([]);
  
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    role: "",
    profile_picture: null,
    joined: "---",
    terminal: "W-STATION-09" 
  });

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setIsLoading(true);
        // checkAuthStatus is called initially but not as a dependency that triggers re-renders
        await checkAuthStatus();
        
        try {
          const history = await fetchActivityHistory();
          setActivityHistory(Array.isArray(history) ? history : []);
        } catch (err) {
          console.error("Activity history failed to load", err);
          setActivityHistory([]);
        }
      } catch (err) {
        setError("System failed to synchronize identity state.");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
    // Removed [checkAuthStatus] to prevent infinite refresh loop
  }, [checkAuthStatus]);

  useEffect(() => {
    if (currentUser) {
      setProfileData({
        username: currentUser.username || "",
        email: currentUser.email || "",
        role: currentUser.role || "",
        profile_picture: currentUser.profile_picture || null,
        joined: currentUser.date_joined ? new Date(currentUser.date_joined).toLocaleDateString() : "---",
        terminal: "W-STATION-09"
      });
    }
  }, [currentUser]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      
      const payload = {
        username: profileData.username,
        email: profileData.email,
      };

      if (profileData.profile_picture instanceof File) {
        // Convert File to Base64
        const reader = new FileReader();
        const base64Promise = new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = (err) => reject(err);
        });
        reader.readAsDataURL(profileData.profile_picture);
        payload.profile_picture = await base64Promise;
      }
      
      await updateProfile(payload);
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
      <div className="min-h-screen flex items-center justify-center bg-slate-950 font-mono">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="text-emerald-500 animate-spin" size={48} />
          <p className="text-emerald-500 text-[10px] uppercase tracking-[0.3em] animate-pulse">Synchronizing_Identity_Core...</p>
        </div>
      </div>
    );
  }

  const isManager = currentUser?.role === 'manager';
  const themeAccent = isManager ? "emerald" : "violet";

  return (
    <div className={`min-h-screen ${isManager ? 'bg-emerald-50/30' : 'bg-slate-50'} dark:bg-slate-950 transition-colors duration-500 italic`}>
      <div className="flex relative z-10 w-full h-screen">
        <Sidebar roles={isManager ? ["manager"] : ["admin"]} />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 relative z-10">
            <div className="max-w-5xl mx-auto space-y-8">
              
              {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-4 text-rose-500">
                  <AlertCircle size={20} />
                  <p className="text-xs font-black uppercase tracking-widest">{error}</p>
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                <div className="relative group">
                  <div className={`w-32 h-32 rounded-4xl ${isManager ? 'bg-emerald-600' : 'bg-violet-600'} shadow-2xl flex items-center justify-center text-white overflow-hidden border-4 border-white dark:border-slate-800`}>
                    {profileData.profile_picture ? (
                      <img 
                        src={profileData.profile_picture instanceof File ? URL.createObjectURL(profileData.profile_picture) : 
                             (profileData.profile_picture.startsWith('http') || profileData.profile_picture.startsWith('data:') ? profileData.profile_picture : `http://127.0.0.1:8000${profileData.profile_picture}`)} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error("Image load failed:", e.target.src);
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <User size={64} />
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-white/5 text-slate-400 hover:text-emerald-500 transition-all cursor-pointer">
                    <Camera size={20} />
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setProfileData({ ...profileData, profile_picture: e.target.files[0] });
                          setIsEditing(true);
                        }
                      }}
                    />
                  </label>
                </div>

                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-4">
                    {isEditing ? (
                      <input 
                        className="text-4xl font-black bg-transparent border-b-2 border-emerald-500 text-slate-900 dark:text-white uppercase italic tracking-tighter outline-none w-full"
                        value={profileData.username}
                        onChange={e => setProfileData({...profileData, username: e.target.value})}
                      />
                    ) : (
                      <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                        {profileData.username}
                      </h1>
                    )}
                    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${isManager ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-violet-500/10 text-violet-500 border-violet-500/20'}`}>
                      {profileData.role}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-2 text-slate-400 font-mono text-[10px] uppercase">
                      <Mail size={14} /> 
                      {isEditing ? (
                        <input 
                          className="bg-transparent border-b border-emerald-500/30 outline-none"
                          value={profileData.email}
                          onChange={e => setProfileData({...profileData, email: e.target.value})}
                        />
                      ) : (profileData.email || 'unset@node.sys')}
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 font-mono text-[10px] uppercase">
                      <Monitor size={14} /> {profileData.terminal}
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 font-mono text-[10px] uppercase">
                      <Clock size={14} /> Joined {profileData.joined}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                   <button 
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    disabled={isSaving}
                    className={`flex items-center gap-3 px-6 py-4 ${isEditing ? 'bg-white text-slate-900' : (isManager ? 'bg-emerald-600 text-white' : 'bg-violet-600 text-white')} rounded-2xl font-black uppercase text-xs tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl`}
                   >
                     {isSaving ? <Loader2 size={18} className="animate-spin" /> : (isEditing ? <CheckCircle size={18} /> : <Edit3 size={18} />)}
                     {isEditing ? "Save Protocol" : "Edit Identity"}
                   </button>
                   <button 
                    onClick={logout}
                    className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-xl"
                   >
                     <LogOut size={20} />
                   </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 rounded-4xl bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 shadow-xl">
                  <div className="flex items-center gap-4 mb-8">
                    <div className={`p-3 rounded-2xl ${isManager ? 'bg-emerald-500/10 text-emerald-500' : 'bg-violet-500/10 text-violet-500'}`}>
                      <Shield size={24} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Security Protocol</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Terminal Passcode</label>
                       <div className="relative">
                         <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                         <input 
                          type="password" 
                          disabled={!isEditing}
                          defaultValue="********"
                          className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold focus:border-emerald-500 outline-none dark:text-white"
                         />
                       </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                       <div className="flex items-center gap-3">
                         <Globe size={18} className="text-slate-400" />
                         <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Two-Factor Authentication</span>
                       </div>
                       <div className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${isManager ? 'bg-emerald-500' : 'bg-violet-500'}`}>
                         <div className="w-4 h-4 bg-white rounded-full translate-x-4 shadow-sm" />
                       </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 rounded-4xl bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 shadow-xl">
                  <div className="flex items-center gap-4 mb-8">
                    <div className={`p-3 rounded-2xl ${isManager ? 'bg-emerald-500/10 text-emerald-500' : 'bg-violet-500/10 text-violet-500'}`}>
                      <Bell size={24} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">System Comms</h3>
                  </div>

                  <div className="space-y-4">
                    {["Inventory Alerts", "Simulation Completes", "Staff Shift Changes", "Security Violations"].map((pref, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-transparent hover:border-slate-100 dark:hover:border-white/10 transition-all">
                        <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{pref}</span>
                        <input type="checkbox" defaultChecked className={`w-5 h-5 accent-${themeAccent}-500`} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-4xl overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <History size={20} className={isManager ? "text-emerald-500" : "text-violet-500"} />
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Personal Activity Log</h3>
                  </div>
                  <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-emerald-500 transition-colors">Clear Local History</button>
                </div>
                <div className="overflow-x-auto min-h-[200px]">
                   <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50/50 dark:bg-white/5">
                          <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Event Code</th>
                          <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timestamp</th>
                          <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Signal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {activityHistory.length > 0 ? activityHistory.map((log, i) => (
                           <tr key={i} className="hover:bg-slate-50/30 dark:hover:bg-white/5 transition-colors group">
                             <td className="px-8 py-6">
                               <div className="flex items-center gap-3">
                                 <div className={`w-2 h-2 rounded-full ${isManager ? 'bg-emerald-500' : 'bg-violet-500'}`} />
                                 <span className="text-slate-900 dark:text-white font-black uppercase text-xs italic tracking-tighter font-mono">{log.action || log.event}</span>
                               </div>
                             </td>
                             <td className="px-8 py-6">
                               <span className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{new Date(log.timestamp).toLocaleString()}</span>
                             </td>
                             <td className="px-8 py-6 text-right">
                               <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${log.status === 'SUCCESS' || !log.status ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : 'text-amber-500 bg-amber-500/10 border-amber-500/20'}`}>
                                 {log.status || 'VERIFIED'}
                               </span>
                             </td>
                           </tr>
                        )) : (
                          <tr>
                            <td colSpan="3" className="px-8 py-12 text-center text-slate-400 font-black text-[10px] uppercase tracking-widest opacity-40 italic">
                               No recent neural activity detected in your sector.
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
