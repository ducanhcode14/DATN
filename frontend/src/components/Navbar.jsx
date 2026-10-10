import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, UserCheck, Shield, RefreshCw } from 'lucide-react';

const Navbar = ({ title }) => {
  const { user, logout, login } = useAuth();

  const handleQuickSwitch = async (roleUsername, rolePassword) => {
    await login(roleUsername, rolePassword);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      {/* Page Title */}
      <div>
        <h2 className="text-lg font-bold text-slate-800">{title || 'Hệ thống Quản lý Thiết bị'}</h2>
      </div>

      {/* Right Actions: Quick Role Switcher for Demo + Profile + Logout */}
      <div className="flex items-center space-x-3">
        {/* Quick Demo Switcher */}
        <div className="hidden lg:flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <span className="text-[11px] font-semibold text-slate-500 px-2 flex items-center">
            <RefreshCw className="w-3 h-3 mr-1" /> Đổi vai trò demo:
          </span>
          <button
            onClick={() => handleQuickSwitch('admin', 'admin123')}
            className={`px-2 py-1 rounded text-xs font-medium transition ${
              user?.role === 'admin' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-white'
            }`}
            title="Đăng nhập tài khoản Quản trị viên"
          >
            Admin
          </button>
          <button
            onClick={() => handleQuickSwitch('quanly', 'quanly123')}
            className={`px-2 py-1 rounded text-xs font-medium transition ${
              user?.role === 'manager' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-white'
            }`}
            title="Đăng nhập tài khoản Quản lý"
          >
            Quản lý
          </button>
          <button
            onClick={() => handleQuickSwitch('kythuat', 'kythuat123')}
            className={`px-2 py-1 rounded text-xs font-medium transition ${
              user?.role === 'technician' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-white'
            }`}
            title="Đăng nhập tài khoản Kỹ thuật"
          >
            Kỹ thuật
          </button>
          <button
            onClick={() => handleQuickSwitch('giangvien', 'user123')}
            className={`px-2 py-1 rounded text-xs font-medium transition ${
              user?.role === 'user' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-white'
            }`}
            title="Đăng nhập tài khoản Người dùng"
          >
            Giảng viên
          </button>
        </div>

        {/* User Role Tag */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
          <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-1 rounded-md border border-indigo-100 flex items-center">
            <Shield className="w-3.5 h-3.5 mr-1 text-indigo-600" />
            {user?.role === 'admin'
              ? 'Admin'
              : user?.role === 'manager'
              ? 'Quản lý'
              : user?.role === 'technician'
              ? 'Kỹ thuật'
              : 'Người dùng'}
          </span>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="flex items-center text-xs font-medium text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-200 transition"
          title="Đăng xuất khỏi hệ thống"
        >
          <LogOut className="w-3.5 h-3.5 mr-1" />
          Đăng xuất
        </button>
      </div>
    </header>
  );
};

export default Navbar;
