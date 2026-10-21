const mongoose = require('mongoose');

const equipmentCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên nhóm thiết bị'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Vui lòng nhập mã nhóm thiết bị'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EquipmentCategory', equipmentCategorySchema);

