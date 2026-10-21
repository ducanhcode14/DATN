const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Vui lòng nhập mã thiết bị'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên thiết bị'],
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EquipmentCategory',
      required: [true, 'Vui lòng chọn nhóm thiết bị'],
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      required: [true, 'Vui lòng chọn vị trí thiết bị'],
    },
    manufacturer: {
      type: String,
      trim: true,
      default: '',
    },
    model: {
      type: String,
      trim: true,
      default: '',
    },
    serialNumber: {
      type: String,
      trim: true,
      default: '',
    },
    useDate: {
      type: Date,
      required: [true, 'Vui lòng nhập ngày đưa vào sử dụng'],
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['active', 'maintenance_needed', 'in_repair', 'broken', 'decommissioned'],
      default: 'active',
    },
    importanceLevel: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
      required: true,
    },
    lastMaintenanceDate: {
      type: Date,
      default: null,
    },
    nextMaintenanceDate: {
      type: Date,
      default: null,
    },
    purchaseCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    specifications: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Equipment', equipmentSchema);

