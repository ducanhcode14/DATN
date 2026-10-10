const EquipmentCategory = require('../models/EquipmentCategory');

exports.getCategories = async (req, res) => {
  try {
    const categories = await EquipmentCategory.find().sort({ name: 1 });
    return res.status(200).json({ success: true, data: categories });
  } catch (error) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, code, description } = req.body;
    const existing = await EquipmentCategory.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: { code: 'CATEGORY_EXISTS', message: 'Mã nhóm thiết bị đã tồn tại' },
      });
    }

    const category = await EquipmentCategory.create({
      name,
      code: code.toUpperCase(),
      description,
    });

    return res.status(201).json({ success: true, message: 'Tạo nhóm thiết bị thành công', data: category });
  } catch (error) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await EquipmentCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy nhóm thiết bị' } });
    }
    return res.status(200).json({ success: true, message: 'Cập nhật thành công', data: category });
  } catch (error) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};
