import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import {
  Cpu,
  ArrowLeft,
  AlertTriangle,
  Wrench,
  Calendar,
  MapPin,
  Tag,
  Clock,
  DollarSign,
  PlusCircle,
  CheckCircle,
} from 'lucide-react';
import {
  EquipmentStatusBadge,
  IncidentSeverityBadge,
  IncidentStatusBadge,
} from '../components/StatusBadge';

const EquipmentDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('incidents'); // 'incidents' | 'maintenances' | 'specs'

  // Modal Report Incident
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [incidentForm, setIncidentForm] = useState({
    title: '',
    description: '',
    severity: 'medium',
  });

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/equipments/${id}`);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIncident = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosClient.post('/incidents', {
        equipmentId: id,
        ...incidentForm,
      });
      if (res.success) {
        setShowIncidentModal(false);
        setIncidentForm({ title: '', description: '', severity: 'medium' });
        fetchDetail();
      }
    } catch (err) {
      alert(err.error?.message || 'Lỗi gửi báo cáo sự cố');
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3"></div>
        Đang tải hồ sơ thiết bị...
      </div>
    );
  }

  const { equipment, incidents, maintenances } = data;

  const totalRepairCost = incidents.reduce((sum, i) => sum + (i.repairCost || 0), 0);
  const totalMaintCost = maintenances.reduce((sum, m) => sum + (m.cost || 0), 0);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/equipments"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại danh sách thiết bị
        </Link>
      </div>

      {/* Main Info Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
              <Cpu className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                  {equipment.code}
                </span>
                <EquipmentStatusBadge status={equipment.status} />
              </div>
              <h1 className="text-xl font-bold text-slate-900 mt-1">{equipment.name}</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {equipment.manufacturer} {equipment.model && `• Model: ${equipment.model}`}{' '}
                {equipment.serialNumber && `• SN: ${equipment.serialNumber}`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowIncidentModal(true)}
              className="inline-flex items-center px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold shadow-xs transition"
            >
              <AlertTriangle className="w-4 h-4 mr-1.5" /> Báo Sự Cố Thiết Bị
            </button>
          </div>
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 text-xs">
          <div className="flex items-center space-x-3">
            <MapPin className="w-4 h-4 text-slate-400" />
            <div>
              <span className="text-slate-400 block text-[11px]">Vị trí đặt:</span>
              <span className="font-semibold text-slate-800">
                {equipment.locationId
                  ? `${equipment.locationId.name} (${equipment.locationId.room})`
                  : 'Chưa đặt'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Tag className="w-4 h-4 text-slate-400" />
            <div>
              <span className="text-slate-400 block text-[11px]">Phân loại nhóm:</span>
              <span className="font-semibold text-slate-800">
                {equipment.categoryId?.name || '---'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Clock className="w-4 h-4 text-slate-400" />
            <div>
              <span className="text-slate-400 block text-[11px]">Bảo trì gần nhất:</span>
              <span className="font-semibold text-slate-800">
                {equipment.lastMaintenanceDate
                  ? new Date(equipment.lastMaintenanceDate).toLocaleDateString('vi-VN')
                  : 'Chưa từng bảo trì'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <DollarSign className="w-4 h-4 text-slate-400" />
            <div>
              <span className="text-slate-400 block text-[11px]">Tổng chi phí sự cố & bảo trì:</span>
              <span className="font-bold text-slate-900">
                {(totalRepairCost + totalMaintCost).toLocaleString('vi-VN')} đ
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-200 text-xs font-semibold px-4 pt-2">
          <button
            onClick={() => setActiveTab('incidents')}
            className={`px-4 py-3 border-b-2 flex items-center transition ${
              activeTab === 'incidents'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <AlertTriangle className="w-4 h-4 mr-1.5" />
            Lịch Sử Sự Cố ({incidents.length})
          </button>

          <button
            onClick={() => setActiveTab('maintenances')}
            className={`px-4 py-3 border-b-2 flex items-center transition ${
              activeTab === 'maintenances'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Wrench className="w-4 h-4 mr-1.5" />
            Lịch Sử Bảo Trì ({maintenances.length})
          </button>

          <button
            onClick={() => setActiveTab('specs')}
            className={`px-4 py-3 border-b-2 flex items-center transition ${
              activeTab === 'specs'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Cpu className="w-4 h-4 mr-1.5" />
            Hồ Sơ Kỹ Thuật
          </button>
        </div>

        {/* Tab 1: Incidents Content */}
        {activeTab === 'incidents' && (
          <div className="overflow-x-auto p-4">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-2.5 text-left">Mã sự cố</th>
                  <th className="px-4 py-2.5 text-left">Tiêu đề lỗi</th>
                  <th className="px-4 py-2.5 text-center">Mức nghiêm trọng</th>
                  <th className="px-4 py-2.5 text-center">Trạng thái</th>
                  <th className="px-4 py-2.5 text-left">Người báo cáo</th>
                  <th className="px-4 py-2.5 text-right">Chi phí sửa chữa</th>
                  <th className="px-4 py-2.5 text-left">Biện pháp khắc phục</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {incidents.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-6 text-center text-slate-400">
                      Chưa ghi nhận sự cố nào trên thiết bị này
                    </td>
                  </tr>
                ) : (
                  incidents.map((inc) => (
                    <tr key={inc._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono font-bold text-slate-800">{inc.code}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{inc.title}</td>
                      <td className="px-4 py-3 text-center">
                        <IncidentSeverityBadge severity={inc.severity} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <IncidentStatusBadge status={inc.status} />
                      </td>
                      <td className="px-4 py-3 text-slate-600">{inc.reportedBy?.fullName}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900">
                        {inc.repairCost ? `${inc.repairCost.toLocaleString('vi-VN')} đ` : '0 đ'}
                      </td>
                      <td className="px-4 py-3 text-slate-500 max-w-xs truncate">
                        {inc.resolution || 'Chưa ghi nhận'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Maintenances Content */}
        {activeTab === 'maintenances' && (
          <div className="overflow-x-auto p-4">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-2.5 text-left">Mã bảo trì</th>
                  <th className="px-4 py-2.5 text-left">Loại bảo trì</th>
                  <th className="px-4 py-2.5 text-left">Ngày thực hiện</th>
                  <th className="px-4 py-2.5 text-left">Nội dung công việc</th>
                  <th className="px-4 py-2.5 text-center">Kết quả</th>
                  <th className="px-4 py-2.5 text-right">Chi phí</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {maintenances.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-6 text-center text-slate-400">
                      Chưa có lịch sử bảo trì
                    </td>
                  </tr>
                ) : (
                  maintenances.map((m) => (
                    <tr key={m._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono font-bold text-slate-800">{m.code}</td>
                      <td className="px-4 py-3 capitalize text-slate-700">
                        {m.type === 'periodic'
                          ? 'Định kỳ'
                          : m.type === 'preventive'
                          ? 'Phòng ngừa'
                          : 'Sửa chữa'}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {m.performedDate
                          ? new Date(m.performedDate).toLocaleDateString('vi-VN')
                          : new Date(m.scheduledDate).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-4 py-3 text-slate-800 max-w-xs">{m.content}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {m.result === 'good' ? 'Đạt chuẩn' : m.result === 'fair' ? 'Tạm ổn' : 'Thay thế linh kiện'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900">
                        {m.cost ? `${m.cost.toLocaleString('vi-VN')} đ` : '0 đ'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Specs Content */}
        {activeTab === 'specs' && (
          <div className="p-6 space-y-4 text-xs">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block mb-1">Mã thiết bị:</span>
                <span className="font-bold text-slate-800">{equipment.code}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block mb-1">Ngày bắt đầu sử dụng:</span>
                <span className="font-bold text-slate-800">
                  {new Date(equipment.useDate).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block mb-1">Nguyên giá mua sắm:</span>
                <span className="font-bold text-slate-800">
                  {equipment.purchaseCost ? `${equipment.purchaseCost.toLocaleString('vi-VN')} đ` : 'Chưa có'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block mb-1">Mức độ quan trọng (C5):</span>
                <span className="font-bold text-slate-800">{equipment.importanceLevel} / 5</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block mb-1">Đơn vị sử dụng:</span>
                <span className="font-bold text-slate-800">{equipment.locationId?.department || 'Trường ĐH'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-400 block mb-1">Tòa nhà & Phòng:</span>
                <span className="font-bold text-slate-800">
                  {equipment.locationId?.building} - {equipment.locationId?.room}
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg mt-4">
              <h4 className="font-bold text-slate-800 mb-2">Thông số cấu hình & ghi chú:</h4>
              <p className="text-slate-600 leading-relaxed">
                {equipment.specifications || equipment.description || 'Không có ghi chú thêm.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal Báo sự cố */}
      {showIncidentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-rose-600" />
              Báo Cáo Sự Cố Cho {equipment.code}
            </h3>

            <form onSubmit={handleCreateIncident} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tiêu đề sự cố / Hiện tượng lỗi *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Không lên nguồn, màn hình sọc xanh..."
                  value={incidentForm.title}
                  onChange={(e) => setIncidentForm({ ...incidentForm, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mức độ nghiêm trọng</label>
                <select
                  value={incidentForm.severity}
                  onChange={(e) => setIncidentForm({ ...incidentForm, severity: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="low">Thấp (Chưa ảnh hưởng nhiều)</option>
                  <option value="medium">Trung bình</option>
                  <option value="high">Cao (Cần khắc phục sớm)</option>
                  <option value="critical">Khẩn cấp (Ngừng hoạt động lớp học/thi)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mô tả chi tiết</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Mô tả hoàn cảnh xảy ra lỗi..."
                  value={incidentForm.description}
                  onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                ></textarea>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowIncidentModal(false)}
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
    </div>
  );
};

export default EquipmentDetail;

