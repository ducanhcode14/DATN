const Location = require('../models/Location');
const Equipment = require('../models/Equipment');

exports.getLocations = async (req, res) => {
  try {
    const locations = await Location.find().sort({ building: 1, room: 1 });
    return res.status(200).json({ success: true, data: locations });
  } catch (error) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

exports.createLocation = async (req, res) => {
  try {
    const { name, building, room, department, description } = req.body;
    const location = await Location.create({
      name,
      building,
      room,
      department,
      description,
    });
    return res.status(201).json({ success: true, message: 'Tạo vị trí thành công', data: location });
  } catch (error) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

exports.updateLocation = async (req, res) => {
  try {
    const { name, building, room, department, description } = req.body;
    const location = await Location.findByIdAndUpdate(
      req.params.id,
      { name, building, room, department, description },
      { new: true, runValidators: true }
    );
    if (!location) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy vị trí' } });
    }
    return res.status(200).json({ success: true, message: 'Cập nhật vị trí thành công', data: location });
  } catch (error) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

exports.deleteLocation = async (req, res) => {
  try {
    const inUseCount = await Equipment.countDocuments({ locationId: req.params.id });
    if (inUseCount > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'LOCATION_IN_USE',
          message: `Không thể xóa vị trí/phòng này vì đang có ${inUseCount} thiết bị đặt tại đây. Hãy chuyển thiết bị sang vị trí khác trước.`,
        },
      });
    }

    const location = await Location.findByIdAndDelete(req.params.id);
    if (!location) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy vị trí' } });
    }
    return res.status(200).json({ success: true, message: 'Xóa vị trí thành công' });
  } catch (error) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};
