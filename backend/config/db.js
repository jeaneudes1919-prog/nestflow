const { Pool } = require('pg');
require('dotenv').config();

// On utilise DATABASE_URL qui est la norme sur Neon et Render
const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Neon nécessite SSL. rejectUnauthorized: false est souvent nécessaire sur Render
    ssl: {
        rejectUnauthorized: false,
    },
});

pool.on('connect', () => {
    console.log('✅ Connecté à la base de données Neon (PostgreSQL)');
});

pool.on('error', (err) => {
    console.error('❌ Erreur inattendue sur PostgreSQL', err);
    process.exit(-1);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool, // Utile si tu as besoin de fermer la connexion ou faire des transactions
};