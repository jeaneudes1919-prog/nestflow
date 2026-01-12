const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// --- ROUTES PUBLIQUES ---
// Voir toutes les annonces (Home & AllProperties)
router.get('/', propertyController.getAllProperties);

// Voir les détails d'un bien (PropertyDetails)
router.get('/:id', propertyController.getPropertyById);


// --- ROUTES PROTÉGÉES (Connexion requise) ---

// Créer une nouvelle annonce
router.post('/', authMiddleware, propertyController.createProperty);

// Upload de plusieurs images (Maximum 5 images à la fois)
// On utilise .array('images', 5) au lieu de .single('image')
router.post(
    '/:id/images', 
    authMiddleware, 
    upload.array('images', 5), 
    propertyController.uploadPropertyImages
);

// Mettre à jour une annonce (Vérifie si pas de réservation en cours dans le controller)
router.put('/:id', authMiddleware, propertyController.updateProperty);
router.get('/host/stats', authMiddleware, propertyController.getHostStats);
router.delete('/:id', authMiddleware, propertyController.deleteProperty);
router.delete('/image/:imageId', authMiddleware, propertyController.deleteImage);
module.exports = router;