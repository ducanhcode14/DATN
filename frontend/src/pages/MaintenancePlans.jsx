import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import {
  CalendarCheck,
  Plus,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Clock,
  Wrench,
  UserCheck,
  AlertCircle,
} from 'lucide-react';
import { PlanStatusBadge, PriorityBadge } from '../components/StatusBadge';

const MaintenancePlans = () => {
  const { user, isManager, isTechnician } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPlanId, setExpandedPlanId] = useState(null);

  // Modal: Cập nhật tiến độ item trong plan
  const [showItemModal, setShowItemModal] = useState(false);
  const [activePlan, setActivePlan] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [technicians, setTechnicians] = useState([]);

  const [itemForm, setItemForm] = useState({
    status: 'completed',
    maintenanceResult: 'good',
    maintenanceCost: 150000,
    maintenanceContent: '',
    notes: '',
  });

  useEffect(() => {
    fetchPlans();
    fetchTechnicians();
  }, []);

  const fetchTechnicians = async () => {
    try {
      const res = await axiosClient.get('/users?role=technician');
      if (res.success) setTechnicians(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/maintenance-plans');
      if (res.success) {
        setPlans(res.data);
        if (res.data.length > 0 && !expandedPlanId) {
          setExpandedPlanId(res.data[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (planId) => {
    setExpandedPlanId(expandedPlanId === planId ? null : planId);
  };

  const handleOpenItemUpdate = (plan, item) => {
    setActivePlan(plan);
    setActiveItem(item);
    setItemForm({
      status: item.status === 'pending' ? 'in_progress' : item.status,
      maintenanceResult: 'good',
      maintenanceCost: 150000,
      maintenanceContent: `Bảo dưỡng kỹ thuật cho ${item.equipmentId?.code} theo ${plan.name}`,
      notes: item.notes || '',
    });
    setShowItemModal(true);
  };

  const handleUpdateItemSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosClient.patch(
        `/maintenance-plans/${activePlan._id}/items/${activeItem._id}`,
        {
          ...itemForm,
          createMaintenanceRecord: itemForm.status === 'completed',
        }
      );
      if (res.success) {
        setShowItemModal(false);
        fetchPlans();
      }
    } catch (err) {
      alert(err.error?.message || 'Lỗi cập nhật tiến độ');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Quản Lý & Theo Dõi Kế Hoạch Bảo Trì</h2>
          <p className="text-xs text-slate-500">
            Theo dõi tiến độ thực hiện từng thiết bị trong các đợt bảo dưỡng định kỳ và đột xuất
          </p>
        </div>
      </div>

      {/* Plan list */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-slate-400 bg-white rounded-xl border">
            Đang tải danh sách kế hoạch...
          </div>
        ) : plans.length === 0 ? (
          <div className="p-8 text-center text-slate-400 bg-white rounded-xl border">
            Chưa có kế hoạch bảo trì nào. Hãy vào mục <strong>Đánh giá ưu tiên</strong> để tạo kế hoạch từ danh sách thiết bị đề xuất!
          </div>
        ) : (
          plans.map((plan) => {
            const isExpanded = expandedPlanId === plan._id;
            const completedCount = plan.items.filter((i) => i.status === 'completed').length;
            const progressPercent =
              plan.items.length > 0 ? Math.round((completedCount / plan.items.length) * 100) : 0;

            return (
              <div
                key={plan._id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition"
              >
                {/* Plan Header Card */}
                <div
                  onClick={() => toggleExpand(plan._id)}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition"
                >
                  <div className="flex items-start space-x-3">
                    <button className="mt-1 text-slate-400 hover:text-slate-600">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-indigo-600" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {plan.code}
                        </span>
                        <PlanStatusBadge status={plan.status} />
                        <span className="text-xs text-slate-400">• Kỳ: {plan.period}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mt-1">{plan.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Thời gian: {new Date(plan.startDate).toLocaleDateString('vi-VN')} →{' '}
                        {new Date(plan.endDate).toLocaleDateString('vi-VN')} • Tạo bởi: {plan.createdBy?.fullName}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full md:w-64 flex-shrink-0">
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>Tiến độ thực hiện</span>
                      <span>
                        {completedCount} / {plan.items.length} thiết bị ({progressPercent}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          progressPercent === 100
                            ? 'bg-emerald-500'
                            : progressPercent > 50
                            ? 'bg-indigo-600'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Plan Items Sub-Table */}
                {isExpanded && (
                  <div className="border-t border-slate-200 bg-slate-50/50 p-4">
                    <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto shadow-xs">
                      <table className="min-w-full divide-y divide-slate-200 text-xs">
                        <thead className="bg-slate-100/70 text-slate-600 font-semibold uppercase">
                          <tr>
                            <th className="px-4 py-2.5 text-left">Mã TB</th>
                            <th className="px-4 py-2.5 text-left">Tên Thiết Bị</th>
                            <th className="px-4 py-2.5 text-left">Vị trí đặt</th>
                            <th className="px-4 py-2.5 text-center">Mức ưu tiên</th>
                            <th className="px-4 py-2.5 text-left">Kỹ thuật viên</th>
                            <th className="px-4 py-2.5 text-center">Trạng thái</th>
                            <th className="px-4 py-2.5 text-right">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                          {plan.items.map((item) => (
                            <tr key={item._id} className="hover:bg-slate-50 transition">
                              <td className="px-4 py-3 font-bold text-indigo-600 whitespace-nowrap">
                                {item.equipmentId?.code}
                              </td>
                              <td className="px-4 py-3 font-medium text-slate-800">
                                {item.equipmentId?.name}
                              </td>
                              <td className="px-4 py-3 text-slate-500">
                                {item.equipmentId?.locationId?.name || '---'}
                              </td>
                              <td className="px-4 py-3 text-center whitespace-nowrap">
                                <PriorityBadge level={item.priorityLevel} score={item.priorityScore} />
                              </td>
                              <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                                {item.assignedTo?.fullName || (
                                  <span className="text-slate-400 italic">Chưa giao</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center whitespace-nowrap">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                    item.status === 'completed'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : item.status === 'in_progress'
                                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}
                                >
                                  {item.status === 'completed'
                                    ? 'Đã bảo trì xong'
                                    : item.status === 'in_progress'
                                    ? 'Đang thực hiện'
                                    : 'Chờ bảo trì'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right whitespace-nowrap">
                                {isTechnician && (
                                  <button
                                    onClick={() => handleOpenItemUpdate(plan, item)}
                                    className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded text-[11px] transition"
                                  >
                                    Cập nhật tiến độ
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Cập nhật mục thiết bị trong kế hoạch */}
      {showItemModal && activeItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center">
              <Wrench className="w-5 h-5 mr-2 text-indigo-600" />
              Cập Nhật Tiến Độ Bảo Trì
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Thiết bị: <strong className="text-indigo-600">{activeItem.equipmentId?.code}</strong> - {activeItem.equipmentId?.name}
            </p>

            <form onSubmit={handleUpdateItemSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Trạng thái công việc</label>
                <select
                  value={itemForm.status}
                  onChange={(e) => setItemForm({ ...itemForm, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="pending">Chờ thực hiện (Pending)</option>
                  <option value="in_progress">Đang thực hiện (In Progress)</option>
                  <option value="completed">Đã hoàn thành bảo trì (Completed)</option>
                  <option value="skipped">Bỏ qua / Hoãn lại (Skipped)</option>
                </select>
              </div>

              {itemForm.status === 'completed' && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-3">
                  <div className="text-[11px] text-emerald-800 font-semibold">
                    ✓ Hệ thống sẽ tự động cập nhật ngày bảo trì gần nhất (BR-06) và tạo bản ghi lịch sử bảo trì.
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Kết quả kiểm tra kỹ thuật</label>
                    <select
                      value={itemForm.maintenanceResult}
                      onChange={(e) => setItemForm({ ...itemForm, maintenanceResult: e.target.value })}
                      className="w-full px-3 py-1.5 border rounded-lg bg-white"
                    >
                      <option value="good">Đạt chuẩn (Thiết bị hoạt động tốt)</option>
                      <option value="fair">Tạm ổn (Cần theo dõi)</option>
                      <option value="replaced_parts">Đã thay thế linh kiện</option>
                      <option value="failed">Không đạt (Chuyển sang hỏng)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Chi phí thực hiện (VNĐ)</label>
                    <input
                      type="number"
                      min="0"
                      step="10000"
                      value={itemForm.maintenanceCost}
                      onChange={(e) => setItemForm({ ...itemForm, maintenanceCost: e.target.value })}
                      className="w-full px-3 py-1.5 border rounded-lg bg-white font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nội dung công việc</label>
                    <textarea
                      rows="2"
                      value={itemForm.maintenanceContent}
                      onChange={(e) => setItemForm({ ...itemForm, maintenanceContent: e.target.value })}
                      className="w-full px-3 py-1.5 border rounded-lg bg-white"
                    ></textarea>
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ghi chú thêm</label>
                <input
                  type="text"
                  value={itemForm.notes}
                  onChange={(e) => setItemForm({ ...itemForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Ghi chú kỹ thuật viên..."
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-sm"
                >
                  Lưu kết quả
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenancePlans;

