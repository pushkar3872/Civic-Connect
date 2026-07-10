const mongoose = require('mongoose');
const CATEGORIES = require('../constants/categories');

const complaintSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: Object.values(CATEGORIES),
    },
    department: { type: String },
    priority: { type: String },
    citizenId: { type: mongoose.Schema.Types.ObjectId, required: true },
    assignedWorker: { type: mongoose.Schema.Types.ObjectId },
    status: { type: String, default: 'NEW' },
    images: [{ url: String, publicId: String }],
    beforeImages: [{ url: String, publicId: String }],
    afterImages: [{ url: String, publicId: String }],
    location: {
      latitude: Number,
      longitude: Number,
      address: String,
    },
    adminRemarks: String,
    workerRemarks: String,
    closedAt: Date,
  },
  { timestamps: true, collection: 'complaints' }
);

module.exports = mongoose.model('Complaint', complaintSchema);
