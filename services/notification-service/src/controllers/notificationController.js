const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const notificationService = require('../services/notificationService');

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await notificationService.getUserNotifications(req.user.id);
  res.status(200).json(new ApiResponse(200, notifications));
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user.id);
  res.status(200).json(new ApiResponse(200, notification, 'Notification marked as read'));
});

const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const notifications = await notificationService.markAllAsRead(req.user.id);
  res.status(200).json(new ApiResponse(200, notifications, 'All notifications marked as read'));
});

const deleteNotification = asyncHandler(async (req, res) => {
  await notificationService.deleteNotification(req.params.id, req.user.id);
  res.status(200).json(new ApiResponse(200, null, 'Notification deleted successfully'));
});

const triggerNotification = asyncHandler(async (req, res) => {
  const notification = await notificationService.createNotification(req.body);
  res.status(201).json(new ApiResponse(201, notification, 'Notification triggered successfully'));
});

module.exports = {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  triggerNotification,
};
