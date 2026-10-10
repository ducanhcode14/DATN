const Maintenance = require('../models/Maintenance');
const Equipment = require('../models/Equipment');
const MaintenancePlan = require('../models/MaintenancePlan');

// @desc    Lấy danh sách các đợt bảo trì
// @route   GET /api/maintenances
// @access  Private
exports.getMaintenances = async (req, res) => {
  try {
    const { equipmentId, planId, type, result, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (equipmentId) filter.equipmentId = equipmentId;
    if (planId) filter.planId = planId;
    if (type) filter.type = type;
    if (result) filter.result = result;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Maintenance.countDocuments(filter);
    const maintenances = await Maintenance.find(filter)
      .populate('equipmentId', 'code name status locationId')
      .populate('performedBy', 'fullName username')
      .populate('planId', 'code name period')
      .sort({ scheduledDate: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      data: maintenances,
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

// @desc    Lấy chi tiết bản ghi bảo trì
// @route   GET /api/maintenances/:id
// @access  Private
exports.getMaintenanceById = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id)
      .populate('equipmentId')
      .populate('performedBy', 'fullName username email phone')
      .populate('planId');

    if (!maintenance) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Không tìm thấy bản ghi bảo trì' },
      });
    }

    return res.status(200).json({
      success: true,
      data: maintenance,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
};

// @desc    Tạo bản ghi bảo trì mới
// @route   POST /api/maintenances
// @access  Private (Admin, Manager, Technician)
exports.createMaintenance = async (req, res) => {
  try {
    const { equipmentId, planId, type, scheduledDate, performedDate, performedBy, content, result, cost, notes } = req.body;

    const count = await Maintenance.countDocuments();
    const year = new Date().getFullYear();
    const code = `MAINT-${year}-${String(count + 1).padStart(4, '0')}`;

    const maintenance = await Maintenance.create({
      code,
      equipmentId,
      planId: planId || null,
      type: type || 'periodic',
      scheduledDate: scheduledDate || new Date(),
      performedDate: performedDate || (result && result !== 'pending' ? new Date() : null),
      performedBy: performedBy || req.user._id,
      content,
      result: result || 'pending',
      cost: Number(cost) || 0,
      notes: notes || '',
    });

    // Nếu đã hoàn tất (result khác pending), cập nhật lastMaintenanceDate cho thiết bị (theo BR-06)
    if (result && result !== 'pending') {
      const updateData = {
        lastMaintenanceDate: maintenance.performedDate || new Date(),
        status: result === 'failed' ? 'broken' : 'active',
      };
      await Equipment.findByIdAndUpdate(equipmentId, updateData);
    }

    // Nếu thuộc kế hoạch bảo trì, cập nhật trạng thái item trong kế hoạch
    if (planId) {
      await MaintenancePlan.updateOne(
        { _id: planId, 'items.equipmentId': equipmentId },
        {
          $set: {
            'items.$.status': result && result !== 'pending' ? 'completed' : 'in_progress',
            'items.$.maintenanceId': maintenance._id,
          },
        }
      );
    }

    const populated = await Maintenance.findById(maintenance._id)
      .populate('equipmentId', 'code name status')
      .populate('performedBy', 'fullName username')
      .populate('planId', 'code name');

    return res.status(201).json({
      success: true,
      message: 'Tạo bản ghi bảo trì thành công',
      data: populated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
};

// @desc    Cập nhật bản ghi bảo trì (kết quả, chi phí, ngày thực hiện)
// @route   PUT /api/maintenances/:id
// @access  Private (Admin, Manager, Technician)
exports.updateMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);
    if (!maintenance) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Không tìm thấy bản ghi bảo trì' },
      });
    }

    const { type, scheduledDate, performedDate, performedBy, content, result, cost, notes } = req.body;

    if (type) maintenance.type = type;
    if (scheduledDate) maintenance.scheduledDate = scheduledDate;
    if (performedDate !== undefined) maintenance.performedDate = performedDate;
    if (performedBy) maintenance.performedBy = performedBy;
    if (content) maintenance.content = content;
    if (result) maintenance.result = result;
    if (cost !== undefined) maintenance.cost = Number(cost);
    if (notes !== undefined) maintenance.notes = notes;

    await maintenance.save();

    // Nếu đã hoàn thành bảo trì, cập nhật thiết bị (BR-06)
    if (maintenance.result && maintenance.result !== 'pending') {
      await Equipment.findByIdAndUpdate(maintenance.equipmentId, {
        lastMaintenanceDate: maintenance.performedDate || new Date(),
        status: maintenance.result === 'failed' ? 'broken' : 'active',
      });

      if (maintenance.planId) {
        await MaintenancePlan.updateOne(
          { _id: maintenance.planId, 'items.equipmentId': maintenance.equipmentId },
          {
            $set: {
              'items.$.status': 'completed',
              'items.$.maintenanceId': maintenance._id,
            },
          }
        );
      }
    }

    const populated = await Maintenance.findById(maintenance._id)
      .populate('equipmentId', 'code name status')
      .populate('performedBy', 'fullName username')
      .populate('planId', 'code name');

    return res.status(200).json({
      success: true,
      message: 'Cập nhật bản ghi bảo trì thành công',
      data: populated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
};
