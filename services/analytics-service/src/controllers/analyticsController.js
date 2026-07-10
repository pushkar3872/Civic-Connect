const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const analyticsService = require('../services/analyticsService');

const getDashboard = asyncHandler(async (req, res) => {
  const data = await analyticsService.getDashboardMetrics();
  res.status(200).json(new ApiResponse(200, data));
});

const getComplaintsAnalytics = asyncHandler(async (req, res) => {
  const data = await analyticsService.getComplaintBreakdown();
  res.status(200).json(new ApiResponse(200, data));
});

const getWorkersAnalytics = asyncHandler(async (req, res) => {
  const data = await analyticsService.getWorkerMetrics();
  res.status(200).json(new ApiResponse(200, data));
});

const getTrendsAnalytics = asyncHandler(async (req, res) => {
  const data = await analyticsService.getTrendMetrics();
  res.status(200).json(new ApiResponse(200, data));
});

module.exports = {
  getDashboard,
  getComplaintsAnalytics,
  getWorkersAnalytics,
  getTrendsAnalytics,
};
