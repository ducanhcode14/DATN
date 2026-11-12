const { spawn } = require('child_process');
const path = require('path');
const net = require('net');
const fs = require('fs');

function checkPort(port = 27017, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(800);
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

function findMongodPath() {
  const baseServer = 'C:\\Program Files\\MongoDB\\Server';
  if (fs.existsSync(baseServer)) {
    try {
      const versions = fs.readdirSync(baseServer);
      for (const v of versions) {
        const candidate = path.join(baseServer, v, 'bin', 'mongod.exe');
        if (fs.existsSync(candidate)) return candidate;
      }
    } catch (e) {}
  }
  return 'mongod';
}

async function ensureMongoRunning(port = 27017) {
  const isRunning = await checkPort(port);
  if (isRunning) {
    return true;
  }

  console.log(`[MongoDB] Cổng ${port} chưa hoạt động. Đang tự động khởi chạy MongoDB cục bộ...`);
  const dataDir = path.resolve(__dirname, '../../data/db');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const mongodPath = findMongodPath();
  const child = spawn(mongodPath, ['--dbpath', dataDir, '--port', String(port), '--bind_ip', '127.0.0.1'], {
    stdio: 'ignore',
    detached: true,
  });
  child.unref();

  let retries = 0;
  while (retries < 10) {
    await new Promise((r) => setTimeout(r, 1000));
    retries++;
    if (await checkPort(port)) {
      console.log(`[MongoDB] Đã tự động kích hoạt MongoDB thành công trên cổng ${port}`);
      return true;
    }
  }

  console.warn(`[MongoDB] Cảnh báo: Không thể tự động kích hoạt mongod sau 10 giây.`);
  return false;
}

module.exports = { ensureMongoRunning, checkPort };
