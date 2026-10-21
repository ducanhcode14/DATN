const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    equipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
      required: [true, 'Vui lòng chọn thiết bị bảo trì'],
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MaintenancePlan',
      default: null,
    },
    type: {
      type: String,
      enum: ['periodic', 'preventive', 'corrective'],
      default: 'periodic',
    },
    scheduledDate: {
      type: Date,
      default: Date.now,
    },
    performedDate: {
      type: Date,
      default: null,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    content: {
      type: String,
      required: [true, 'Vui lòng nhập nội dung công việc bảo trì'],
      trim: true,
    },
    result: {
      type: String,
      enum: ['pending', 'good', 'fair', 'replaced_parts', 'failed'],
      default: 'pending',
    },
    cost: {
      type: Number,
      default: 0,
      min: [0, 'Chi phí không thể âm'],
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Maintenance', maintenanceSchema);

