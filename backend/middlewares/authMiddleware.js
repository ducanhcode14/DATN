const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'doantotnghiep_buiducanh_secret_key_2026');
      req.user = await User.findById(decoded.id).select('-passwordHash');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: { code: 'USER_NOT_FOUND', message: 'Tài khoản không tồn tại hoặc đã bị xóa' },
        });
      }

      if (req.user.status === 'inactive') {
        return res.status(403).json({
          success: false,
          error: { code: 'ACCOUNT_LOCKED', message: 'Tài khoản đã bị khóa, vui lòng liên hệ Quản trị viên' },
        });
      }

      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn' },
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: 'NO_TOKEN', message: 'Không có quyền truy cập, vui lòng đăng nhập' },
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Vai trò [${req.user ? req.user.role : 'khách'}] không được phép thực hiện chức năng này`,
        },
      });
    }
    next();
  };
};

module.exports = { protect, authorize };

