const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema(
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
      required: [true, 'Vui lòng chọn thiết bị gặp sự cố'],
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Vui lòng xác định người báo cáo'],
    },
    reportedAt: {
      type: Date,
      default: Date.now,
    },
    title: {
      type: String,
      required: [true, 'Vui lòng nhập tiêu đề sự cố'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Vui lòng nhập mô tả chi tiết sự cố'],
      trim: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'assigned', 'in_progress', 'resolved', 'closed', 'cancelled'],
      default: 'open',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolution: {
      type: String,
      default: '',
    },
    repairCost: {
      type: Number,
      default: 0,
      min: [0, 'Chi phí sửa chữa không thể âm'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Incident', incidentSchema);
