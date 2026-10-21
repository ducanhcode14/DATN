const Equipment = require('../models/Equipment');
const EquipmentCategory = require('../models/EquipmentCategory');
const Incident = require('../models/Incident');
const Maintenance = require('../models/Maintenance');
const MaintenancePlan = require('../models/MaintenancePlan');
const priorityService = require('../services/priorityService');

// @desc    Lấy toàn bộ số liệu KPI và biểu đồ cho Dashboard
// @route   GET /api/dashboard/summary
// @access  Private
exports.getDashboardSummary = async (req, res) => {
  try {
    // 1. Thống kê số lượng tổng quan
    const totalEquipments = await Equipment.countDocuments();
    const activeEquipments = await Equipment.countDocuments({ status: 'active' });
    const maintenanceNeededEquipments = await Equipment.countDocuments({ status: 'maintenance_needed' });
    const inRepairEquipments = await Equipment.countDocuments({ status: 'in_repair' });
    const brokenEquipments = await Equipment.countDocuments({ status: 'broken' });
    const decommissionedEquipments = await Equipment.countDocuments({ status: 'decommissioned' });

    const totalIncidents = await Incident.countDocuments();
    const openIncidents = await Incident.countDocuments({ status: { $in: ['open', 'assigned', 'in_progress'] } });
    const resolvedIncidents = await Incident.countDocuments({ status: { $in: ['resolved', 'closed'] } });

    const totalMaintenances = await Maintenance.countDocuments();
    const totalPlans = await MaintenancePlan.countDocuments();
    const activePlans = await MaintenancePlan.countDocuments({ status: { $in: ['scheduled', 'in_progress'] } });

    // 2. Thống kê thiết bị theo nhóm (Category)
    const categoryStats = await Equipment.aggregate([
      {
        $group: {
          _id: '$categoryId',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'equipmentcategories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $unwind: {
          path: '$category',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          name: { $ifNull: ['$category.name', 'Khác'] },
          code: { $ifNull: ['$category.code', 'OTHER'] },
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 3. Thống kê chi phí
    const incidentCostAgg = await Incident.aggregate([
      { $group: { _id: null, total: { $sum: '$repairCost' } } },
    ]);
    const maintenanceCostAgg = await Maintenance.aggregate([
      { $group: { _id: null, total: { $sum: '$cost' } } },
    ]);

    const totalRepairCost = incidentCostAgg[0]?.total || 0;
    const totalMaintenanceCost = maintenanceCostAgg[0]?.total || 0;
    const totalExpense = totalRepairCost + totalMaintenanceCost;

    // 4. Đánh giá ưu tiên nhanh (Top và phân bổ mức độ)
    const ranking = await priorityService.evaluateEquipmentPriority();
    const priorityStats = {
      high: ranking.filter((r) => r.priorityLevel === 'high').length,
      medium: ranking.filter((r) => r.priorityLevel === 'medium').length,
      low: ranking.filter((r) => r.priorityLevel === 'low').length,
    };

    const topPriorityEquipments = ranking.slice(0, 7);

    // 5. Thống kê sự cố theo mức độ nghiêm trọng
    const incidentsBySeverity = await Incident.aggregate([
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 },
        },
      },
    ]);

    // 6. Thống kê số lượng sự cố & bảo trì theo tháng (6 tháng gần đây)
    const monthlyStats = await Incident.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$reportedAt' },
            month: { $month: '$reportedAt' },
          },
          incidentCount: { $sum: 1 },
          repairCost: { $sum: '$repairCost' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        cards: {
          totalEquipments,
          activeEquipments,
          maintenanceNeededEquipments,
          inRepairEquipments,
          brokenEquipments,
          decommissionedEquipments,
          totalIncidents,
          openIncidents,
          resolvedIncidents,
          totalMaintenances,
          totalPlans,
          activePlans,
          totalExpense,
          totalRepairCost,
          totalMaintenanceCost,
        },
        categoryStats,
        priorityStats,
        topPriorityEquipments,
        incidentsBySeverity,
        monthlyStats,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
};

