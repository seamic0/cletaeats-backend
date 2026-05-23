const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/clientes?search=texto
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('CALL sp_get_clientes(?)', [req.query.search || null]);
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/clientes/:id
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('CALL sp_get_cliente_by_id(?)', [req.params.id]);
        if (!rows[0][0]) return res.status(404).json({ error: 'Cliente no encontrado' });
        res.json(rows[0][0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/clientes
router.post('/', async (req, res) => {
    try {
        const { nombre, identificacion, correo, telefono, direccion } = req.body;
        if (!nombre || !identificacion || !correo || !telefono || !direccion)
            return res.status(400).json({ error: 'Todos los campos son requeridos' });

        const [dup] = await pool.query('CALL sp_check_cliente_identificacion(?, ?)', [identificacion, '']);
        if (dup[0].length > 0) return res.status(409).json({ error: 'Ya existe un cliente con esa identificación' });

        const id = uuidv4();
        await pool.query('CALL sp_create_cliente(?, ?, ?, ?, ?, ?)', [id, nombre, identificacion, correo, telefono, direccion]);
        res.status(201).json({ id, nombre, identificacion, correo, telefono, direccion });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/clientes/:id
router.put('/:id', async (req, res) => {
    try {
        const { nombre, identificacion, correo, telefono, direccion } = req.body;
        if (!nombre || !identificacion || !correo || !telefono || !direccion)
            return res.status(400).json({ error: 'Todos los campos son requeridos' });

        const [dup] = await pool.query('CALL sp_check_cliente_identificacion(?, ?)', [identificacion, req.params.id]);
        if (dup[0].length > 0) return res.status(409).json({ error: 'Ya existe un cliente con esa identificación' });

        await pool.query('CALL sp_update_cliente(?, ?, ?, ?, ?, ?)', [req.params.id, nombre, identificacion, correo, telefono, direccion]);
        res.json({ id: req.params.id, nombre, identificacion, correo, telefono, direccion });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/clientes/:id
router.delete('/:id', async (req, res) => {
    try {
        await pool.query('CALL sp_delete_cliente(?)', [req.params.id]);
        res.status(204).send();
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
