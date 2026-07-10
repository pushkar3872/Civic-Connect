const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');

const verifyToken = (req, res, next) => {
  const internalSecret = req.headers['x-internal-secret'] || req.headers['x-service-key'];
  const expectedSecret = process.env.INTERNAL_SERVICE_SECRET || process.env.INTERNAL_SERVICE_KEY;
  if (internalSecret && expectedSecret && internalSecret === expectedSecret) {
    req.user = { id: 'internal', role: 'ADMIN' };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Access token required'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    try {
      console.log('[WorkerService] verifyToken decoded user:', {
        id: decoded.id || decoded._id,
        role: decoded.role,
        email: decoded.email,
      });
    } catch (e) {
      console.log('[WorkerService] verifyToken decoded (raw):', decoded);
    }
    next();
  } catch {
    next(new ApiError(401, 'Invalid or expired token'));
  }
};

module.exports = verifyToken;
