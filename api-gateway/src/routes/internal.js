const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const verifyInternalSecret = require('../middleware/verifyInternalSecret');
const { isValidEvent, isValidRoom } = require('../socket/events');

const router = express.Router();

router.post(
  '/socket/emit',
  verifyInternalSecret,
  asyncHandler(async (req, res) => {
    const { event, room, data } = req.body;
    const io = req.app.get('io');

    if (!event) {
      throw new ApiError(400, 'Event name is required');
    }

    if (!isValidEvent(event)) {
      throw new ApiError(400, `Invalid event. Allowed events: complaint:new, complaint:assigned, complaint:updated, complaint:completed, complaint:closed, worker:created, worker:updated, worker:deleted`);
    }

    if (!room) {
      throw new ApiError(400, 'Room is required');
    }

    if (!isValidRoom(room)) {
      throw new ApiError(400, 'Invalid room. Use admin:room or user:<userId>');
    }

    if (room === 'admin:room') {
      io.to('admin:room').emit(event, data ?? {});
    } else {
      io.to(room).emit(event, data ?? {});
    }

    const response = new ApiResponse(200, { event, room }, 'Socket event emitted');
    res.status(response.statusCode).json(response);
  }),
);

module.exports = router;
