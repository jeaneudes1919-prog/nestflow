const db = require('../config/db');

// --- 1. CRÉER UNE ANNONCE ---
exports.createProperty = async (req, res) => {
    const { title, description, price_per_night, location, max_guests, amenities } = req.body;
    const host_id = req.user.id;

    try {
        const newProperty = await db.query(
            `INSERT INTO properties 
            (host_id, title, description, price_per_night, location, max_guests, amenities) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING *`,
            [host_id, title, description, price_per_night, location, max_guests, amenities]
        );
        res.status(201).json(newProperty.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de la création du bien' });
    }
};

// --- 2. UPLOAD MULTIPLE D'IMAGES (is_main supporté) ---
exports.uploadPropertyImages = async (req, res) => {
    const { id } = req.params;
    const files = req.files;

    if (!files || files.length === 0) return res.status(400).json({ error: 'Aucun fichier envoyé' });

    try {
        const checkOwner = await db.query('SELECT host_id FROM properties WHERE id = $1', [id]);
        if (checkOwner.rows.length === 0) return res.status(404).json({ error: 'Bien introuvable' });
        if (checkOwner.rows[0].host_id !== req.user.id) return res.status(403).json({ error: 'Non autorisé' });

        const imagesResults = [];
        for (let i = 0; i < files.length; i++) {
            const imageUrl = `/uploads/${files[i].filename}`;
            const isMain = (i === 0); // La première devient principale par défaut

            const result = await db.query(
                'INSERT INTO property_images (property_id, image_url, is_main) VALUES ($1, $2, $3) RETURNING *',
                [id, imageUrl, isMain]
            );
            imagesResults.push(result.rows[0]);
        }
        res.status(201).json(imagesResults);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur lors de l'upload des images" });
    }
};

// --- 3. SUPPRIMER UNE IMAGE SPÉCIFIQUE ---
exports.deleteImage = async (req, res) => {
    const { imageId } = req.params;
    const userId = req.user.id;

    try {
        const check = await db.query(`
            SELECT pi.id FROM property_images pi
            JOIN properties p ON pi.property_id = p.id
            WHERE pi.id = $1 AND p.host_id = $2
        `, [imageId, userId]);

        if (check.rows.length === 0) return res.status(403).json({ error: "Non autorisé ou image introuvable" });

        await db.query('DELETE FROM property_images WHERE id = $1', [imageId]);
        res.json({ message: "Image supprimée" });
    } catch (err) {
        res.status(500).json({ error: "Erreur lors de la suppression de l'image" });
    }
};

// --- 4. LISTER TOUTES LES ANNONCES (Catalogage Home) ---
exports.getAllProperties = async (req, res) => {
    try {
        const query = `
            SELECT p.*, 
                   (SELECT image_url FROM property_images WHERE property_id = p.id AND is_main = true LIMIT 1) as image_url,
                   COALESCE(AVG(r.rating), 0) as average_rating,
                   COUNT(r.id) as review_count
            FROM properties p
            LEFT JOIN reviews r ON p.id = r.property_id
            GROUP BY p.id
            ORDER BY average_rating DESC, review_count DESC 
        `;
        const properties = await db.query(query);
        const formatted = properties.rows.map(prop => ({
            ...prop,
            average_rating: parseFloat(prop.average_rating).toFixed(1),
            review_count: parseInt(prop.review_count)
        }));
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// --- 5. VOIR UNE ANNONCE EN DÉTAIL ---
exports.getPropertyById = async (req, res) => {
    const { id } = req.params;
    try {
        const propQuery = `
            SELECT p.*, u.username as host_name, u.email as host_email,
                   COALESCE(AVG(r.rating), 0) as average_rating
            FROM properties p
            JOIN users u ON p.host_id = u.id
            LEFT JOIN reviews r ON p.id = r.property_id
            WHERE p.id = $1
            GROUP BY p.id, u.username, u.email
        `;
        const property = await db.query(propQuery, [id]);
        if (property.rows.length === 0) return res.status(404).json({ error: 'Bien introuvable' });

        const images = await db.query(
            'SELECT id, image_url, is_main FROM property_images WHERE property_id = $1 ORDER BY is_main DESC',
            [id]
        );

        res.json({
            ...property.rows[0],
            average_rating: parseFloat(property.rows[0].average_rating).toFixed(1),
            images: images.rows
        });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// --- 6. METTRE À JOUR UNE ANNONCE (Sécurité date) ---
exports.updateProperty = async (req, res) => {
    const { id } = req.params;
    const { title, description, price_per_night, location, max_guests, amenities } = req.body;

    try {
        const checkBookings = await db.query(
            `SELECT id FROM reservations 
             WHERE property_id = $1 
             AND status IN ('pending', 'confirmed') 
             AND end_date >= CURRENT_DATE`,
            [id]
        );

        if (checkBookings.rows.length > 0) {
            return res.status(403).json({
                error: "Modification impossible : des réservations sont en cours ou prévues."
            });
        }

        const updated = await db.query(
            `UPDATE properties 
             SET title = $1, description = $2, price_per_night = $3, location = $4, max_guests = $5, amenities = $6
             WHERE id = $7 AND host_id = $8
             RETURNING *`,
            [title, description, price_per_night, location, max_guests, amenities, id, req.user.id]
        );

        if (updated.rows.length === 0) return res.status(404).json({ error: "Bien non trouvé ou non autorisé" });
        res.json(updated.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Erreur lors de la mise à jour" });
    }
};

// --- 7. STATISTIQUES DU DASHBOARD HÔTE ---
exports.getHostStats = async (req, res) => {
    const host_id = req.user.id;
    try {
        const stats = await db.query(`
            SELECT 
                COUNT(DISTINCT p.id) as total_posts,
                COUNT(DISTINCT r.guest_id) as total_clients,
                COALESCE(SUM(r.total_price), 0) as total_revenue,
                COUNT(DISTINCT CASE WHEN r.status = 'pending' THEN r.id END) as pending_requests
            FROM properties p
            LEFT JOIN reservations r ON p.id = r.property_id AND r.status = 'confirmed'
            WHERE p.host_id = $1
        `, [host_id]);

        const properties = await db.query(`
            SELECT p.*, 
            (SELECT COUNT(*) FROM reservations 
             WHERE property_id = p.id 
             AND status IN ('pending', 'confirmed') 
             AND end_date >= CURRENT_DATE) as active_bookings
            FROM properties p 
            WHERE host_id = $1
        `, [host_id]);

        res.json({
            summary: stats.rows[0],
            myProperties: properties.rows
        });
    } catch (err) {
        res.status(500).json({ error: 'Erreur stats' });
    }
};

// --- 8. SUPPRIMER UNE ANNONCE ---
exports.deleteProperty = async (req, res) => {
    const { id } = req.params;
    const host_id = req.user.id;

    try {
        const check = await db.query(`
            SELECT (
                SELECT COUNT(*) FROM reservations 
                WHERE property_id = $1 AND status IN ('pending', 'confirmed') AND end_date >= CURRENT_DATE
            ) as active_bookings
            FROM properties WHERE id = $1 AND host_id = $2
        `, [id, host_id]);

        if (check.rows.length === 0) return res.status(404).json({ error: "Bien introuvable" });

        if (parseInt(check.rows[0].active_bookings) > 0) {
            return res.status(403).json({ error: "Suppression impossible : réservations en cours" });
        }

        await db.query('DELETE FROM properties WHERE id = $1 AND host_id = $2', [id, host_id]);
        res.json({ message: "Annonce supprimée avec succès" });
    } catch (err) {
        res.status(500).json({ error: "Erreur lors de la suppression" });
    }
};