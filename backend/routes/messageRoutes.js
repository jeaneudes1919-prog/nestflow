const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, messageController.sendMessage);
router.get('/inbox', authMiddleware, messageController.getConversations);
router.get('/:propertyId/:contactId', authMiddleware, messageController.getChatHistory);
router.put('/read/:propertyId/:contactId', authMiddleware, messageController.markAsRead);
module.exports = router;