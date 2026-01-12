// backend/controllers/reviewController.js
const db = require('../config/db');

exports.addReview = async (req, res) => {
    const { property_id, rating, comment } = req.body;
    const guest_id = req.user.id;

    try {
        // 1. VÉRIFICATION STRICTE
        // L'utilisateur a-t-il une réservation CONFIRMÉE pour ce bien ?
        // (Idéalement, on vérifie aussi que la date de fin est passée, mais restons simples pour le test)
        const checkBooking = await db.query(
            `SELECT * FROM reservations 
             WHERE property_id = $1 
             AND guest_id = $2 
             AND status = 'confirmed'`,
            [property_id, guest_id]
        );

        if (checkBooking.rows.length === 0) {
            return res.status(403).json({ error: "Vous devez avoir séjourné dans ce logement pour le noter." });
        }

        // 2. VÉRIFIER S'IL A DÉJÀ NOTÉ (Un seul avis par séjour)
        const checkExisting = await db.query(
            'SELECT * FROM reviews WHERE property_id = $1 AND guest_id = $2',
            [property_id, guest_id]
        );

        if (checkExisting.rows.length > 0) {
            return res.status(400).json({ error: "Vous avez déjà donné votre avis sur ce logement." });
        }

        // 3. CRÉATION DE L'AVIS
        const newReview = await db.query(
            'INSERT INTO reviews (property_id, guest_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
            [property_id, guest_id, rating, comment]
        );

        res.status(201).json(newReview.rows[0]);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// Récupérer les avis d'un bien
exports.getPropertyReviews = async (req, res) => {
    const { propertyId } = req.params;
    try {
        const reviews = await db.query(
            `SELECT r.*, u.username, u.avatar_url 
             FROM reviews r
             JOIN users u ON r.guest_id = u.id
             WHERE r.property_id = $1
             ORDER BY r.created_at DESC`,
            [propertyId]
        );
        res.json(reviews.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};