const mongoose = require('mongoose');
const NOTIFICATION_TYPES = require('../constants/notificationTypes');

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPES),
      required: true,
    },
    read: { type: Boolean, default: false },
    complaintId: { type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
