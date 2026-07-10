const axios = require('axios');
const ApiError = require('../utils/ApiError');
const { STATUSES } = require('../constants/statuses');

const getNotificationType = (status, previousStatus) => {
  if (status === STATUSES.ASSIGNED) return 'WORKER_ASSIGNED';
  if (status === STATUSES.COMPLETED_BY_WORKER) return 'WORK_COMPLETED';
  if (status === STATUSES.VERIFIED_BY_ADMIN) return 'VERIFIED';
  if (status === STATUSES.CLOSED) return 'CLOSED';
  if (previousStatus === null) return 'COMPLAINT_CREATED';
  return null;
};

const getSocketEvent = (status, previousStatus) => {
  if (previousStatus === null) return 'complaint:new';
  if (status === STATUSES.ASSIGNED) return 'complaint:assigned';
  if (status === STATUSES.COMPLETED_BY_WORKER) return 'complaint:completed';
  if (status === STATUSES.CLOSED) return 'complaint:closed';
  return 'complaint:updated';
};

const triggerNotification = async (payload) => {
  const url = `${process.env.NOTIFICATION_SERVICE_URL}/api/notifications/trigger`;
  const internalKey = process.env.INTERNAL_SERVICE_KEY || 'your_internal_service_key_here';
  try {
    await axios.post(url, payload, {
      headers: {
        'x-service-key': internalKey,
      },
      timeout: 5000,
    });
  } catch (error) {
    console.error('[IntegrationService] Notification trigger failed:', error.response?.data || error.message);
  }
};

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

const getNotificationMessage = (status, previousStatus) => {
  if (status === STATUSES.ASSIGNED) return 'A municipal worker has been assigned to your complaint.';
  if (status === STATUSES.IN_PROGRESS) return 'Work has started on your complaint.';
  if (status === STATUSES.COMPLETED_BY_WORKER) return 'The worker has completed the assigned task.';
  if (status === STATUSES.VERIFIED_BY_ADMIN) return 'The administrator has verified the completion of work.';
  if (status === STATUSES.CLOSED) return 'Your complaint has been officially closed.';
  if (previousStatus === null) return 'Your complaint has been submitted successfully.';
  return 'Your complaint status has been updated.';
};

const fetchUser = async (userId) => {
  const url = `${process.env.AUTH_SERVICE_URL}/api/auth/internal/users/${userId}`;
  const internalSecret = process.env.INTERNAL_SERVICE_SECRET || 'your-internal-service-secret';
  try {
    const response = await axios.get(url, {
      headers: {
        'X-Internal-Secret': internalSecret,
      },
      timeout: 5000,
    });
    return response.data?.data?.user;
  } catch (error) {
    console.error(`[IntegrationService] fetchUser failed for userId ${userId}:`, error.message);
    return null;
  }
};

const notifyStatusChange = async (complaint, previousStatus = null) => {
  const notificationType = getNotificationType(complaint.status, previousStatus);
  const socketEvent = getSocketEvent(complaint.status, previousStatus);
  const complaintPayload = complaint.toObject ? complaint.toObject() : complaint;

  const rooms = [`user:${complaint.citizenId}`, 'admin:room'];
  if (complaint.assignedWorker) {
    rooms.push(`user:${complaint.assignedWorker}`);
  }

  await emitSocketEvent(socketEvent, complaintPayload, rooms);

  if (notificationType) {
    // Resolve Citizen email/name
    const citizen = await fetchUser(complaint.citizenId);
    
    // Resolve Worker name if assigned
    let worker = null;
    if (complaint.assignedWorker) {
      try {
        worker = await fetchWorker(complaint.assignedWorker, null);
      } catch (workerErr) {
        console.error('[IntegrationService] Failed to fetch worker details for email:', workerErr.message);
      }
    }

    await triggerNotification({
      userId: complaint.citizenId.toString(),
      type: notificationType,
      complaintId: complaint._id.toString(),
      title: complaint.title,
      status: complaint.status,
      message: getNotificationMessage(complaint.status, previousStatus),
      email: citizen?.email || '',
      userName: citizen?.name || 'Citizen',
      complaintTitle: complaint.title,
      workerName: worker?.name || '',
    });

    if (notificationType === 'WORKER_ASSIGNED' && worker?.email) {
      await triggerNotification({
        userId: complaint.assignedWorker.toString(),
        type: 'TASK_ASSIGNED',
        complaintId: complaint._id.toString(),
        title: 'New Task Assigned',
        status: complaint.status,
        message: 'You have been assigned a new complaint.',
        email: worker.email,
        userName: worker.name,
        complaintTitle: complaint.title,
        workerName: worker.name,
      });
    }
  }
};

const fetchWorker = async (workerId, authHeader) => {
  const url = `${process.env.WORKER_SERVICE_URL}/api/workers/${workerId}`;
  const headers = {};
  if (authHeader) {
    headers.Authorization = authHeader;
  } else {
    headers['X-Internal-Secret'] = process.env.INTERNAL_SERVICE_SECRET || 'your-internal-service-secret';
  }
  console.log('[IntegrationService] fetchWorker', { url, authHeaderProvided: Boolean(authHeader) });
  try {
    const response = await axios.get(url, {
      headers,
      timeout: 5000,
    });
    return response.data?.data || response.data;
  } catch (error) {
    console.error('[IntegrationService] fetchWorker failed', {
      url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    });
    if (error.response?.status === 404) {
      throw new ApiError(404, 'Worker not found');
    }
    throw new ApiError(502, 'Worker service unavailable');
  }
};

const fetchCurrentWorker = async (authHeader) => {
  const url = `${process.env.WORKER_SERVICE_URL}/api/workers/me`;
  console.log('[IntegrationService] fetchCurrentWorker', { url, authHeaderProvided: Boolean(authHeader) });
  try {
    const response = await axios.get(url, {
      headers: { Authorization: authHeader },
      timeout: 5000,
    });
    return response.data?.data || response.data;
  } catch (error) {
    console.error('[IntegrationService] fetchCurrentWorker failed', {
      url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    });
    if (error.response?.status === 404) {
      throw new ApiError(404, 'Worker profile not found');
    }
    throw new ApiError(502, 'Worker service unavailable');
  }
};

const assignWorkerTask = async (workerId, authHeader) => {
  const worker = await fetchWorker(workerId, authHeader);
  const currentTasks = worker.activeTasks ?? 0;
  const url = `${process.env.WORKER_SERVICE_URL}/api/workers/${workerId}`;

  try {
    await axios.patch(
      url,
      { activeTasks: currentTasks + 1 },
      {
        headers: { Authorization: authHeader },
        timeout: 5000,
      }
    );
  } catch (error) {
    throw new ApiError(502, 'Failed to update worker active tasks');
  }
};

const unassignWorkerTask = async (workerId, authHeader) => {
  if (!workerId) return;

  try {
    const worker = await fetchWorker(workerId, authHeader);
    const currentTasks = worker.activeTasks ?? 0;
    const url = `${process.env.WORKER_SERVICE_URL}/api/workers/${workerId}`;

    await axios.patch(
      url,
      { activeTasks: Math.max(0, currentTasks - 1) },
      {
        headers: { Authorization: authHeader },
        timeout: 5000,
      }
    );
  } catch (error) {
    console.error('Worker task decrement failed:', error.message);
  }
};

const syncWorkerTasks = async (workerId, authHeader) => {
  if (!workerId) return;
  const mongoose = require('mongoose');
  const Complaint = mongoose.model('Complaint');

  try {
    const activeTasks = await Complaint.countDocuments({
      assignedWorker: workerId,
      status: { $in: ['ASSIGNED', 'IN_PROGRESS', 'REWORK_REQUIRED'] }
    });
    
    const completedTasks = await Complaint.countDocuments({
      assignedWorker: workerId,
      status: { $in: ['COMPLETED_BY_WORKER', 'VERIFIED_BY_ADMIN', 'CLOSED'] }
    });

    const url = `${process.env.WORKER_SERVICE_URL}/api/workers/${workerId}`;
    const headers = {};
    if (authHeader) headers.Authorization = authHeader;
    else headers['X-Internal-Secret'] = process.env.INTERNAL_SERVICE_SECRET || 'your-internal-service-secret';

    await axios.patch(
      url,
      { activeTasks, completedTasks },
      { headers, timeout: 5000 }
    );
  } catch (error) {
    console.error('[IntegrationService] Failed to sync worker tasks:', error.message);
  }
};

module.exports = {
  triggerNotification,
  emitSocketEvent,
  notifyStatusChange,
  fetchWorker,
  fetchCurrentWorker,
  assignWorkerTask,
  unassignWorkerTask,
  fetchUser,
  syncWorkerTasks,
};
