const db = require('../config/db');

// Envoyer un message
exports.sendMessage = async (req, res) => {
    const { receiver_id, content, property_id } = req.body;
    const sender_id = req.user.id;

    try {
        const newMessage = await db.query(
            `INSERT INTO messages (sender_id, receiver_id, content, property_id) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [sender_id, receiver_id, content, property_id]
        );
        res.status(201).json(newMessage.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de l\'envoi du message' });
    }
};

// Récupérer la liste des conversations (Inbox)
// backend/controllers/messageController.js

exports.getConversations = async (req, res) => {
    const userId = req.user.id;
    try {
        const query = `
            SELECT 
                u.id as contact_id, 
                u.username as contact_name,
                p.id as property_id,
                p.title as property_title,
                m.content as last_message,
                m.created_at,
                -- On compte les messages où l'utilisateur actuel est le destinataire et is_read est false
                (SELECT COUNT(*) FROM messages 
                 WHERE sender_id = u.id AND receiver_id = $1 AND is_read = false) as unread_count
            FROM messages m
            JOIN users u ON (m.sender_id = u.id OR m.receiver_id = u.id)
            JOIN properties p ON m.property_id = p.id
            WHERE (m.sender_id = $1 OR m.receiver_id = $1) AND u.id != $1
            AND m.id IN (
                SELECT MAX(id) FROM messages 
                WHERE sender_id = $1 OR receiver_id = $1 
                GROUP BY LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id), property_id
            )
            ORDER BY m.created_at DESC
        `;
        const conversations = await db.query(query, [userId]);
        res.json(conversations.rows);
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// Nouvelle fonction pour marquer comme lu quand on ouvre la discussion
exports.markAsRead = async (req, res) => {
    const { propertyId, contactId } = req.params;
    const userId = req.user.id;
    try {
        await db.query(
            "UPDATE messages SET is_read = true WHERE property_id = $1 AND sender_id = $2 AND receiver_id = $3",
            [propertyId, contactId, userId]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Erreur' });
    }
};

// Récupérer les messages d'une discussion précise
exports.getChatHistory = async (req, res) => {
    const { contactId, propertyId } = req.params;
    const userId = req.user.id;
    try {
        const messages = await db.query(
            `SELECT * FROM messages 
             WHERE property_id = $1 
             AND ((sender_id = $2 AND receiver_id = $3) OR (sender_id = $3 AND receiver_id = $2))
             ORDER BY created_at ASC`,
            [propertyId, userId, contactId]
        );
        res.json(messages.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};