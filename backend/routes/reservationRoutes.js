// routes/reservationRoutes.js
const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const authMiddleware = require('../middlewares/authMiddleware');

// Toutes les routes de réservation nécessitent d'être connecté
router.use(authMiddleware);

router.post('/', reservationController.createReservation);
router.get('/my-trips', reservationController.getMyTrips);
router.get('/manage', reservationController.getHostReservations); // Voir les demandes
router.put('/:id/status', reservationController.updateReservationStatus); // Accepter/Refuser
module.exports = router;