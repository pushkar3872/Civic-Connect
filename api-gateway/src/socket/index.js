const jwt = require('jsonwebtoken');
const { isValidRoom } = require('./events');

const initSocket = (server) => {
  const { Server } = require('socket.io');

  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/socket.io',
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user?.id || socket.user?.userId;
    if (userId) {
      socket.join(`user:${userId}`);
    }

    if (socket.user?.role?.toUpperCase() === 'ADMIN') {
      socket.join('admin:room');
    }

    socket.on('join:room', (payload) => {
      const room = typeof payload === 'string' ? payload : payload?.room;

      if (!isValidRoom(room)) {
        socket.emit('error', { message: 'Invalid room name' });
        return;
      }

      if (room === 'admin:room' && socket.user?.role?.toUpperCase() !== 'ADMIN') {
        socket.emit('error', { message: 'Forbidden: admin room access denied' });
        return;
      }

      if (room.startsWith('user:')) {
        const requestedUserId = room.split(':')[1];
        const currentUserId = String(socket.user?.id || socket.user?.userId);
        if (requestedUserId !== currentUserId && socket.user?.role?.toUpperCase() !== 'ADMIN') {
          socket.emit('error', { message: 'Forbidden: cannot join another user room' });
          return;
        }
      }

      socket.join(room);
      socket.emit('joined:room', { room });
    });

    socket.on('disconnect', () => {
      // Socket.IO handles room cleanup on disconnect
    });
  });

  return io;
};

module.exports = initSocket;
