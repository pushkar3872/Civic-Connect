const Complaint = require('../models/Complaint');
const ApiError = require('../utils/ApiError');
const { DEPARTMENT_MAP } = require('../constants/departments');
const { STATUSES, isValidTransition } = require('../constants/statuses');
const ROLES = require('../constants/roles');
const {
  notifyStatusChange,
  fetchWorker,
  fetchCurrentWorker,
  assignWorkerTask,
  unassignWorkerTask,
  syncWorkerTasks,
} = require('./integrationService');

const getUserId = (user) => user.id || user.userId || user._id;

const getWorkerId = (user) => user.workerId || user.id || user.userId || user._id;

const getWorkerProfileId = async (user, authHeader) => {
  console.log('[ComplaintService] getWorkerProfileId', {
    role: user.role,
    userId: getUserId(user),
    authHeaderProvided: Boolean(authHeader),
  });

  if (user.role !== ROLES.WORKER) {
    return getWorkerId(user);
  }

  if (!authHeader) {
    throw new ApiError(401, 'Authorization header required for worker profile resolution');
  }

  const worker = await fetchCurrentWorker(authHeader);
  console.log('[ComplaintService] getWorkerProfileId fetched worker profile', {
    workerId: worker?._id?.toString(),
    userId: getUserId(user),
  });
  return worker._id?.toString();
};

const ADMIN_STATUSES = new Set([
  STATUSES.UNDER_REVIEW,
  STATUSES.VERIFIED_BY_ADMIN,
  STATUSES.REWORK_REQUIRED,
  STATUSES.CLOSED,
  STATUSES.ASSIGNED,
]);

const WORKER_STATUSES = new Set([
  STATUSES.IN_PROGRESS,
  STATUSES.COMPLETED_BY_WORKER,
]);

const assertStatusPermission = (role, status) => {
  if (role === ROLES.ADMIN) {
    return true;
  }
  if (role === ROLES.WORKER) {
    return WORKER_STATUSES.has(status);
  }
  console.error('[ComplaintService] assertStatusPermission - forbidden', { role, status });
  throw new ApiError(403, 'Forbidden: insufficient permissions to update status');
};

const assertComplaintAccess = async (complaint, user, authHeader) => {
  console.log('[ComplaintService] assertComplaintAccess', {
    complaintId: complaint._id?.toString(),
    assignedWorker: complaint.assignedWorker?.toString(),
    userRole: user.role,
    userId: getUserId(user),
  });

  if (user.role === ROLES.ADMIN) return;
  if (user.role === ROLES.CITIZEN && complaint.citizenId.toString() === getUserId(user)) return;
  if (user.role === ROLES.WORKER) {
    const workerId = await getWorkerProfileId(user, authHeader);
    if (complaint.assignedWorker && complaint.assignedWorker.toString() === workerId) {
      return;
    }
  }
  console.error('[ComplaintService] assertComplaintAccess - access denied', {
    complaintId: complaint._id?.toString(),
    assignedWorker: complaint.assignedWorker?.toString(),
    userRole: user.role,
    userId: getUserId(user),
  });
  throw new ApiError(403, 'Forbidden: you cannot access this complaint');
};

const buildFilters = (query) => {
  const filters = {};
  if (query.category) filters.category = { $regex: new RegExp(query.category, 'i') };
  if (query.status) filters.status = { $regex: new RegExp(query.status, 'i') };
  if (query.priority) filters.priority = { $regex: new RegExp(query.priority, 'i') };
  if (query.department) filters.department = { $regex: new RegExp(query.department, 'i') };
  
  if (query.search) {
    filters.$or = [
      { title: { $regex: new RegExp(query.search, 'i') } },
      { description: { $regex: new RegExp(query.search, 'i') } }
    ];
  }
  return filters;
};

const createComplaint = async (body, user) => {
  const department = DEPARTMENT_MAP[body.category];
  if (!department) {
    throw new ApiError(400, 'Invalid category');
  }

  const complaint = await Complaint.create({
    ...body,
    department,
    citizenId: getUserId(user),
    status: STATUSES.NEW,
  });

  await notifyStatusChange(complaint, null);
  return complaint;
};

const getAllComplaints = async (query) => {
  const filters = buildFilters(query);
  return Complaint.find(filters).sort({ createdAt: -1 });
};

const getMyComplaints = async (user) => {
  return Complaint.find({ citizenId: getUserId(user) }).sort({ createdAt: -1 });
};

const getComplaintById = async (id, user, authHeader) => {
  const complaint = await Complaint.findById(id);
  if (!complaint) {
    throw new ApiError(404, 'Complaint not found');
  }
  await assertComplaintAccess(complaint, user, authHeader);
  return complaint;
};

const updateComplaintStatus = async (id, body, user, authHeader) => {
  const complaint = await Complaint.findById(id);
  if (!complaint) {
    throw new ApiError(404, 'Complaint not found');
  }

  if (user.role === ROLES.WORKER) {
    const workerId = await getWorkerProfileId(user, authHeader);
    if (!complaint.assignedWorker || complaint.assignedWorker.toString() !== workerId) {
      console.error('[ComplaintService] updateComplaintStatus - forbidden: complaint not assigned to worker', {
        complaintId: complaint._id?.toString(),
        complaintAssignedWorker: complaint.assignedWorker?.toString(),
        workerProfileId: workerId,
        userId: getUserId(user),
      });
      throw new ApiError(403, 'Forbidden: complaint is not assigned to you');
    }
  } else if (user.role === ROLES.CITIZEN) {
    console.error('[ComplaintService] updateComplaintStatus - forbidden: citizen attempted status update', { userId: getUserId(user) });
    throw new ApiError(403, 'Forbidden: citizens cannot update complaint status');
  }

  const hasStatusUpdate = body.status !== undefined;
  const previousStatus = complaint.status;

  if (hasStatusUpdate) {
    assertStatusPermission(user.role, body.status);

    if (user.role === ROLES.WORKER && ADMIN_STATUSES.has(body.status)) {
      console.error('[ComplaintService] updateComplaintStatus - forbidden: worker attempted admin-only status', {
        userId: getUserId(user),
        attemptedStatus: body.status,
      });
      throw new ApiError(403, 'Workers cannot set admin-only statuses');
    }

    if (body.status !== complaint.status && !isValidTransition(complaint.status, body.status)) {
      throw new ApiError(
        400,
        `Invalid status transition from ${complaint.status} to ${body.status}`
      );
    }

    complaint.status = body.status;
  }

  if (body.workerRemarks !== undefined) {
    complaint.workerRemarks = body.workerRemarks;
  }
  if (body.beforeImages !== undefined) {
    complaint.beforeImages = body.beforeImages;
  }
  if (body.afterImages !== undefined) {
    complaint.afterImages = body.afterImages;
  }

  await complaint.save();
  await notifyStatusChange(complaint, previousStatus);
  if (complaint.assignedWorker) {
    await syncWorkerTasks(complaint.assignedWorker.toString(), authHeader);
  }
  return complaint;
};

const assignWorker = async (id, workerId, authHeader) => {
  const complaint = await Complaint.findById(id);
  if (!complaint) {
    throw new ApiError(404, 'Complaint not found');
  }

  const worker = await fetchWorker(workerId, authHeader);

  if (worker.department !== complaint.department) {
    throw new ApiError(
      400,
      'Worker department must match the complaint department'
    );
  }

  if (worker.availability === false) {
    throw new ApiError(400, 'Selected worker is not available');
  }

  const previousWorkerId = complaint.assignedWorker?.toString();
  const previousStatus = complaint.status;

  if (previousWorkerId && previousWorkerId !== workerId) {
    await unassignWorkerTask(previousWorkerId, authHeader);
  }

  if (!previousWorkerId || previousWorkerId !== workerId) {
    await assignWorkerTask(workerId, authHeader);
  }

  complaint.assignedWorker = workerId;

  if (complaint.status !== STATUSES.ASSIGNED) {
    if (!isValidTransition(complaint.status, STATUSES.ASSIGNED)) {
      throw new ApiError(
        400,
        `Cannot assign worker while complaint status is ${complaint.status}`
      );
    }
    complaint.status = STATUSES.ASSIGNED;
  }

  await complaint.save();
  console.log('[ComplaintService] assignWorker - saved complaint assignment', {
    complaintId: complaint._id?.toString(),
    assignedWorker: complaint.assignedWorker?.toString(),
    workerIdProvided: workerId,
    workerProfileId: worker?._id?.toString(),
    workerUserId: worker?.userId?.toString(),
  });
  await notifyStatusChange(complaint, previousStatus);
  return complaint;
};

const verifyComplaint = async (id, body, user) => {
  const complaint = await Complaint.findById(id);
  if (!complaint) {
    throw new ApiError(404, 'Complaint not found');
  }

  const targetStatus = body.approved ? STATUSES.VERIFIED_BY_ADMIN : STATUSES.REWORK_REQUIRED;

  if (!isValidTransition(complaint.status, targetStatus)) {
    throw new ApiError(
      400,
      `Invalid status transition from ${complaint.status} to ${targetStatus}`
    );
  }

  const previousStatus = complaint.status;
  complaint.status = targetStatus;
  if (body.adminRemarks !== undefined) {
    complaint.adminRemarks = body.adminRemarks;
  }

  await complaint.save();
  await notifyStatusChange(complaint, previousStatus);
  if (complaint.assignedWorker) {
    await syncWorkerTasks(complaint.assignedWorker.toString(), null);
  }
  return complaint;
};

const closeComplaint = async (id, body) => {
  const complaint = await Complaint.findById(id);
  if (!complaint) {
    throw new ApiError(404, 'Complaint not found');
  }

  if (!isValidTransition(complaint.status, STATUSES.CLOSED)) {
    throw new ApiError(
      400,
      `Invalid status transition from ${complaint.status} to ${STATUSES.CLOSED}`
    );
  }

  const previousStatus = complaint.status;
  complaint.status = STATUSES.CLOSED;
  complaint.closedAt = new Date();
  if (body.adminRemarks !== undefined) {
    complaint.adminRemarks = body.adminRemarks;
  }

  await complaint.save();
  await notifyStatusChange(complaint, previousStatus);
  if (complaint.assignedWorker) {
    await syncWorkerTasks(complaint.assignedWorker.toString(), null);
  }
  return complaint;
};

const deleteComplaint = async (id) => {
  const complaint = await Complaint.findByIdAndDelete(id);
  if (!complaint) {
    throw new ApiError(404, 'Complaint not found');
  }
  return complaint;
};

const getComplaintsByWorker = async (workerId, user, authHeader) => {
  console.log('[ComplaintService] getComplaintsByWorker', {
    workerId,
    userRole: user.role,
    userId: getUserId(user),
    authHeaderProvided: Boolean(authHeader),
  });

  if (user.role === ROLES.WORKER) {
    const currentWorkerId = await getWorkerProfileId(user, authHeader);
    console.log('[ComplaintService] getComplaintsByWorker currentWorkerId', {
      currentWorkerId,
    });

    if (workerId !== currentWorkerId) {
      throw new ApiError(403, 'Forbidden: you can only view your own assigned complaints');
    }
  }
  return Complaint.find({ assignedWorker: workerId }).sort({ updatedAt: -1 });
};

module.exports = {
  createComplaint,
  getAllComplaints,
  getMyComplaints,
  getComplaintById,
  updateComplaintStatus,
  assignWorker,
  verifyComplaint,
  closeComplaint,
  deleteComplaint,
  getComplaintsByWorker,
};
