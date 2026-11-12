const mongoose = require('mongoose');
const { ensureMongoRunning } = require('./ensureMongo');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/equipment_maintenance';
    
    // Nếu kết nối tới localhost / 127.0.0.1, đảm bảo MongoDB đang chạy trước
    if (mongoUri.includes('127.0.0.1') || mongoUri.includes('localhost')) {
      await ensureMongoRunning(27017);
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`[MongoDB] Kết nối cơ sở dữ liệu thành công: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB] Lỗi kết nối CSDL: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
