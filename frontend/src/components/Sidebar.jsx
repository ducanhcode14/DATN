import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Cpu,
  AlertTriangle,
  Flame,
  CalendarCheck,
  Wrench,
  Layers,
  FileSpreadsheet,
  Users,
  Search,
  CheckSquare,
} from 'lucide-react';

const Sidebar = () => {
  const { user, isAdmin } = useAuth();
  const role = user?.role || 'user';

  // Phân quyền danh mục Menu theo đúng Ma trận phân quyền (SRS Mục 14)
  let navigation = [];

  if (role === 'admin') {
    navigation = [
      { name: 'Tổng quan (Dashboard)', href: '/', icon: LayoutDashboard },
      { name: 'Quản lý Thiết bị', href: '/equipments', icon: Cpu },
      { name: 'Quản lý Sự cố', href: '/incidents', icon: AlertTriangle },
      { name: 'Đánh giá Ưu tiên (C1-C5)', href: '/priority', icon: Flame, badge: 'MCDA' },
      { name: 'Kế hoạch Bảo trì', href: '/plans', icon: CalendarCheck },
      { name: 'Lịch sử Bảo trì', href: '/maintenances', icon: Wrench },
      { name: 'Danh mục & Vị trí', href: '/categories-locations', icon: Layers },
      { name: 'Báo cáo & Thống kê', href: '/reports', icon: FileSpreadsheet },
      { name: 'Quản trị Người dùng', href: '/users', icon: Users },
    ];
  } else if (role === 'manager') {
    navigation = [
      { name: 'Tổng quan (Dashboard)', href: '/', icon: LayoutDashboard },
      { name: 'Quản lý Thiết bị', href: '/equipments', icon: Cpu },
      { name: 'Quản lý Sự cố', href: '/incidents', icon: AlertTriangle },
      { name: 'Đánh giá Ưu tiên (C1-C5)', href: '/priority', icon: Flame, badge: 'MCDA' },
      { name: 'Lập Kế hoạch Bảo trì', href: '/plans', icon: CalendarCheck },
      { name: 'Lịch sử Bảo trì', href: '/maintenances', icon: Wrench },
      { name: 'Danh mục & Vị trí', href: '/categories-locations', icon: Layers },
      { name: 'Báo cáo & Thống kê', href: '/reports', icon: FileSpreadsheet },
    ];
  } else if (role === 'technician') {
    navigation = [
      { name: 'Bàn làm việc Kỹ thuật', href: '/', icon: LayoutDashboard },
      { name: 'Danh sách Thiết bị', href: '/equipments', icon: Cpu },
      { name: 'Tiếp nhận & Xử lý Sự cố', href: '/incidents', icon: AlertTriangle },
      { name: 'Thực hiện Kế hoạch Bảo trì', href: '/plans', icon: CheckSquare },
      { name: 'Nhật ký Bảo trì', href: '/maintenances', icon: Wrench },
    ];
  } else {
    // Role: user (Giảng viên / Người sử dụng thiết bị)
    navigation = [
      { name: 'Trang cá nhân', href: '/', icon: LayoutDashboard },
      { name: 'Tra cứu Thiết bị Phòng học', href: '/equipments', icon: Search },
      { name: 'Báo Hỏng & Theo dõi Sự cố', href: '/incidents', icon: AlertTriangle },
    ];
  }

  const roleLabels = {
    admin: 'Quản trị viên (Admin)',
    manager: 'Quản lý thiết bị',
    technician: 'Nhân viên kỹ thuật',
    user: 'Giảng viên / Người dùng',
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 min-h-screen border-r border-slate-800">
      {/* Brand logo & title */}
      <div className="h-16 flex items-center px-5 bg-slate-950 border-b border-slate-800">
        <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white mr-3 shadow-md shadow-indigo-500/30">
          <Wrench className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-sm text-white tracking-wide leading-tight">BẢO TRÌ THIẾT BỊ</h1>
          <p className="text-[11px] text-slate-400 font-medium">Đồ án TN • Bùi Đức Anh</p>
        </div>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Menu Nghiệp Vụ</span>
          <span className="text-[10px] font-bold text-indigo-400 uppercase">
            {role}
          </span>
        </div>
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end={item.href === '/'}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/50'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <div className="flex items-center space-x-3">
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.name}</span>
            </div>
            {item.badge && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User info card at bottom */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center space-x-3 px-2 py-1">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-white">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.fullName}</p>
            <p className="text-[11px] text-slate-400">
              {roleLabels[role] || 'Người dùng'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
