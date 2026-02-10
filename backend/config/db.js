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

pool.on('connect', async (client) => {
    // On force le schéma au cas où l'ALTER USER n'aurait pas été fait
    await client.query('SET search_path TO nestflow');
    console.log('✅ Connecté et positionné sur le schéma : nestflow');
});

pool.on('error', (err) => {
    console.error('❌ Erreur inattendue sur PostgreSQL', err);
    process.exit(-1);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool, // Utile si tu as besoin de fermer la connexion ou faire des transactions
};