const mongoose = require('mongoose');
const CATEGORIES = require('../constants/categories');
const PRIORITIES = require('../constants/priorities');
const { STATUSES } = require('../constants/statuses');

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: Object.values(CATEGORIES),
      required: true,
    },
    department: { type: String, required: true },
    priority: {
      type: String,
      enum: Object.values(PRIORITIES),
      default: PRIORITIES.MEDIUM,
    },
    citizenId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    assignedWorker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
    },
    status: {
      type: String,
      enum: Object.values(STATUSES),
      default: STATUSES.NEW,
    },
    images: [imageSchema],
    beforeImages: [imageSchema],
    afterImages: [imageSchema],
    location: {
      latitude: Number,
      longitude: Number,
      address: String,
    },
    adminRemarks: { type: String },
    workerRemarks: { type: String },
    closedAt: { type: Date },
  },
  { timestamps: true }
);

complaintSchema.index({ citizenId: 1, createdAt: -1 });
complaintSchema.index({ status: 1, category: 1, department: 1, priority: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
