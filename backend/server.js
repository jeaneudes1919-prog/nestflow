const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./config/db');
const { cloudinary } = require('./config/cloudinary'); // Import de l'instance config
const path = require('path');

const app = express();

const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// --- ROUTES ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/properties', require('./routes/propertyRoutes'));
app.use('/api/reservations', require('./routes/reservationRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
    res.status(200).json({ status: 'NestFlow API Online 🚀' });
});

const PORT = process.env.PORT || 5000;

// --- FONCTION DE VÉRIFICATION DES CONNEXIONS ---
const checkConnections = async () => {
    console.log('\n🔍 Vérification des services...');

    // 1. Test Neon (PostgreSQL)
    try {
        const res = await db.query('SELECT NOW()');
        console.log('✅ DATABASE (Neon)  : Connectée (' + res.rows[0].now.toLocaleTimeString() + ')');
    } catch (err) {
        console.error('❌ DATABASE (Neon)  : Échec de connexion !', err.message);
    }

    // 2. Test Cloudinary
    try {
        // La méthode api.ping() vérifie si tes API Keys sont valides
        const result = await cloudinary.api.ping();
        if (result.status === 'ok') {
            console.log('✅ CLOUD (Cloudinary) : Connecté (Prêt pour les images)');
        }
    } catch (err) {
        console.error('❌ CLOUD (Cloudinary) : Erreur d\'identifiants !', err.message);
    }
    
    console.log('-------------------------------------------\n');
};

app.listen(PORT, async () => {
    console.log(`🚀 Serveur NestFlow démarré sur le port ${PORT}`);
    await checkConnections(); // On lance la vérification ici
});