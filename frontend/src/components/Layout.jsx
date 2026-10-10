import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const titlesMap = {
  '/': 'Tổng Quan Hệ Thống (Dashboard)',
  '/equipments': 'Quản Lý Danh Sách Thiết Bị',
  '/incidents': 'Theo Dõi & Xử Lý Sự Cố',
  '/priority': 'Đánh Giá Mức Độ Ưu Tiên Bảo Trì (MCDA C1 - C5)',
  '/plans': 'Quản Lý & Theo Dõi Kế Hoạch Bảo Trì',
  '/maintenances': 'Lịch Sử Hoạt Động Bảo Trì & Sửa Chữa',
  '/categories-locations': 'Danh Mục Thiết Bị & Vị Trí Phòng Ban',
  '/reports': 'Báo Cáo & Thống Kê Chi Tiết',
  '/users': 'Quản Trị Người Dùng & Phân Quyền',
};

const Layout = () => {
  const location = useLocation();
  const currentTitle = titlesMap[location.pathname] || 'Quản Lý Bảo Trì Thiết Bị';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar title={currentTitle} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
