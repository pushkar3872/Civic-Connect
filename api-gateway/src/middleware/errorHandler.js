const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err instanceof ApiError ? err.statusCode : err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: err.errors || [],
  });
};

module.exports = errorHandler;
