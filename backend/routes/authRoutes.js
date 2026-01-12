// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware'); // Ton middleware Multer existant
// Définition des URLs
router.post('/register', authController.register);
router.post('/login', authController.login);
router.put('/profile', authMiddleware, authController.updateProfile);
router.post('/profile/avatar', authMiddleware, upload.single('avatar'), authController.uploadAvatar);
module.exports = router;