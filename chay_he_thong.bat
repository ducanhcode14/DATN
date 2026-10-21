@echo off
chcp 65001 >nul
title Khởi động Hệ thống Quản lý và Lập kế hoạch Bảo trì Thiết bị
echo =====================================================================
echo    HỆ THỐNG QUẢN LÝ VÀ HỖ TRỢ LẬP KẾ HOẠCH BẢO TRÌ THIẾT BỊ
echo    Sinh viên: Bùi Đức Anh - Đồ án tốt nghiệp
echo =====================================================================
echo.

cd /d "%~dp0"

echo [1/3] Đang kiểm tra dịch vụ MongoDB...
sc query MongoDB | findstr /i "RUNNING" >nul
if %errorlevel% neq 0 (
    echo [Cảnh báo] MongoDB chưa chạy. Đang cố khởi động dịch vụ MongoDB...
    net start MongoDB
) else (
    echo [OK] Dịch vụ MongoDB đang hoạt động tốt.
)
echo.

echo [2/3] Đang khởi động Backend Server (Port 5000)...
start "Backend - Node.js Express" cmd /k "cd /d "%~dp0backend" && npm start"

timeout /t 3 /nobreak >nul

echo [3/3] Đang khởi động Frontend (Port 3000)...
start "Frontend - React Vite" cmd /k "cd /d "%~dp0frontend" && npm run dev"

timeout /t 4 /nobreak >nul

echo.
echo =====================================================================
echo  HỆ THỐNG ĐÃ SẴN SÀNG!
echo  - Frontend: http://localhost:3000
echo  - Backend API: http://localhost:5000
echo  Đang tự động mở trình duyệt...
echo =====================================================================
start http://localhost:3000

exit
