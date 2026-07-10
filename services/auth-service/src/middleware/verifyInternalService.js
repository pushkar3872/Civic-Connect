const ApiError = require('../utils/ApiError');

const verifyInternalService = (req, res, next) => {
  const serviceSecret = req.headers['x-internal-secret'];
  const expectedSecret = process.env.INTERNAL_SERVICE_SECRET || 'your-internal-service-secret';

  if (!serviceSecret || serviceSecret !== expectedSecret) {
    return next(new ApiError(403, 'Forbidden: invalid internal service secret'));
  }

  next();
};

module.exports = verifyInternalService;
