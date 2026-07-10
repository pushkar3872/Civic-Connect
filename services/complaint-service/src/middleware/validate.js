const ApiError = require('../utils/ApiError');

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    return next(new ApiError(422, 'Validation failed', errors));
  }
  req.body = result.data;
  next();
};

module.exports = validate;
