const Equipment = require('../models/Equipment');
const Incident = require('../models/Incident');
const Maintenance = require('../models/Maintenance');
const MaintenanceCriterion = require('../models/MaintenanceCriterion');

/**
 * Service tính điểm đánh giá mức độ ưu tiên bảo trì thiết bị
 * Áp dụng phương pháp đánh giá đa tiêu chí (MCDA) với chuẩn hóa Min-Max
 * Tiêu chí C1 - C5 theo chuẩn đặc tả Đồ án tốt nghiệp
 */
class PriorityService {
  /**
   * Lấy cấu hình trọng số từ CSDL hoặc dùng mặc định
   */
  async getWeights() {
    const criteria = await MaintenanceCriterion.find({ active: true });
    const defaultWeights = {
      C1: 20, // Tuổi thiết bị
      C2: 25, // Tần suất sự cố
      C3: 20, // Thời gian từ lần bảo trì gần nhất
      C4: 10, // Chi phí sửa chữa/bảo trì
      C5: 25, // Mức độ quan trọng
    };

    if (!criteria || criteria.length === 0) {
      return defaultWeights;
    }

    const weights = {};
    criteria.forEach((c) => {
      weights[c.code] = c.weight;
    });

    return { ...defaultWeights, ...weights };
  }

  /**
   * Đánh giá và xếp hạng ưu tiên bảo trì cho tập thiết bị
   * @param {Object} filter - Điều kiện lọc thiết bị (categoryId, locationId, status, ...)
   * @param {Object} customWeights - Trọng số tùy biến nếu người dùng muốn mô phỏng
   */
  async evaluateEquipmentPriority(filter = {}, customWeights = null) {
    // Chỉ đánh giá các thiết bị chưa ngừng sử dụng
    const query = {
      status: { $ne: 'decommissioned' },
      ...filter,
    };

    const equipments = await Equipment.find(query)
      .populate('categoryId', 'name code')
      .populate('locationId', 'name building room department')
      .lean();

    if (equipments.length === 0) {
      return [];
    }

    const equipmentIds = equipments.map((e) => e._id);

    // Lấy thống kê sự cố theo từng thiết bị
    const incidentStats = await Incident.aggregate([
      { $match: { equipmentId: { $in: equipmentIds } } },
      {
        $group: {
          _id: '$equipmentId',
          count: { $sum: 1 },
          totalRepairCost: { $sum: { $ifNull: ['$repairCost', 0] } },
        },
      },
    ]);

    // Lấy thống kê bảo trì theo từng thiết bị
    const maintenanceStats = await Maintenance.aggregate([
      { $match: { equipmentId: { $in: equipmentIds } } },
      {
        $group: {
          _id: '$equipmentId',
          count: { $sum: 1 },
          totalMaintenanceCost: { $sum: { $ifNull: ['$cost', 0] } },
          latestMaintenanceDate: { $max: { $ifNull: ['$performedDate', '$scheduledDate'] } },
        },
      },
    ]);

    const incidentMap = new Map();
    incidentStats.forEach((stat) => {
      incidentMap.set(stat._id.toString(), stat);
    });

    const maintenanceMap = new Map();
    maintenanceStats.forEach((stat) => {
      maintenanceMap.set(stat._id.toString(), stat);
    });

    const now = new Date();

    // Bước 1: Tính toán các giá trị thô (Raw values)
    const rawData = equipments.map((eq) => {
      const eqIdStr = eq._id.toString();
      const inc = incidentMap.get(eqIdStr) || { count: 0, totalRepairCost: 0 };
      const maint = maintenanceMap.get(eqIdStr) || { count: 0, totalMaintenanceCost: 0, latestMaintenanceDate: null };

      // C1: Tuổi thiết bị (tính theo ngày)
      const useDate = eq.useDate ? new Date(eq.useDate) : now;
      const ageDays = Math.max(0, Math.floor((now - useDate) / (1000 * 60 * 60 * 24)));

      // C2: Tần suất sự cố (tổng số lần hỏng)
      const incidentCount = inc.count;

      // C3: Thời gian từ lần bảo trì gần nhất (ngày).
      // Nếu có ngày bảo trì gần nhất (ở thiết bị hoặc lịch sử bảo trì), tính từ ngày đó; nếu chưa từng bảo trì, tính từ ngày đưa vào sử dụng
      const lastMaint = eq.lastMaintenanceDate || maint.latestMaintenanceDate || eq.useDate || now;
      const daysSinceLastMaint = Math.max(0, Math.floor((now - new Date(lastMaint)) / (1000 * 60 * 60 * 24)));

      // C4: Tổng chi phí sửa chữa + chi phí bảo trì
      const totalCost = (inc.totalRepairCost || 0) + (maint.totalMaintenanceCost || 0);

      // C5: Mức độ quan trọng (1 - 5)
      const importanceLevel = eq.importanceLevel || 3;

      return {
        equipment: eq,
        raw: {
          C1: ageDays,
          C2: incidentCount,
          C3: daysSinceLastMaint,
          C4: totalCost,
          C5: importanceLevel,
        },
      };
    });

    // Bước 2: Tìm Min - Max cho từng tiêu chí để chuẩn hóa
    const keys = ['C1', 'C2', 'C3', 'C4', 'C5'];
    const minMax = {};

    keys.forEach((k) => {
      const values = rawData.map((d) => d.raw[k]);
      minMax[k] = {
        min: Math.min(...values),
        max: Math.max(...values),
      };
    });

    // Lấy trọng số W1 - W5
    const weights = customWeights || (await this.getWeights());
    const totalWeight = keys.reduce((sum, k) => sum + (weights[k] || 0), 0) || 100;

    // Bước 3: Chuẩn hóa Min-Max (về thang 0 - 100) và tính điểm tổng Priority Score
    const evaluatedList = rawData.map((item) => {
      const normalized = {};

      keys.forEach((k) => {
        const val = item.raw[k];
        const { min, max } = minMax[k];

        if (max > min) {
          // Chuẩn hóa thuận chiều: giá trị càng cao điểm càng cao
          normalized[k] = Math.round(((val - min) / (max - min)) * 100 * 100) / 100;
        } else {
          // Trường hợp min == max (ví dụ tất cả thiết bị đều có cùng giá trị)
          normalized[k] = 50;
        }
      });

      // Điểm tổng có trọng số: W1*C1 + W2*C2 + W3*C3 + W4*C4 + W5*C5
      let priorityScore = 0;
      keys.forEach((k) => {
        const w = (weights[k] || 0) / totalWeight;
        priorityScore += normalized[k] * w;
      });

      priorityScore = Math.round(priorityScore * 100) / 100;

      // Phân loại mức ưu tiên (Theo đặc tả BR-08)
      let priorityLevel = 'low';
      let priorityLabel = 'Thấp';
      if (priorityScore >= 70) {
        priorityLevel = 'high';
        priorityLabel = 'Cao';
      } else if (priorityScore >= 40) {
        priorityLevel = 'medium';
        priorityLabel = 'Trung bình';
      }

      return {
        equipmentId: item.equipment._id,
        code: item.equipment.code,
        name: item.equipment.name,
        category: item.equipment.categoryId?.name || 'Chưa phân nhóm',
        location: item.equipment.locationId
          ? `${item.equipment.locationId.name} (${item.equipment.locationId.building} - ${item.equipment.locationId.room})`
          : 'Chưa đặt',
        status: item.equipment.status,
        rawValues: {
          ageDays: item.raw.C1,
          ageMonths: Math.round((item.raw.C1 / 30) * 10) / 10,
          incidentCount: item.raw.C2,
          daysSinceLastMaintenance: item.raw.C3,
          totalCost: item.raw.C4,
          importanceLevel: item.raw.C5,
        },
        normalizedScores: normalized,
        priorityScore,
        priorityLevel,
        priorityLabel,
        weightsUsed: weights,
        recommendation:
          priorityScore >= 70
            ? 'Cần đưa vào kế hoạch bảo trì ngay lập tức'
            : priorityScore >= 40
            ? 'Cần bảo trì định kỳ trong đợt tiếp theo'
            : 'Thiết bị hoạt động ổn định, tiếp tục theo dõi',
      };
    });

    // Sắp xếp giảm dần theo điểm ưu tiên (cao nhất lên đầu)
    evaluatedList.sort((a, b) => b.priorityScore - a.priorityScore);

    // Gán thứ hạng (Rank)
    evaluatedList.forEach((item, index) => {
      item.rank = index + 1;
    });

    return evaluatedList;
  }
}

module.exports = new PriorityService();
