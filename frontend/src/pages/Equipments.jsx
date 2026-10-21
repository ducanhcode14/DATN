import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import {
  Cpu,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { EquipmentStatusBadge } from '../components/StatusBadge';

const Equipments = () => {
  const { isManager } = useAuth();
  const [equipments, setEquipments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedLoc, setSelectedLoc] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    categoryId: '',
    locationId: '',
    manufacturer: '',
    model: '',
    serialNumber: '',
    useDate: new Date().toISOString().split('T')[0],
    status: 'active',
    importanceLevel: 3,
    purchaseCost: 0,
    description: '',
  });

  useEffect(() => {
    fetchMetadata();
    fetchEquipments();
  }, []);

  const fetchMetadata = async () => {
    try {
      const [catsRes, locsRes] = await Promise.all([
        axiosClient.get('/equipment-categories'),
        axiosClient.get('/locations'),
      ]);
      if (catsRes.success) setCategories(catsRes.data);
      if (locsRes.success) setLocations(locsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEquipments = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (selectedCat) query.append('categoryId', selectedCat);
      if (selectedLoc) query.append('locationId', selectedLoc);
      if (selectedStatus) query.append('status', selectedStatus);

      const res = await axiosClient.get(`/equipments?${query.toString()}`);
      if (res.success) {
        setEquipments(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      code: `EQ-${Date.now().toString().slice(-4)}`,
      name: '',
      categoryId: categories[0]?._id || '',
      locationId: locations[0]?._id || '',
      manufacturer: '',
      model: '',
      serialNumber: '',
      useDate: new Date().toISOString().split('T')[0],
      status: 'active',
      importanceLevel: 3,
      purchaseCost: 0,
      description: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (eq) => {
    setIsEditing(true);
    setCurrentId(eq._id);
    setFormData({
      code: eq.code,
      name: eq.name,
      categoryId: eq.categoryId?._id || eq.categoryId,
      locationId: eq.locationId?._id || eq.locationId,
      manufacturer: eq.manufacturer || '',
      model: eq.model || '',
      serialNumber: eq.serialNumber || '',
      useDate: eq.useDate ? eq.useDate.split('T')[0] : '',
      status: eq.status,
      importanceLevel: eq.importanceLevel || 3,
      purchaseCost: eq.purchaseCost || 0,
      description: eq.description || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        const res = await axiosClient.put(`/equipments/${currentId}`, formData);
        if (res.success) {
          setShowModal(false);
          fetchEquipments();
        }
      } else {
        const res = await axiosClient.post('/equipments', formData);
        if (res.success) {
          setShowModal(false);
          fetchEquipments();
        }
      }
    } catch (err) {
      alert(err.error?.message || err.message || 'Lỗi lưu thông tin thiết bị');
    }
  };

  const handleDelete = async (id, code) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa/ngừng sử dụng thiết bị [${code}]?`)) {
      try {
        const res = await axiosClient.delete(`/equipments/${id}`);
        if (res.success) {
          alert(res.message);
          fetchEquipments();
        }
      } catch (err) {
        alert(err.error?.message || 'Lỗi thao tác');
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Danh Mục & Danh Sách Thiết Bị</h2>
          <p className="text-xs text-slate-500">Quản lý toàn bộ thông tin tài sản thiết bị trường học</p>
        </div>
        {isManager && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Thêm Thiết Bị Mới
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo mã, tên, model, serial..."
            value={search}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50"
        >
          <option value="">-- Tất cả nhóm --</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={selectedLoc}
          onChange={(e) => setSelectedLoc(e.target.value)}
          className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50"
        >
          <option value="">-- Tất cả vị trí --</option>
          {locations.map((l) => (
            <option key={l._id} value={l._id}>
              {l.name} ({l.building})
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50"
        >
          <option value="">-- Tình trạng --</option>
          <option value="active">Đang hoạt động</option>
          <option value="maintenance_needed">Cần kiểm tra</option>
          <option value="in_repair">Đang sửa chữa</option>
          <option value="broken">Hỏng hóc</option>
          <option value="decommissioned">Ngừng sử dụng</option>
        </select>

        <button
          onClick={fetchEquipments}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
        >
          Lọc dữ liệu
        </button>
      </div>

      {/* Equipment Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Mã TB</th>
                <th className="px-4 py-3 text-left">Tên Thiết Bị</th>
                <th className="px-4 py-3 text-left">Nhóm</th>
                <th className="px-4 py-3 text-left">Vị trí phòng</th>
                <th className="px-4 py-3 text-center">Tình trạng</th>
                <th className="px-4 py-3 text-center">Độ quan trọng</th>
                <th className="px-4 py-3 text-center">Bảo trì gần nhất</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-slate-400">
                    Đang tải danh sách thiết bị...
                  </td>
                </tr>
              ) : equipments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-slate-400">
                    Không tìm thấy thiết bị nào
                  </td>
                </tr>
              ) : (
                equipments.map((eq) => (
                  <tr key={eq._id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-bold text-indigo-600 whitespace-nowrap">
                      <Link to={`/equipments/${eq._id}`} className="hover:underline">
                        {eq.code}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <div>{eq.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {eq.manufacturer} {eq.model && `• ${eq.model}`}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {eq.categoryId?.name || '---'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {eq.locationId ? `${eq.locationId.name} (${eq.locationId.room})` : '---'}
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <EquipmentStatusBadge status={eq.status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold text-slate-700">{eq.importanceLevel} / 5</span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-500 whitespace-nowrap">
                      {eq.lastMaintenanceDate
                        ? new Date(eq.lastMaintenanceDate).toLocaleDateString('vi-VN')
                        : 'Chưa bảo trì'}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/equipments/${eq._id}`}
                          className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded"
                          title="Xem chi tiết & lịch sử"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {isManager && (
                          <>
                            <button
                              onClick={() => handleOpenEdit(eq)}
                              className="p-1 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded"
                              title="Sửa thông tin"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(eq._id, eq.code)}
                              className="p-1 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded"
                              title="Xóa / Ngừng dùng"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Thêm / Sửa Thiết Bị */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              {isEditing ? 'Cập Nhật Thông Tin Thiết Bị' : 'Thêm Mới Thiết Bị Vào Hệ Thống'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mã thiết bị *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-lg uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tên thiết bị *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nhóm danh mục *</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-lg bg-white"
                  >
                    <option value="">-- Chọn nhóm --</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vị trí đặt *</label>
                  <select
                    required
                    value={formData.locationId}
                    onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-lg bg-white"
                  >
                    <option value="">-- Chọn vị trí --</option>
                    {locations.map((l) => (
                      <option key={l._id} value={l._id}>
                        {l.name} ({l.building} - {l.room})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hãng sản xuất</label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Model</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Serial Number</label>
                  <input
                    type="text"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ngày đưa vào SD</label>
                  <input
                    type="date"
                    required
                    value={formData.useDate}
                    onChange={(e) => setFormData({ ...formData, useDate: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tình trạng</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-1.5 border rounded-lg bg-white"
                  >
                    <option value="active">Đang hoạt động</option>
                    <option value="maintenance_needed">Cần kiểm tra</option>
                    <option value="in_repair">Đang sửa chữa</option>
                    <option value="broken">Hỏng</option>
                    <option value="decommissioned">Ngừng sử dụng</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Độ quan trọng (1-5)</label>
                  <select
                    value={formData.importanceLevel}
                    onChange={(e) => setFormData({ ...formData, importanceLevel: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 border rounded-lg bg-white"
                  >
                    <option value="1">1 - Rất thấp</option>
                    <option value="2">2 - Thấp</option>
                    <option value="3">3 - Trung bình</option>
                    <option value="4">4 - Cao</option>
                    <option value="5">5 - Trọng yếu / Khẩn cấp</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ghi chú / Mô tả</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded-lg"
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
                  {isEditing ? 'Lưu thay đổi' : 'Thêm thiết bị'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Equipments;

