const axios = require('axios');
const ApiError = require('../utils/ApiError');

const emitSocketEvent = async (event, data, rooms = []) => {
  const url = `${process.env.SOCKET_URL}/internal/socket/emit`;
  const targets = rooms.length > 0 ? rooms : ['admin:room'];
  const internalSecret = process.env.INTERNAL_SERVICE_SECRET;

  if (!internalSecret) {
    console.error('INTERNAL_SERVICE_SECRET is not configured');
    return;
  }

  await Promise.all(
    targets.map(async (room) => {
      try {
        await axios.post(
          url,
          { event, room, data },
          {
            headers: {
              'X-Internal-Secret': internalSecret,
            },
            timeout: 5000,
          }
        );
      } catch (error) {
        console.error(`Socket emit failed for room ${room}:`, error.message);
      }
    })
  );
};

const notifyWorkerChange = async (worker, eventType = 'worker:updated') => {
  const workerPayload = worker.toObject ? worker.toObject() : worker;

  await emitSocketEvent(eventType, workerPayload, ['admin:room']);
};

module.exports = {
  emitSocketEvent,
  notifyWorkerChange,
};
