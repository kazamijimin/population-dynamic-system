import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Fetch Reports (CRASH SAFE)
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);

        const res = await api.get("/reports/");

        // Handle both array and paginated response
        let reportData = [];

        if (Array.isArray(res.data)) {
          reportData = res.data;
        } else if (Array.isArray(res.data?.results)) {
          reportData = res.data.results;
        }

        setReports(reportData);
        setError(null);
      } catch (err) {
        console.error("Reports Error:", err);
        setError("Failed to load reports");
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // ✅ Safe Filtering (NEVER crashes)
  const filteredReports = useMemo(() => {
    if (!Array.isArray(reports)) return [];

    return reports.filter((report) =>
      report?.title?.toLowerCase().includes(search.toLowerCase())
    );
  }, [reports, search]);

  // ✅ Export CSV
  const exportToCSV = () => {
    if (!filteredReports.length) return;

    const headers = ["ID", "Title", "Type", "Status", "Created At"];

    const rows = filteredReports.map((r) => [
      r?.id ?? "",
      r?.title ?? "",
      r?.type ?? "",
      r?.status ?? "",
      r?.created_at
        ? new Date(r.created_at).toLocaleString()
        : "",
    ]);

    const csv =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((row) => row.join(",")).join("\n");

    const encodedUri = encodeURI(csv);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.download = "reports.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusStyles = {
    completed: "bg-emerald-100 text-emerald-600",
    pending: "bg-amber-100 text-amber-600",
    failed: "bg-red-100 text-red-600",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Reports</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage and export generated reports
            </p>
          </div>

          <button
            onClick={exportToCSV}
            className="mt-4 sm:mt-0 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Export CSV
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search reports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

          {/* Loading */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="w-10 h-10 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="text-center py-10 text-red-500 font-medium">
              {error}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filteredReports.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              No reports found
            </div>
          )}

          {/* Table */}
          {!loading && !error && filteredReports.length > 0 && (
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-medium text-gray-600">ID</th>
                  <th className="px-6 py-3 font-medium text-gray-600">Title</th>
                  <th className="px-6 py-3 font-medium text-gray-600">Type</th>
                  <th className="px-6 py-3 font-medium text-gray-600">Status</th>
                  <th className="px-6 py-3 font-medium text-gray-600">Created</th>
                </tr>
              </thead>

              <tbody>
                {filteredReports.map((report) => (
                  <tr
                    key={report?.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 text-gray-700">
                      {report?.id}
                    </td>

                    <td className="px-6 py-4 font-medium text-gray-800">
                      {report?.title}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {report?.type}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          statusStyles[report?.status] ||
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {report?.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-gray-500">
                      {report?.created_at
                        ? new Date(report.created_at).toLocaleDateString()
                        : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

        </div>
      </div>
    </div>
  );
}
