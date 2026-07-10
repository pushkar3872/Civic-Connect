const mongoose = require('mongoose');
const { DEPARTMENTS } = require('../constants/departments');

const workerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    department: {
      type: String,
      enum: DEPARTMENTS,
      required: true,
    },
    availability: { type: Boolean, default: true },
    activeTasks: { type: Number, default: 0 },
    completedTasks: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Worker', workerSchema);
