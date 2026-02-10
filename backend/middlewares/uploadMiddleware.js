// middlewares/uploadMiddleware.js
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// 1. Configuration de Cloudinary (Assure-toi que tes variables d'env sont sur Render)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Configuration du stockage Cloudinary au lieu du DiskStorage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'nestflow_uploads', // Dossier automatique dans Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    // Cloudinary gère le renommage unique automatiquement
  },
});

// 3. Le filtre reste identique pour la sécurité
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Le fichier doit être une image !'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;