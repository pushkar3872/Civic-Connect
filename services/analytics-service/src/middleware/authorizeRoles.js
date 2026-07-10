const ApiError = require('../utils/ApiError');

const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(403, 'Forbidden: insufficient permissions'));
  }
  next();
};

module.exports = authorizeRoles;
