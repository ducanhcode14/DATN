const Equipment = require('../models/Equipment');
const Incident = require('../models/Incident');
const Maintenance = require('../models/Maintenance');

// @desc    Lấy danh sách thiết bị kèm bộ lọc và tìm kiếm
// @route   GET /api/equipments
// @access  Private
exports.getEquipments = async (req, res) => {
  try {
    const { search, categoryId, locationId, status, importanceLevel, page = 1, limit = 100 } = req.query;
    const filter = {};

    if (categoryId) filter.categoryId = categoryId;
    if (locationId) filter.locationId = locationId;
    if (status) filter.status = status;
    if (importanceLevel) filter.importanceLevel = Number(importanceLevel);

    if (search) {
      filter.$or = [
        { code: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } },
        { manufacturer: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Equipment.countDocuments(filter);
    const equipments = await Equipment.find(filter)
      .populate('categoryId', 'name code')
      .populate('locationId', 'name building room department')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      data: equipments,
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

// @desc    Lấy chi tiết một thiết bị và toàn bộ lịch sử sự cố/bảo trì
// @route   GET /api/equipments/:id
// @access  Private
exports.getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id)
      .populate('categoryId', 'name code')
      .populate('locationId', 'name building room department');

    if (!equipment) {
      return res.status(404).json({
        success: false,
        error: { code: 'EQUIPMENT_NOT_FOUND', message: 'Không tìm thấy thiết bị' },
      });
    }

    const incidents = await Incident.find({ equipmentId: equipment._id })
      .populate('reportedBy', 'fullName username')
      .populate('assignedTo', 'fullName username')
      .sort({ reportedAt: -1 });

    const maintenances = await Maintenance.find({ equipmentId: equipment._id })
      .populate('performedBy', 'fullName username')
      .populate('planId', 'name code')
      .sort({ scheduledDate: -1 });

    return res.status(200).json({
      success: true,
      data: {
        equipment,
        incidents,
        maintenances,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
};

// @desc    Tạo thiết bị mới
// @route   POST /api/equipments
// @access  Private (Admin, Manager)
exports.createEquipment = async (req, res) => {
  try {
    const { code, name, categoryId, locationId, manufacturer, model, serialNumber, useDate, status, importanceLevel, purchaseCost, specifications, description } = req.body;

    const existing = await Equipment.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: { code: 'EQUIPMENT_CODE_EXISTS', message: `Mã thiết bị [${code}] đã tồn tại trên hệ thống` },
      });
    }

    const equipment = await Equipment.create({
      code: code.toUpperCase(),
      name,
      categoryId,
      locationId,
      manufacturer,
      model,
      serialNumber,
      useDate: useDate || Date.now(),
      status: status || 'active',
      importanceLevel: Number(importanceLevel) || 3,
      purchaseCost: Number(purchaseCost) || 0,
      specifications,
      description,
    });

    const populated = await Equipment.findById(equipment._id)
      .populate('categoryId', 'name code')
      .populate('locationId', 'name building room department');

    return res.status(201).json({
      success: true,
      message: 'Thêm mới thiết bị thành công',
      data: populated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
};

// @desc    Cập nhật thiết bị
// @route   PUT /api/equipments/:id
// @access  Private (Admin, Manager, Technician)
exports.updateEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        error: { code: 'EQUIPMENT_NOT_FOUND', message: 'Không tìm thấy thiết bị' },
      });
    }

    // Nếu sửa mã thiết bị, kiểm tra trùng
    if (req.body.code && req.body.code.toUpperCase() !== equipment.code) {
      const existing = await Equipment.findOne({ code: req.body.code.toUpperCase() });
      if (existing) {
        return res.status(409).json({
          success: false,
          error: { code: 'CODE_EXISTS', message: 'Mã thiết bị đã được sử dụng bởi thiết bị khác' },
        });
      }
      req.body.code = req.body.code.toUpperCase();
    }

    const updated = await Equipment.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('categoryId', 'name code')
      .populate('locationId', 'name building room department');

    return res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin thiết bị thành công',
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
};

// @desc    Xóa thiết bị (hoặc chuyển sang trạng thái ngừng sử dụng)
// @route   DELETE /api/equipments/:id
// @access  Private (Admin, Manager)
exports.deleteEquipment = async (req, res) => {
  try {
    const incidentCount = await Incident.countDocuments({ equipmentId: req.params.id });
    const maintenanceCount = await Maintenance.countDocuments({ equipmentId: req.params.id });

    if (incidentCount > 0 || maintenanceCount > 0) {
      // Chuyển sang decommissioned thay vì xóa cứng theo quy tắc nghiệp vụ BR-04
      const eq = await Equipment.findByIdAndUpdate(
        req.params.id,
        { status: 'decommissioned' },
        { new: true }
      );
      return res.status(200).json({
        success: true,
        message: 'Thiết bị đã có lịch sử sự cố/bảo trì nên được chuyển sang trạng thái [Ngừng sử dụng]',
        data: eq,
      });
    }

    await Equipment.findByIdAndDelete(req.params.id);
    return res.status(200).json({
      success: true,
      message: 'Đã xóa thiết bị thành công',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
};

