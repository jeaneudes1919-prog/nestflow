// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    // 1. Récupérer le token dans le header "Authorization"
    // Format attendu: "Bearer <TOKEN_ICI>"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // On garde juste la partie après "Bearer"

    if (!token) {
        return res.status(401).json({ error: 'Accès refusé. Token manquant.' });
    }

    try {
        // 2. Vérifier le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Ajouter les infos de l'user à la requête pour les utiliser plus tard
        req.user = decoded; 
        
        next(); // Tout est ok, on passe à la suite
    } catch (err) {
        res.status(403).json({ error: 'Token invalide.' });
    }
};