import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import {
  Flame,
  Sliders,
  CheckCircle,
  HelpCircle,
  PlusCircle,
  RefreshCw,
  Search,
  Filter,
  ArrowUpDown,
  FileCheck,
  CalendarCheck,
} from 'lucide-react';
import { PriorityBadge, EquipmentStatusBadge } from '../components/StatusBadge';

const PriorityEvaluation = () => {
  const { isManager } = useAuth();
  const navigate = useNavigate();

  const [ranking, setRanking] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Trọng số W1 - W5
  const [weights, setWeights] = useState({
    C1: 20, // Tuổi thiết bị
    C2: 25, // Tần suất sự cố
    C3: 20, // Thời gian từ bảo trì gần nhất
    C4: 10, // Chi phí sửa chữa
    C5: 25, // Mức độ quan trọng
  });
  const [showWeightConfig, setShowWeightConfig] = useState(false);
  const [weightSaveMsg, setWeightSaveMsg] = useState('');

  // Selected equipments for plan creation
  const [selectedEquipments, setSelectedEquipments] = useState(new Set());
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
  const [planForm, setPlanForm] = useState({
    name: `Kế hoạch bảo trì ưu tiên cao - ${new Date().toLocaleDateString('vi-VN')}`,
    period: 'Quý 4/2026',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: 'Được lập tự động từ kết quả đánh giá ưu tiên bảo trì C1-C5',
  });

  useEffect(() => {
    fetchMetadata();
    evaluatePriority();
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

  const evaluatePriority = async (customWeights = null) => {
    try {
      setLoading(true);
      const res = await axiosClient.post('/priority/evaluate', {
        categoryId: selectedCategory || undefined,
        locationId: selectedLocation || undefined,
        weights: customWeights || weights,
      });

      if (res.success) {
        setRanking(res.data.ranking);
        setStats(res.data.stats);

        // Mặc định tự động chọn các thiết bị mức "Cao" (High) để hỗ trợ 1-click tạo kế hoạch
        const highIds = new Set(
          res.data.ranking.filter((r) => r.priorityLevel === 'high').map((r) => r.equipmentId)
        );
        setSelectedEquipments(highIds);
      }
    } catch (err) {
      console.error('Lỗi tính toán ưu tiên', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWeightChange = (key, value) => {
    setWeights((prev) => ({
      ...prev,
      [key]: Number(value),
    }));
  };

  const handleApplyWeights = () => {
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    if (total !== 100) {
      alert(`Tổng trọng số phải bằng 100% (Hiện tại: ${total}%)`);
      return;
    }
    evaluatePriority(weights);
  };

  const handleSaveDefaultWeights = async () => {
    try {
      const total = Object.values(weights).reduce((a, b) => a + b, 0);
      if (total !== 100) {
        alert(`Tổng trọng số phải bằng 100% (Hiện tại: ${total}%)`);
        return;
      }
      const res = await axiosClient.put('/priority/criteria', { weights });
      if (res.success) {
        setWeightSaveMsg('Đã lưu cấu hình trọng số vào CSDL hệ thống thành công!');
        setTimeout(() => setWeightSaveMsg(''), 4000);
      }
    } catch (err) {
      alert(err.error?.message || 'Lỗi lưu trọng số');
    }
  };

  const toggleSelectEquipment = (id) => {
    const next = new Set(selectedEquipments);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedEquipments(next);
  };

  const handleSelectAllFiltered = (items) => {
    if (selectedEquipments.size === items.length) {
      setSelectedEquipments(new Set());
    } else {
      setSelectedEquipments(new Set(items.map((i) => i.equipmentId)));
    }
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    if (selectedEquipments.size === 0) {
      alert('Vui lòng chọn ít nhất một thiết bị để lập kế hoạch');
      return;
    }

    const items = ranking
      .filter((r) => selectedEquipments.has(r.equipmentId))
      .map((r) => ({
        equipmentId: r.equipmentId,
        priorityScore: r.priorityScore,
        priorityLevel: r.priorityLevel,
        notes: `Mức ưu tiên ${r.priorityLabel} (${r.priorityScore}đ)`,
      }));

    try {
      const res = await axiosClient.post('/maintenance-plans', {
        ...planForm,
        items,
      });

      if (res.success) {
        setShowCreatePlanModal(false);
        navigate('/plans');
      }
    } catch (err) {
      alert(err.error?.message || 'Lỗi tạo kế hoạch');
    }
  };

  // Filter client-side
  const filteredList = ranking.filter((item) => {
    const matchesSearch =
      searchTerm === '' ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === '' || item.priorityLevel === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const totalWeights = Object.values(weights).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Header and Explanation */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                <Flame className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Thuật Toán Đánh Giá Mức Độ Ưu Tiên Bảo Trì (MCDA C1 - C5)
                </h2>
                <p className="text-xs text-slate-500">
                  Công thức: <code className="bg-slate-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono font-semibold">PriorityScore = C1*W1 + C2*W2 + C3*W3 + C4*W4 + C5*W5</code> (Chuẩn hóa Min-Max [0, 100])
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowWeightConfig(!showWeightConfig)}
              className="inline-flex items-center px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-xs transition"
            >
              <Sliders className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
              {showWeightConfig ? 'Ẩn cấu hình trọng số' : 'Điều chỉnh trọng số W1-W5'}
            </button>

            {isManager && (
              <button
                disabled={selectedEquipments.size === 0}
                onClick={() => setShowCreatePlanModal(true)}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition"
              >
                <PlusCircle className="w-4 h-4 mr-1.5" />
                Lập kế hoạch từ {selectedEquipments.size} thiết bị đã chọn
              </button>
            )}
          </div>
        </div>

        {/* Expandable Weight Configuration Panel */}
        {showWeightConfig && (
          <div className="mt-5 pt-5 border-t border-slate-200 bg-slate-50 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
                <Sliders className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                Cấu hình trọng số thử nghiệm đồ án (Tổng = 100%)
              </h4>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded ${
                  totalWeights === 100 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}
              >
                Tổng: {totalWeights}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  C1: Tuổi thiết bị (W1)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={weights.C1}
                    onChange={(e) => handleWeightChange('C1', e.target.value)}
                    className="w-16 px-2 py-1 text-sm border rounded font-semibold text-center"
                  />
                  <span className="text-xs font-medium text-slate-400">%</span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  C2: Tần suất sự cố (W2)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={weights.C2}
                    onChange={(e) => handleWeightChange('C2', e.target.value)}
                    className="w-16 px-2 py-1 text-sm border rounded font-semibold text-center"
                  />
                  <span className="text-xs font-medium text-slate-400">%</span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  C3: Chưa bảo trì (W3)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={weights.C3}
                    onChange={(e) => handleWeightChange('C3', e.target.value)}
                    className="w-16 px-2 py-1 text-sm border rounded font-semibold text-center"
                  />
                  <span className="text-xs font-medium text-slate-400">%</span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  C4: Chi phí sửa (W4)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={weights.C4}
                    onChange={(e) => handleWeightChange('C4', e.target.value)}
                    className="w-16 px-2 py-1 text-sm border rounded font-semibold text-center"
                  />
                  <span className="text-xs font-medium text-slate-400">%</span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  C5: Mức quan trọng (W5)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={weights.C5}
                    onChange={(e) => handleWeightChange('C5', e.target.value)}
                    className="w-16 px-2 py-1 text-sm border rounded font-semibold text-center"
                  />
                  <span className="text-xs font-medium text-slate-400">%</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-slate-500 italic">
                * Thay đổi trọng số để mô phỏng sự nhạy cảm của thuật toán trong bảo vệ đồ án
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={handleApplyWeights}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-500 shadow-xs"
                >
                  Tính lại điểm ngay
                </button>
                {isManager && (
                  <button
                    onClick={handleSaveDefaultWeights}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-semibold hover:bg-emerald-500 shadow-xs"
                  >
                    Lưu làm mặc định hệ thống
                  </button>
                )}
              </div>
            </div>
            {weightSaveMsg && (
              <p className="mt-2 text-xs font-semibold text-emerald-600">{weightSaveMsg}</p>
            )}
          </div>
        )}
      </div>

      {/* Summary Stats Badges */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500">Đã đánh giá</span>
            <div className="text-xl font-bold text-slate-800">{stats.total} thiết bị</div>
          </div>
          <div
            onClick={() => setSelectedLevel(selectedLevel === 'high' ? '' : 'high')}
            className={`cursor-pointer p-4 rounded-xl border transition ${
              selectedLevel === 'high' ? 'bg-rose-50 border-rose-400 shadow-sm' : 'bg-white border-slate-200'
            }`}
          >
            <span className="text-xs text-rose-600 font-semibold">Ưu tiên Cao (&gt;= 70đ)</span>
            <div className="text-xl font-bold text-rose-700">{stats.high} thiết bị</div>
          </div>
          <div
            onClick={() => setSelectedLevel(selectedLevel === 'medium' ? '' : 'medium')}
            className={`cursor-pointer p-4 rounded-xl border transition ${
              selectedLevel === 'medium' ? 'bg-amber-50 border-amber-400 shadow-sm' : 'bg-white border-slate-200'
            }`}
          >
            <span className="text-xs text-amber-600 font-semibold">Trung bình (40 - 69đ)</span>
            <div className="text-xl font-bold text-amber-700">{stats.medium} thiết bị</div>
          </div>
          <div
            onClick={() => setSelectedLevel(selectedLevel === 'low' ? '' : 'low')}
            className={`cursor-pointer p-4 rounded-xl border transition ${
              selectedLevel === 'low' ? 'bg-emerald-50 border-emerald-400 shadow-sm' : 'bg-white border-slate-200'
            }`}
          >
            <span className="text-xs text-emerald-600 font-semibold">Thấp (&lt; 40đ)</span>
            <div className="text-xl font-bold text-emerald-700">{stats.low} thiết bị</div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 items-center space-x-3 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo mã, tên thiết bị, phòng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50"
          >
            <option value="">-- Mức ưu tiên --</option>
            <option value="high">Ưu tiên Cao (&gt;=70)</option>
            <option value="medium">Trung bình (40-69)</option>
            <option value="low">Thấp (&lt;40)</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => evaluatePriority()}
            className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Làm mới
          </button>
        </div>
      </div>

      {/* Priority Ranking Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-center w-10">
                  <input
                    type="checkbox"
                    checked={
                      filteredList.length > 0 && selectedEquipments.size === filteredList.length
                    }
                    onChange={() => handleSelectAllFiltered(filteredList)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="px-3 py-3 text-left">Hạng</th>
                <th className="px-3 py-3 text-left">Mã & Tên Thiết Bị</th>
                <th className="px-3 py-3 text-left">Vị trí phòng</th>
                <th className="px-2 py-3 text-center">C1: Tuổi</th>
                <th className="px-2 py-3 text-center">C2: Sự cố</th>
                <th className="px-2 py-3 text-center">C3: Chưa bảo trì</th>
                <th className="px-2 py-3 text-center">C4: Chi phí</th>
                <th className="px-2 py-3 text-center">C5: Trọng yếu</th>
                <th className="px-3 py-3 text-center">Điểm Priority</th>
                <th className="px-3 py-3 text-center">Phân loại</th>
                <th className="px-3 py-3 text-left">Đề xuất xử lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="12" className="px-6 py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                      <span className="ml-2 font-medium">Đang tính toán chuẩn hóa Min-Max...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan="12" className="px-6 py-8 text-center text-slate-400">
                    Không tìm thấy thiết bị phù hợp với bộ lọc
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => {
                  const isChecked = selectedEquipments.has(item.equipmentId);
                  return (
                    <tr
                      key={item.equipmentId}
                      className={`hover:bg-slate-50 transition ${isChecked ? 'bg-indigo-50/40' : ''}`}
                    >
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectEquipment(item.equipmentId)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-3 py-3 font-bold text-slate-700">#{item.rank}</td>
                      <td className="px-3 py-3">
                        <div className="font-semibold text-slate-900">{item.code}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs">{item.name}</div>
                      </td>
                      <td className="px-3 py-3 text-slate-600 text-[11px] max-w-[150px] truncate">
                        {item.location}
                      </td>

                      {/* Raw and Normalized C1 */}
                      <td className="px-2 py-3 text-center" title={`Điểm chuẩn hóa: ${item.normalizedScores.C1}đ`}>
                        <div className="font-medium text-slate-800">{item.rawValues.ageMonths} th</div>
                        <div className="text-[10px] text-slate-400">({item.normalizedScores.C1}đ)</div>
                      </td>

                      {/* Raw and Normalized C2 */}
                      <td className="px-2 py-3 text-center" title={`Điểm chuẩn hóa: ${item.normalizedScores.C2}đ`}>
                        <div className="font-bold text-rose-600">{item.rawValues.incidentCount} lần</div>
                        <div className="text-[10px] text-slate-400">({item.normalizedScores.C2}đ)</div>
                      </td>

                      {/* Raw and Normalized C3 */}
                      <td className="px-2 py-3 text-center" title={`Điểm chuẩn hóa: ${item.normalizedScores.C3}đ`}>
                        <div className="font-medium text-slate-800">{item.rawValues.daysSinceLastMaintenance} ng</div>
                        <div className="text-[10px] text-slate-400">({item.normalizedScores.C3}đ)</div>
                      </td>

                      {/* Raw and Normalized C4 */}
                      <td className="px-2 py-3 text-center" title={`Điểm chuẩn hóa: ${item.normalizedScores.C4}đ`}>
                        <div className="font-medium text-slate-800">
                          {Math.round(item.rawValues.totalCost / 1000)}k
                        </div>
                        <div className="text-[10px] text-slate-400">({item.normalizedScores.C4}đ)</div>
                      </td>

                      {/* Raw and Normalized C5 */}
                      <td className="px-2 py-3 text-center" title={`Điểm chuẩn hóa: ${item.normalizedScores.C5}đ`}>
                        <div className="font-bold text-indigo-700">{item.rawValues.importanceLevel}/5</div>
                        <div className="text-[10px] text-slate-400">({item.normalizedScores.C5}đ)</div>
                      </td>

                      {/* Total Priority Score */}
                      <td className="px-3 py-3 text-center">
                        <span className="font-extrabold text-sm text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                          {item.priorityScore}
                        </span>
                      </td>

                      {/* Level */}
                      <td className="px-3 py-3 text-center">
                        <PriorityBadge level={item.priorityLevel} />
                      </td>

                      {/* Recommendation */}
                      <td className="px-3 py-3 text-slate-600 text-[11px] max-w-xs">
                        {item.recommendation}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Lập Kế Hoạch Bảo Trì từ các thiết bị đã chọn */}
      {showCreatePlanModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center mb-1">
              <CalendarCheck className="w-5 h-5 mr-2 text-indigo-600" />
              Tạo Kế Hoạch Bảo Trì Mới
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Đang lập kế hoạch cho <strong className="text-indigo-600 font-bold">{selectedEquipments.size}</strong> thiết bị có mức độ ưu tiên bảo trì cao
            </p>

            <form onSubmit={handleCreatePlan} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên kế hoạch bảo trì</label>
                <input
                  type="text"
                  required
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kỳ bảo trì</label>
                  <input
                    type="text"
                    required
                    value={planForm.period}
                    onChange={(e) => setPlanForm({ ...planForm, period: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="VD: Quý 4/2026"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ngày bắt đầu</label>
                  <input
                    type="date"
                    required
                    value={planForm.startDate}
                    onChange={(e) => setPlanForm({ ...planForm, startDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ngày hoàn thành dự kiến</label>
                <input
                  type="date"
                  required
                  value={planForm.endDate}
                  onChange={(e) => setPlanForm({ ...planForm, endDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ghi chú kế hoạch</label>
                <textarea
                  rows="2"
                  value={planForm.notes}
                  onChange={(e) => setPlanForm({ ...planForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                ></textarea>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-200 mt-4">
                <button
                  type="button"
                  onClick={() => setShowCreatePlanModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-sm"
                >
                  Xác nhận tạo kế hoạch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriorityEvaluation;

