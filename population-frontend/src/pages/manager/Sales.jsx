import { useState, useEffect, useCallback } from "react";
import { analyticsApi } from "../../api/analytics.api";
import Topbar from "../../components/layout/Topbar";
import Sidebar from "../../components/layout/Sidebar";
import { 
  TrendingUp, DollarSign,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";

const fallbackSalesData = {
  totalRevenue: 4250.8,
  orders: 142,
  averageOrder: 29.93,
  conversionRate: "12.4%",
  growth: "+8.2%",
  topCategories: [
    { name: "Beverages", value: 65, color: "bg-emerald-500" },
    { name: "Bakery", value: 20, color: "bg-amber-500" },
    { name: "Merchandise", value: 15, color: "bg-indigo-500" }
  ],
  hourlySales: [
    { time: "08:00", sales: 450 },
    { time: "10:00", sales: 820 },
    { time: "12:00", sales: 1250 },
    { time: "14:00", sales: 680 },
    { time: "16:00", sales: 540 },
    { time: "18:00", sales: 980 }
  ],
  sourceLabel: "Fallback dataset",
};

const categoryColors = ["bg-emerald-500", "bg-amber-500", "bg-indigo-500", "bg-teal-500", "bg-violet-500"];

const getCollection = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

const toNumber = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.-]/g, "");
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const readMetric = (source, keys) => {
  if (!source || typeof source !== "object") return null;

  for (const [key, value] of Object.entries(source)) {
    const normalized = key.toLowerCase().replace(/[^a-z]/g, "");
    if (keys.includes(normalized)) {
      const numeric = toNumber(value);
      if (numeric !== null) return numeric;
    }

    if (value && typeof value === "object" && !Array.isArray(value)) {
      const nested = readMetric(value, keys);
      if (nested !== null) return nested;
    }
  }

  return null;
};

const readStringMetric = (source, keys) => {
  if (!source || typeof source !== "object") return null;

  for (const [key, value] of Object.entries(source)) {
    const normalized = key.toLowerCase().replace(/[^a-z]/g, "");
    if (keys.includes(normalized) && value != null) {
      return String(value);
    }

    if (value && typeof value === "object" && !Array.isArray(value)) {
      const nested = readStringMetric(value, keys);
      if (nested) return nested;
    }
  }

  return null;
};

const normalizeTimeLabel = (value, index) => {
  if (!value) return `${String(8 + index * 2).padStart(2, "0")}:00`;
  if (typeof value === "string" && /^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);

  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  }

  return String(value);
};

const buildCategoryMix = (rows) => {
  const grouped = new Map();

  rows.forEach((row) => {
    const name = row.category || row.product_category || row.productType || row.item_type || row.type || row.name;
    const metric = toNumber(
      row.revenue ?? row.sales ?? row.amount ?? row.total ?? row.total_revenue ?? row.value ?? row.quantity
    );

    if (!name || metric === null) return;
    grouped.set(name, (grouped.get(name) || 0) + metric);
  });

  const total = [...grouped.values()].reduce((sum, value) => sum + value, 0);
  if (!total) return fallbackSalesData.topCategories;

  return [...grouped.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value], index) => ({
      name,
      value: Math.round((value / total) * 100),
      color: categoryColors[index % categoryColors.length],
    }));
};

const buildHourlySales = (rows) => {
  const grouped = new Map();

  rows.forEach((row) => {
    const rawTime = row.time || row.hour || row.timestamp || row.date || row.datetime;
    const amount = toNumber(row.revenue ?? row.sales ?? row.amount ?? row.total ?? row.total_revenue ?? row.value);
    if (!rawTime || amount === null) return;

    const label = normalizeTimeLabel(rawTime, grouped.size);
    grouped.set(label, (grouped.get(label) || 0) + amount);
  });

  if (!grouped.size) return fallbackSalesData.hourlySales;

  return [...grouped.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(0, 8)
    .map(([time, sales]) => ({ time, sales }));
};

const buildSalesData = ({ report, historicalRows, timeframe }) => {
  const reportData = report?.data && typeof report.data === "object" ? report.data : {};
  const rows = Array.isArray(historicalRows) ? historicalRows : [];

  const totalRevenue =
    readMetric(reportData, ["totalrevenue", "revenue", "sales", "totalsales"]) ??
    rows.reduce((sum, row) => sum + (toNumber(row.revenue ?? row.sales ?? row.amount ?? row.total ?? row.total_revenue) || 0), 0);

  const orders =
    readMetric(reportData, ["orders", "ordervolume", "ordercount", "transactions"]) ??
    rows.reduce((sum, row) => sum + (toNumber(row.orders ?? row.order_count ?? row.transactions ?? row.transaction_count) || 0), 0);

  const averageOrder =
    readMetric(reportData, ["averageorder", "avgticket", "averageticket", "averageordervalue"]) ??
    (orders > 0 ? totalRevenue / orders : null);

  const conversionRateRaw =
    readStringMetric(reportData, ["conversionrate", "convrate"]) ??
    readMetric(reportData, ["conversionrate", "convrate"]);

  const growthRaw =
    readStringMetric(reportData, ["growth", "growthrate", "revenuegrowth"]) ??
    readMetric(reportData, ["growth", "growthrate", "revenuegrowth"]);

  const topCategories = Array.isArray(reportData.topCategories)
    ? reportData.topCategories.map((item, index) => ({
        name: item.name || item.category || `Category ${index + 1}`,
        value: Math.round(toNumber(item.value ?? item.percent ?? item.percentage) || 0),
        color: item.color || categoryColors[index % categoryColors.length],
      }))
    : buildCategoryMix(rows);

  const hourlySales = Array.isArray(reportData.hourlySales)
    ? reportData.hourlySales.map((item, index) => ({
        time: normalizeTimeLabel(item.time || item.hour, index),
        sales: toNumber(item.sales ?? item.revenue ?? item.amount ?? item.total) || 0,
      }))
    : buildHourlySales(rows);

  if (!totalRevenue && !orders && !rows.length && !Object.keys(reportData).length) {
    return {
      ...fallbackSalesData,
      sourceLabel: "Fallback dataset",
    };
  }

  return {
    totalRevenue: totalRevenue || 0,
    orders: orders || 0,
    averageOrder: averageOrder || 0,
    conversionRate: conversionRateRaw != null
      ? (String(conversionRateRaw).includes("%") ? String(conversionRateRaw) : `${Number(conversionRateRaw).toFixed(1)}%`)
      : "N/A",
    growth: growthRaw != null
      ? (String(growthRaw).startsWith("+") || String(growthRaw).startsWith("-")
          ? String(growthRaw)
          : `+${Number(growthRaw).toFixed(1)}%`)
      : (timeframe === "today" ? "+0.0%" : "+0.0%"),
    topCategories,
    hourlySales,
    sourceLabel: report?.title || "Live analytics data",
  };
};

export default function ManagerSales() {
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("today");
  const [dataSource, setDataSource] = useState("Loading sales data");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [reportsRes, historicalRes] = await Promise.all([
        analyticsApi.getSalesReports(),
        analyticsApi.getHistoricalSales()
      ]);

      const reports = getCollection(reportsRes.data).filter((item) => item.type === "sales");
      const historicalSets = getCollection(historicalRes.data).filter((item) => item.data_type === "sales");

      const latestReport = reports[0] || null;
      const latestHistorical = historicalSets[0] || null;
      const historicalRows = Array.isArray(latestHistorical?.data) ? latestHistorical.data : [];

      const normalized = buildSalesData({
        report: latestReport,
        historicalRows,
        timeframe,
      });

      setSalesData(normalized);
      setDataSource(
        latestReport?.title ||
        latestHistorical?.filename ||
        normalized.sourceLabel ||
        "Sales analytics"
      );
    } catch (error) {
      console.error("Failed to load sales analytics:", error);
      setSalesData({
        ...fallbackSalesData,
        sourceLabel: "Fallback dataset",
      });
      setDataSource("Fallback dataset");
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-emerald-50/30 dark:bg-linear-to-br dark:from-emerald-950 dark:via-slate-900 dark:to-black relative overflow-hidden transition-colors duration-500 italic">
      <div className="flex relative z-10 w-full h-screen">
        <Sidebar role="manager" />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 relative z-10">
            <div className="max-w-7xl mx-auto space-y-8">
              
              {/* Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-2">
                  <h1 className="text-5xl md:text-6xl font-black text-emerald-900 dark:text-emerald-50 tracking-tighter uppercase italic leading-none">
                    Revenue <span className="text-emerald-600 dark:text-emerald-400">Stream</span>
                  </h1>
                  <div className="flex items-center gap-3 bg-white dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 rounded-full px-4 py-1.5 w-fit shadow-sm">
                    <DollarSign size={14} className="text-emerald-500" />
                    <p className="text-[10px] font-black text-emerald-900/60 dark:text-emerald-300 uppercase tracking-[0.3em] font-mono">
                      FINANCIAL_LOGS // NODE: {timeframe.toUpperCase()} // SOURCE: {dataSource}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-white/5 p-2 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                  {["today", "week", "month"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTimeframe(t)}
                      className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        timeframe === t 
                          ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" 
                          : "text-slate-400 hover:text-emerald-500"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <RefreshCw className="text-emerald-500 animate-spin" size={40} />
                  <p className="text-[10px] font-black text-emerald-900/40 dark:text-emerald-400/40 uppercase tracking-widest">Hydrating Sales Data...</p>
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in duration-500">
                  {/* Primary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="p-8 rounded-4xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 shadow-xl relative overflow-hidden group">
                      <DollarSign className="absolute -right-4 -bottom-4 opacity-[0.03] text-emerald-500 group-hover:scale-110 transition-transform" size={100} />
                      <p className="text-[10px] font-black text-emerald-900/40 dark:text-emerald-400/40 uppercase tracking-widest mb-1">Total Revenue</p>
                      <h4 className="text-4xl font-black text-emerald-900 dark:text-emerald-50 italic tracking-tighter">${salesData.totalRevenue.toLocaleString()}</h4>
                      <div className="mt-4 flex items-center gap-2 text-emerald-500">
                        <ArrowUpRight size={14} />
                        <span className="text-[10px] font-black">{salesData.growth} vs prev</span>
                      </div>
                    </div>

                    <div className="p-8 rounded-4xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 shadow-xl">
                      <p className="text-[10px] font-black text-emerald-900/40 dark:text-emerald-400/40 uppercase tracking-widest mb-1">Order Volume</p>
                      <h4 className="text-4xl font-black text-emerald-900 dark:text-emerald-50 italic tracking-tighter">{salesData.orders}</h4>
                      <div className="mt-4 flex items-center gap-2 text-emerald-500">
                        <TrendingUp size={14} />
                        <span className="text-[10px] font-black">Stable Velocity</span>
                      </div>
                    </div>

                    <div className="p-8 rounded-4xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 shadow-xl">
                      <p className="text-[10px] font-black text-emerald-900/40 dark:text-emerald-400/40 uppercase tracking-widest mb-1">Avg Ticket</p>
                      <h4 className="text-4xl font-black text-emerald-900 dark:text-emerald-50 italic tracking-tighter">${Number(salesData.averageOrder || 0).toFixed(2)}</h4>
                      <div className="mt-4 flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase">
                        Active Optimization Required
                      </div>
                    </div>

                    <div className="p-8 rounded-4xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 shadow-xl">
                      <p className="text-[10px] font-black text-emerald-900/40 dark:text-emerald-400/40 uppercase tracking-widest mb-1">Conv. Rate</p>
                      <h4 className="text-4xl font-black text-emerald-900 dark:text-emerald-50 italic tracking-tighter">{salesData.conversionRate}</h4>
                    </div>
                  </div>

                  {/* Hourly Breakdown & Distribution */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 p-8 rounded-4xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 shadow-xl">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-emerald-900 dark:text-emerald-50 uppercase italic tracking-tighter">Hourly Revenue Velocity</h3>
                        <Activity className="text-emerald-500" size={20} />
                      </div>
                      <div className="flex items-end justify-between h-48 gap-4 px-4">
                        {salesData.hourlySales.map((entry, idx) => (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-4 group">
                            <div 
                              className="w-full bg-emerald-500/10 group-hover:bg-emerald-500 transition-all rounded-t-xl" 
                              style={{ height: `${(entry.sales / Math.max(...salesData.hourlySales.map((item) => item.sales), 1)) * 100}%` }}
                            />
                            <span className="text-[10px] font-black text-emerald-900/40 dark:text-emerald-400/40 uppercase font-mono">{entry.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="lg:col-span-1 p-8 rounded-4xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 shadow-xl">
                      <h3 className="text-xl font-black text-emerald-900 dark:text-emerald-50 uppercase italic tracking-tighter mb-8">Category Mix</h3>
                      <div className="space-y-6">
                        {salesData.topCategories.map((cat, idx) => (
                          <div key={idx} className="space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                              <span className="text-emerald-900/60 dark:text-emerald-400/60">{cat.name}</span>
                              <span className="text-emerald-900 dark:text-emerald-50">{cat.value}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                              <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${cat.value}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-10 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Insight Detected</p>
                        <p className="text-[11px] font-bold text-emerald-900/60 dark:text-emerald-400/60 uppercase leading-relaxed">
                          Beverage volume is up 12% during peak 12:00. Increase prep capacity.
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function Activity({ className, size }) { return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>; }
