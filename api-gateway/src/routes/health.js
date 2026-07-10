const express = require('express');
const ApiResponse = require('../utils/ApiResponse');

const router = express.Router();

router.get('/', (req, res) => {
  const response = new ApiResponse(200, {
    service: 'civic-connect-api-gateway',
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }, 'API Gateway is healthy');
  res.status(response.statusCode).json(response);
});

module.exports = router;
