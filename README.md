# HỆ THỐNG QUẢN LÝ VÀ HỖ TRỢ LẬP KẾ HOẠCH BẢO TRÌ THIẾT BỊ
### 👨‍🎓 Thông tin tác giả & Đề tài
* **Sinh viên thực hiện:** **Bùi Đức Anh**
* **Mã số sinh viên (MSSV):** `1150080126`
* **Lớp:** `11_ĐH_THMT` — **Khóa:** 11 (Niên khóa 2022 – 2026)

## Yêu cầu Hệ thống

| Phần mềm / Công cụ | Phiên bản khuyến nghị | Mục đích sử dụng |
| :--- | :--- | :--- |
| **Node.js** | `>= 18.x` hoặc `>= 20.x` (LTS) | Môi trường thực thi JavaScript cho Backend & Frontend |
| **npm** | `>= 9.x` hoặc `>= 10.x` | Trình quản lý gói thư viện (đi kèm Node.js) |
| **MongoDB** | `>= 5.0` (Khuyên dùng v7.0 hoặc v8.0) | Hệ quản trị cơ sở dữ liệu NoSQL (hoặc dùng MongoDB Atlas) |
| **Git** *(Tùy chọn)* | `>= 2.x` | Quản lý mã nguồn |
| **Trình duyệt Web** | Chrome, Edge, Firefox, Brave |


## Hướng dẫn Cài đặt & Cấu hình chi tiết

### Bước 1: Mở thư mục dự án
Mở terminal tại thư mục gốc của đồ án:
```bash
cd d:\doantotnghiep
```

### Bước 2: Cài đặt thư viện phụ thuộc (Dependencies)

Hệ thống gồm 2 thành phần độc lập: **Backend (Node.js/Express)** và **Frontend (React/Vite)**. Bạn có thể cài đặt cho cả hai phân hệ theo một trong hai cách:

#### Cách 2.1: Cài đặt tự động bằng 1 dòng lệnh (Khuyên dùng):
```bash
cd backend && npm install && cd ../frontend && npm install && cd ..
```

#### Cách 2.2: Cài đặt riêng từng thư mục:
* **Cài đặt Backend:**
  ```bash
  cd d:\doantotnghiep\backend
  npm install
  ```
  *(Các gói chính: `express@5`, `mongoose@9`, `bcryptjs`, `jsonwebtoken`, `cors`, `dotenv`, `morgan`)*

* **Cài đặt Frontend:**
  ```bash
  cd d:\doantotnghiep\frontend
  npm install
  ```
  *(Các gói chính: `react@19`, `vite@8`, `tailwindcss@3`, `react-router-dom@7`, `recharts`, `lucide-react`, `axios`)*

---

### Bước 3: Cấu hình biến môi trường (.env)

Hệ thống đã có sẵn file cấu hình mẫu tại `backend/.env.example` và file chạy thực tế tại `backend/.env`.

1. Kiểm tra hoặc tạo file `backend/.env`:
   ```env
   # Cổng chạy dịch vụ Backend API
   PORT=5000

   # Chuỗi kết nối MongoDB (Mặc định dùng cơ sở dữ liệu cục bộ)
   MONGODB_URI=mongodb://127.0.0.1:27017/equipment_maintenance

   # Khóa bí mật ký mã thông báo xác thực JWT
   JWT_SECRET=doantotnghiep_buiducanh_secret_key_2026

   # Môi trường chạy ứng dụng
   NODE_ENV=development
   ```

2. **Nếu muốn sử dụng MongoDB Atlas (Đám mây):**  
   Chỉ cần thay giá trị `MONGODB_URI` bằng chuỗi kết nối từ MongoDB Atlas:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/equipment_maintenance?retryWrites=true&w=majority
   ```

---

### Bước 4: Khởi tạo dữ liệu thực nghiệm (Database Seeding)

Dự án đã chuẩn bị sẵn bộ dữ liệu thực nghiệm mẫu phong phú, mô phỏng chân thực quy mô cơ sở vật chất của một trường đại học:
* **4 Tài khoản người dùng mẫu** theo đúng 4 vai trò.
* **5 Nhóm danh mục thiết bị:** Máy tính & Laptop, Máy chiếu & Màn hình, Thiết bị mạng, Máy in ấn, Bộ lưu điện UPS.
* **15 Vị trí phòng ban:** Giảng đường đa năng, Phòng máy tính thực hành Lab, Văn phòng Khoa, Phòng Server Data Center.
* **100 Thiết bị kỹ thuật** với đầy đủ thông số cấu hình, nguyên giá, ngày đưa vào sử dụng và ngày bảo trì gần nhất.
* **170 Bản ghi sự cố hỏng hóc** qua nhiều thời kỳ với đa dạng nguyên nhân.
* **120 Biên bản bảo dưỡng định kỳ & sửa chữa** lưu vết chi tiết chi phí và phụ tùng thay thế.
* **Cấu hình 5 tiêu chí C1 - C5** với các trọng số $W_j$ chuẩn hóa.

Để nạp toàn bộ dữ liệu mẫu vào MongoDB, thực thi lệnh sau:
```bash
# Thực thi tại thư mục gốc:
npm run seed

# Hoặc thực thi trong thư mục backend:
cd backend
npm run seed
```
> Khi màn hình xuất hiện thông báo: `[Seed] === NẠP DỮ LIỆU MẪU THÀNH CÔNG! ===`, cơ sở dữ liệu đã sẵn sàng!

---

## 4. Hướng dẫn Khởi chạy Hệ thống

### Cách 1: Khởi chạy 1 lệnh duy nhất (Khuyến nghị)

Script tự động hóa thông minh `start.js` tại thư mục gốc giúp bạn khởi chạy toàn bộ hệ thống chỉ với **1 câu lệnh duy nhất**:

```bash
npm start
```

> **Cơ chế tự động của script `start.js`:**
> 1. Tự động kiểm tra cổng MongoDB `27017`. Nếu MongoDB chưa chạy, script sẽ tự động tìm `mongod.exe` trên máy tính và kích hoạt ngầm với thư mục lưu trữ dữ liệu an toàn tại `data/db`.
> 2. Khởi động Backend API Server tại cổng `5000`.
> 3. Khởi động Frontend Vite React Web App tại cổng `3000`.
> 4. Hiển thị thông báo trạng thái trực quan và lắng nghe `Ctrl + C` để tắt đồng bộ tất cả các tiến trình.

Sau khi khởi chạy, mở trình duyệt web và truy cập:
**`http://localhost:3000`**


### Cách 2: Khởi chạy thủ công từng phân hệ (Split Terminal)

Nếu muốn theo dõi riêng luồng ghi nhật ký (logs) của từng phân hệ trong Visual Studio Code, bạn có thể mở 2 tab Terminal:

#### Terminal 1 — Khởi động Backend:
```bash
cd d:\doantotnghiep\backend
npm start
```
* Backend khởi chạy tại: `http://localhost:5000`
* Tự động kết nối MongoDB và sẵn sàng tiếp nhận các cuộc gọi RESTful API.

#### Terminal 2 — Khởi động Frontend:
```bash
cd d:\doantotnghiep\frontend
npm run dev
```
* Frontend chạy tại: `http://localhost:3000`
* Hỗ trợ công nghệ Hot Module Replacement (HMR) giúp giao diện cập nhật ngay lập tức khi chỉnh sửa code.

---

### Cách 3: Đóng gói sản phẩm (Production Build)

Khi cần bàn giao hoặc đóng gói ứng dụng đưa lên máy chủ triển khai chính thức:
```bash
cd d:\doantotnghiep\frontend
npm run build
```
Mã nguồn giao diện sẽ được tối ưu hóa, nén minify và xuất ra thư mục `frontend/dist`. Để chạy thử bản đóng gói:
```bash
npm run preview
```

---

## 5. Tài khoản Mẫu & Phân quyền Người dùng (RBAC)

Hệ thống thiết lập cơ chế kiểm soát truy cập dựa trên vai trò (**Role-Based Access Control - RBAC**) với 4 đối tượng tài khoản đã được khởi tạo sẵn trong cơ sở dữ liệu:

| Vai trò (Role) | Tên đăng nhập | Mật khẩu | Phạm vi quyền hạn & Trách nhiệm chính |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin` | `admin123` | Toàn quyền cấu hình hệ thống, quản trị tài khoản, khóa/mở người dùng, quản lý danh mục & vị trí phòng ban. |
| **Quản lý thiết bị (Manager)** | `quanly` | `quanly123` | Quản lý hồ sơ thiết bị, tiếp nhận và điều phối sự cố, kích hoạt thuật toán MCDA C1-C5, lập và duyệt kế hoạch bảo trì, xem Dashboard và xuất 7 báo cáo. |
| **Kỹ thuật viên (Technician)** | `kythuat` | `kythuat123` | Tiếp nhận phiếu phân công sửa chữa, ghi nhận nguyên nhân, cập nhật giải pháp, chi phí phát sinh và xác nhận hoàn tất bảo trì. |
| **Giảng viên / User** | `giangvien` | `user123` | Tra cứu danh mục thiết bị tại các phòng học, gửi phiếu báo hỏng trực tuyến khi gặp sự cố và theo dõi tiến độ xử lý. |