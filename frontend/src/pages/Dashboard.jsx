import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import {
  Cpu,
  AlertTriangle,
  Wrench,
  CalendarCheck,
  DollarSign,
  TrendingUp,
  Flame,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { EquipmentStatusBadge, PriorityBadge } from '../components/StatusBadge';

const PRIORITY_COLORS = ['#ef4444', '#f59e0b', '#10b981']; // High, Medium, Low
const CATEGORY_COLORS = ['#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b'];

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/dashboard/summary');
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-sm text-slate-500 font-medium">Đang tải số liệu tổng quan...</span>
      </div>
    );
  }

  const { cards, categoryStats, priorityStats, topPriorityEquipments, incidentsBySeverity } = data;

  const priorityPieData = [
    { name: 'Ưu tiên Cao (>=70)', value: priorityStats.high },
    { name: 'Trung bình (40-69)', value: priorityStats.medium },
    { name: 'Thấp (<40)', value: priorityStats.low },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">Hệ Thống Quản Lý & Hỗ Trợ Lập Kế Hoạch Bảo Trì</h2>
          <p className="mt-1 text-indigo-100 text-sm max-w-2xl">
            Tự động tổng hợp dữ liệu lịch sử sự cố, tính toán mức độ ưu tiên bảo trì bằng thuật toán MCDA đa tiêu chí C1 - C5.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Link
            to="/priority"
            className="inline-flex items-center px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-lg text-sm shadow transition"
          >
            <Flame className="w-4 h-4 mr-1.5" />
            Đánh Giá Ưu Tiên C1-C5
          </Link>
          <Link
            to="/plans"
            className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg text-sm border border-white/20 transition"
          >
            <CalendarCheck className="w-4 h-4 mr-1.5" />
            Kế Hoạch Bảo Trì
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Equipments */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng Thiết Bị</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{cards.totalEquipments}</h3>
            <div className="mt-1 text-xs text-emerald-600 font-medium flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              {cards.activeEquipments} đang hoạt động tốt
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Cpu className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Incidents */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sự Cố Đang Xử Lý</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{cards.openIncidents}</h3>
            <p className="mt-1 text-xs text-slate-500 font-medium">Tổng số {cards.totalIncidents} sự cố ghi nhận</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Priority Alert */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ưu Tiên Bảo Trì Cao</p>
            <h3 className="text-2xl font-bold text-rose-600 mt-1">{priorityStats.high} thiết bị</h3>
            <p className="mt-1 text-xs text-amber-600 font-medium">{priorityStats.medium} thiết bị mức trung bình</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
            <Flame className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Total Expense */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tổng Chi Phí Bảo Trì</p>
            <h3 className="text-xl font-bold text-slate-800 mt-1">
              {(cards.totalExpense || 0).toLocaleString('vi-VN')} đ
            </h3>
            <p className="mt-1 text-xs text-slate-500 font-medium">
              Sửa chữa: {(cards.totalRepairCost || 0).toLocaleString('vi-VN')} đ
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Charts Section: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Priority Distribution (DB-07) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Phân Bổ Mức Độ Ưu Tiên Bảo Trì (DB-07)</h3>
              <p className="text-xs text-slate-500">Dựa trên thuật toán 5 tiêu chí C1 - C5</p>
            </div>
            <Link to="/priority" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center">
              Xem chi tiết <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${value} TB`}
                >
                  {priorityPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[index % PRIORITY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Equipments by Category (DB-02) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Số Lượng Thiết Bị Theo Nhóm (DB-02)</h3>
              <p className="text-xs text-slate-500">Phân bố chủng loại thiết bị trong hệ thống</p>
            </div>
            <Link to="/equipments" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center">
              Xem danh sách <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryStats} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="Số lượng thiết bị" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                  {categoryStats.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Priority Equipments Table (DB-08) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center">
              <Flame className="w-4 h-4 mr-2 text-rose-500" />
              Thiết Bị Cần Ưu Tiên Bảo Trì Hàng Đầu (DB-08)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Được thuật toán hệ thống tự động đề xuất dựa trên điểm tổng hợp C1 - C5
            </p>
          </div>
          <Link
            to="/priority"
            className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-3 py-1.5 rounded-lg border border-indigo-200 transition flex items-center"
          >
            Đưa vào kế hoạch bảo trì <ArrowRight className="w-3 h-3 ml-1.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-5 py-3 text-left">Hạng</th>
                <th className="px-5 py-3 text-left">Mã TB</th>
                <th className="px-5 py-3 text-left">Tên Thiết Bị</th>
                <th className="px-5 py-3 text-left">Vị trí phòng</th>
                <th className="px-5 py-3 text-center">Tình trạng</th>
                <th className="px-5 py-3 text-center">Số sự cố (C2)</th>
                <th className="px-5 py-3 text-center">Điểm ưu tiên</th>
                <th className="px-5 py-3 text-center">Mức đề xuất</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {topPriorityEquipments && topPriorityEquipments.length > 0 ? (
                topPriorityEquipments.map((item) => (
                  <tr key={item.equipmentId} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-3.5 whitespace-nowrap font-bold text-slate-700">#{item.rank}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap font-semibold text-indigo-600">
                      <Link to={`/equipments/${item.equipmentId}`} className="hover:underline">
                        {item.code}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-800 font-medium">{item.name}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-500 text-xs">{item.location}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-center">
                      <EquipmentStatusBadge status={item.status} />
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-center font-semibold text-rose-600">
                      {item.rawValues.incidentCount} lần
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-center font-bold text-slate-900">
                      {item.priorityScore}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-center">
                      <PriorityBadge level={item.priorityLevel} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-5 py-6 text-center text-slate-400 text-sm">
                    Không có thiết bị cần bảo trì khẩn cấp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
