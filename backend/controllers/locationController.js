const Location = require('../models/Location');

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
    const location = await Location.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!location) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy vị trí' } });
    }
    return res.status(200).json({ success: true, message: 'Cập nhật vị trí thành công', data: location });
  } catch (error) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
};

