import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
} from 'lucide-react';

const Maintenances = () => {
  const { isTechnician } = useAuth();
  const [maintenances, setMaintenances] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [typeFilter, setTypeFilter] = useState('');
  const [resultFilter, setResultFilter] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    equipmentId: '',
    type: 'periodic',
    scheduledDate: new Date().toISOString().split('T')[0],
    performedDate: new Date().toISOString().split('T')[0],
    content: '',
    result: 'good',
    cost: 150000,
    notes: '',
  });

  useEffect(() => {
    fetchMaintenances();
    fetchEquipments();
  }, []);

  const fetchEquipments = async () => {
    try {
      const res = await axiosClient.get('/equipments?limit=200');
      if (res.success) setEquipments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMaintenances = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (typeFilter) query.append('type', typeFilter);
      if (resultFilter) query.append('result', resultFilter);

      const res = await axiosClient.get(`/maintenances?${query.toString()}`);
      if (res.success) {
        setMaintenances(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosClient.post('/maintenances', form);
      if (res.success) {
        setShowModal(false);
        fetchMaintenances();
      }
    } catch (err) {
      alert(err.error?.message || 'Lỗi thêm bản ghi bảo trì');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Lịch Sử & Hoạt Động Bảo Trì Thiết Bị</h2>
          <p className="text-xs text-slate-500">
            Theo dõi chi tiết các đợt bảo dưỡng định kỳ, phòng ngừa và chi phí vật tư phát sinh
          </p>
        </div>
        {isTechnician && (
          <button
            onClick={() => {
              setForm({
                equipmentId: equipments[0]?._id || '',
                type: 'periodic',
                scheduledDate: new Date().toISOString().split('T')[0],
                performedDate: new Date().toISOString().split('T')[0],
                content: '',
                result: 'good',
                cost: 150000,
                notes: '',
              });
              setShowModal(true);
            }}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Tạo Bản Ghi Bảo Trì
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50"
        >
          <option value="">-- Tất cả loại bảo trì --</option>
          <option value="periodic">Định kỳ (Periodic)</option>
          <option value="preventive">Phòng ngừa (Preventive)</option>
          <option value="corrective">Sửa chữa / Khắc phục (Corrective)</option>
        </select>

        <select
          value={resultFilter}
          onChange={(e) => setResultFilter(e.target.value)}
          className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50"
        >
          <option value="">-- Kết quả --</option>
          <option value="good">Đạt chuẩn</option>
          <option value="fair">Tạm ổn</option>
          <option value="replaced_parts">Thay linh kiện</option>
          <option value="failed">Không đạt</option>
        </select>

        <button
          onClick={fetchMaintenances}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
        >
          Lọc dữ liệu
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Mã BT</th>
                <th className="px-4 py-3 text-left">Mã & Tên Thiết Bị</th>
                <th className="px-4 py-3 text-left">Loại Bảo Trì</th>
                <th className="px-4 py-3 text-left">Ngày Thực Hiện</th>
                <th className="px-4 py-3 text-left">Người Thực Hiện</th>
                <th className="px-4 py-3 text-left">Nội Dung Thực Hiện</th>
                <th className="px-4 py-3 text-center">Kết Quả</th>
                <th className="px-4 py-3 text-right">Chi Phí</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-slate-400">
                    Đang tải lịch sử bảo trì...
                  </td>
                </tr>
              ) : maintenances.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-slate-400">
                    Không tìm thấy bản ghi bảo trì nào
                  </td>
                </tr>
              ) : (
                maintenances.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                      {m.code}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                      <div className="font-semibold text-indigo-600">{m.equipmentId?.code}</div>
                      <div className="text-[11px] text-slate-400 max-w-[150px] truncate">
                        {m.equipmentId?.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap capitalize text-slate-700">
                      {m.type === 'periodic'
                        ? 'Định kỳ'
                        : m.type === 'preventive'
                        ? 'Phòng ngừa'
                        : 'Sửa chữa'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                      {m.performedDate
                        ? new Date(m.performedDate).toLocaleDateString('vi-VN')
                        : new Date(m.scheduledDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                      {m.performedBy?.fullName || 'Kỹ thuật viên'}
                    </td>
                    <td className="px-4 py-3 text-slate-800 max-w-xs truncate">{m.content}</td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {m.result === 'good'
                          ? 'Đạt chuẩn'
                          : m.result === 'fair'
                          ? 'Tạm ổn'
                          : m.result === 'replaced_parts'
                          ? 'Thay linh kiện'
                          : 'Không đạt'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900 whitespace-nowrap">
                      {m.cost ? `${m.cost.toLocaleString('vi-VN')} đ` : '0 đ'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Tạo mới bản ghi bảo trì */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center">
              <Wrench className="w-5 h-5 mr-2 text-indigo-600" />
              Tạo Bản Ghi Hoạt Động Bảo Trì
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chọn thiết bị *</label>
                <select
                  required
                  value={form.equipmentId}
                  onChange={(e) => setForm({ ...form, equipmentId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="">-- Chọn thiết bị --</option>
                  {equipments.map((eq) => (
                    <option key={eq._id} value={eq._id}>
                      {eq.code} - {eq.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Loại bảo trì</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="periodic">Định kỳ</option>
                    <option value="preventive">Phòng ngừa</option>
                    <option value="corrective">Sửa chữa / Khắc phục</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kết quả kiểm tra</label>
                  <select
                    value={form.result}
                    onChange={(e) => setForm({ ...form, result: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="good">Đạt chuẩn</option>
                    <option value="fair">Tạm ổn</option>
                    <option value="replaced_parts">Đã thay linh kiện</option>
                    <option value="failed">Không đạt</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ngày thực hiện</label>
                  <input
                    type="date"
                    required
                    value={form.performedDate}
                    onChange={(e) => setForm({ ...form, performedDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Chi phí (VNĐ)</label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={form.cost}
                    onChange={(e) => setForm({ ...form, cost: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nội dung công việc *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Vệ sinh, kiểm tra nguồn điện, bôi keo tản nhiệt..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                ></textarea>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-sm"
                >
                  Lưu bản ghi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenances;
