const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');

const app = express();

// --- CONFIGURATION CORS SÉCURISÉE ---
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Import des routes
const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Utilisation des routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/reviews', reviewRoutes);

// On garde l'accès aux uploads locaux UNIQUEMENT pour la transition si besoin
// Mais à terme, toutes tes images viendront de Cloudinary
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route de santé pour Render
app.get('/', (req, res) => {
    res.status(200).json({ status: 'NestFlow API Online 🚀' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Serveur NestFlow sur le port ${PORT}`);
});