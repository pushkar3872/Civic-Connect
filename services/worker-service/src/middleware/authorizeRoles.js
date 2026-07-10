const ApiError = require('../utils/ApiError');

const authorizeRoles = (...roles) => (req, res, next) => {
  try {
    console.log('[WorkerService] authorizeRoles - required:', roles, 'req.user:', req.user);
  } catch (e) {}
  if (!req.user || !roles.includes(req.user.role)) {
    console.error('[WorkerService] authorizeRoles - access denied', { requiredRoles: roles, userRole: req.user?.role, userId: req.user?.id });
    return next(new ApiError(403, 'Forbidden: insufficient permissions'));
  }
  next();
};

module.exports = authorizeRoles;
