const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const verifyInternalService = require('../middleware/verifyInternalService');
const notificationController = require('../controllers/notificationController');
const { validateTrigger } = require('../services/notificationService');

const router = express.Router();

router.post(
  '/trigger',
  verifyInternalService,
  validateTrigger,
  notificationController.triggerNotification
);

router.use(verifyToken);

router.get('/', notificationController.getNotifications);
router.patch('/read-all', notificationController.markAllNotificationsRead);
router.patch('/:id/read', notificationController.markNotificationRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
