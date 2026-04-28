import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import { analyticsApi } from "../../api/analytics.api";
import Topbar from "../../components/layout/Topbar";
import Sidebar from "../../components/layout/Sidebar";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { 
  BarChart3, TrendingUp, Users, Zap, Download, FileDown, 
  Calendar, Clock, Target, ArrowUpRight, ArrowDownRight, 
  Plus, Search, Filter, FileText, Loader2, Trash2
} from "lucide-react";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeRange, setActiveRange] = useState("daily");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newReport, setNewReport] = useState({ title: "", type: "inventory", description: "" });
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [activeRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await analyticsApi.getReports();
      setReports(Array.isArray(res.data) ? res.data : (res.data?.results || []));
    } catch (err) {
      setError("Failed to initialize report protocol.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await analyticsApi.createReport({
        ...newReport,
        status: "completed",
        data: { generated_at: new Date().toISOString(), metrics: { total_sales: "$4.2k", flow: "1.2k" } }
      });
      setReports([res.data, ...reports]);
      setShowCreateModal(false);
      setNewReport({ title: "", type: "inventory", description: "" });
    } catch {
      setError("Security violation: Report generation locked.");
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = (report) => {
    setIsExporting(true);
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.text(`NEXUS_REPORT: ${report.title}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`TYPE: ${report.type.toUpperCase()} // AT: ${new Date(report.created_at).toLocaleString()}`, 14, 30);
    doc.autoTable({
      startY: 40,
      head: [['Metric', 'Value', 'Status']],
      body: [
        ['Customer Flow', '1.2k units', 'OPTIMAL'],
        ['Inventory Drift', '2.1%', 'WARNING'],
        ['Staffing Load', '92.4%', 'CRITICAL']
      ],
      theme: 'grid'
    });
    doc.save(`nexus_${report.type}_${report.id}.pdf`);
    setIsExporting(false);
  };

  const filteredReports = reports.filter(r => 
    r.title.toLowerCase().includes(search.toLowerCase()) || 
    r.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-linear-to-br dark:from-indigo-950 dark:via-slate-900 dark:to-black relative overflow-hidden transition-colors duration-500 italic">
      <div className="flex relative z-10 w-full h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 relative z-10">
            <div className="max-w-7xl mx-auto space-y-8">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                  <h1 className="text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic">Intelligence <span className="text-violet-600">Hub</span></h1>
                  <div className="flex items-center gap-2 bg-white/50 dark:bg-white/5 px-4 py-1.5 rounded-full border border-slate-200 dark:border-white/10 shadow-sm w-fit">
                    <FileText size={14} className="text-violet-500 animate-pulse" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Module_Analytics_Export // Active</span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setShowCreateModal(true)} className="group flex items-center gap-3 px-8 py-4 bg-violet-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-violet-500 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-violet-500/20">
                    <Plus size={18} /> Generate Master Report
                  </button>
                </div>
              </div>

              {/* Reports Grid */}
              <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-4xl overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex gap-4 w-full md:w-auto">
                    {["daily", "weekly", "monthly"].map(range => (
                      <button key={range} onClick={() => setActiveRange(range)} className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeRange === range ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20" : "bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-violet-500"}`}>
                        {range}
                      </button>
                    ))}
                  </div>
                  <div className="relative w-full md:w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl pl-12 pr-5 py-3 text-sm font-bold focus:border-violet-500 outline-none transition-all dark:text-white" placeholder="Search report codes..." />
                  </div>
                </div>

                <div className="overflow-x-auto min-h-96">
                   <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50/50 dark:bg-white/5 font-mono">
                          <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Designation</th>
                          <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Classification</th>
                          <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sync Status</th>
                          <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Generated</th>
                          <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Export</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-bold">
                        {loading ? (
                          <tr><td colSpan="5" className="px-8 py-20 text-center"><Loader2 className="animate-spin text-violet-500 mx-auto" size={32} /></td></tr>
                        ) : filteredReports.map(report => (
                          <tr key={report.id} className="hover:bg-slate-50/30 dark:hover:bg-white/5 transition-colors group italic">
                            <td className="px-8 py-6">
                              <div className="flex flex-col">
                                <span className="text-slate-900 dark:text-white font-black uppercase text-sm group-hover:text-violet-500 transition-colors">{report.title}</span>
                                <span className="text-[9px] text-slate-400 font-mono tracking-widest">ID_{report.id.toString().padStart(4, '0')}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <span className="px-3 py-1 bg-violet-500/10 text-violet-500 text-[9px] font-black rounded-full uppercase tracking-widest border border-violet-500/20">{report.type}</span>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${report.status === 'completed' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                                <span className="text-[10px] text-slate-400 font-black uppercase">{report.status}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-[10px] text-slate-400 font-mono italic">{new Date(report.created_at).toLocaleString()}</td>
                            <td className="px-8 py-6 text-right">
                              <button onClick={() => exportPDF(report)} className="p-3 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-400 hover:text-violet-500 hover:bg-violet-500/10 transition-all">
                                <Download size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
              </div>

            </div>
          </main>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md italic font-bold">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-4xl p-10 border border-slate-200 dark:border-white/10 shadow-3xl animate-in zoom-in duration-300">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8">Initialize Report Protocol</h2>
            <form onSubmit={handleCreateReport} className="space-y-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                 <input required className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:border-violet-500 outline-none transition-all dark:text-white" placeholder="Q2 Demand Projections" value={newReport.title} onChange={e => setNewReport({...newReport, title: e.target.value})} />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Classification</label>
                 <select className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:border-violet-500 outline-none transition-all dark:text-white appearance-none" value={newReport.type} onChange={e => setNewReport({...newReport, type: e.target.value})}>
                   <option value="inventory">Inventory Analysis</option>
                   <option value="sales">Sales Performance</option>
                   <option value="forecast">Flow Prediction</option>
                 </select>
               </div>
               <div className="flex gap-4 pt-4">
                 <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-8 py-4 border border-slate-200 dark:border-white/10 text-slate-400 rounded-2xl font-black uppercase text-xs tracking-widest">Cancel</button>
                 <button type="submit" className="flex-1 px-8 py-4 bg-violet-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 shadow-xl shadow-violet-500/20">Generate Report</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
