const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên vị trí / phòng'],
      trim: true,
    },
    building: {
      type: String,
      required: [true, 'Vui lòng nhập tên tòa nhà / khu vực'],
      trim: true,
    },
    room: {
      type: String,
      required: [true, 'Vui lòng nhập số phòng'],
      trim: true,
    },
    department: {
      type: String,
      trim: true,
      default: '',
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

module.exports = mongoose.model('Location', locationSchema);

