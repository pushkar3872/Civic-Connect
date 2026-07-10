const express = require('express');
const complaintController = require('../controllers/complaintController');
const verifyToken = require('../middleware/verifyToken');
const authorizeRoles = require('../middleware/authorizeRoles');
const validate = require('../middleware/validate');
const ROLES = require('../constants/roles');
const {
  createComplaintSchema,
  updateStatusSchema,
  assignWorkerSchema,
  verifyComplaintSchema,
  closeComplaintSchema,
} = require('../validations/complaintValidation');

const router = express.Router();

router.post(
  '/',
  verifyToken,
  authorizeRoles(ROLES.CITIZEN),
  validate(createComplaintSchema),
  complaintController.createComplaint
);

router.get(
  '/',
  verifyToken,
  authorizeRoles(ROLES.ADMIN),
  complaintController.getAllComplaints
);

router.get(
  '/my',
  verifyToken,
  authorizeRoles(ROLES.CITIZEN),
  complaintController.getMyComplaints
);

router.get(
  '/internal/worker/:workerId',
  verifyToken,
  authorizeRoles(ROLES.ADMIN, ROLES.WORKER),
  complaintController.getComplaintsByWorker
);

router.get('/:id', verifyToken, complaintController.getComplaintById);

router.patch(
  '/:id/status',
  verifyToken,
  authorizeRoles(ROLES.ADMIN, ROLES.WORKER),
  validate(updateStatusSchema),
  complaintController.updateComplaintStatus
);

router.patch(
  '/:id/assign',
  verifyToken,
  authorizeRoles(ROLES.ADMIN),
  validate(assignWorkerSchema),
  complaintController.assignWorker
);

router.patch(
  '/:id/verify',
  verifyToken,
  authorizeRoles(ROLES.ADMIN),
  validate(verifyComplaintSchema),
  complaintController.verifyComplaint
);

router.patch(
  '/:id/close',
  verifyToken,
  authorizeRoles(ROLES.ADMIN),
  validate(closeComplaintSchema),
  complaintController.closeComplaint
);

router.delete(
  '/:id',
  verifyToken,
  authorizeRoles(ROLES.ADMIN),
  complaintController.deleteComplaint
);

module.exports = router;
