const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const {
  FOLDER_MAP,
  uploadToCloudinary,
  deleteFromCloudinary,
} = require('../config/cloudinary');

const uploadFiles = asyncHandler(async (req, res) => {
  const folderKey = req.query.folder || req.body.folder || 'complaints';
  const folder = FOLDER_MAP[folderKey];

  if (!folder) {
    throw new ApiError(400, 'Invalid folder. Use complaints, before, or after');
  }

  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, 'No files uploaded');
  }

  const uploads = await Promise.all(
    req.files.map(async (file) => {
      const result = await uploadToCloudinary(file.buffer, folder);
      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    })
  );

  res.status(201).json(new ApiResponse(201, uploads, 'Files uploaded successfully'));
});

const deleteFile = asyncHandler(async (req, res) => {
  const publicId = decodeURIComponent(req.params.publicId || '');

  if (!publicId) {
    throw new ApiError(400, 'publicId is required');
  }

  const result = await deleteFromCloudinary(publicId);

  if (result.result !== 'ok' && result.result !== 'not found') {
    throw new ApiError(500, 'Failed to delete file from Cloudinary');
  }

  res.status(200).json(new ApiResponse(200, { publicId }, 'File deleted successfully'));
});

module.exports = { uploadFiles, deleteFile };
