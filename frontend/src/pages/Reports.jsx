import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import {
  FileSpreadsheet,
  Printer,
  Flame,
  Wrench,
  AlertTriangle,
  Cpu,
  CalendarCheck,
} from 'lucide-react';
import {
  EquipmentStatusBadge,
  PriorityBadge,
  IncidentSeverityBadge,
  IncidentStatusBadge,
  PlanStatusBadge,
} from '../components/StatusBadge';

const reportOptions = [
  { id: 'equipments', name: '1. Báo cáo Toàn Bộ Danh Sách Thiết Bị', icon: Cpu },
  { id: 'broken-devices', name: '2. Báo cáo Thiết Bị Hỏng & Cần Kiểm Tra', icon: AlertTriangle },
  { id: 'high-priority', name: '3. Báo cáo Thiết Bị Có Mức Độ Ưu Tiên Cao (C1-C5)', icon: Flame },
  { id: 'maintenance-history', name: '4. Báo cáo Lịch Sử Hoạt Động Bảo Trì', icon: Wrench },
  { id: 'costs', name: '5. Báo cáo Chi Phí Sửa Chữa & Bảo Trì', icon: FileSpreadsheet },
  { id: 'plans', name: '6. Báo cáo Tiến Độ Kế Hoạch Bảo Trì', icon: CalendarCheck },
  { id: 'incidents', name: '7. Báo cáo Thống Kê Tình Hình Sự Cố', icon: AlertTriangle },
];

const Reports = () => {
  const [selectedType, setSelectedType] = useState('high-priority');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchReport();
  }, [selectedType]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      setReportData(null); // Xóa dữ liệu báo cáo cũ trước khi nạp dữ liệu mới
      const res = await axiosClient.get(`/reports/${selectedType}`);
      if (res.success) {
        setReportData(res.data);
      }
    } catch (err) {
      console.error('Lỗi tải báo cáo:', err);
      setErrorMsg(err.error?.message || err.message || 'Không thể tải dữ liệu báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Báo Cáo & Thống Kê Nghiệp Vụ</h2>
          <p className="text-xs text-slate-500">
            Hỗ trợ kết xuất và in ấn các báo cáo phục vụ bảo vệ đồ án tốt nghiệp
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <Printer className="w-4 h-4 mr-1.5" /> In Báo Cáo / Lưu PDF
          </button>
        </div>
      </div>

      {/* Report Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 print:hidden">
        {reportOptions.map((opt) => {
          const isSelected = selectedType === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setSelectedType(opt.id)}
              className={`p-3 rounded-xl border text-left flex items-start space-x-3 transition ${
                isSelected
                  ? 'bg-indigo-50/80 border-indigo-500 text-indigo-900 shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div
                className={`p-2 rounded-lg flex-shrink-0 ${
                  isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                <opt.icon className="w-4 h-4" />
              </div>
              <div className="text-xs font-semibold leading-snug">{opt.name}</div>
            </button>
          );
        })}
      </div>

      {/* Report Display Container (Printable) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs print:border-none print:shadow-none print:p-0">
        {/* Printable Official Header */}
        <div className="border-b border-slate-200 pb-4 mb-5 text-center">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            TRƯỜNG ĐẠI HỌC • HỆ THỐNG QUẢN LÝ BẢO TRÌ THIẾT BỊ
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            {reportData?.title || 'Báo Cáo Nghiệp Vụ'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Thời điểm lập: {new Date().toLocaleString('vi-VN')} • Sinh viên: Bùi Đức Anh
          </p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mb-2"></div>
            <div>Đang tổng hợp dữ liệu báo cáo...</div>
          </div>
        ) : errorMsg ? (
          <div className="p-6 text-center text-rose-500 bg-rose-50 rounded-lg text-xs font-semibold">
            {errorMsg}
          </div>
        ) : !reportData ? (
          <div className="p-8 text-center text-slate-400 text-xs">Không có dữ liệu báo cáo</div>
        ) : (
          <div className="space-y-4">
            {/* Summary Metrics */}
            <div className="flex flex-wrap gap-4 p-4 bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 print:bg-slate-100">
              {reportData.total !== undefined && (
                <div>
                  Tổng số bản ghi: <span className="font-bold text-indigo-700">{reportData.total}</span>
                </div>
              )}
              {reportData.totalCost !== undefined && (
                <div>
                  Tổng chi phí: <span className="font-bold text-emerald-700">{reportData.totalCost.toLocaleString('vi-VN')} đ</span>
                </div>
              )}
              {reportData.grandTotal !== undefined && (
                <div>
                  Tổng chi phí toàn kỳ:{' '}
                  <span className="font-bold text-emerald-700">{reportData.grandTotal.toLocaleString('vi-VN')} đ</span>
                </div>
              )}
              {reportData.totalMaintenanceCost !== undefined && (
                <div>
                  Chi phí bảo trì:{' '}
                  <span className="font-bold text-slate-900">{reportData.totalMaintenanceCost.toLocaleString('vi-VN')} đ</span>
                </div>
              )}
              {reportData.totalRepairCost !== undefined && (
                <div>
                  Chi phí sửa chữa:{' '}
                  <span className="font-bold text-slate-900">{reportData.totalRepairCost.toLocaleString('vi-VN')} đ</span>
                </div>
              )}
            </div>

            {/* 1 & 2. Table for Equipment Lists */}
            {(selectedType === 'equipments' || selectedType === 'broken-devices') && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-100 font-semibold uppercase">
                    <tr>
                      <th className="px-3 py-2 text-left">Mã TB</th>
                      <th className="px-3 py-2 text-left">Tên Thiết Bị</th>
                      <th className="px-3 py-2 text-left">Nhóm</th>
                      <th className="px-3 py-2 text-left">Vị trí đặt</th>
                      <th className="px-3 py-2 text-center">Tình trạng</th>
                      <th className="px-3 py-2 text-center">Độ quan trọng</th>
                      <th className="px-3 py-2 text-center">Bảo trì gần nhất</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {reportData.items && reportData.items.length > 0 ? (
                      reportData.items.map((eq) => (
                        <tr key={eq._id} className="hover:bg-slate-50">
                          <td className="px-3 py-2 font-mono font-bold text-indigo-600">{eq.code}</td>
                          <td className="px-3 py-2 font-medium">{eq.name}</td>
                          <td className="px-3 py-2 text-slate-600">{eq.categoryId?.name || '---'}</td>
                          <td className="px-3 py-2 text-slate-600">{eq.locationId?.name || '---'}</td>
                          <td className="px-3 py-2 text-center">
                            <EquipmentStatusBadge status={eq.status} />
                          </td>
                          <td className="px-3 py-2 text-center font-semibold">{eq.importanceLevel || 3}/5</td>
                          <td className="px-3 py-2 text-center text-slate-500">
                            {eq.lastMaintenanceDate
                              ? new Date(eq.lastMaintenanceDate).toLocaleDateString('vi-VN')
                              : 'Chưa có'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-3 py-6 text-center text-slate-400">
                          Không có bản ghi nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* 3. Table for High Priority Report */}
            {selectedType === 'high-priority' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-100 font-semibold uppercase">
                    <tr>
                      <th className="px-3 py-2 text-left">Hạng</th>
                      <th className="px-3 py-2 text-left">Mã TB</th>
                      <th className="px-3 py-2 text-left">Tên Thiết Bị</th>
                      <th className="px-3 py-2 text-left">Vị trí phòng</th>
                      <th className="px-3 py-2 text-center">Tình trạng</th>
                      <th className="px-3 py-2 text-center">Số sự cố (C2)</th>
                      <th className="px-3 py-2 text-center">Điểm MCDA</th>
                      <th className="px-3 py-2 text-center">Đề xuất</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {reportData.items && reportData.items.length > 0 ? (
                      reportData.items.map((item) => (
                        <tr key={item.equipmentId || item._id} className="hover:bg-slate-50">
                          <td className="px-3 py-2 font-bold">#{item.rank || '-'}</td>
                          <td className="px-3 py-2 font-mono font-semibold text-indigo-600">{item.code}</td>
                          <td className="px-3 py-2 font-medium">{item.name}</td>
                          <td className="px-3 py-2 text-slate-500">{item.location || '---'}</td>
                          <td className="px-3 py-2 text-center">
                            <EquipmentStatusBadge status={item.status} />
                          </td>
                          <td className="px-3 py-2 text-center font-bold text-rose-600">
                            {item.rawValues?.incidentCount ?? 0} lần
                          </td>
                          <td className="px-3 py-2 text-center font-bold text-slate-900">{item.priorityScore}</td>
                          <td className="px-3 py-2 text-center">
                            <PriorityBadge level={item.priorityLevel} />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="px-3 py-6 text-center text-slate-400">
                          Không có thiết bị nào ở mức ưu tiên cao
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* 4. Table for Maintenance History */}
            {selectedType === 'maintenance-history' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-100 font-semibold uppercase">
                    <tr>
                      <th className="px-3 py-2 text-left">Mã BT</th>
                      <th className="px-3 py-2 text-left">Thiết Bị</th>
                      <th className="px-3 py-2 text-left">Loại BT</th>
                      <th className="px-3 py-2 text-left">Ngày thực hiện</th>
                      <th className="px-3 py-2 text-left">Nội dung</th>
                      <th className="px-3 py-2 text-right">Chi phí</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {reportData.items && reportData.items.length > 0 ? (
                      reportData.items.map((m) => (
                        <tr key={m._id} className="hover:bg-slate-50">
                          <td className="px-3 py-2 font-mono font-bold">{m.code}</td>
                          <td className="px-3 py-2 font-medium text-indigo-600">{m.equipmentId?.code || '---'}</td>
                          <td className="px-3 py-2 capitalize">{m.type}</td>
                          <td className="px-3 py-2">
                            {m.performedDate ? new Date(m.performedDate).toLocaleDateString('vi-VN') : '---'}
                          </td>
                          <td className="px-3 py-2">{m.content}</td>
                          <td className="px-3 py-2 text-right font-bold">
                            {m.cost ? `${m.cost.toLocaleString('vi-VN')} đ` : '0 đ'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-3 py-6 text-center text-slate-400">
                          Không có bản ghi bảo trì nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* 5. Table for Costs */}
            {selectedType === 'costs' && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-xs uppercase mb-2 text-slate-700">Chi phí Bảo trì Thiết bị</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-xs mb-4">
                      <thead className="bg-slate-100 font-semibold uppercase">
                        <tr>
                          <th className="px-3 py-2 text-left">Mã BT</th>
                          <th className="px-3 py-2 text-left">Thiết Bị</th>
                          <th className="px-3 py-2 text-left">Nội dung</th>
                          <th className="px-3 py-2 text-right">Chi phí (VNĐ)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {reportData.maintenances?.slice(0, 15).map((m) => (
                          <tr key={m._id}>
                            <td className="px-3 py-1.5 font-mono">{m.code}</td>
                            <td className="px-3 py-1.5 font-medium">{m.equipmentId?.code}</td>
                            <td className="px-3 py-1.5">{m.content}</td>
                            <td className="px-3 py-1.5 text-right font-bold text-slate-900">
                              {m.cost?.toLocaleString('vi-VN')} đ
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-xs uppercase mb-2 text-slate-700">Chi phí Sửa chữa Sự cố</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-xs">
                      <thead className="bg-slate-100 font-semibold uppercase">
                        <tr>
                          <th className="px-3 py-2 text-left">Mã Sự Cố</th>
                          <th className="px-3 py-2 text-left">Thiết Bị</th>
                          <th className="px-3 py-2 text-left">Tiêu đề lỗi</th>
                          <th className="px-3 py-2 text-right">Chi phí sửa (VNĐ)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {reportData.incidents?.slice(0, 15).map((inc) => (
                          <tr key={inc._id}>
                            <td className="px-3 py-1.5 font-mono font-semibold">{inc.code}</td>
                            <td className="px-3 py-1.5 font-medium text-indigo-600">{inc.equipmentId?.code}</td>
                            <td className="px-3 py-1.5">{inc.title}</td>
                            <td className="px-3 py-1.5 text-right font-bold text-slate-900">
                              {inc.repairCost?.toLocaleString('vi-VN')} đ
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 6. Table for Plans */}
            {selectedType === 'plans' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-100 font-semibold uppercase">
                    <tr>
                      <th className="px-3 py-2 text-left">Mã Kế Hoạch</th>
                      <th className="px-3 py-2 text-left">Tên Kế Hoạch</th>
                      <th className="px-3 py-2 text-left">Kỳ Thực Hiện</th>
                      <th className="px-3 py-2 text-left">Thời Gian</th>
                      <th className="px-3 py-2 text-center">Số TB</th>
                      <th className="px-3 py-2 text-center">Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {reportData.items && reportData.items.length > 0 ? (
                      reportData.items.map((plan) => (
                        <tr key={plan._id} className="hover:bg-slate-50">
                          <td className="px-3 py-2 font-mono font-bold text-indigo-600">{plan.code}</td>
                          <td className="px-3 py-2 font-medium text-slate-900">{plan.name}</td>
                          <td className="px-3 py-2 text-slate-600">{plan.period}</td>
                          <td className="px-3 py-2 text-slate-500">
                            {new Date(plan.startDate).toLocaleDateString('vi-VN')} →{' '}
                            {new Date(plan.endDate).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="px-3 py-2 text-center font-bold text-slate-800">
                            {plan.items?.length || 0}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <PlanStatusBadge status={plan.status} />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-3 py-6 text-center text-slate-400">
                          Không có kế hoạch bảo trì nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* 7. Table for Incidents */}
            {selectedType === 'incidents' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-100 font-semibold uppercase">
                    <tr>
                      <th className="px-3 py-2 text-left">Mã SC</th>
                      <th className="px-3 py-2 text-left">Thiết Bị</th>
                      <th className="px-3 py-2 text-left">Tiêu Đề Lỗi</th>
                      <th className="px-3 py-2 text-center">Mức Nghiêm Trọng</th>
                      <th className="px-3 py-2 text-center">Trạng Thái</th>
                      <th className="px-3 py-2 text-left">Người Báo</th>
                      <th className="px-3 py-2 text-right">Chi Phí Sửa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {reportData.items && reportData.items.length > 0 ? (
                      reportData.items.map((inc) => (
                        <tr key={inc._id} className="hover:bg-slate-50">
                          <td className="px-3 py-2 font-mono font-bold text-slate-800">{inc.code}</td>
                          <td className="px-3 py-2 font-medium text-indigo-600">{inc.equipmentId?.code || '---'}</td>
                          <td className="px-3 py-2 text-slate-800">{inc.title}</td>
                          <td className="px-3 py-2 text-center">
                            <IncidentSeverityBadge severity={inc.severity} />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <IncidentStatusBadge status={inc.status} />
                          </td>
                          <td className="px-3 py-2 text-slate-600">{inc.reportedBy?.fullName || '---'}</td>
                          <td className="px-3 py-2 text-right font-bold text-slate-900">
                            {inc.repairCost ? `${inc.repairCost.toLocaleString('vi-VN')} đ` : '0 đ'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-3 py-6 text-center text-slate-400">
                          Không có sự cố nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
