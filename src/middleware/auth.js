const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'cletaeats_secret_dev';

/**
 * Middleware que verifica el token JWT en el header Authorization.
 * Header esperado: Authorization: Bearer <token>
 */
function authMiddleware(req, res, next) {
    const header = req.headers['authorization'];
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token requerido' });
    }

    const token = header.split(' ')[1];
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
}

module.exports = { authMiddleware, JWT_SECRET };
