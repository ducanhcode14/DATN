const mongoose = require('mongoose');

const maintenanceCriterionSchema = new mongoose.Schema(
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
      required: true,
      trim: true,
    },
    weight: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    direction: {
      type: String,
      enum: ['asc', 'desc'],
      default: 'asc', // asc: giá trị càng cao điểm càng cao (thuận chiều)
    },
    minValue: {
      type: Number,
      default: 0,
    },
    maxValue: {
      type: Number,
      default: 100,
    },
    active: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MaintenanceCriterion', maintenanceCriterionSchema);

