const ApiError = require('../utils/ApiError');

const verifyInternalService = (req, res, next) => {
  const serviceKey = req.headers['x-service-key'];
  const expectedKey = process.env.INTERNAL_SERVICE_KEY;

  if (!expectedKey) {
    return next(new ApiError(500, 'INTERNAL_SERVICE_KEY is not configured'));
  }

  if (!serviceKey || serviceKey !== expectedKey) {
    return next(new ApiError(403, 'Forbidden: invalid service key'));
  }

  next();
};

module.exports = verifyInternalService;
