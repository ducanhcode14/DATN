const { spawn } = require('child_process');
const path = require('path');

console.log('===============================================================');
console.log(' KHỞI ĐỘNG HỆ THỐNG QUẢN LÝ VÀ LẬP KẾ HOẠCH BẢO TRÌ THIẾT BỊ');
console.log(' Sinh viên thực hiện: Bùi Đức Anh');
console.log('===============================================================\n');

const backendDir = path.join(__dirname, 'backend');
const frontendDir = path.join(__dirname, 'frontend');

// 1. Chạy Backend
console.log('[1/2] Đang khởi động Backend Server (Port 5000)...');
const backendProcess = spawn('npm.cmd', ['start'], {
  cwd: backendDir,
  stdio: 'inherit',
  shell: true,
});

// 2. Chạy Frontend
console.log('[2/2] Đang khởi động Frontend Vite React (Port 3000)...');
const frontendProcess = spawn('npm.cmd', ['run', 'dev'], {
  cwd: frontendDir,
  stdio: 'inherit',
  shell: true,
});

const cleanup = () => {
  console.log('\nĐang dừng hệ thống...');
  try {
    backendProcess.kill();
    frontendProcess.kill();
  } catch (e) {}
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
