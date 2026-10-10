import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Equipments from './pages/Equipments';
import EquipmentDetail from './pages/EquipmentDetail';
import Incidents from './pages/Incidents';
import PriorityEvaluation from './pages/PriorityEvaluation';
import MaintenancePlans from './pages/MaintenancePlans';
import Maintenances from './pages/Maintenances';
import CategoriesAndLocations from './pages/CategoriesAndLocations';
import Reports from './pages/Reports';
import Users from './pages/Users';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="equipments" element={<Equipments />} />
        <Route path="equipments/:id" element={<EquipmentDetail />} />
        <Route path="incidents" element={<Incidents />} />
        <Route path="priority" element={<PriorityEvaluation />} />
        <Route path="plans" element={<MaintenancePlans />} />
        <Route path="maintenances" element={<Maintenances />} />
        <Route path="categories-locations" element={<CategoriesAndLocations />} />
        <Route path="reports" element={<Reports />} />
        <Route
          path="users"
          element={
            <ProtectedRoute requiredRole="admin">
              <Users />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
