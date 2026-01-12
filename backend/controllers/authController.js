// backend/controllers/authController.js
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// INSCRIPTION
exports.register = async (req, res) => {
    const { username, email, password, role } = req.body;

    try {
        const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Cet email est déjà utilisé.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // On retourne tout de suite bio et avatar_url (même s'ils sont null au début)
        const newUser = await db.query(
            'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, bio, avatar_url',
            [username, email, hashedPassword, role || 'guest']
        );

        const token = jwt.sign(
            { id: newUser.rows[0].id, role: newUser.rows[0].role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Utilisateur créé avec succès',
            token,
            user: newUser.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur lors de l\'inscription' });
    }
};

// CONNEXION (Optimisé pour renvoyer l'avatar)
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (userResult.rows.length === 0) {
            return res.status(400).json({ error: 'Email ou mot de passe incorrect' });
        }

        const user = userResult.rows[0];

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(400).json({ error: 'Email ou mot de passe incorrect' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // ICI : On renvoie TOUTES les infos nécessaires au frontend
        res.json({
            message: 'Connexion réussie',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                bio: user.bio,             // <--- AJOUTÉ
                avatar_url: user.avatar_url // <--- AJOUTÉ
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur lors de la connexion' });
    }
};

// MISE À JOUR DU PROFIL
exports.updateProfile = async (req, res) => {
    const userId = req.user.id;
    const { username, email, bio } = req.body;

    try {
        const updatedUser = await db.query(
            `UPDATE users SET username = $1, email = $2, bio = $3 
             WHERE id = $4 RETURNING id, username, email, role, bio, avatar_url`,
            [username, email, bio || null, userId]
        );
        res.json(updatedUser.rows[0]);
    } catch (err) {
        console.error(err);
        if (err.code === '23505') { // Code erreur PostgreSQL pour "Unique violation" (email déjà pris)
            return res.status(400).json({ error: "Cet email est déjà utilisé." });
        }
        res.status(500).json({ error: "Erreur lors de la mise à jour" });
    }
};

// UPLOAD AVATAR
exports.uploadAvatar = async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "Aucun fichier fourni" });
    
    const userId = req.user.id;
    const avatarUrl = `/uploads/${req.file.filename}`;

    try {
        const updatedUser = await db.query(
            `UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING id, username, email, role, bio, avatar_url`,
            [avatarUrl, userId]
        );
        res.json(updatedUser.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur upload avatar" });
    }
};