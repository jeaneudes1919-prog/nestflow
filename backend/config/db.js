// config/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});

pool.on('connect', () => {
    console.log('✅ Connecté à la base de données PostgreSQL');
});

pool.on('error', (err) => {
    console.error('❌ Erreur inattendue sur le client inactif', err);
    process.exit(-1);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};