const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'nestflow_properties',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const uploadCloud = multer({ storage });

// CHANGE CETTE LIGNE : On exporte un objet avec des accolades
module.exports = { cloudinary, uploadCloud };