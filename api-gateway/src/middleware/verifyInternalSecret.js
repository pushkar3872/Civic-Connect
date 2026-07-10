const ApiError = require('../utils/ApiError');

const verifyInternalSecret = (req, res, next) => {
  const secret = req.headers['x-internal-secret'];
  if (!secret || secret !== process.env.INTERNAL_SERVICE_SECRET) {
    return next(new ApiError(403, 'Forbidden: invalid internal service secret'));
  }
  next();
};

module.exports = verifyInternalSecret;
