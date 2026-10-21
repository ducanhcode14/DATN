const mongoose = require('mongoose');

const maintenancePlanItemSchema = new mongoose.Schema({
  equipmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment',
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  scheduledDate: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'skipped'],
    default: 'pending',
  },
  maintenanceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Maintenance',
    default: null,
  },
  priorityScore: {
    type: Number,
    default: 0,
  },
  priorityLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  notes: {
    type: String,
    default: '',
  },
});

const maintenancePlanSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên kế hoạch bảo trì'],
      trim: true,
    },
    period: {
      type: String,
      required: [true, 'Vui lòng nhập kỳ bảo trì (ví dụ: Quý 4/2026)'],
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Vui lòng chọn ngày bắt đầu'],
    },
    endDate: {
      type: Date,
      required: [true, 'Vui lòng chọn ngày kết thúc'],
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'in_progress', 'completed', 'cancelled'],
      default: 'draft',
    },
    items: [maintenancePlanItemSchema],
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MaintenancePlan', maintenancePlanSchema);

