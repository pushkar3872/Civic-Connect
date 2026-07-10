const multer = require('multer');
const ApiError = require('../utils/ApiError');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 5;

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only jpg, jpeg, png, and webp images are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },
});

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new ApiError(400, 'Each file must be 5MB or less'));
    }
    if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(new ApiError(400, 'Maximum 5 files allowed per upload'));
    }
    return next(new ApiError(400, err.message));
  }
  next(err);
};

module.exports = { upload, handleMulterError, MAX_FILES };
