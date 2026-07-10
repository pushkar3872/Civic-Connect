const Complaint = require('../models/Complaint');
const CATEGORIES = require('../constants/categories');
const STATUSES = require('../constants/statuses');

const PENDING_STATUSES = [
  STATUSES.NEW,
  STATUSES.UNDER_REVIEW,
  STATUSES.ASSIGNED,
  STATUSES.IN_PROGRESS,
  STATUSES.COMPLETED_BY_WORKER,
  STATUSES.REWORK_REQUIRED,
];

const buildCategoryMap = () =>
  Object.values(CATEGORIES).reduce((acc, category) => {
    acc[category] = 0;
    return acc;
  }, {});

const buildStatusMap = () =>
  Object.values(STATUSES).reduce((acc, status) => {
    acc[status] = 0;
    return acc;
  }, {});

const getMonthlyTrends = async () => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  const trends = await Complaint.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const monthLabels = [];
  for (let i = 11; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthLabels.push({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      label: date.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
    });
  }

  return monthLabels.map(({ year, month, label }) => {
    const match = trends.find((t) => t._id.year === year && t._id.month === month);
    return {
      month: label,
      year,
      monthNumber: month,
      count: match ? match.count : 0,
    };
  });
};

const getWorkerPerformanceFromComplaints = async () => {
  const performance = await Complaint.aggregate([
    { $match: { assignedWorker: { $ne: null } } },
    {
      $group: {
        _id: '$assignedWorker',
        totalAssigned: { $sum: 1 },
        completed: {
          $sum: {
            $cond: [
              {
                $in: [
                  '$status',
                  [STATUSES.COMPLETED_BY_WORKER, STATUSES.VERIFIED_BY_ADMIN, STATUSES.CLOSED],
                ],
              },
              1,
              0,
            ],
          },
        },
        verified: {
          $sum: {
            $cond: [
              { $in: ['$status', [STATUSES.VERIFIED_BY_ADMIN, STATUSES.CLOSED]] },
              1,
              0,
            ],
          },
        },
        avgResolutionMs: {
          $avg: {
            $cond: [
              { $and: [{ $ne: ['$closedAt', null] }, { $ne: ['$createdAt', null] }] },
              { $subtract: ['$closedAt', '$createdAt'] },
              null,
            ],
          },
        },
      },
    },
    { $sort: { completed: -1 } },
  ]);

  return performance.map((item) => ({
    workerId: item._id,
    totalAssigned: item.totalAssigned,
    completed: item.completed,
    verified: item.verified,
    avgResolutionTimeHours: item.avgResolutionMs
      ? Math.round((item.avgResolutionMs / (1000 * 60 * 60)) * 100) / 100
      : 0,
  }));
};

const getAvgResolutionTimeHours = async () => {
  const result = await Complaint.aggregate([
    {
      $match: {
        closedAt: { $ne: null },
        status: { $in: [STATUSES.VERIFIED_BY_ADMIN, STATUSES.CLOSED] },
      },
    },
    {
      $group: {
        _id: null,
        avgMs: { $avg: { $subtract: ['$closedAt', '$createdAt'] } },
      },
    },
  ]);

  if (!result.length || !result[0].avgMs) return 0;
  return Math.round((result[0].avgMs / (1000 * 60 * 60)) * 100) / 100;
};

const getDashboardMetrics = async () => {
  const [
    totalComplaints,
    pendingComplaints,
    resolvedComplaints,
    closedComplaints,
    categoryAgg,
    statusAgg,
    departmentAgg,
    avgResolutionTimeHours,
    workerPerformance,
    monthlyTrends,
  ] = await Promise.all([
    Complaint.countDocuments(),
    Complaint.countDocuments({ status: { $in: PENDING_STATUSES } }),
    Complaint.countDocuments({ status: STATUSES.VERIFIED_BY_ADMIN }),
    Complaint.countDocuments({ status: STATUSES.CLOSED }),
    Complaint.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Complaint.aggregate([{ $group: { _id: '$department', count: { $sum: 1 } } }]),
    getAvgResolutionTimeHours(),
    getWorkerPerformanceFromComplaints(),
    getMonthlyTrends(),
  ]);

  const byCategory = buildCategoryMap();
  categoryAgg.forEach((item) => {
    if (item._id) byCategory[item._id] = item.count;
  });

  const byStatus = buildStatusMap();
  statusAgg.forEach((item) => {
    if (item._id) byStatus[item._id] = item.count;
  });

  const byDepartment = {};
  departmentAgg.forEach((item) => {
    if (item._id) byDepartment[item._id] = item.count;
  });

  return {
    totalComplaints,
    pendingComplaints,
    resolvedComplaints,
    closedComplaints,
    byCategory,
    byStatus,
    byDepartment,
    avgResolutionTimeHours,
    workerPerformance,
    monthlyTrends,
  };
};

const getComplaintBreakdown = async () => {
  const [byCategory, byStatus, byDepartment] = await Promise.all([
    Complaint.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Complaint.aggregate([{ $group: { _id: '$department', count: { $sum: 1 } } }]),
  ]);

  const categoryMap = buildCategoryMap();
  byCategory.forEach((item) => {
    if (item._id) categoryMap[item._id] = item.count;
  });

  const statusMap = buildStatusMap();
  byStatus.forEach((item) => {
    if (item._id) statusMap[item._id] = item.count;
  });

  const departmentMap = {};
  byDepartment.forEach((item) => {
    if (item._id) departmentMap[item._id] = item.count;
  });

  return {
    byCategory: categoryMap,
    byStatus: statusMap,
    byDepartment: departmentMap,
  };
};

const getWorkerMetrics = async () => getWorkerPerformanceFromComplaints();

const getTrendMetrics = async () => getMonthlyTrends();

module.exports = {
  getDashboardMetrics,
  getComplaintBreakdown,
  getWorkerMetrics,
  getTrendMetrics,
};
