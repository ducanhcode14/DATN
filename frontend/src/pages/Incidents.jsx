import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import {
  AlertTriangle,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  UserCheck,
  Edit,
} from 'lucide-react';
import { IncidentSeverityBadge, IncidentStatusBadge } from '../components/StatusBadge';

const Incidents = () => {
  const { user, isTechnician, isManager } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);

  const [createForm, setCreateForm] = useState({
    equipmentId: '',
    title: '',
    description: '',
    severity: 'medium',
  });

  const [updateForm, setUpdateForm] = useState({
    status: 'in_progress',
    assignedTo: '',
    resolution: '',
    repairCost: 0,
    updateEquipmentStatus: 'active',
  });

  useEffect(() => {
    fetchIncidents();
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const [eqsRes, usersRes] = await Promise.all([
        axiosClient.get('/equipments?limit=200'),
        axiosClient.get('/users?role=technician').catch(() => ({ success: false })),
      ]);
      if (eqsRes.success) setEquipments(eqsRes.data);
      if (usersRes.success) setTechnicians(usersRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (statusFilter) query.append('status', statusFilter);
      if (severityFilter) query.append('severity', severityFilter);
      if (searchTerm) query.append('search', searchTerm);

      const res = await axiosClient.get(`/incidents?${query.toString()}`);
      if (res.success) {
        setIncidents(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setCreateForm({
      equipmentId: equipments[0]?._id || '',
      title: '',
      description: '',
      severity: 'medium',
    });
    setShowCreateModal(true);
  };

  const handleOpenUpdate = (inc) => {
    setSelectedIncident(inc);
    setUpdateForm({
      status: inc.status,
      assignedTo: inc.assignedTo?._id || inc.assignedTo || '',
      resolution: inc.resolution || '',
      repairCost: inc.repairCost || 0,
      updateEquipmentStatus: 'active',
    });
    setShowUpdateModal(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosClient.post('/incidents', createForm);
      if (res.success) {
        setShowCreateModal(false);
        fetchIncidents();
      }
    } catch (err) {
      alert(err.error?.message || 'Lỗi ghi nhận sự cố');
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosClient.patch(`/incidents/${selectedIncident._id}`, updateForm);
      if (res.success) {
        setShowUpdateModal(false);
        fetchIncidents();
      }
    } catch (err) {
      alert(err.error?.message || 'Lỗi cập nhật sự cố');
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Quản Lý & Xử Lý Sự Cố Thiết Bị</h2>
          <p className="text-xs text-slate-500">Tiếp nhận báo hỏng, phân công kỹ thuật và cập nhật kết quả xử lý</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Báo Sự Cố Mới
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo mã sự cố, tiêu đề, mô tả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50"
        >
          <option value="">-- Trạng thái --</option>
          <option value="open">Mới tiếp nhận (Open)</option>
          <option value="assigned">Đã phân công</option>
          <option value="in_progress">Đang xử lý</option>
          <option value="resolved">Đã khắc phục</option>
          <option value="closed">Đã đóng</option>
        </select>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50"
        >
          <option value="">-- Mức nghiêm trọng --</option>
          <option value="low">Thấp</option>
          <option value="medium">Trung bình</option>
          <option value="high">Cao</option>
          <option value="critical">Khẩn cấp</option>
        </select>

        <button
          onClick={fetchIncidents}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
        >
          Lọc danh sách
        </button>
      </div>

      {/* Incidents Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Mã SC</th>
                <th className="px-4 py-3 text-left">Thiết Bị</th>
                <th className="px-4 py-3 text-left">Hiện Tượng / Tiêu Đề</th>
                <th className="px-4 py-3 text-center">Nghiêm Trọng</th>
                <th className="px-4 py-3 text-center">Trạng Thái</th>
                <th className="px-4 py-3 text-left">Người Báo</th>
                <th className="px-4 py-3 text-left">Kỹ Thuật Xử Lý</th>
                <th className="px-4 py-3 text-right">Chi Phí</th>
                <th className="px-4 py-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-slate-400">
                    Đang tải danh sách sự cố...
                  </td>
                </tr>
              ) : incidents.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-slate-400">
                    Không có bản ghi sự cố nào
                  </td>
                </tr>
              ) : (
                incidents.map((inc) => (
                  <tr key={inc._id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-mono font-bold text-slate-800 whitespace-nowrap">
                      {inc.code}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                      <div className="font-semibold text-indigo-600">{inc.equipmentId?.code}</div>
                      <div className="text-[11px] text-slate-400 max-w-[140px] truncate">
                        {inc.equipmentId?.name}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-800">
                      <div className="font-medium">{inc.title}</div>
                      <div className="text-[11px] text-slate-500 max-w-xs truncate">{inc.description}</div>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <IncidentSeverityBadge severity={inc.severity} />
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <IncidentStatusBadge status={inc.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {inc.reportedBy?.fullName || 'Người dùng'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {inc.assignedTo?.fullName || (
                        <span className="text-slate-400 italic">Chưa giao</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900 whitespace-nowrap">
                      {inc.repairCost ? `${inc.repairCost.toLocaleString('vi-VN')} đ` : '0 đ'}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {isTechnician && (
                        <button
                          onClick={() => handleOpenUpdate(inc)}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded text-[11px] transition inline-flex items-center"
                        >
                          <Edit className="w-3 h-3 mr-1" /> Cập nhật xử lý
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Báo sự cố mới */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-rose-600" />
              Ghi Nhận Sự Cố / Báo Hỏng Thiết Bị
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chọn thiết bị gặp sự cố *</label>
                <select
                  required
                  value={createForm.equipmentId}
                  onChange={(e) => setCreateForm({ ...createForm, equipmentId: e.target.value })}
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

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hiện tượng lỗi / Tiêu đề *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Không khởi động được, máy chiếu mờ đèn..."
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mức độ nghiêm trọng</label>
                <select
                  value={createForm.severity}
                  onChange={(e) => setCreateForm({ ...createForm, severity: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="low">Thấp - Sự cố nhỏ, thiết bị vẫn tạm dùng được</option>
                  <option value="medium">Trung bình - Hoạt động chập chờn</option>
                  <option value="high">Cao - Ngừng hoạt động một phần</option>
                  <option value="critical">Khẩn cấp - Tê liệt phòng máy / Giảng đường lớn</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mô tả chi tiết sự cố *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Mô tả cụ thể triệu chứng, thời điểm xảy ra..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                ></textarea>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg shadow-sm"
                >
                  Gửi báo cáo sự cố
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Cập nhật xử lý sự cố (Kỹ thuật viên / Quản lý) */}
      {showUpdateModal && selectedIncident && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center">
              <Edit className="w-5 h-5 mr-2 text-indigo-600" />
              Cập Nhật Xử Lý Sự Cố [{selectedIncident.code}]
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Thiết bị: <strong className="text-indigo-600">{selectedIncident.equipmentId?.code}</strong> - {selectedIncident.title}
            </p>

            <form onSubmit={handleUpdateSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Trạng thái xử lý *</label>
                  <select
                    value={updateForm.status}
                    onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="open">Mới báo cáo (Open)</option>
                    <option value="assigned">Đã phân công (Assigned)</option>
                    <option value="in_progress">Đang xử lý (In Progress)</option>
                    <option value="resolved">Đã khắc phục (Resolved)</option>
                    <option value="closed">Đã đóng sự cố (Closed)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phân công kỹ thuật</label>
                  <select
                    value={updateForm.assignedTo}
                    onChange={(e) => setUpdateForm({ ...updateForm, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="">-- Chọn kỹ thuật viên --</option>
                    {technicians.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.fullName} ({t.username})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chi phí sửa chữa (VNĐ)</label>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={updateForm.repairCost}
                  onChange={(e) => setUpdateForm({ ...updateForm, repairCost: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Biện pháp khắc phục / Kết quả sửa</label>
                <textarea
                  rows="3"
                  placeholder="Ghi rõ các linh kiện đã thay thế, nguyên nhân lỗi..."
                  value={updateForm.resolution}
                  onChange={(e) => setUpdateForm({ ...updateForm, resolution: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                ></textarea>
              </div>

              {(updateForm.status === 'resolved' || updateForm.status === 'closed') && (
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <label className="block font-semibold text-emerald-800 mb-1">
                    Cập nhật trạng thái thiết bị sau sửa chữa:
                  </label>
                  <select
                    value={updateForm.updateEquipmentStatus}
                    onChange={(e) => setUpdateForm({ ...updateForm, updateEquipmentStatus: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-lg bg-white text-xs"
                  >
                    <option value="active">Đang hoạt động (Bình thường)</option>
                    <option value="maintenance_needed">Cần theo dõi thêm</option>
                  </select>
                </div>
              )}

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-sm"
                >
                  Lưu cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Incidents;

