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

// Middleware kiểm tra đăng nhập và phân quyền trên Route (Client-side Route Guard)
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Nếu không đủ quyền, điều hướng về trang chủ
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
        {/* Tất cả vai trò đều có trang Tổng quan riêng */}
        <Route index element={<Dashboard />} />

        {/* Thiết bị: Tất cả đều xem được, nhưng quyền Thêm/Sửa/Xóa phân cấp ở component */}
        <Route path="equipments" element={<Equipments />} />
        <Route path="equipments/:id" element={<EquipmentDetail />} />

        {/* Sự cố: Tất cả đều xem và gửi báo cáo, quyền Xử lý phân cấp ở component */}
        <Route path="incidents" element={<Incidents />} />

        {/* Đánh giá ưu tiên C1-C5: CHỈ Admin và Quản lý */}
        <Route
          path="priority"
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <PriorityEvaluation />
            </ProtectedRoute>
          }
        />

        {/* Kế hoạch bảo trì: Admin, Quản lý (Lập kế hoạch), Kỹ thuật viên (Thực hiện) */}
        <Route
          path="plans"
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager', 'technician']}>
              <MaintenancePlans />
            </ProtectedRoute>
          }
        />

        {/* Nhật ký bảo trì: Admin, Quản lý, Kỹ thuật viên */}
        <Route
          path="maintenances"
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager', 'technician']}>
              <Maintenances />
            </ProtectedRoute>
          }
        />

        {/* Danh mục & Vị trí: CHỈ Admin và Quản lý */}
        <Route
          path="categories-locations"
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <CategoriesAndLocations />
            </ProtectedRoute>
          }
        />

        {/* Báo cáo & Thống kê: CHỈ Admin và Quản lý */}
        <Route
          path="reports"
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <Reports />
            </ProtectedRoute>
          }
        />

        {/* Quản trị tài khoản người dùng: DUY NHẤT Admin */}
        <Route
          path="users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
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
