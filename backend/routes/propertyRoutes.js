const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const authMiddleware = require('../middlewares/authMiddleware');

// --- IMPORT CLOUDINARY ---
// On remplace l'ancien middleware local par celui de Cloudinary
const { uploadCloud } = require('../config/cloudinary');

// --- ROUTES PUBLIQUES ---
// Voir toutes les annonces
router.get('/', propertyController.getAllProperties);

// Voir les détails d'un bien
router.get('/:id', propertyController.getPropertyById);


// --- ROUTES PROTÉGÉES (Connexion requise) ---

// Créer une nouvelle annonce (Données textuelles)
router.post('/', authMiddleware, propertyController.createProperty);

/**
 * OPTION PREMIUM : Créer et Upload en une seule fois
 * Si tu veux que l'utilisateur puisse envoyer les photos DIRECTEMENT à la création.
 * router.post('/full', authMiddleware, uploadCloud.array('images', 5), propertyController.createPropertyWithImages);
 */

// Upload de plusieurs images vers Cloudinary (Max 5)
// req.files contiendra maintenant les URLs sécurisées (https://res.cloudinary.com/...)
router.post(
    '/:id/images', 
    authMiddleware, 
    uploadCloud.array('images', 5), 
    propertyController.uploadPropertyImages
);

// Statistiques de l'hôte
router.get('/host/stats', authMiddleware, propertyController.getHostStats);

// Mises à jour et suppressions
router.put('/:id', authMiddleware, propertyController.updateProperty);
router.delete('/:id', authMiddleware, propertyController.deleteProperty);

// Suppression d'une image spécifique (Pense à la supprimer aussi sur Cloudinary dans ton controller !)
router.delete('/image/:imageId', authMiddleware, propertyController.deleteImage);

module.exports = router;