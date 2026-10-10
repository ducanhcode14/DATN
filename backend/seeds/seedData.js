require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const EquipmentCategory = require('../models/EquipmentCategory');
const Location = require('../models/Location');
const Equipment = require('../models/Equipment');
const Incident = require('../models/Incident');
const Maintenance = require('../models/Maintenance');
const MaintenancePlan = require('../models/MaintenancePlan');
const MaintenanceCriterion = require('../models/MaintenanceCriterion');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/equipment_maintenance';
    console.log(`[Seed] Đang kết nối tới MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('[Seed] Xóa sạch dữ liệu cũ...');
    await Promise.all([
      User.deleteMany({}),
      EquipmentCategory.deleteMany({}),
      Location.deleteMany({}),
      Equipment.deleteMany({}),
      Incident.deleteMany({}),
      Maintenance.deleteMany({}),
      MaintenancePlan.deleteMany({}),
      MaintenanceCriterion.deleteMany({}),
    ]);

    console.log('[Seed] 1. Khởi tạo 4 tài khoản người dùng mẫu theo vai trò...');
    const salt = await bcrypt.genSalt(10);
    const passHashAdmin = await bcrypt.hash('admin123', salt);
    const passHashManager = await bcrypt.hash('quanly123', salt);
    const passHashTech = await bcrypt.hash('kythuat123', salt);
    const passHashUser = await bcrypt.hash('user123', salt);

    const users = await User.insertMany([
      {
        username: 'admin',
        passwordHash: passHashAdmin,
        fullName: 'Bùi Đức Anh (Admin)',
        email: 'admin@university.edu.vn',
        phone: '0912345678',
        role: 'admin',
        status: 'active',
      },
      {
        username: 'quanly',
        passwordHash: passHashManager,
        fullName: 'Nguyễn Văn Quản Lý',
        email: 'manager@university.edu.vn',
        phone: '0987654321',
        role: 'manager',
        status: 'active',
      },
      {
        username: 'kythuat',
        passwordHash: passHashTech,
        fullName: 'Trần Văn Kỹ Thuật',
        email: 'technician@university.edu.vn',
        phone: '0977889900',
        role: 'technician',
        status: 'active',
      },
      {
        username: 'giangvien',
        passwordHash: passHashUser,
        fullName: 'Lê Thị Giảng Viên',
        email: 'giangvien@university.edu.vn',
        phone: '0933221100',
        role: 'user',
        status: 'active',
      },
    ]);

    const adminUser = users[0];
    const managerUser = users[1];
    const techUser = users[2];
    const normalUser = users[3];

    console.log('[Seed] 2. Khởi tạo 5 nhóm danh mục thiết bị...');
    const categories = await EquipmentCategory.insertMany([
      { name: 'Máy tính để bàn & Laptop', code: 'COMPUTER', description: 'Máy tính PC phòng thực hành, laptop giảng viên' },
      { name: 'Máy chiếu & Màn hình trình chiếu', code: 'PROJECTOR', description: 'Máy chiếu giảng đường, màn hình LED tương tác' },
      { name: 'Thiết bị mạng (Router, Switch, AP)', code: 'NETWORK', description: 'Hạ tầng mạng trường đại học và phòng Lab' },
      { name: 'Thiết bị in ấn (Máy in, Photocopy)', code: 'PRINTER', description: 'Máy in văn phòng khoa, photocopy tài liệu' },
      { name: 'Bộ lưu điện UPS & Nguồn điện', code: 'POWER_UPS', description: 'Bộ lưu điện cho trung tâm dữ liệu và phòng thực hành' },
    ]);

    console.log('[Seed] 3. Khởi tạo 8 vị trí / phòng ban thực tế...');
    const locations = await Location.insertMany([
      { name: 'Phòng Lab Máy tính 01', building: 'Nhà A1', room: 'A1-301', department: 'Khoa CNTT' },
      { name: 'Phòng Lab Máy tính 02', building: 'Nhà A1', room: 'A1-302', department: 'Khoa CNTT' },
      { name: 'Phòng Thực hành Mạng & Viễn thông', building: 'Nhà B2', room: 'B2-402', department: 'Khoa Điện tử - Viễn thông' },
      { name: 'Giảng đường Đa năng A101', building: 'Nhà A1', room: 'A1-101', department: 'Phòng Đào tạo' },
      { name: 'Giảng đường Lớn B201', building: 'Nhà B2', room: 'B2-201', department: 'Phòng Đào tạo' },
      { name: 'Phòng Hội thảo Quốc tế', building: 'Nhà B2', room: 'B2-501', department: 'Ban Giám hiệu' },
      { name: 'Văn phòng Khoa Công nghệ Thông tin', building: 'Nhà A1', room: 'A1-205', department: 'Khoa CNTT' },
      { name: 'Phòng Máy chủ Trung tâm (Data Center)', building: 'Nhà C3', room: 'C3-102', department: 'Trung tâm CNTT' },
    ]);

    console.log('[Seed] 4. Khởi tạo 5 tiêu chí đánh giá ưu tiên bảo trì (C1 - C5)...');
    await MaintenanceCriterion.insertMany([
      { code: 'C1', name: 'Tuổi thiết bị', weight: 20, direction: 'asc', minValue: 0, maxValue: 100, active: true, description: 'Thiết bị sử dụng lâu năm có xu hướng hao mòn và cần bảo trì hơn' },
      { code: 'C2', name: 'Tần suất sự cố', weight: 25, direction: 'asc', minValue: 0, maxValue: 100, active: true, description: 'Số lần phát sinh sự cố trong quá trình vận hành' },
      { code: 'C3', name: 'Thời gian từ lần bảo trì gần nhất', weight: 20, direction: 'asc', minValue: 0, maxValue: 100, active: true, description: 'Khoảng thời gian chưa được bảo dưỡng định kỳ hoặc sửa chữa' },
      { code: 'C4', name: 'Tổng chi phí sửa chữa', weight: 10, direction: 'asc', minValue: 0, maxValue: 100, active: true, description: 'Tổng chi phí bảo dưỡng và sửa chữa đã chi trả' },
      { code: 'C5', name: 'Mức độ quan trọng', weight: 25, direction: 'asc', minValue: 0, maxValue: 100, active: true, description: 'Mức độ ảnh hưởng của thiết bị đối với hoạt động đào tạo, thi cử' },
    ]);

    console.log('[Seed] 5. Khởi tạo 100 thiết bị đa dạng chủng loại...');
    const equipmentsData = [];
    const now = new Date();

    // 100 thiết bị phân bổ theo các phòng và danh mục
    for (let i = 1; i <= 100; i++) {
      let catIndex, locIndex, prefix, name, mfg, model, importance, monthsAgo;

      if (i <= 40) {
        // 40 máy tính PC
        catIndex = 0;
        locIndex = i <= 20 ? 0 : 1; // Lab 1 hoặc Lab 2
        prefix = 'PC';
        name = `Máy tính để bàn Dell OptiPlex ${i <= 20 ? 'Lab 1' : 'Lab 2'} - Máy #${String(i).padStart(2, '0')}`;
        mfg = 'Dell';
        model = i % 2 === 0 ? 'OptiPlex 7090' : 'OptiPlex 3080';
        importance = i % 5 === 0 ? 4 : 3;
        monthsAgo = 6 + (i % 36); // tuổi từ 6 tháng đến 3.5 năm
      } else if (i <= 55) {
        // 15 máy chiếu & màn hình
        catIndex = 1;
        locIndex = (i - 41) % locations.length;
        prefix = 'PRJ';
        name = `Máy chiếu độ nét cao Panasonic - Phòng ${locations[locIndex].room}`;
        mfg = i % 2 === 0 ? 'Panasonic' : 'Sony';
        model = i % 2 === 0 ? 'PT-VMZ51' : 'VPL-CWZ10';
        importance = 5; // Giảng đường cực kỳ quan trọng
        monthsAgo = 8 + (i % 40);
      } else if (i <= 75) {
        // 20 thiết bị mạng (Switch, Router, Wifi AP)
        catIndex = 2;
        locIndex = (i - 56) % locations.length;
        prefix = 'NET';
        name = i <= 65 ? `Switch Cisco Catalyst 24 Port - ${locations[locIndex].name}` : `Router Cisco Gateway Doanh nghiệp #${i - 65}`;
        mfg = 'Cisco';
        model = i <= 65 ? 'Catalyst 2960X' : 'ISR 4331';
        importance = locIndex === 7 ? 5 : 4; // Data center là 5
        monthsAgo = 12 + (i % 48);
      } else if (i <= 88) {
        // 13 máy in & máy photocopy
        catIndex = 3;
        locIndex = (i - 76) % locations.length;
        prefix = 'PRT';
        name = i % 2 === 0 ? `Máy in Canon LBP 2900 - ${locations[locIndex].room}` : `Máy photocopy đa chức năng Ricoh - ${locations[locIndex].department}`;
        mfg = i % 2 === 0 ? 'Canon' : 'Ricoh';
        model = i % 2 === 0 ? 'LBP 2900' : 'MP 3555SP';
        importance = 3;
        monthsAgo = 10 + (i % 30);
      } else {
        // 12 bộ lưu điện UPS
        catIndex = 4;
        locIndex = (i - 89) % locations.length;
        prefix = 'UPS';
        name = `Bộ lưu điện APC Smart-UPS 3000VA - ${locations[locIndex].name}`;
        mfg = 'APC Schneider';
        model = 'SMT3000I';
        importance = locIndex === 7 ? 5 : 4;
        monthsAgo = 14 + (i % 42);
      }

      const useDate = new Date(now.getTime() - monthsAgo * 30 * 24 * 60 * 60 * 1000);
      
      // Ngày bảo trì gần nhất (ngẫu nhiên từ 1 đến 12 tháng trước, một số chưa bảo trì)
      let lastMaintenanceDate = null;
      if (i % 6 !== 0) {
        const lastMaintDaysAgo = 15 + ((i * 13) % 250);
        lastMaintenanceDate = new Date(now.getTime() - lastMaintDaysAgo * 24 * 60 * 60 * 1000);
      }

      // Trạng thái thiết bị
      let status = 'active';
      if (i % 17 === 0) status = 'broken';
      else if (i % 9 === 0) status = 'maintenance_needed';
      else if (i % 23 === 0) status = 'in_repair';

      equipmentsData.push({
        code: `${prefix}-${String(i).padStart(3, '0')}`,
        name,
        categoryId: categories[catIndex]._id,
        locationId: locations[locIndex]._id,
        manufacturer: mfg,
        model,
        serialNumber: `SN-${mfg.substring(0, 3).toUpperCase()}-${20220000 + i}`,
        useDate,
        status,
        importanceLevel: importance,
        lastMaintenanceDate,
        purchaseCost: 8000000 + (i % 10) * 3500000,
        specifications: `Cấu hình tiêu chuẩn đồ án, kiểm định năm ${useDate.getFullYear()}`,
        description: `Thiết bị phục vụ công tác giảng dạy và nghiên cứu tại ${locations[locIndex].name}`,
      });
    }

    const equipments = await Equipment.insertMany(equipmentsData);

    console.log('[Seed] 6. Khởi tạo 170 bản ghi sự cố thực tế...');
    const incidentTitles = [
      'Máy không lên nguồn khi bật',
      'Màn hình xuất hiện sọc xanh, nhấp nháy liên tục',
      'Hỏng cổng kết nối HDMI / VGA',
      'Bàn phím bị liệt một số phím chức năng',
      'Quạt tản nhiệt phát tiếng ồn lớn, máy bị treo đơ',
      'Mất kết nối mạng LAN chập chờn',
      'Máy in bị kẹt giấy liên tục',
      'Mực in bị nhòe và sọc đen trên trang in',
      'Đèn báo nguồn nhấp nháy đỏ báo lỗi phần cứng',
      'Bộ lưu điện phát tiếng kêu bíp liên tục không ngắt',
      'Máy chiếu bị mờ bóng đèn, hiển thị màu ố vàng',
      'Switch mạng bị sập nguồn ngắt kết nối cả phòng',
      'Máy tính bị nhiễm mã độc, tự động restart',
      'Ổ cứng phát tiếng kêu lạch cạch, không boot được OS',
    ];

    const severities = ['low', 'medium', 'high', 'critical'];
    const incidentsData = [];

    for (let j = 1; j <= 170; j++) {
      // Phân bổ: một số thiết bị hỏng nhiều lần (để test C2), một số ít hỏng
      const eqIndex = j <= 50 ? j % 15 : (j * 7) % equipments.length;
      const eq = equipments[eqIndex];
      const title = incidentTitles[j % incidentTitles.length];
      const severity = severities[j % severities.length];

      const daysAgo = 5 + ((j * 11) % 360);
      const reportedAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

      // Trạng thái sự cố
      const isResolved = j % 5 !== 0;
      const status = isResolved ? (j % 2 === 0 ? 'resolved' : 'closed') : (j % 3 === 0 ? 'open' : 'in_progress');
      const resolvedAt = isResolved ? new Date(reportedAt.getTime() + (2 + (j % 5)) * 24 * 60 * 60 * 1000) : null;
      const repairCost = isResolved ? (j % 4 === 0 ? 0 : (200000 + (j % 15) * 150000)) : 0;

      incidentsData.push({
        code: `INC-2026-${String(j).padStart(4, '0')}`,
        equipmentId: eq._id,
        reportedBy: j % 2 === 0 ? normalUser._id : managerUser._id,
        reportedAt,
        title: `${title} (${eq.code})`,
        description: `Người dùng phát hiện ${title.toLowerCase()} trong quá trình sử dụng tại ${eq.name}.`,
        severity,
        status,
        assignedTo: techUser._id,
        resolvedAt,
        resolution: isResolved ? 'Đã kiểm tra linh kiện, vệ sinh chân cắm và thay thế vật tư hỏng, hệ thống đã hoạt động bình thường.' : '',
        repairCost,
      });
    }

    await Incident.insertMany(incidentsData);

    console.log('[Seed] 7. Khởi tạo 120 bản ghi bảo trì định kỳ / sửa chữa...');
    const maintenancesData = [];
    const maintTypes = ['periodic', 'preventive', 'corrective'];
    const maintResults = ['good', 'fair', 'replaced_parts'];

    for (let k = 1; k <= 120; k++) {
      const eqIndex = (k * 3) % equipments.length;
      const eq = equipments[eqIndex];
      const type = maintTypes[k % maintTypes.length];
      const result = maintResults[k % maintResults.length];
      const daysAgo = 10 + ((k * 8) % 300);
      const scheduledDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const performedDate = new Date(scheduledDate.getTime() + 2 * 60 * 60 * 1000);
      const cost = type === 'periodic' ? 150000 : 350000 + (k % 8) * 100000;

      maintenancesData.push({
        code: `MAINT-2026-${String(k).padStart(4, '0')}`,
        equipmentId: eq._id,
        type,
        scheduledDate,
        performedDate,
        performedBy: techUser._id,
        content: `Bảo dưỡng kỹ thuật: Vệ sinh bụi quạt, tra keo tản nhiệt, kiểm tra nguồn điện, test cổng kết nối cho ${eq.code}`,
        result,
        cost,
        notes: 'Thiết bị sau khi bảo trì đạt tiêu chuẩn an toàn kỹ thuật phòng thực hành.',
      });
    }

    await Maintenance.insertMany(maintenancesData);

    console.log('[Seed] 8. Khởi tạo 2 Kế hoạch bảo trì mẫu (Đã hoàn thành & Đang thực hiện)...');
    // Plan 1: Hoàn thành quý 3/2026
    const plan1Items = equipments.slice(0, 10).map((eq, idx) => ({
      equipmentId: eq._id,
      assignedTo: techUser._id,
      scheduledDate: new Date(now.getTime() - (45 - idx * 2) * 24 * 60 * 60 * 1000),
      status: 'completed',
      priorityScore: 78.5,
      priorityLevel: 'high',
      notes: 'Đã hoàn tất bảo trì đợt 1',
    }));

    // Plan 2: Kế hoạch trọng điểm tháng 10/2026 (Đang thực hiện)
    const plan2Items = equipments.slice(10, 22).map((eq, idx) => ({
      equipmentId: eq._id,
      assignedTo: techUser._id,
      scheduledDate: new Date(now.getTime() + (idx * 2) * 24 * 60 * 60 * 1000),
      status: idx < 4 ? 'completed' : idx < 7 ? 'in_progress' : 'pending',
      priorityScore: 84.2 - idx * 1.5,
      priorityLevel: idx < 6 ? 'high' : 'medium',
      notes: 'Bảo trì đợt trước kỳ thi học kỳ',
    }));

    await MaintenancePlan.insertMany([
      {
        code: 'PLAN-2026-Q3',
        name: 'Kế hoạch bảo trì định kỳ Quý 3/2026 hệ thống phòng Lab',
        period: 'Quý 3/2026',
        createdBy: managerUser._id,
        startDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        status: 'completed',
        items: plan1Items,
        notes: 'Đã hoàn thành 10/10 thiết bị phòng Lab 01.',
      },
      {
        code: 'PLAN-2026-Q4',
        name: 'Kế hoạch bảo trì ưu tiên cao Quý 4/2026 giảng đường và Data Center',
        period: 'Quý 4/2026',
        createdBy: managerUser._id,
        startDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000),
        status: 'in_progress',
        items: plan2Items,
        notes: 'Tập trung các máy chiếu giảng đường lớn và switch trung tâm.',
      },
    ]);

    console.log('===============================================================');
    console.log(' ĐÃ KHỞI TẠO XONG TOÀN BỘ CƠ SỞ DỮ LIỆU THỰC NGHIỆM THÀNH CÔNG!');
    console.log('---------------------------------------------------------------');
    console.log(' - 4 Tài khoản người dùng (admin, quanly, kythuat, giangvien)');
    console.log(' - 5 Nhóm danh mục thiết bị');
    console.log(' - 8 Vị trí / Phòng ban');
    console.log(' - 5 Tiêu chí ưu tiên C1 - C5');
    console.log(' - 100 Thiết bị (PC, Máy chiếu, Mạng, Máy in, UPS)');
    console.log(' - 170 Bản ghi sự cố (Incidents)');
    console.log(' - 120 Bản ghi bảo trì (Maintenances)');
    console.log(' - 2 Kế hoạch bảo trì (Maintenance Plans)');
    console.log('===============================================================');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedDatabase();
