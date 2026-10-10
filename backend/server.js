require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Khởi tạo app
const app = express();

// Kết nối cơ sở dữ liệu MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Khai báo Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/equipment-categories', require('./routes/categoryRoutes'));
app.use('/api/locations', require('./routes/locationRoutes'));
app.use('/api/equipments', require('./routes/equipmentRoutes'));
app.use('/api/incidents', require('./routes/incidentRoutes'));
app.use('/api/maintenances', require('./routes/maintenanceRoutes'));
app.use('/api/priority', require('./routes/priorityRoutes'));
app.use('/api/maintenance-plans', require('./routes/planRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// Route kiểm tra trạng thái API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Hệ thống Quản lý và Hỗ trợ Lập kế hoạch Bảo trì Thiết bị đang hoạt động bình thường',
    timestamp: new Date().toISOString(),
  });
});

// Xử lý lỗi không tìm thấy endpoint
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Không tìm thấy endpoint: ${req.method} ${req.originalUrl}`,
    },
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Error Stack]', err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'Đã xảy ra lỗi trên máy chủ',
    },
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` Máy chủ Backend đang chạy tại: http://localhost:${PORT}`);
  console.log(` Môi trường: ${process.env.NODE_ENV || 'development'}`);
  console.log(`====================================================`);
});
