const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/repartidores?search=texto&estado=disponible
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('CALL sp_get_repartidores(?, ?)', [req.query.search || null, req.query.estado || null]);
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/repartidores/:id
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('CALL sp_get_repartidor_by_id(?)', [req.params.id]);
        if (!rows[0][0]) return res.status(404).json({ error: 'Repartidor no encontrado' });
        res.json(rows[0][0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/repartidores
router.post('/', async (req, res) => {
    try {
        const { nombre, cedula, correo, direccion, telefono, numeroTarjeta, estado = 'disponible', amonestaciones = 0 } = req.body;
        if (!nombre || !cedula || !correo || !direccion || !telefono || !numeroTarjeta)
            return res.status(400).json({ error: 'Todos los campos son requeridos' });

        const [dup] = await pool.query('CALL sp_check_repartidor_cedula(?, ?)', [cedula, '']);
        if (dup[0].length > 0) return res.status(409).json({ error: 'Ya existe un repartidor con esa cédula' });

        const id = uuidv4();
        await pool.query('CALL sp_create_repartidor(?, ?, ?, ?, ?, ?, ?, ?, ?)', [id, nombre, cedula, correo, direccion, telefono, numeroTarjeta, estado, amonestaciones]);
        res.status(201).json({ id, nombre, cedula, correo, direccion, telefono, numeroTarjeta, estado, amonestaciones });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/repartidores/:id
router.put('/:id', async (req, res) => {
    try {
        const { nombre, cedula, correo, direccion, telefono, numeroTarjeta, estado = 'disponible', amonestaciones = 0 } = req.body;
        if (!nombre || !cedula || !correo || !direccion || !telefono || !numeroTarjeta)
            return res.status(400).json({ error: 'Todos los campos son requeridos' });

        const [dup] = await pool.query('CALL sp_check_repartidor_cedula(?, ?)', [cedula, req.params.id]);
        if (dup[0].length > 0) return res.status(409).json({ error: 'Ya existe un repartidor con esa cédula' });

        await pool.query('CALL sp_update_repartidor(?, ?, ?, ?, ?, ?, ?, ?, ?)', [req.params.id, nombre, cedula, correo, direccion, telefono, numeroTarjeta, estado, amonestaciones]);
        res.json({ id: req.params.id, nombre, cedula, correo, direccion, telefono, numeroTarjeta, estado, amonestaciones });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/repartidores/:id
router.delete('/:id', async (req, res) => {
    try {
        await pool.query('CALL sp_delete_repartidor(?)', [req.params.id]);
        res.status(204).send();
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
