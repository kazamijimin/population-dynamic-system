import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [time, setTime] = useState(new Date());

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch backend data with auto refresh
  useEffect(() => {
    const fetchData = () => {
      setLoading(true);
      api.get("/health/")
        .then(res => {
          setData(res.data);
          setError(null);
        })
        .catch(err => {
          console.error(err);
          setError(err.message || "Failed to connect to backend");
        })
        .finally(() => setLoading(false));
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: "Total Population", value: data?.population || "12,847", icon: "👥", color: "indigo" },
    { label: "Active Simulations", value: data?.simulations || "3", icon: "🔬", color: "emerald" },
    { label: "Inventory Items", value: data?.inventory || "156", icon: "📦", color: "amber" },
    { label: "Reports Generated", value: data?.reports || "24", icon: "📊", color: "pink" },
  ];

  const activities = [
    { action: "New simulation started", time: "2 minutes ago", icon: "🔬" },
    { action: "Population data updated", time: "15 minutes ago", icon: "📈" },
    { action: "Report exported", time: "1 hour ago", icon: "📄" },
    { action: "New user registered", time: "3 hours ago", icon: "👤" },
  ];

  const quickActions = [
    { label: "New Simulation", icon: "🔬", color: "indigo" },
    { label: "Add Inventory", icon: "📦", color: "emerald" },
    { label: "Generate Report", icon: "📊", color: "amber" },
    { label: "Manage Users", icon: "👥", color: "pink" },
  ];

  const colorClasses = {
    indigo: {
      bg: "bg-indigo-100",
      text: "text-indigo-600",
      border: "border-indigo-500",
    },
    emerald: {
      bg: "bg-emerald-100",
      text: "text-emerald-600",
      border: "border-emerald-500",
    },
    amber: {
      bg: "bg-amber-100",
      text: "text-amber-600",
      border: "border-amber-500",
    },
    pink: {
      bg: "bg-pink-100",
      text: "text-pink-600",
      border: "border-pink-500",
    },
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 font-sans">

      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">Admin Panel</h2>

        <nav className="flex flex-col gap-4 text-gray-600">
          <a className="hover:text-indigo-600 cursor-pointer">Dashboard</a>
          <a className="hover:text-indigo-600 cursor-pointer">Simulations</a>
          <a className="hover:text-indigo-600 cursor-pointer">Inventory</a>
          <a className="hover:text-indigo-600 cursor-pointer">Reports</a>
          <a className="hover:text-indigo-600 cursor-pointer">Users</a>
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-400">System Time</p>
          <p className="text-sm font-medium text-gray-700">
            {time.toLocaleTimeString()}
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Welcome back! Here's what's happening today.
            </p>
          </div>

          <div>
            {loading ? (
              <span className="px-4 py-2 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">
                ⏳ Connecting...
              </span>
            ) : error ? (
              <span className="px-4 py-2 rounded-full text-sm font-medium bg-red-100 text-red-600">
                ❌ Offline
              </span>
            ) : (
              <span className="px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-600">
                ✓ System Online
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 flex items-center gap-4 shadow-sm border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${colorClasses[stat.color].bg}`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <h3 className={`text-2xl font-bold ${colorClasses[stat.color].text}`}>
                  {stat.value}
                </h3>
                <p className="text-xs text-emerald-500 mt-1">
                  +12% from last week
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-5">
              Recent Activity
            </h2>

            <div className="flex flex-col gap-4">
              {activities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <span className="text-xl">{activity.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-400">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-5">
              System Status
            </h2>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                <p>Checking system status...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <span className="text-5xl mb-4">⚠️</span>
                <p className="text-red-600 font-medium">{error}</p>
                <p className="text-gray-500 text-sm mt-2">
                  Make sure the backend server is running
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {["Backend API", "Database", "Simulation Engine"].map(
                  (service, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <span className="text-gray-700">{service}</span>
                      <span className="ml-auto text-emerald-500 text-sm font-medium">
                        Operational
                      </span>
                    </div>
                  )
                )}

                {data && (
                  <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
                      API Response:
                    </p>
                    <pre className="text-sm text-gray-700 font-mono">
                      {JSON.stringify(data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">
            Quick Actions
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className={`group flex flex-col items-center gap-3 p-6 bg-white border ${colorClasses[action.color].border} rounded-2xl hover:bg-gray-50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">
                  {action.icon}
                </span>
                <span className={`font-medium ${colorClasses[action.color].text}`}>
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
