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

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, isLoading } = useContext(AuthContext);
  
  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontWeight: '900', fontStyle: 'italic', background: '#f8fafc', color: '#7c3aed' }}>CORE_LOADING...</div>;
  }
  
  if (!currentUser) return <Navigate to="/login" />;
  
  if (allowedRoles && !allowedRoles.includes(currentUser?.role)) {
    // Redirect based on role if they try to access something they shouldn't
    if (currentUser.role === 'staff') return <Navigate to="/staff/terminal" />;
    return <Navigate to="/admin/dashboard" />;
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
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default AppRoutes;