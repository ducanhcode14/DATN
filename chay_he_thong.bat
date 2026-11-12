@echo off
chcp 65001 >nul
title Khởi động Hệ thống Quản lý và Lập kế hoạch Bảo trì Thiết bị
echo =====================================================================
echo    HỆ THỐNG QUẢN LÝ VÀ HỖ TRỢ LẬP KẾ HOẠCH BẢO TRÌ THIẾT BỊ
echo    Sinh viên: Bùi Đức Anh - Đồ án tốt nghiệp
echo =====================================================================
echo.

cd /d "%~dp0"

:: Đảm bảo thư mục lưu dữ liệu database data\db tồn tại
if not exist "%~dp0data\db" mkdir "%~dp0data\db"

echo [1/3] Đang kiểm tra cơ sở dữ liệu MongoDB (Port 27017)...
powershell -NoProfile -Command "$client = New-Object System.Net.Sockets.TcpClient; try { $client.Connect('127.0.0.1', 27017); exit 0 } catch { exit 1 }"
if %errorlevel% neq 0 (
    echo [Thông báo] MongoDB chưa chạy trên cổng 27017. Đang tự động bật MongoDB...
    if exist "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" (
        start "MongoDB Server" /min "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath "%~dp0data\db" --port 27017 --bind_ip 127.0.0.1
    ) else (
        echo Đang thử tìm mongod trong hệ thống...
        start "MongoDB Server" /min mongod --dbpath "%~dp0data\db" --port 27017 --bind_ip 127.0.0.1
    )
    timeout /t 3 /nobreak >nul
) else (
    echo [OK] MongoDB đã sẵn sàng hoạt động.
)
echo.

echo [2/3] Đang khởi động Backend Server (Port 5000)...
start "Backend - Node.js Express" cmd /k "cd /d "%~dp0backend" && npm start"

timeout /t 3 /nobreak >nul

echo [3/3] Đang khởi động Frontend (Port 3000)...
start "Frontend - React Vite" cmd /k "cd /d "%~dp0frontend" && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo =====================================================================
echo  HỆ THỐNG ĐÃ SẴN SÀNG!
echo  - Frontend:    http://localhost:3000
echo  - Backend API: http://localhost:5000
echo  Đang tự động mở trình duyệt...
echo =====================================================================
start http://localhost:3000

exit
