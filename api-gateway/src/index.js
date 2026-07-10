require('dotenv').config();

const http = require('http');
const createApp = require('./app');
const initSocket = require('./socket');

const PORT = process.env.PORT || 5000;

let app;
const server = http.createServer((req, res) => app(req, res));
const io = initSocket(server);
app = createApp(io);

server.listen(PORT, () => {
  console.log(`CivicConnect API Gateway running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Socket.IO path: /socket.io`);
});

const shutdown = (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);
  server.close(() => {
    io.close();
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
