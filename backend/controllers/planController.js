const MaintenancePlan = require('../models/MaintenancePlan');
const Equipment = require('../models/Equipment');
const Maintenance = require('../models/Maintenance');

// @desc    Lấy danh sách các kế hoạch bảo trì
// @route   GET /api/maintenance-plans
// @access  Private
exports.getPlans = async (req, res) => {
  try {
    const { status, period, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (period) filter.period = { $regex: period, $options: 'i' };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await MaintenancePlan.countDocuments(filter);
    const plans = await MaintenancePlan.find(filter)
      .populate('createdBy', 'fullName username')
      .populate('items.equipmentId', 'code name status locationId categoryId')
      .populate('items.assignedTo', 'fullName username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      data: plans,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
};

// @desc    Lấy chi tiết một kế hoạch bảo trì
// @route   GET /api/maintenance-plans/:id
// @access  Private
exports.getPlanById = async (req, res) => {
  try {
    const plan = await MaintenancePlan.findById(req.params.id)
      .populate('createdBy', 'fullName username email phone')
      .populate({
        path: 'items.equipmentId',
        populate: [
          { path: 'locationId', select: 'name building room' },
          { path: 'categoryId', select: 'name code' },
        ],
      })
      .populate('items.assignedTo', 'fullName username email phone')
      .populate('items.maintenanceId');

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Không tìm thấy kế hoạch bảo trì' },
      });
    }

    return res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
};

// @desc    Tạo kế hoạch bảo trì mới (hỗ trợ nhập danh sách thiết bị đề xuất)
// @route   POST /api/maintenance-plans
// @access  Private (Admin, Manager)
exports.createPlan = async (req, res) => {
  try {
    const { name, period, startDate, endDate, items, notes } = req.body;

    const count = await MaintenancePlan.countDocuments();
    const year = new Date().getFullYear();
    const code = `PLAN-${year}-${String(count + 1).padStart(3, '0')}`;

    const formattedItems = (items || []).map((item) => ({
      equipmentId: item.equipmentId,
      assignedTo: item.assignedTo || null,
      scheduledDate: item.scheduledDate || startDate,
      status: 'pending',
      priorityScore: item.priorityScore || 0,
      priorityLevel: item.priorityLevel || 'medium',
      notes: item.notes || '',
    }));

    const plan = await MaintenancePlan.create({
      code,
      name,
      period,
      createdBy: req.user._id,
      startDate,
      endDate,
      status: 'scheduled',
      items: formattedItems,
      notes: notes || '',
    });

    const populated = await MaintenancePlan.findById(plan._id)
      .populate('createdBy', 'fullName username')
      .populate('items.equipmentId', 'code name locationId categoryId');

    return res.status(201).json({
      success: true,
      message: 'Tạo kế hoạch bảo trì thành công',
      data: populated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
};

// @desc    Cập nhật kế hoạch bảo trì
// @route   PUT /api/maintenance-plans/:id
// @access  Private (Admin, Manager)
exports.updatePlan = async (req, res) => {
  try {
    const { name, period, startDate, endDate, status, notes } = req.body;
    const plan = await MaintenancePlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Không tìm thấy kế hoạch bảo trì' },
      });
    }

    if (name) plan.name = name;
    if (period) plan.period = period;
    if (startDate) plan.startDate = startDate;
    if (endDate) plan.endDate = endDate;
    if (status) plan.status = status;
    if (notes !== undefined) plan.notes = notes;

    await plan.save();

    return res.status(200).json({
      success: true,
      message: 'Cập nhật kế hoạch thành công',
      data: plan,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
};

// @desc    Cập nhật tiến độ của một mục thiết bị trong kế hoạch bảo trì
// @route   PATCH /api/maintenance-plans/:id/items/:itemId
// @access  Private (Admin, Manager, Technician)
exports.updatePlanItem = async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const { status, assignedTo, scheduledDate, notes, createMaintenanceRecord, maintenanceContent, maintenanceCost, maintenanceResult } = req.body;

    const plan = await MaintenancePlan.findById(id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Không tìm thấy kế hoạch bảo trì' },
      });
    }

    const item = plan.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Không tìm thấy mục thiết bị trong kế hoạch' },
      });
    }

    if (status) item.status = status;
    if (assignedTo !== undefined) item.assignedTo = assignedTo;
    if (scheduledDate) item.scheduledDate = scheduledDate;
    if (notes !== undefined) item.notes = notes;

    // Nếu người dùng chọn tạo bản ghi bảo trì ngay khi hoàn thành mục
    if (createMaintenanceRecord || status === 'completed') {
      const count = await Maintenance.countDocuments();
      const year = new Date().getFullYear();
      const code = `MAINT-${year}-${String(count + 1).padStart(4, '0')}`;

      const maint = await Maintenance.create({
        code,
        equipmentId: item.equipmentId,
        planId: plan._id,
        type: 'periodic',
        scheduledDate: item.scheduledDate || new Date(),
        performedDate: new Date(),
        performedBy: item.assignedTo || req.user._id,
        content: maintenanceContent || `Bảo trì định kỳ theo kế hoạch ${plan.name}`,
        result: maintenanceResult || 'good',
        cost: Number(maintenanceCost) || 0,
        notes: notes || '',
      });

      item.maintenanceId = maint._id;
      item.status = 'completed';

      // Cập nhật ngày bảo trì gần nhất của thiết bị
      await Equipment.findByIdAndUpdate(item.equipmentId, {
        lastMaintenanceDate: new Date(),
        status: maintenanceResult === 'failed' ? 'broken' : 'active',
      });
    }

    // Kiểm tra xem tất cả items đã hoàn thành chưa để cập nhật trạng thái của plan
    const allCompleted = plan.items.every((it) => it.status === 'completed' || it.status === 'skipped');
    if (allCompleted && plan.items.length > 0) {
      plan.status = 'completed';
    } else if (plan.items.some((it) => it.status === 'in_progress' || it.status === 'completed')) {
      plan.status = 'in_progress';
    }

    await plan.save();

    const populated = await MaintenancePlan.findById(plan._id)
      .populate('createdBy', 'fullName username')
      .populate('items.equipmentId', 'code name locationId categoryId')
      .populate('items.assignedTo', 'fullName username');

    return res.status(200).json({
      success: true,
      message: 'Cập nhật mục kế hoạch thành công',
      data: populated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
};
