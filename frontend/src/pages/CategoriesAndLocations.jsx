import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { Layers, MapPin, Plus, Edit, FolderPlus } from 'lucide-react';

const CategoriesAndLocations = () => {
  const { isManager } = useAuth();
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' | 'locations'
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCatModal, setShowCatModal] = useState(false);
  const [showLocModal, setShowLocModal] = useState(false);

  const [catForm, setCatForm] = useState({ name: '', code: '', description: '' });
  const [locForm, setLocForm] = useState({ name: '', building: '', room: '', department: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catsRes, locsRes] = await Promise.all([
        axiosClient.get('/equipment-categories'),
        axiosClient.get('/locations'),
      ]);
      if (catsRes.success) setCategories(catsRes.data);
      if (locsRes.success) setLocations(locsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCatSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosClient.post('/equipment-categories', catForm);
      if (res.success) {
        setShowCatModal(false);
        setCatForm({ name: '', code: '', description: '' });
        fetchData();
      }
    } catch (err) {
      alert(err.error?.message || 'Lỗi thêm nhóm danh mục');
    }
  };

  const handleLocSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosClient.post('/locations', locForm);
      if (res.success) {
        setShowLocModal(false);
        setLocForm({ name: '', building: '', room: '', department: '' });
        fetchData();
      }
    } catch (err) {
      alert(err.error?.message || 'Lỗi thêm vị trí');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Quản Lý Danh Mục & Vị Trí Thiết Bị</h2>
          <p className="text-xs text-slate-500">Cấu hình hệ thống phân nhóm và vị trí phòng ban giảng dạy</p>
        </div>
        {isManager && (
          <div className="flex space-x-2">
            {activeTab === 'categories' ? (
              <button
                onClick={() => setShowCatModal(true)}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs transition"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Thêm Nhóm Danh Mục
              </button>
            ) : (
              <button
                onClick={() => setShowLocModal(true)}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs transition"
              >
                <Plus className="w-4 h-4 mr-1.5" /> Thêm Vị Trí / Phòng Mới
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-200 text-xs font-semibold px-4 pt-2">
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-3 border-b-2 flex items-center transition ${
              activeTab === 'categories'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Layers className="w-4 h-4 mr-1.5" />
            Nhóm Thiết Bị ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('locations')}
            className={`px-4 py-3 border-b-2 flex items-center transition ${
              activeTab === 'locations'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <MapPin className="w-4 h-4 mr-1.5" />
            Vị Trí & Phòng Ban ({locations.length})
          </button>
        </div>

        {/* Tab 1: Categories */}
        {activeTab === 'categories' && (
          <div className="overflow-x-auto p-4">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Mã Nhóm</th>
                  <th className="px-4 py-3 text-left">Tên Nhóm Thiết Bị</th>
                  <th className="px-4 py-3 text-left">Mô Tả Chức Năng</th>
                  <th className="px-4 py-3 text-center">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {categories.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-mono font-bold text-indigo-600">{c.code}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{c.name}</td>
                    <td className="px-4 py-3 text-slate-500">{c.description || '---'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Hoạt động
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Locations */}
        {activeTab === 'locations' && (
          <div className="overflow-x-auto p-4">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Tên Phòng / Vị Trí</th>
                  <th className="px-4 py-3 text-left">Tòa Nhà</th>
                  <th className="px-4 py-3 text-left">Số Phòng</th>
                  <th className="px-4 py-3 text-left">Đơn Vị Quản Lý / Khoa</th>
                  <th className="px-4 py-3 text-center">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {locations.map((l) => (
                  <tr key={l._id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-medium text-slate-900">{l.name}</td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{l.building}</td>
                    <td className="px-4 py-3 font-mono text-indigo-600">{l.room}</td>
                    <td className="px-4 py-3 text-slate-600">{l.department || 'Phòng ban trường'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Hoạt động
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Category */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">Thêm Nhóm Thiết Bị Mới</h3>
            <form onSubmit={handleCatSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mã nhóm *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: AUDIO, CAMERA..."
                  value={catForm.code}
                  onChange={(e) => setCatForm({ ...catForm, code: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg uppercase"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên nhóm thiết bị *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Thiết bị Âm thanh Giảng đường..."
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mô tả</label>
                <textarea
                  rows="2"
                  value={catForm.description}
                  onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                ></textarea>
              </div>
              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCatModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-sm"
                >
                  Thêm nhóm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Location */}
      {showLocModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">Thêm Vị Trí / Phòng Mới</h3>
            <form onSubmit={handleLocSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên vị trí *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Phòng Lab Trí tuệ Nhân tạo"
                  value={locForm.name}
                  onChange={(e) => setLocForm({ ...locForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tòa nhà *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Nhà B1"
                    value={locForm.building}
                    onChange={(e) => setLocForm({ ...locForm, building: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số phòng *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: B1-304"
                    value={locForm.room}
                    onChange={(e) => setLocForm({ ...locForm, room: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Đơn vị / Khoa phụ trách</label>
                <input
                  type="text"
                  placeholder="VD: Khoa Công nghệ Thông tin"
                  value={locForm.department}
                  onChange={(e) => setLocForm({ ...locForm, department: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowLocModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow-sm"
                >
                  Thêm vị trí
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesAndLocations;
