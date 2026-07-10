const axios = require('axios');
const { z } = require('zod');
const Worker = require('../models/Worker');
const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');
const { DEPARTMENTS } = require('../constants/departments');
const { notifyWorkerChange } = require('./integrationService');

const createWorkerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  phone: z
    .string()
    .regex(/^\d{10}$/, 'Phone must be 10 digits')
    .optional(),
  department: z.enum(DEPARTMENTS, { message: 'Invalid department' }),
  availability: z.boolean().optional(),
});

const updateWorkerSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z
    .string()
    .regex(/^\d{10}$/, 'Phone must be 10 digits')
    .optional(),
  department: z.enum(DEPARTMENTS).optional(),
  availability: z.boolean().optional(),
  activeTasks: z.number().min(0).optional(),
  completedTasks: z.number().min(0).optional(),
  rating: z.number().min(0).max(5).optional(),
});

const validate = (schema) => (req, res, next) => {
  console.log(`\n--- [Validation Start] ---`);
  console.log(`Incoming payload:`, JSON.stringify(req.body, null, 2));
  
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    console.error(`[Validation Failed] Errors:`, JSON.stringify(errors, null, 2));
    return next(new ApiError(422, 'Validation failed', errors));
  }
  
  console.log(`[Validation Success] Parsed payload:`, JSON.stringify(result.data, null, 2));
  req.body = result.data;
  next();
};

const createAuthUser = async (workerData, authHeader) => {
  const authUrl = process.env.AUTH_SERVICE_URL;
  if (!authUrl) {
    throw new ApiError(500, 'AUTH_SERVICE_URL is not configured');
  }

  try {
    const response = await axios.post(
      `${authUrl}/api/auth/register-internal`,
      {
        name: workerData.name,
        email: workerData.email,
        password: workerData.password,
        phone: workerData.phone,
        role: 'WORKER',
      },
      {
        headers: { Authorization: authHeader },
      }
    );

    const user = response.data?.data?.user || response.data?.data;
    if (!user || (!user._id && !user.id)) {
      throw new ApiError(500, 'Failed to create auth user for worker');
    }
    return user;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    const message =
      error.response?.data?.message || 'Failed to create worker auth account';
    const statusCode = error.response?.status || 500;
    const errors = error.response?.data?.errors || [];
    throw new ApiError(statusCode, message, errors);
  }
};

const createWorker = async (body, authHeader) => {
  console.log(`\n--- [Worker.create DB Check] ---`);
  console.log(`- Connection Name: ${mongoose.connection.name}`);
  console.log(`- Connection Host: ${mongoose.connection.host}`);
  console.log(`- Collection Name: ${Worker.collection.name}`);

  console.log(`\n--- [Worker.create Department Check] ---`);
  console.log(`- Allowed DEPARTMENTS:`, DEPARTMENTS);
  console.log(`- Incoming department: ${body.department}`);
  console.log(`- Validation Result: ${DEPARTMENTS.includes(body.department)}`);

  const existing = await Worker.findOne({ email: body.email });
  if (existing) {
    throw new ApiError(409, 'Worker with this email already exists');
  }

  console.log(`\n--- [createAuthUser] Starting auth user creation... ---`);
  const authUser = await createAuthUser(body, authHeader);
  console.log(`[createAuthUser] Success. Auth User returned:`, JSON.stringify(authUser, null, 2));

  let worker;
  console.log(`\n--- [Worker.create] Attempting to insert into database... ---`);
  try {
    worker = await Worker.create({
      userId: authUser._id || authUser.id,
      name: body.name,
      email: body.email,
      phone: body.phone,
      department: body.department,
      availability: body.availability ?? true,
    });
    console.log(`[Worker.create] Successfully inserted worker: ${worker._id}`);

    // Trigger worker welcome email in the background
    triggerWorkerNotification(worker).catch(err => {
      console.error('[WorkerService] Worker welcome email background trigger failed:', err.message);
    });
  } catch (error) {
    console.error(`\n--- [Worker.create Failed] ---`);
    console.error(`- error.message:`, error.message);
    console.error(`- error.name:`, error.name);
    console.error(`- error.errors:`, error.errors);
    console.error(`- stack trace:`, error.stack);
    throw new ApiError(500, 'Database error: Failed to create worker profile', [error.message]);
  }

  console.log(`\n--- [notifyWorkerChange] Starting socket notification... ---`);
  try {
    // Emit socket event to notify admins about new worker
    await notifyWorkerChange(worker, 'worker:created');
    console.log(`[notifyWorkerChange] Successfully emitted socket event`);
  } catch (socketError) {
    console.error(`[notifyWorkerChange Failed] Socket notification error:`, socketError.message);
    console.error(`- Continuing without socket notification...`);
  }

  return worker;
};

const getWorkers = async (filters = {}) => {
  const query = {};
  if (filters.department) query.department = filters.department;
  if (filters.availability !== undefined) {
    query.availability = filters.availability === 'true' || filters.availability === true;
  }
  return Worker.find(query).sort({ createdAt: -1 }).lean();
};

const getWorkerById = async (id) => {
  const worker = await Worker.findById(id);
  if (!worker) throw new ApiError(404, 'Worker not found');
  return worker;
};

const getWorkerByUserId = async (userId) => {
  const worker = await Worker.findOne({ userId });
  console.log('[WorkerService] getWorkerByUserId lookup', { userId });
  if (!worker) {
    console.error('[WorkerService] getWorkerByUserId - no worker profile found for userId', userId);
    throw new ApiError(404, 'Worker profile not found');
  }
  return worker;
};

const updateWorker = async (id, body) => {
  const worker = await Worker.findByIdAndUpdate(id, body, {
    new: true,
    runValidators: true,
  });
  if (!worker) throw new ApiError(404, 'Worker not found');

  // Emit socket event to notify admins about worker update
  await notifyWorkerChange(worker, 'worker:updated');

  return worker;
};

const deleteWorker = async (id) => {
  const worker = await Worker.findByIdAndDelete(id);
  if (!worker) throw new ApiError(404, 'Worker not found');

  // Emit socket event to notify admins about worker deletion
  await notifyWorkerChange(worker, 'worker:deleted');

  return worker;
};

const getWorkersByDepartment = async (department) => {
  if (!DEPARTMENTS.includes(department)) {
    throw new ApiError(400, 'Invalid department');
  }
  return Worker.find({ department, availability: true }).sort({ activeTasks: 1 });
};

const getWorkerTasks = async (workerId, authHeader) => {
  const complaintUrl = process.env.COMPLAINT_SERVICE_URL;
  console.log('[WorkerService] getWorkerTasks', {
    workerId,
    complaintUrl,
    authHeaderProvided: Boolean(authHeader),
  });

  if (!complaintUrl) {
    throw new ApiError(500, 'COMPLAINT_SERVICE_URL is not configured');
  }

  try {
    const response = await axios.get(
      `${complaintUrl}/api/complaints/internal/worker/${workerId}`,
      { headers: { Authorization: authHeader } }
    );
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error('[WorkerService] getWorkerTasks error', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    });
    if (error.response?.status === 404) return [];
    const message = error.response?.data?.message || 'Failed to fetch worker tasks';
    throw new ApiError(error.response?.status || 500, message);
  }
};

const getPerformanceSummary = async () => {
  const workers = await Worker.find().sort({ completedTasks: -1 });
  return workers.map((worker) => ({
    workerId: worker._id,
    userId: worker.userId,
    name: worker.name,
    email: worker.email,
    department: worker.department,
    activeTasks: worker.activeTasks,
    completedTasks: worker.completedTasks,
    rating: worker.rating,
    availability: worker.availability,
  }));
};

const triggerWorkerNotification = async (worker) => {
  const url = `${process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:5005'}/api/notifications/trigger`;
  const internalSecret = process.env.INTERNAL_SERVICE_SECRET || process.env.INTERNAL_SERVICE_KEY || 'your-internal-service-secret';
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-service-key': internalSecret,
      },
      body: JSON.stringify({
        userId: worker.userId.toString(),
        type: 'WORKER_CREATED',
        title: 'CivicConnect Worker Account Created',
        message: `Hello ${worker.name}, your worker account has been created for department: ${worker.department}.`,
        email: worker.email,
        userName: worker.name,
      }),
    });
    if (!response.ok) {
      const errText = await response.text();
      console.error('[WorkerService] Worker welcome email trigger failed:', errText);
    } else {
      console.log(`[WorkerService] Triggered worker welcome email for ${worker.email}`);
    }
  } catch (error) {
    console.error('[WorkerService] Failed to trigger worker welcome email:', error.message);
  }
};

module.exports = {
  validate,
  createWorkerSchema,
  updateWorkerSchema,
  createWorker,
  getWorkers,
  getWorkerById,
  getWorkerByUserId,
  updateWorker,
  deleteWorker,
  getWorkersByDepartment,
  getWorkerTasks,
  getPerformanceSummary,
};
