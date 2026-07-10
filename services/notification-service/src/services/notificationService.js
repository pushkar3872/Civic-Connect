const { z } = require('zod');
const Notification = require('../models/Notification');
const NOTIFICATION_TYPES = require('../constants/notificationTypes');
const ApiError = require('../utils/ApiError');
const { sendEmail } = require('./emailService');

const triggerSchema = z.object({
  userId: z.string().min(1, 'userId is required'),
  title: z.string().min(1, 'title is required'),
  message: z.string().min(1, 'message is required'),
  type: z.enum(Object.values(NOTIFICATION_TYPES)),
  complaintId: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  userName: z.string().optional(),
  complaintTitle: z.string().optional(),
  workerName: z.string().optional(),
});

const validateTrigger = (req, res, next) => {
  const result = triggerSchema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return next(new ApiError(422, 'Validation failed', errors));
  }
  req.body = result.data;
  next();
};

const createNotification = async (payload) => {
  const notification = await Notification.create({
    userId: payload.userId,
    title: payload.title,
    message: payload.message,
    type: payload.type,
    complaintId: payload.complaintId,
  });

  if (payload.email) {
    try {
      await sendEmail(payload.type, payload.email, {
        complaintId: payload.complaintId,
        userName: payload.userName,
        complaintTitle: payload.complaintTitle,
        workerName: payload.workerName,
      });
      console.log(`[NotificationService] Email sent successfully to ${payload.email} for type ${payload.type}`);
    } catch (emailError) {
      console.error(`[NotificationService] Failed to send email to ${payload.email}:`, emailError.message);
    }
  }

  return notification;
};

const getUserNotifications = async (userId) =>
  Notification.find({ userId }).sort({ createdAt: -1 });

const markAsRead = async (id, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: id, userId },
    { read: true },
    { new: true }
  );
  if (!notification) throw new ApiError(404, 'Notification not found');
  return notification;
};

const markAllAsRead = async (userId) => {
  await Notification.updateMany({ userId, read: false }, { read: true });
  return Notification.find({ userId }).sort({ createdAt: -1 });
};

const deleteNotification = async (id, userId) => {
  const notification = await Notification.findOneAndDelete({ _id: id, userId });
  if (!notification) throw new ApiError(404, 'Notification not found');
  return notification;
};

module.exports = {
  validateTrigger,
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
