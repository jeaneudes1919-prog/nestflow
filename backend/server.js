// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
// Import de la connexion BDD (pour vérifier qu'elle marche au lancement)
const db = require('./config/db');

const app = express();

const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Middlewares
app.use(cors()); // Autorise le frontend à nous parler
app.use(express.json()); // Permet de lire le JSON dans les requêtes (req.body)
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/reservations', reservationRoutes);
app.use('/api/reviews', reviewRoutes);

// Route de test
app.get('/', (req, res) => {
    res.send('API NestFlow est en ligne 🚀');
});

// Test de connexion BDD direct au lancement
app.get('/test-db', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()');
        res.json({ message: 'Connexion BDD réussie', time: result.rows[0].now });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur de connexion BDD' });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});