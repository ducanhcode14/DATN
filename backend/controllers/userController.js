const User = require('../models/User');

// @desc    Lấy danh sách người dùng
// @route   GET /api/users
// @access  Private (Admin)
exports.getUsers = async (req, res) => {
  try {
    const { role, status, search } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter).select('-passwordHash').sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
};

// @desc    Tạo người dùng mới
// @route   POST /api/users
// @access  Private (Admin)
exports.createUser = async (req, res) => {
  try {
    const { username, password, fullName, email, phone, role } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: { code: 'USERNAME_EXISTS', message: 'Tên đăng nhập đã tồn tại trong hệ thống' },
      });
    }

    const user = new User({
      username,
      passwordHash: password || '123456',
      fullName,
      email,
      phone,
      role: role || 'user',
    });

    await user.save();

    const createdUser = await User.findById(user._id).select('-passwordHash');

    return res.status(201).json({
      success: true,
      message: 'Tạo tài khoản người dùng thành công',
      data: createdUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
};

// @desc    Cập nhật người dùng
// @route   PUT /api/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res) => {
  try {
    const { fullName, email, phone, role, status, password } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'Không tìm thấy người dùng' },
      });
    }

    if (fullName) user.fullName = fullName;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (role) user.role = role;
    if (status) user.status = status;
    if (password) {
      user.passwordHash = password; // pre('save') hook will hash it
    }

    await user.save();

    const updatedUser = await User.findById(user._id).select('-passwordHash');

    return res.status(200).json({
      success: true,
      message: 'Cập nhật tài khoản thành công',
      data: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
};
