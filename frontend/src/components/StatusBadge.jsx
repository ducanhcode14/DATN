import React from 'react';

export const EquipmentStatusBadge = ({ status }) => {
  const map = {
    active: { label: 'Đang hoạt động', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    maintenance_needed: { label: 'Cần kiểm tra', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
    in_repair: { label: 'Đang sửa chữa', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
    broken: { label: 'Hỏng hóc', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
    decommissioned: { label: 'Ngừng sử dụng', bg: 'bg-slate-100 text-slate-600 border-slate-200' },
  };

  const current = map[status] || { label: status, bg: 'bg-gray-50 text-gray-700 border-gray-200' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${current.bg}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
      {current.label}
    </span>
  );
};

export const PriorityBadge = ({ level, score }) => {
  const map = {
    high: { label: 'Ưu tiên Cao', bg: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
    medium: { label: 'Ưu tiên Trung bình', bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
    low: { label: 'Ưu tiên Thấp', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  };

  const current = map[level] || { label: level, bg: 'bg-gray-50 text-gray-700 border-gray-200', dot: 'bg-gray-400' };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${current.bg}`}>
      <span className={`w-2 h-2 rounded-full mr-1.5 ${current.dot}`}></span>
      {current.label} {score !== undefined && `(${score}đ)`}
    </span>
  );
};

export const IncidentSeverityBadge = ({ severity }) => {
  const map = {
    low: { label: 'Thấp', bg: 'bg-slate-100 text-slate-700' },
    medium: { label: 'Trung bình', bg: 'bg-amber-100 text-amber-800' },
    high: { label: 'Cao', bg: 'bg-orange-100 text-orange-800' },
    critical: { label: 'Khẩn cấp', bg: 'bg-rose-100 text-rose-800 font-bold animate-pulse' },
  };
  const current = map[severity] || { label: severity, bg: 'bg-gray-100 text-gray-800' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${current.bg}`}>
      {current.label}
    </span>
  );
};

export const IncidentStatusBadge = ({ status }) => {
  const map = {
    open: { label: 'Mới báo cáo', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
    assigned: { label: 'Đã phân công', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
    in_progress: { label: 'Đang xử lý', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
    resolved: { label: 'Đã khắc phục', bg: 'bg-teal-50 text-teal-700 border-teal-200' },
    closed: { label: 'Đã đóng sự cố', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    cancelled: { label: 'Hủy bỏ', bg: 'bg-gray-100 text-gray-600 border-gray-200' },
  };
  const current = map[status] || { label: status, bg: 'bg-gray-100 text-gray-700 border-gray-200' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${current.bg}`}>
      {current.label}
    </span>
  );
};

export const PlanStatusBadge = ({ status }) => {
  const map = {
    draft: { label: 'Bản nháp', bg: 'bg-slate-100 text-slate-700 border-slate-200' },
    scheduled: { label: 'Đã lên lịch', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
    in_progress: { label: 'Đang thực hiện', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
    completed: { label: 'Hoàn thành', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    cancelled: { label: 'Đã hủy', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
  };
  const current = map[status] || { label: status, bg: 'bg-gray-100 text-gray-700 border-gray-200' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${current.bg}`}>
      {current.label}
    </span>
  );
};

