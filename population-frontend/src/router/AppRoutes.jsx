import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import Login from '../pages/Login';
import Register from '../pages/Register';

// Import pages
import AdminDashboard from '../pages/admin/Dashboard';
import AdminInventory from '../pages/admin/Inventory';
import Reports from '../pages/admin/Reports';
import Population from '../pages/admin/Population';
import Simulation from '../pages/admin/Simulation';
import Schedules from '../pages/admin/Schedules';
import SimulationDashboard from '../pages/admin/SimulationDashboard';
import Users from '../pages/admin/Users';
import ActivityLogs from '../pages/admin/ActivityLogs';
import ManagerDashboard from '../pages/manager/Dashboard';
import ManagerInventory from '../pages/manager/Inventory';
import ManagerReports from '../pages/manager/Reports';
import ManagerSimulation from '../pages/manager/Simulation';
import CustomerFlow from '../pages/manager/Flow';
import ManagerSales from '../pages/manager/Sales';
import Profile from '../pages/manager/Profile';
import StaffTerminal from '../pages/staff/StaffTerminal';
import StaffProfile from '../pages/staff/StaffProfile';
import { getRoleHomePath } from '../utils/roleRoutes';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, isLoading } = useContext(AuthContext);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-6">
        <div className="ds-card ds-card-pad-lg max-w-md w-full text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white flex items-center justify-center shadow-[0_18px_32px_-18px_rgba(124,58,237,0.68)]">
            <span className="text-lg font-bold">AI</span>
          </div>
          <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">Preparing your workspace</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Syncing authenticated session and dashboard access.
          </p>
        </div>
      </div>
    );
  }
  
  if (!currentUser) return <Navigate to="/login" />;
  
  if (allowedRoles && !allowedRoles.includes(currentUser?.role)) {
    return <Navigate to={getRoleHomePath(currentUser.role)} />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Admin/Unified routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      
      {/* Restricted to Admin only */}
      <Route path="/admin/inventory" element={<ProtectedRoute allowedRoles={['admin']}><AdminInventory /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><Reports /></ProtectedRoute>} />
      <Route path="/admin/customers" element={<ProtectedRoute allowedRoles={['admin']}><Population /></ProtectedRoute>} />
      <Route path="/admin/schedules" element={<ProtectedRoute allowedRoles={['admin']}><Schedules /></ProtectedRoute>} />
      <Route path="/admin/simulation" element={<ProtectedRoute allowedRoles={['admin']}><Simulation /></ProtectedRoute>} />
      <Route path="/admin/flow" element={<ProtectedRoute allowedRoles={['admin']}><SimulationDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><Users /></ProtectedRoute>} />
      <Route path="/admin/activity" element={<ProtectedRoute allowedRoles={['admin']}><ActivityLogs /></ProtectedRoute>} />
      <Route path="/admin/profile" element={<ProtectedRoute allowedRoles={['admin']}><Profile /></ProtectedRoute>} />
      
      {/* Manager specific routes */}
      <Route path="/manager/dashboard" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><ManagerDashboard /></ProtectedRoute>} />
      <Route path="/manager/inventory" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><ManagerInventory /></ProtectedRoute>} />
      <Route path="/manager/reports" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><ManagerReports /></ProtectedRoute>} />
      <Route path="/manager/simulation" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><ManagerSimulation /></ProtectedRoute>} />
      <Route path="/manager/flow" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><CustomerFlow /></ProtectedRoute>} />
      <Route path="/manager/sales" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><ManagerSales /></ProtectedRoute>} />
      <Route path="/manager/profile" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><Profile /></ProtectedRoute>} />
      
      {/* Staff specific routes */}
      <Route path="/staff/terminal" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'staff']}><StaffTerminal /></ProtectedRoute>} />
      <Route path="/staff/profile" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'staff']}><StaffProfile /></ProtectedRoute>} />
      
      {/* Default redirect */}
      <Route path="/" element={<RootRedirect />} />
    </Routes>
  );
};

const RootRedirect = () => {
  const { currentUser, isLoading } = useContext(AuthContext);

  if (isLoading) return null;

  return <Navigate to={currentUser ? getRoleHomePath(currentUser.role) : "/login"} />;
};

export default AppRoutes;
