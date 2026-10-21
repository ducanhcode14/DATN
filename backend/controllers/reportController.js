const Equipment = require('../models/Equipment');
const Incident = require('../models/Incident');
const Maintenance = require('../models/Maintenance');
const MaintenancePlan = require('../models/MaintenancePlan');
const priorityService = require('../services/priorityService');

// @desc    Báo cáo tổng hợp theo các loại
// @route   GET /api/reports/:type
// @access  Private (Admin, Manager)
exports.getReportData = async (req, res) => {
  try {
    const { type } = req.params;
    const { categoryId, locationId, startDate, endDate, status } = req.query;

    let result = {};

    switch (type) {
      case 'equipments': {
        const filter = {};
        if (categoryId) filter.categoryId = categoryId;
        if (locationId) filter.locationId = locationId;
        if (status) filter.status = status;

        const data = await Equipment.find(filter)
          .populate('categoryId', 'name code')
          .populate('locationId', 'name building room department')
          .sort({ code: 1 });

        result = { title: 'Báo cáo Danh sách Thiết bị', total: data.length, items: data };
        break;
      }

      case 'broken-devices': {
        const data = await Equipment.find({
          status: { $in: ['broken', 'maintenance_needed', 'in_repair'] },
        })
          .populate('categoryId', 'name code')
          .populate('locationId', 'name building room department')
          .sort({ status: 1 });

        result = { title: 'Báo cáo Thiết bị Hỏng & Cần Kiểm tra', total: data.length, items: data };
        break;
      }

      case 'high-priority': {
        const ranking = await priorityService.evaluateEquipmentPriority();
        const highList = ranking.filter((r) => r.priorityLevel === 'high');
        result = { title: 'Báo cáo Thiết bị Có Mức Độ Ưu Tiên Bảo Trì Cao', total: highList.length, items: highList };
        break;
      }

      case 'maintenance-history': {
        const filter = {};
        if (startDate || endDate) {
          filter.performedDate = {};
          if (startDate) filter.performedDate.$gte = new Date(startDate);
          if (endDate) filter.performedDate.$lte = new Date(endDate);
        }

        const data = await Maintenance.find(filter)
          .populate('equipmentId', 'code name locationId')
          .populate('performedBy', 'fullName username')
          .populate('planId', 'name code')
          .sort({ performedDate: -1 });

        const totalCost = data.reduce((sum, item) => sum + (item.cost || 0), 0);

        result = { title: 'Báo cáo Lịch sử Bảo trì & Sửa chữa', total: data.length, totalCost, items: data };
        break;
      }

      case 'costs': {
        const maintenances = await Maintenance.find({ cost: { $gt: 0 } })
          .populate('equipmentId', 'code name')
          .sort({ performedDate: -1 });
        const incidents = await Incident.find({ repairCost: { $gt: 0 } })
          .populate('equipmentId', 'code name')
          .sort({ resolvedAt: -1 });

        const totalMaintenanceCost = maintenances.reduce((acc, m) => acc + (m.cost || 0), 0);
        const totalRepairCost = incidents.reduce((acc, i) => acc + (i.repairCost || 0), 0);

        result = {
          title: 'Báo cáo Chi phí Bảo trì & Sửa chữa',
          totalMaintenanceCost,
          totalRepairCost,
          grandTotal: totalMaintenanceCost + totalRepairCost,
          maintenances,
          incidents,
        };
        break;
      }

      case 'incidents': {
        const filter = {};
        if (status) filter.status = status;

        const data = await Incident.find(filter)
          .populate('equipmentId', 'code name')
          .populate('reportedBy', 'fullName')
          .populate('assignedTo', 'fullName')
          .sort({ reportedAt: -1 });

        result = { title: 'Báo cáo Thống kê Sự cố', total: data.length, items: data };
        break;
      }

      case 'plans': {
        const data = await MaintenancePlan.find()
          .populate('createdBy', 'fullName')
          .populate('items.equipmentId', 'code name')
          .populate('items.assignedTo', 'fullName')
          .sort({ createdAt: -1 });

        result = { title: 'Báo cáo Kế hoạch Bảo trì', total: data.length, items: data };
        break;
      }

      default:
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_REPORT_TYPE', message: 'Loại báo cáo không hợp lệ' },
        });
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
};

