// controllers/reservationController.js
const db = require('../config/db');

exports.createReservation = async (req, res) => {
    const { property_id, start_date, end_date } = req.body;
    const guest_id = req.user.id; // L'utilisateur qui réserve

    try {
        // 1. Validation de base : Date de fin > Date de début
        if (new Date(start_date) >= new Date(end_date)) {
            return res.status(400).json({ error: 'La date de fin doit être après la date de début.' });
        }

        // 2. LE CHALLENGE TECHNIQUE : Vérifier si le bien est déjà réservé sur ces dates
        // On cherche une réservation qui "chevauche" la période demandée.
        // Logique SQL : (Debut_Existant < Fin_Demandee) ET (Fin_Existante > Debut_Demande)
        const conflictCheck = await db.query(
            `SELECT * FROM reservations 
             WHERE property_id = $1 
             AND status != 'cancelled'
             AND (start_date < $3 AND end_date > $2)`,
            [property_id, start_date, end_date]
        );

        if (conflictCheck.rows.length > 0) {
            return res.status(409).json({ error: 'Ce bien n\'est pas disponible à ces dates.' });
        }

        /// 3. Récupérer le prix ET L'ID DU PROPRIÉTAIRE (Ajout de host_id)
        const propertyResult = await db.query('SELECT price_per_night, title, host_id FROM properties WHERE id = $1', [property_id]);
        
        if (propertyResult.rows.length === 0) return res.status(404).json({ error: 'Bien introuvable' });
        
        const property = propertyResult.rows[0];

        // --- NOUVELLE VÉRIFICATION ICI ---
        if (property.host_id === guest_id) {
            return res.status(400).json({ error: "Vous ne pouvez pas réserver votre propre bien !" });
        }

        // 4. Calcul du prix total
        // On calcule la différence en jours
        const start = new Date(start_date);
        const end = new Date(end_date);
        const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        const total_price = nights * property.price_per_night;

        // 5. Création de la réservation
        const newReservation = await db.query(
            `INSERT INTO reservations (property_id, guest_id, start_date, end_date, total_price)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [property_id, guest_id, start_date, end_date, total_price]
        );

        res.status(201).json({
            message: 'Réservation créée avec succès !',
            reservation: newReservation.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de la réservation' });
    }
};

// Voir MES réservations (Côté Voyageur)
exports.getMyTrips = async (req, res) => {
    try {
        const trips = await db.query(
            `SELECT r.*, p.title, p.location, pi.image_url 
             FROM reservations r
             JOIN properties p ON r.property_id = p.id
             LEFT JOIN property_images pi ON p.id = pi.property_id AND pi.is_cover = true
             WHERE r.guest_id = $1
             ORDER BY r.start_date DESC`,
            [req.user.id]
        );
        res.json(trips.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};
// ... (code existant)

// CÔTÉ HÔTE : Voir les réservations sur MES propriétés
exports.getHostReservations = async (req, res) => {
    const host_id = req.user.id;

    try {
        // La requête est un peu complexe : 
        // On veut les réservations (r)
        // Liées à des propriétés (p) qui appartiennent à l'hôte connecté
        // On veut aussi le nom du voyageur (u)
        const query = `
            SELECT r.*, p.title as property_title, u.username as guest_name, u.email as guest_email
            FROM reservations r
            JOIN properties p ON r.property_id = p.id
            JOIN users u ON r.guest_id = u.id
            WHERE p.host_id = $1
            ORDER BY r.created_at DESC
        `;
        
        const result = await db.query(query, [host_id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// CÔTÉ HÔTE : Accepter ou Refuser (Changer le statut)
exports.updateReservationStatus = async (req, res) => {
    const { id } = req.params; // ID de la réservation
    const { status } = req.body; // 'confirmed' ou 'cancelled'

    // Validation simple
    if (!['confirmed', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Statut invalide' });
    }

    try {
        // Vérification de sécurité : Est-ce que cette réservation concerne bien un bien de l'hôte connecté ?
        // C'est vital pour empêcher un hôte A de valider les résas d'un hôte B.
        const checkOwner = await db.query(`
            SELECT r.id FROM reservations r
            JOIN properties p ON r.property_id = p.id
            WHERE r.id = $1 AND p.host_id = $2
        `, [id, req.user.id]);

        if (checkOwner.rows.length === 0) {
            return res.status(403).json({ error: 'Accès non autorisé à cette réservation' });
        }

        // Mise à jour
        const updated = await db.query(
            'UPDATE reservations SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );

        res.json({ message: `Réservation ${status}`, reservation: updated.rows[0] });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};