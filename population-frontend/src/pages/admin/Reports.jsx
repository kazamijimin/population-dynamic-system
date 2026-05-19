import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import { analyticsApi } from "../../api/analytics.api";
import Topbar from "../../components/layout/Topbar";
import Sidebar from "../../components/layout/Sidebar";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
  const [success, setSuccess] = useState(null);
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
      setError(err.response?.data?.detail || "Failed to initialize report protocol.");
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
      showSuccess("Report generated successfully!");
    } catch (err) {
      const data = err.response?.data;
      setError(data?.detail || data?.title?.[0] || "Security violation: Report generation locked.");
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = (report) => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      
      const primaryColor = [124, 58, 237]; // Violet 600
      const secondaryColor = [30, 41, 59]; // Slate 800
      
      // Header Background
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 40, 'F');
      
      // Header Text
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("NEXUS DYNAMICS", 14, 20);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("INTELLIGENCE HUB // MASTER REPORT", 14, 28);
      
      // Report Title
      doc.setTextColor(...secondaryColor);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(report.title.toUpperCase(), 14, 55);
      
      // Metadata
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(`CLASSIFICATION: ${report.type.toUpperCase()}`, 14, 65);
      doc.text(`GENERATED: ${new Date(report.created_at).toLocaleString()}`, 14, 71);
      doc.text(`REFERENCE ID: NEX-${report.id.toString().padStart(6, '0')}`, 14, 77);

      const bodyData = [];
      if (report.data && report.data.metrics) {
        Object.entries(report.data.metrics).forEach(([key, value]) => {
          bodyData.push([key.replace(/_/g, ' ').toUpperCase(), value]);
        });
      } else {
        bodyData.push(['NO METRICS FOUND', '-']);
      }

      let startY = 87;

      if (report.description) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...secondaryColor);
        doc.text("DESCRIPTION:", 14, startY);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(100, 116, 139);
        const splitDesc = doc.splitTextToSize(report.description, 180);
        doc.text(splitDesc, 14, startY + 6);
        startY += (splitDesc.length * 6) + 12;
      }

      autoTable(doc, {
        startY: startY,
        head: [['METRIC', 'VALUE']],
        body: bodyData,
        theme: 'striped',
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'left'
        },
        columnStyles: {
          0: { fontStyle: 'bold', textColor: secondaryColor },
          1: { halign: 'right', textColor: primaryColor, fontStyle: 'bold' }
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252] // Slate 50
        },
        margin: { top: 20, right: 14, bottom: 20, left: 14 }
      });

      const pageCount = doc.internal.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `NEXUS INTELLIGENCE SYSTEM • PAGE ${i} OF ${pageCount}`, 
          doc.internal.pageSize.width / 2, 
          doc.internal.pageSize.height - 10, 
          { align: 'center' }
        );
      }

      doc.save(`nexus_report_${report.type}_${report.id}.pdf`);
      showSuccess(`Report "${report.title}" exported to PDF successfully!`);
    } catch (err) {
      setError("Failed to export PDF: " + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const exportCSV = (report) => {
    try {
      let csvContent = `Report Title,${report.title}\nReport Type,${report.type}\nGenerated,${new Date(report.created_at).toLocaleString()}\n\nMetric,Value\n`;

      if (report.data && report.data.metrics) {
        Object.entries(report.data.metrics).forEach(([key, value]) => {
          csvContent += `${key.replace(/_/g, ' ').toUpperCase()},${value}\n`;
        });
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `report_${report.type}_${report.id}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showSuccess(`Report "${report.title}" exported to CSV successfully!`);
    } catch (err) {
      setError("Failed to export CSV: " + err.message);
    }
  };

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
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

              {success && (
                <div className="flex items-start justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200 shadow-sm not-italic mt-4">
                  <span>{success}</span>
                  <button type="button" onClick={() => setSuccess(null)} className="font-black hover:text-emerald-900 dark:hover:text-white">
                    x
                  </button>
                </div>
              )}

              {error && (
                <div className="flex items-start justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200 shadow-sm not-italic mt-4">
                  <span>{error}</span>
                  <button type="button" onClick={() => setError(null)} className="font-black hover:text-rose-900 dark:hover:text-white">
                    x
                  </button>
                </div>
              )}

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
                        ) : filteredReports.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="px-8 py-24 text-center">
                              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
                                No reports yet. Generate a master report to start the archive.
                              </p>
                            </td>
                          </tr>
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
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => exportPDF(report)} title="Export PDF" className="p-3 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-400 hover:text-violet-500 hover:bg-violet-500/10 transition-all">
                                  <FileText size={16} />
                                </button>
                                <button onClick={() => exportCSV(report)} title="Export CSV" className="p-3 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all">
                                  <FileDown size={16} />
                                </button>
                              </div>
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
