const { spawn, execSync } = require('child_process');
const path = require('path');
const net = require('net');
const fs = require('fs');

console.log('===============================================================');
console.log(' KHỞI ĐỘNG HỆ THỐNG QUẢN LÝ VÀ LẬP KẾ HOẠCH BẢO TRÌ THIẾT BỊ');
console.log(' Sinh viên thực hiện: Bùi Đức Anh');
console.log('===============================================================\n');

const rootDir = __dirname;
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');
const dataDir = path.join(rootDir, 'data', 'db');

// Đảm bảo thư mục data/db luôn tồn tại
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Hàm kiểm tra port có đang mở không
function checkPort(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      resolve(false);
    });
    socket.connect(port, host);
  });
}

// Tìm đường dẫn mongod.exe trên Windows
function findMongodPath() {
  const possiblePaths = [
    'C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\6.0\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\5.0\\bin\\mongod.exe',
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
  }
  // Thử tìm trong thư mục C:\Program Files\MongoDB\Server
  const baseServer = 'C:\\Program Files\\MongoDB\\Server';
  if (fs.existsSync(baseServer)) {
    const versions = fs.readdirSync(baseServer);
    for (const v of versions) {
      const candidate = path.join(baseServer, v, 'bin', 'mongod.exe');
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  return 'mongod';
}

async function startSystem() {
  let mongoProcess = null;

  // 1. Kiểm tra MongoDB
  console.log('[1/3] Kiểm tra kết nối MongoDB (Port 27017)...');
  const isMongoRunning = await checkPort(27017);

  if (isMongoRunning) {
    console.log('   => MongoDB đã sẵn sàng trên cổng 27017.');
  } else {
    console.log('   => MongoDB chưa chạy. Đang tự động khởi chạy MongoDB cục bộ...');
    const mongodPath = findMongodPath();
    console.log(`   => Sử dụng: ${mongodPath}`);
    
    mongoProcess = spawn(mongodPath, ['--dbpath', dataDir, '--port', '27017', '--bind_ip', '127.0.0.1'], {
      stdio: 'ignore',
      detached: false,
    });

    // Chờ tối đa 10s cho MongoDB khởi động
    let waited = 0;
    while (waited < 10) {
      await new Promise((r) => setTimeout(r, 1000));
      waited++;
      if (await checkPort(27017)) {
        break;
      }
    }

    if (await checkPort(27017)) {
      console.log('   => MongoDB khởi động thành công!');
    } else {
      console.error('   [!] Không thể khởi động MongoDB tự động. Vui lòng kiểm tra lại dịch vụ MongoDB.');
    }
  }

  // 2. Chạy Backend
  console.log('\n[2/3] Đang khởi động Backend Server (Port 5000)...');
  const backendProcess = spawn('npm.cmd', ['start'], {
    cwd: backendDir,
    stdio: 'inherit',
    shell: true,
  });

  // Chờ 2 giây để backend khởi tạo
  await new Promise((r) => setTimeout(r, 2000));

  // 3. Chạy Frontend
  console.log('\n[3/3] Đang khởi động Frontend Vite React (Port 3000)...');
  const frontendProcess = spawn('npm.cmd', ['run', 'dev'], {
    cwd: frontendDir,
    stdio: 'inherit',
    shell: true,
  });

  console.log('\n===============================================================');
  console.log(' HỆ THỐNG ĐÃ KHỞI CHẠY THÀNH CÔNG:');
  console.log(' - Frontend (Giao diện Web): http://localhost:3000');
  console.log(' - Backend (RESTful API):   http://localhost:5000');
  console.log(' Nhấn Ctrl + C để dừng toàn bộ hệ thống.');
  console.log('===============================================================\n');

  const cleanup = () => {
    console.log('\nĐang tắt hệ thống...');
    try {
      if (mongoProcess) mongoProcess.kill();
      backendProcess.kill();
      frontendProcess.kill();
    } catch (e) {}
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

startSystem();
