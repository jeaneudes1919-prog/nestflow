const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, reviewController.addReview);
router.get('/:propertyId', reviewController.getPropertyReviews);

module.exports = router;