# HỆ THỐNG QUẢN LÝ VÀ HỖ TRỢ LẬP KẾ HOẠCH BẢO TRÌ THIẾT BỊ
**Đề tài Đồ án tốt nghiệp**  
**Sinh viên thực hiện:** Bùi Đức Anh  
**Ngăn xếp công nghệ:** React.js, Node.js (Express.js), MongoDB, Tailwind CSS, Recharts

---

## 1. Giới thiệu Đề tài
Hệ thống quản lý và hỗ trợ lập kế hoạch bảo trì thiết bị giải quyết trọn vẹn bài toán quản lý tài sản, theo dõi tình trạng, ghi nhận sự cố, quản lý lịch sử bảo dưỡng và đặc biệt là **tự động tính điểm đánh giá mức độ ưu tiên bảo trì bằng phương pháp ra quyết định đa tiêu chí (MCDA C1 - C5)** trong môi trường trường đại học (phòng máy tính, phòng học, phòng chức năng, trung tâm dữ liệu).

### Các tính năng cốt lõi:
1. **Quản lý thiết bị tập trung:** Mã hóa duy nhất, theo dõi vị trí tòa nhà/phòng, phân loại danh mục, ngày bắt đầu sử dụng, tình trạng hoạt động và mức độ quan trọng.
2. **Quản lý & Xử lý sự cố (Incidents):** Cho phép giảng viên/người dùng báo hỏng, hỗ trợ kỹ thuật viên tiếp nhận, phân công xử lý, ghi nhận nguyên nhân, giải pháp và chi phí sửa chữa.
3. **Quản lý lịch sử bảo trì (Maintenances):** Lưu vết toàn bộ hoạt động bảo dưỡng định kỳ, phòng ngừa và sửa chữa; tự động cập nhật ngày bảo trì gần nhất của thiết bị khi hoàn tất.
4. **Thuật toán Đánh giá Mức độ Ưu tiên Bảo trì (MCDA C1 - C5):**
   - $C_1$: Tuổi thiết bị (số tháng/ngày tính từ `useDate`).
   - $C_2$: Tần suất sự cố (tổng số lần hỏng hóc trong lịch sử).
   - $C_3$: Thời gian từ lần bảo trì gần nhất (ngày kể từ `lastMaintenanceDate` hoặc `useDate`).
   - $C_4$: Tổng chi phí sửa chữa và bảo dưỡng đã phát sinh.
   - $C_5$: Mức độ quan trọng của thiết bị đối với hoạt động đào tạo (1 - 5).
   - **Chuẩn hóa Min-Max:** $S_i = 100 \times \frac{x_i - \min}{\max - \min}$.
   - **Tính điểm tổng hợp (Priority Score):** $\text{PriorityScore} = \sum_{i=1}^5 (S_i \times W_i)$ với $\sum W_i = 100\%$.
   - **Phân loại ưu tiên:**
     - **Cao (High):** Điểm $\ge 70$ $\rightarrow$ Đề xuất bảo trì khẩn / ưu tiên hàng đầu.
     - **Trung bình (Medium):** $40 \le$ Điểm $< 70$ $\rightarrow$ Xem xét đưa vào kế hoạch định kỳ.
     - **Thấp (Low):** Điểm $< 40$ $\rightarrow$ Thiết bị hoạt động ổn định.
5. **Hỗ trợ Lập kế hoạch bảo trì:** Tự động lọc thiết bị ưu tiên cao, hỗ trợ 1-click tạo kế hoạch bảo trì, phân công kỹ thuật viên và theo dõi tiến độ hoàn thành.
6. **Dashboard & Báo cáo:** Biểu đồ phân bổ mức độ ưu tiên, chủng loại thiết bị, thống kê chi phí, cùng 7 mẫu báo cáo chuyên nghiệp có thể in/kết xuất PDF.
7. **Phân quyền người dùng (RBAC):** 4 vai trò rõ ràng:
   - **Quản trị viên (Admin):** Toàn quyền hệ thống, quản lý tài khoản người dùng.
   - **Người quản lý thiết bị (Manager):** Quản lý thiết bị, sự cố, chạy thuật toán ưu tiên, lập kế hoạch bảo trì, xem báo cáo.
   - **Nhân viên kỹ thuật (Technician):** Tiếp nhận xử lý sự cố, thực hiện bảo trì, cập nhật kết quả và chi phí.
   - **Người sử dụng (User / Giảng viên):** Tra cứu thiết bị, gửi báo cáo sự cố.

---

## 2. Tài khoản Mẫu Phục vụ Demo Bảo vệ Đồ án

| Vai trò | Tên đăng nhập | Mật khẩu | Chức năng chính |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin` | `admin123` | Quản trị người dùng, cấu hình tiêu chí C1-C5, toàn quyền |
| **Quản lý thiết bị** | `quanly` | `quanly123` | Đánh giá ưu tiên, lập kế hoạch bảo trì, xem dashboard/báo cáo |
| **Kỹ thuật viên** | `kythuat` | `kythuat123` | Cập nhật xử lý sự cố, thực hiện bảo trì, cập nhật tiến độ |
| **Giảng viên / Người dùng** | `giangvien` | `user123` | Xem thiết bị, gửi báo cáo sự cố khi thiết bị phòng học hỏng |

*(Trên giao diện web có thanh đổi vai trò nhanh 1-click giúp việc thuyết trình bảo vệ đồ án diễn ra liền mạch).*

---

## 3. Cấu trúc Dự án

```
d:\doantotnghiep\
├── backend/
│   ├── config/
│   │   └── db.js                 # Kết nối MongoDB cục bộ
│   ├── controllers/              # Bộ điều khiển RESTful API
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── categoryController.js
│   │   ├── locationController.js
│   │   ├── equipmentController.js
│   │   ├── incidentController.js
│   │   ├── maintenanceController.js
│   │   ├── priorityController.js # API thuật toán C1-C5
│   │   ├── planController.js     # API kế hoạch bảo trì
│   │   ├── dashboardController.js
│   │   └── reportController.js
│   ├── models/                   # 8 Mongoose Models theo đặc tả SRS
│   │   ├── User.js
│   │   ├── EquipmentCategory.js
│   │   ├── Location.js
│   │   ├── Equipment.js
│   │   ├── Incident.js
│   │   ├── Maintenance.js
│   │   ├── MaintenancePlan.js
│   │   └── MaintenanceCriterion.js
│   ├── middlewares/
│   │   └── authMiddleware.js     # Xác thực JWT & phân quyền RBAC
│   ├── routes/                   # Khai báo các endpoints
│   ├── services/
│   │   └── priorityService.js    # Logic thuật toán chuẩn hóa Min-Max
│   ├── seeds/
│   │   └── seedData.js           # Bộ dữ liệu thực nghiệm: 100 TB, 170 SC, 120 BT
│   ├── .env
│   ├── server.js                 # Entrypoint Backend Express (Port 5000)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosClient.js    # Cấu hình Axios & Bearer Token
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Quản lý phiên và quyền người dùng
│   │   ├── components/           # Navbar, Sidebar, Layout, Badges
│   │   ├── pages/                # Các màn hình nghiệp vụ
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Equipments.jsx
│   │   │   ├── EquipmentDetail.jsx
│   │   │   ├── Incidents.jsx
│   │   │   ├── PriorityEvaluation.jsx # Giao diện thuật toán MCDA
│   │   │   ├── MaintenancePlans.jsx
│   │   │   ├── Maintenances.jsx
│   │   │   ├── CategoriesAndLocations.jsx
│   │   │   ├── Reports.jsx
│   │   │   └── Users.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vite.config.js            # Reverse proxy tới backend /api
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

---

## 4. Hướng dẫn Chạy Hệ thống trên Terminal VS Code

### Cách 1: Chạy tất cả bằng 1 lệnh duy nhất (Khuyên dùng)
Mở Terminal trong VS Code tại thư mục gốc `d:\doantotnghiep` và gõ:
```bash
npm start
```
*(Hệ thống sẽ tự động kiểm tra MongoDB, tự động khởi động MongoDB nếu chưa chạy, sau đó chạy đồng thời Backend và Frontend).*

---

### Cách 2: Chạy riêng từng Terminal (Split Terminal trong VS Code)
Nếu muốn xem riêng log của từng bên:

- **Terminal 1 (Backend):**
  ```bash
  cd backend
  npm start
  ```
  *(Backend chạy tại `http://localhost:5000`. Cơ chế thông minh sẽ tự động bật MongoDB nếu cổng 27017 chưa mở).*

- **Terminal 2 (Frontend):**
  ```bash
  cd frontend
  npm run dev
  ```
  *(Frontend chạy tại `http://localhost:3000`).*

Truy cập trình duyệt: **`http://localhost:3000`**

---

## 5. Checklist Trình bày Bảo vệ Đồ án (Phụ lục D)
1. **Bài toán thực tế:** Thiết bị phân tán, hỏng hóc đột xuất gây gián đoạn thi cử/học tập, nguồn lực bảo trì có hạn.
2. **Mô hình 4 tác nhân:** Quản trị viên, Quản lý thiết bị, Kỹ thuật viên, Người sử dụng.
3. **8 nhóm dữ liệu:** Users, Categories, Locations, Equipments, Incidents, Maintenances, Plans, Criteria.
4. **Giải thích thuật toán:**
   - 5 tiêu chí C1 - C5 có đơn vị khác nhau (ngày, lần, VNĐ, điểm 1-5).
   - Vì sao cần chuẩn hóa Min-Max: đưa tất cả về cùng thang điểm $[0, 100]$.
   - Công thức tổng có trọng số: linh hoạt thay đổi tỷ trọng tùy giai đoạn quản lý (ví dụ: mùa thi tăng trọng số $C_5$, thiết bị cũ tăng $C_1$).
   - Kết quả điểm chỉ đóng vai trò **Hỗ trợ quyết định (Decision Support)**, người quản lý vẫn có thẩm quyền phê duyệt cuối cùng.
5. **Kịch bản Demo trực quan:**
   - Đăng nhập `quanly` $\rightarrow$ Xem Dashboard KPI và biểu đồ.
   - Mở màn hình **Đánh giá ưu tiên** $\rightarrow$ Kéo thử thanh trượt trọng số $W_1-W_5$ để thấy điểm số thay đổi tự động.
   - Nhấn **Lập kế hoạch bảo trì** từ các thiết bị ưu tiên cao $\rightarrow$ Chuyển sang màn hình Kế hoạch.
   - Đổi vai trò sang `kythuat` $\rightarrow$ Cập nhật hoàn thành 1 thiết bị $\rightarrow$ Kiểm tra thấy ngày bảo trì gần nhất và trạng thái thiết bị được cập nhật tự động (BR-06).

