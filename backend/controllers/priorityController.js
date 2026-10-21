const priorityService = require('../services/priorityService');
const MaintenanceCriterion = require('../models/MaintenanceCriterion');

// @desc    Tính toán và đánh giá mức độ ưu tiên bảo trì
// @route   POST /api/priority/evaluate
// @access  Private (Admin, Manager)
exports.evaluatePriority = async (req, res) => {
  try {
    const { categoryId, locationId, status, weights } = req.body;
    const filter = {};
    if (categoryId) filter.categoryId = categoryId;
    if (locationId) filter.locationId = locationId;
    if (status) filter.status = status;

    const ranking = await priorityService.evaluateEquipmentPriority(filter, weights);

    // Thống kê phân bổ theo mức ưu tiên
    const stats = {
      total: ranking.length,
      high: ranking.filter((r) => r.priorityLevel === 'high').length,
      medium: ranking.filter((r) => r.priorityLevel === 'medium').length,
      low: ranking.filter((r) => r.priorityLevel === 'low').length,
      averageScore: ranking.length
        ? Math.round((ranking.reduce((acc, r) => acc + r.priorityScore, 0) / ranking.length) * 100) / 100
        : 0,
    };

    return res.status(200).json({
      success: true,
      message: 'Tính toán mức độ ưu tiên thành công',
      data: {
        ranking,
        stats,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
};

// @desc    Lấy bảng xếp hạng ưu tiên hiện tại
// @route   GET /api/priority/ranking
// @access  Private (Admin, Manager)
exports.getRanking = async (req, res) => {
  try {
    const { minScore = 0, level } = req.query;
    let ranking = await priorityService.evaluateEquipmentPriority();

    if (minScore) {
      ranking = ranking.filter((r) => r.priorityScore >= Number(minScore));
    }
    if (level) {
      ranking = ranking.filter((r) => r.priorityLevel === level);
    }

    return res.status(200).json({
      success: true,
      data: ranking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
};

// @desc    Lấy danh sách thiết bị được đề xuất bảo trì (Mức Cao >= 70 và Trung Bình >= 40)
// @route   GET /api/priority/recommended
// @access  Private (Admin, Manager)
exports.getRecommended = async (req, res) => {
  try {
    const ranking = await priorityService.evaluateEquipmentPriority();
    const recommended = ranking.filter((r) => r.priorityLevel === 'high' || r.priorityLevel === 'medium');

    return res.status(200).json({
      success: true,
      data: recommended,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
};

// @desc    Lấy danh mục các tiêu chí C1 - C5 và trọng số
// @route   GET /api/priority/criteria
// @access  Private
exports.getCriteria = async (req, res) => {
  try {
    const criteria = await MaintenanceCriterion.find().sort({ code: 1 });
    return res.status(200).json({
      success: true,
      data: criteria,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
};

// @desc    Cập nhật trọng số của tiêu chí C1 - C5
// @route   PUT /api/priority/criteria
// @access  Private (Admin, Manager)
exports.updateCriteriaWeights = async (req, res) => {
  try {
    const { weights } = req.body; // e.g. { C1: 20, C2: 25, C3: 20, C4: 10, C5: 25 }

    if (!weights) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_DATA', message: 'Vui lòng cung cấp danh sách trọng số' },
      });
    }

    const totalWeight = Object.values(weights).reduce((a, b) => Number(a) + Number(b), 0);
    if (Math.round(totalWeight) !== 100) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_WEIGHT_SUM', message: `Tổng trọng số các tiêu chí phải bằng 100% (Hiện tại: ${totalWeight}%)` },
      });
    }

    for (const [code, weight] of Object.entries(weights)) {
      await MaintenanceCriterion.findOneAndUpdate({ code }, { weight: Number(weight) });
    }

    const updatedCriteria = await MaintenanceCriterion.find().sort({ code: 1 });

    return res.status(200).json({
      success: true,
      message: 'Cập nhật trọng số thành công',
      data: updatedCriteria,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
};

