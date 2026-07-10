const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const { upload, handleMulterError } = require('../middleware/multer');
const fileController = require('../controllers/fileController');

const router = express.Router();

router.use(verifyToken);

router.post(
  '/upload',
  upload.array('files', 5),
  handleMulterError,
  fileController.uploadFiles
);

router.delete(
  /^\/(.+)/,
  (req, res, next) => {
    req.params.publicId = req.params[0];
    next();
  },
  fileController.deleteFile
);

module.exports = router;
