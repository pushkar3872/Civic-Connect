const errorHandler = (err, req, res, next) => {
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Email already registered',
      errors: [{ field: 'email', message: 'Email already registered' }],
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    errors: err.errors || [],
  });
};

module.exports = errorHandler;
