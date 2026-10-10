import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wrench, Shield, CheckCircle, AlertCircle, ArrowRight, Lock, User } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [errorMsg, setErrorMsg] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const res = await login(username, password);
    if (res.success) {
      navigate('/');
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleSelectPreset = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="mx-auto w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/40 mb-4">
          <Wrench className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          HỆ THỐNG QUẢN LÝ BẢO TRÌ
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Hỗ trợ lập kế hoạch bảo trì thiết bị • Đồ án tốt nghiệp
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700 py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {errorMsg && (
            <div className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center text-rose-300 text-sm">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Tên đăng nhập
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  placeholder="Nhập tên đăng nhập"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  placeholder="Nhập mật khẩu"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition disabled:opacity-50"
            >
              {loading ? 'Đang xác thực...' : 'Đăng nhập hệ thống'}
              {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
            </button>
          </form>

          {/* Quick preset buttons for graduation thesis defense demo */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-xs font-medium text-slate-400 text-center mb-3">
              ⚡ Chọn nhanh tài khoản demo bảo vệ đồ án:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleSelectPreset('admin', 'admin123')}
                className="p-2 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-200 border border-slate-600 text-left transition flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-white">Quản trị viên</div>
                  <div className="text-[10px] text-slate-400">admin / admin123</div>
                </div>
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset('quanly', 'quanly123')}
                className="p-2 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-200 border border-slate-600 text-left transition flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-white">Quản lý TB</div>
                  <div className="text-[10px] text-slate-400">quanly / quanly123</div>
                </div>
                <CheckCircle className="w-3.5 h-3.5 text-teal-400" />
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset('kythuat', 'kythuat123')}
                className="p-2 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-200 border border-slate-600 text-left transition flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-white">Kỹ thuật viên</div>
                  <div className="text-[10px] text-slate-400">kythuat / kythuat123</div>
                </div>
                <Wrench className="w-3.5 h-3.5 text-amber-400" />
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset('giangvien', 'user123')}
                className="p-2 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-200 border border-slate-600 text-left transition flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-white">Giảng viên/User</div>
                  <div className="text-[10px] text-slate-400">giangvien / user123</div>
                </div>
                <User className="w-3.5 h-3.5 text-sky-400" />
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 text-xs text-slate-500">
          Sinh viên: <span className="text-slate-300 font-medium">Bùi Đức Anh</span> • Khóa tốt nghiệp 2026
        </div>
      </div>
    </div>
  );
};

export default Login;
