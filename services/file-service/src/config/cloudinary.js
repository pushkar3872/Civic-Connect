const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const FOLDER_MAP = {
  complaints: 'civic-connect/complaints',
  before: 'civic-connect/before',
  after: 'civic-connect/after',
};

const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });

const deleteFromCloudinary = (publicId) =>
  cloudinary.uploader.destroy(publicId, { resource_type: 'image' });

module.exports = {
  cloudinary,
  FOLDER_MAP,
  uploadToCloudinary,
  deleteFromCloudinary,
};
