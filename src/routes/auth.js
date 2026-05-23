const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const pool = require('../db');
const { JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password)
            return res.status(400).json({ error: 'usuario y contraseña requeridos' });

        const [rows] = await pool.query('CALL sp_get_user_by_username(?)', [username.toLowerCase()]);
        if (rows[0][0])
            return res.status(409).json({ error: 'El usuario ya existe' });

        const passwordHash = await bcrypt.hash(password, 10);
        const id = uuidv4();
        await pool.query('CALL sp_register_user(?, ?, ?)', [id, username.toLowerCase(), passwordHash]);

        const token = jwt.sign({ id, username }, JWT_SECRET, { expiresIn: '8h' });
        res.status(201).json({ token, username });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password)
            return res.status(400).json({ error: 'usuario y contraseña requeridos' });

        const [rows] = await pool.query('CALL sp_get_user_by_username(?)', [username.toLowerCase()]);
        const user = rows[0][0];
        if (!user)
            return res.status(401).json({ error: 'Credenciales inválidas' });

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid)
            return res.status(401).json({ error: 'Credenciales inválidas' });

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '8h' });
        res.json({ token, username: user.username });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
