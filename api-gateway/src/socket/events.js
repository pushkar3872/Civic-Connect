const COMPLAINT_EVENTS = [
  'complaint:new',
  'complaint:assigned',
  'complaint:updated',
  'complaint:completed',
  'complaint:closed',
];

const WORKER_EVENTS = [
  'worker:created',
  'worker:updated',
  'worker:deleted',
];

const ALL_EVENTS = [...COMPLAINT_EVENTS, ...WORKER_EVENTS];

const isValidComplaintEvent = (event) => COMPLAINT_EVENTS.includes(event);

const isValidWorkerEvent = (event) => WORKER_EVENTS.includes(event);

const isValidEvent = (event) => ALL_EVENTS.includes(event);

const isValidRoom = (room) => {
  if (!room || typeof room !== 'string') return false;
  if (room === 'admin:room') return true;
  return /^user:[a-zA-Z0-9_-]+$/.test(room);
};

module.exports = {
  COMPLAINT_EVENTS,
  WORKER_EVENTS,
  ALL_EVENTS,
  isValidComplaintEvent,
  isValidWorkerEvent,
  isValidEvent,
  isValidRoom,
};
