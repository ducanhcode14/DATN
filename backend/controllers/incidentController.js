const Incident = require('../models/Incident');
const Equipment = require('../models/Equipment');

// @desc    Lấy danh sách sự cố
// @route   GET /api/incidents
// @access  Private
exports.getIncidents = async (req, res) => {
  try {
    const { status, severity, equipmentId, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (equipmentId) filter.equipmentId = equipmentId;

    if (search) {
      filter.$or = [
        { code: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Incident.countDocuments(filter);
    const incidents = await Incident.find(filter)
      .populate('equipmentId', 'code name status locationId')
      .populate('reportedBy', 'fullName username')
      .populate('assignedTo', 'fullName username')
      .sort({ reportedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      data: incidents,
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

// @desc    Lấy chi tiết một sự cố
// @route   GET /api/incidents/:id
// @access  Private
exports.getIncidentById = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate('equipmentId')
      .populate('reportedBy', 'fullName username email phone')
      .populate('assignedTo', 'fullName username email phone');

    if (!incident) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Không tìm thấy thông tin sự cố' },
      });
    }

    return res.status(200).json({
      success: true,
      data: incident,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
};

// @desc    Ghi nhận báo cáo sự cố mới
// @route   POST /api/incidents
// @access  Private
exports.createIncident = async (req, res) => {
  try {
    const { equipmentId, title, description, severity } = req.body;

    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        error: { code: 'EQUIPMENT_NOT_FOUND', message: 'Thiết bị không tồn tại' },
      });
    }

    // Tự sinh mã sự cố theo năm INC-2026-XXXX
    const count = await Incident.countDocuments();
    const year = new Date().getFullYear();
    const code = `INC-${year}-${String(count + 1).padStart(4, '0')}`;

    const incident = await Incident.create({
      code,
      equipmentId,
      reportedBy: req.user._id,
      title,
      description,
      severity: severity || 'medium',
      status: 'open',
    });

    // Cập nhật trạng thái thiết bị sang 'in_repair' hoặc 'broken' hoặc 'maintenance_needed'
    if (equipment.status === 'active') {
      const newStatus = severity === 'critical' || severity === 'high' ? 'broken' : 'maintenance_needed';
      await Equipment.findByIdAndUpdate(equipmentId, { status: newStatus });
    }

    const populated = await Incident.findById(incident._id)
      .populate('equipmentId', 'code name status')
      .populate('reportedBy', 'fullName username');

    return res.status(201).json({
      success: true,
      message: 'Ghi nhận sự cố thành công',
      data: populated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
};

// @desc    Tiếp nhận / Cập nhật xử lý sự cố / Đóng sự cố
// @route   PATCH /api/incidents/:id
// @access  Private (Admin, Manager, Technician)
exports.updateIncident = async (req, res) => {
  try {
    const { status, assignedTo, resolution, repairCost, updateEquipmentStatus } = req.body;
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Không tìm thấy sự cố' },
      });
    }

    if (status) incident.status = status;
    if (assignedTo !== undefined) incident.assignedTo = assignedTo;
    if (resolution !== undefined) incident.resolution = resolution;
    if (repairCost !== undefined) incident.repairCost = Number(repairCost);

    if (status === 'resolved' || status === 'closed') {
      if (!incident.resolvedAt) {
        incident.resolvedAt = new Date();
      }
      // Khôi phục trạng thái thiết bị nếu yêu cầu hoặc mặc định khi xử lý xong
      if (updateEquipmentStatus) {
        await Equipment.findByIdAndUpdate(incident.equipmentId, { status: updateEquipmentStatus });
      } else {
        await Equipment.findByIdAndUpdate(incident.equipmentId, { status: 'active' });
      }
    }

    await incident.save();

    const populated = await Incident.findById(incident._id)
      .populate('equipmentId', 'code name status')
      .populate('reportedBy', 'fullName username')
      .populate('assignedTo', 'fullName username');

    return res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái sự cố thành công',
      data: populated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
};
