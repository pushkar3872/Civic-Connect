const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const workerService = require('../services/workerService');

const createWorker = asyncHandler(async (req, res) => {
  const worker = await workerService.createWorker(req.body, req.headers.authorization);
  res.status(201).json(new ApiResponse(201, worker, 'Worker created successfully'));
});

const getWorkers = asyncHandler(async (req, res) => {
  const { department, availability } = req.query;
  const workers = await workerService.getWorkers({ department, availability });
  res.status(200).json(new ApiResponse(200, workers));
});

const getWorkerById = asyncHandler(async (req, res) => {
  if (req.user.role === 'WORKER') {
    const ownWorker = await workerService.getWorkerByUserId(req.user.id);
    if (req.params.id !== ownWorker._id.toString()) {
      console.error('[WorkerController] getWorkerById - forbidden: worker trying to view another profile', {
        reqUserId: req.user.id,
        requestedId: req.params.id,
        ownWorkerId: ownWorker._id.toString(),
      });
      throw new ApiError(403, 'Forbidden: you can only view your own profile');
    }
  }

  const worker = await workerService.getWorkerById(req.params.id);
  res.status(200).json(new ApiResponse(200, worker));
});

const getMe = asyncHandler(async (req, res) => {
  const worker = await workerService.getWorkerByUserId(req.user.id);
  res.status(200).json(new ApiResponse(200, worker));
});

const updateWorker = asyncHandler(async (req, res) => {
  const worker = await workerService.updateWorker(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, worker, 'Worker updated successfully'));
});

const deleteWorker = asyncHandler(async (req, res) => {
  await workerService.deleteWorker(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Worker deleted successfully'));
});

const getWorkersByDepartment = asyncHandler(async (req, res) => {
  const department = decodeURIComponent(req.params.dept);
  const workers = await workerService.getWorkersByDepartment(department);
  res.status(200).json(new ApiResponse(200, workers));
});

const getWorkerTasks = asyncHandler(async (req, res) => {
  let worker;

  if (req.user.role === 'WORKER') {
    const ownWorker = await workerService.getWorkerByUserId(req.user.id);
    console.log('[WorkerController] getWorkerTasks - req.user:', req.user);
    console.log('[WorkerController] getWorkerTasks - resolved ownWorker:', {
      _id: ownWorker._id?.toString(),
      userId: ownWorker.userId?.toString(),
    });
    const requestedId = req.params.id?.toString();
    const ownWorkerId = ownWorker._id.toString();

    if (requestedId && requestedId !== ownWorkerId) {
      console.error('[WorkerController] getWorkerTasks - forbidden: worker requesting another worker tasks', {
        reqUserId: req.user.id,
        requestedId,
        ownWorkerId,
      });
      throw new ApiError(403, 'You can only view your own tasks');
    }
    worker = ownWorker;
  } else {
    worker = await workerService.getWorkerById(req.params.id);
  }

  const tasks = await workerService.getWorkerTasks(
    worker._id.toString(),
    req.headers.authorization
  );
  console.log('[WorkerController] getWorkerTasks - forwarding request to complaint service', {
    workerId: worker._id.toString(),
    authHeaderProvided: Boolean(req.headers.authorization),
  });
  res.status(200).json(new ApiResponse(200, tasks));
});

const getMyTasks = asyncHandler(async (req, res) => {
  const worker = await workerService.getWorkerByUserId(req.user.id);
  console.log('[WorkerController] getMyTasks - req.user:', req.user);
  console.log('[WorkerController] getMyTasks - resolved worker:', { _id: worker._id?.toString(), userId: worker.userId?.toString() });
  const tasks = await workerService.getWorkerTasks(
    worker._id.toString(),
    req.headers.authorization
  );
  res.status(200).json(new ApiResponse(200, tasks));
});

const getPerformance = asyncHandler(async (req, res) => {
  const performance = await workerService.getPerformanceSummary();
  res.status(200).json(new ApiResponse(200, performance));
});

module.exports = {
  createWorker,
  getWorkers,
  getMe,
  getWorkerById,
  updateWorker,
  deleteWorker,
  getWorkersByDepartment,
  getWorkerTasks,
  getMyTasks,
  getPerformance,
};
