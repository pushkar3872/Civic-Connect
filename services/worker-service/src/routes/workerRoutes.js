const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');
const ROLES = require('../constants/roles');
const workerController = require('../controllers/workerController');
const {
  validate,
  createWorkerSchema,
  updateWorkerSchema,
} = require('../services/workerService');

const router = express.Router();
// debug imports
try {
  console.log('[WorkerRoutes] imports', {
    verifyToken: typeof verifyToken,
    authorizeRoles: typeof authorizeRoles,
    ROLES: ROLES,
    workerController_getMe: typeof workerController.getMe,
    validate: typeof validate,
  });
} catch (e) {
  console.log('[WorkerRoutes] imports - error', e && e.message);
}

router.use(verifyToken);
// Additional debug: print controller object and available keys to detect missing exports
try {
  console.log('workerController:', workerController);
  console.log('Available exports:', Object.keys(workerController));
} catch (e) {
  console.log('[WorkerRoutes] controller dump failed', e && e.message);
}

router.get(
  '/performance',
  authorizeRoles(ROLES.ADMIN),
  workerController.getPerformance
);

router.get(
  '/department/:dept',
  authorizeRoles(ROLES.ADMIN),
  workerController.getWorkersByDepartment
);

router
  .route('/')
  .post(
    authorizeRoles(ROLES.ADMIN),
    validate(createWorkerSchema),
    workerController.createWorker
  )
  .get(authorizeRoles(ROLES.ADMIN), workerController.getWorkers);

router.get(
  '/me',
  authorizeRoles(ROLES.WORKER),
  workerController.getMe
);

router.get(
  '/me/tasks',
  authorizeRoles(ROLES.WORKER),
  workerController.getMyTasks
);

router.get(
  '/:id/tasks',
  authorizeRoles(ROLES.ADMIN, ROLES.WORKER),
  workerController.getWorkerTasks
);

router
  .route('/:id')
  .get(
    authorizeRoles(ROLES.ADMIN, ROLES.WORKER),
    workerController.getWorkerById
  )
  .patch(
    authorizeRoles(ROLES.ADMIN),
    validate(updateWorkerSchema),
    workerController.updateWorker
  )
  .delete(authorizeRoles(ROLES.ADMIN), workerController.deleteWorker);

module.exports = router;
