import { useState, useEffect, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { adminApi } from "../../api/users.api";
import { useAuth } from "../../hooks/useAuth";
import Topbar from "../../components/layout/Topbar";
import Sidebar from "../../components/layout/Sidebar";
import { 
  Users as UsersIcon, 
  UserPlus, 
  Shield, 
  Trash2, 
  Key, 
  Activity, 
  History, 
  CheckCircle, 
  XCircle, 
  Search, 
  MoreVertical,
  AlertCircle
} from "lucide-react";

export default function Users() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("users");
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState(null);

  // Hard Redirect if not Admin (Extra layer of safety)
  if (currentUser && currentUser.role !== 'admin') {
    return <Navigate to="/admin/dashboard" />;
  }
  
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    role: "staff",
    password: ""
  });

  const fetchUsers = useCallback(async () => {
    try {
      const res = await adminApi.getUsers();
      setUsers(Array.isArray(res.data) ? res.data : (res.data?.results || []));
    } catch (err) {
      setError("FAILED_TO_LOAD_USER_DATABASE");
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await adminApi.getActivityLogs();
      setLogs(Array.isArray(res.data) ? res.data : (res.data?.results || []));
    } catch (err) {
      console.error("Logs offline");
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    if (activeTab === "logs") fetchLogs();
  }, [fetchUsers, fetchLogs, activeTab]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createUser(newUser);
      setShowAddModal(false);
      setNewUser({ username: "", email: "", role: "staff", password: "" });
      fetchUsers();
    } catch (err) {
      setError("IDENTITY_REGISTRATION_FAILED");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await adminApi.toggleStatus(id);
      fetchUsers();
    } catch (err) {
      setError("STATUS_TOGGLE_REJECTED");
    }
  };

  const handleResetPassword = async (id) => {
    const newPass = prompt("ENTER_NEW_SECURE_KEYPHRASE:");
    if (newPass) {
      try {
        await adminApi.resetPassword(id, newPass);
        alert("KEYPHRASE_DOCKING_SUCCESSFUL");
      } catch (err) {
        setError("KEYPHRASE_RESET_FAILED");
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 italic transition-colors duration-500">
      <div className="flex w-full h-screen relative">
        <Sidebar />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full">
            <div className="max-w-7xl mx-auto space-y-8 pt-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                  <h1 className="text-5xl font-black uppercase tracking-tighter">Access <span className="text-indigo-600">Control</span></h1>
                  <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-400 mt-2">Security_Protocol: Root_Admin_Level</p>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-lg"
                  >
                    <UserPlus size={16} /> Create User
                  </button>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-4 text-rose-500">
                  <AlertCircle size={20} />
                  <p className="text-xs font-black uppercase tracking-widest">{error}</p>
                </div>
              )}

              <div className="flex gap-6 mb-8">
                <button 
                  onClick={() => setActiveTab("users")}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === "users" ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20" : "bg-white dark:bg-slate-900 text-slate-400 hover:text-indigo-600"}`}
                >
                  <UsersIcon size={14} /> Directory
                </button>
                <button 
                  onClick={() => setActiveTab("logs")}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === "logs" ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20" : "bg-white dark:bg-slate-900 text-slate-400 hover:text-indigo-600"}`}
                >
                  <History size={14} /> Audit Logs
                </button>
              </div>

              {activeTab === "users" ? (
                <div className="bg-white dark:bg-slate-900 rounded-4xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800">
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="relative max-w-md">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        placeholder="SEARCH_USER_ENTITY..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl pl-12 pr-4 py-3 text-xs font-bold uppercase tracking-widest focus:border-indigo-500 outline-none dark:text-white" 
                      />
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/50">
                          <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">User Identity</th>
                          <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Role</th>
                          <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                          <th className="px-8 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Operations</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredUsers.length > 0 ? filteredUsers.map(user => (
                          <tr key={user.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-all">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-black italic">
                                  {user.username[0].toUpperCase()}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-black uppercase text-sm dark:text-white">{user.username}</span>
                                  <span className="text-[10px] text-slate-400 font-mono tracking-tighter">{user.email}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${user.role === "admin" ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : user.role === "manager" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"}`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-2">
                                {user.is_active ? <CheckCircle className="text-emerald-500" size={14} /> : <XCircle className="text-rose-500" size={14} />}
                                <span className={`text-[10px] font-black uppercase tracking-widest ${user.is_active ? "text-emerald-500" : "text-rose-500"}`}>
                                  {user.is_active ? "Authorized" : "Deactivated"}
                                </span>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-right space-x-2">
                              <button 
                                onClick={() => handleResetPassword(user.id)}
                                title="Reset Password"
                                className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-500 transition-all border border-slate-200 dark:border-slate-800"
                              >
                                <Key size={14} />
                              </button>
                              <button 
                                onClick={() => handleToggleStatus(user.id)}
                                title={user.is_active ? "Deactivate" : "Activate"}
                                className={`p-2 rounded-lg border transition-all ${user.is_active ? "bg-rose-50 text-rose-500 border-rose-100 hover:bg-rose-500 hover:text-white" : "bg-emerald-50 text-emerald-500 border-emerald-100 hover:bg-emerald-500 hover:text-white"}`}
                              >
                                {user.is_active ? <XCircle size={14} /> : <CheckCircle size={14} />}
                              </button>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan="4" className="px-8 py-12 text-center text-slate-400 uppercase text-[10px] font-black tracking-widest opacity-50">
                              No Entities Detected
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {logs.length > 0 ? logs.map((log, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:border-indigo-500 transition-all">
                      <div className="flex items-center gap-6">
                        <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500">
                          <Activity size={20} />
                        </div>
                        <div>
                          <p className="font-black text-sm uppercase italic tracking-tight dark:text-white">{log.description}</p>
                          <div className="flex gap-4 mt-1">
                            <span className="text-[10px] font-mono text-slate-400 uppercase">Operator: {log.user}</span>
                            <span className="text-[10px] font-mono text-slate-400 uppercase">IP: {log.ip_address}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-black font-mono text-slate-300 group-hover:text-indigo-500 transition-all">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                  )) : (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-4xl border border-dashed border-slate-200 dark:border-slate-800 opacity-50">
                      <History size={48} className="mx-auto mb-4 text-slate-300" />
                      <p className="text-[10px] font-black uppercase tracking-widest">No Activity Records Found</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-4xl p-10 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in duration-300">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-8 dark:text-white">Register Identity</h2>
            <form onSubmit={handleCreateUser} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Codename</label>
                <input 
                  required 
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm font-bold uppercase dark:text-white"
                  placeholder="USERNAME..." 
                  value={newUser.username}
                  onChange={e => setNewUser({...newUser, username: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Encrypted Mail</label>
                <input 
                  type="email"
                  required 
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm font-bold dark:text-white"
                  placeholder="EMAIL@SYSTEM.CORE" 
                  value={newUser.email}
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Access Tier</label>
                <select 
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm font-bold uppercase appearance-none dark:text-white"
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="staff">Staff - Operational</option>
                  <option value="manager">Manager - Tactical</option>
                  <option value="admin">Admin - Strategic</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Initial Keyphrase</label>
                <input 
                  type="password"
                  required 
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm font-bold dark:text-white"
                  placeholder="********" 
                  value={newUser.password}
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 text-slate-400 font-black uppercase text-xs tracking-widest">Abort</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-500/20">Authorize</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
