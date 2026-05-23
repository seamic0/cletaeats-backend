const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/restaurantes?search=texto
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('CALL sp_get_restaurantes(?)', [req.query.search || null]);
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/restaurantes/:id
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('CALL sp_get_restaurante_by_id(?)', [req.params.id]);
        if (!rows[0][0]) return res.status(404).json({ error: 'Restaurante no encontrado' });
        res.json(rows[0][0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/restaurantes
router.post('/', async (req, res) => {
    try {
        const { nombre, cedulaJuridica, direccion, tipoComida } = req.body;
        if (!nombre || !cedulaJuridica || !direccion || !tipoComida)
            return res.status(400).json({ error: 'Todos los campos son requeridos' });

        const [dup] = await pool.query('CALL sp_check_restaurante_cedula(?, ?)', [cedulaJuridica, '']);
        if (dup[0].length > 0) return res.status(409).json({ error: 'Ya existe un restaurante con esa cédula jurídica' });

        const id = uuidv4();
        await pool.query('CALL sp_create_restaurante(?, ?, ?, ?, ?)', [id, nombre, cedulaJuridica, direccion, tipoComida]);
        res.status(201).json({ id, nombre, cedulaJuridica, direccion, tipoComida });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/restaurantes/:id
router.put('/:id', async (req, res) => {
    try {
        const { nombre, cedulaJuridica, direccion, tipoComida } = req.body;
        if (!nombre || !cedulaJuridica || !direccion || !tipoComida)
            return res.status(400).json({ error: 'Todos los campos son requeridos' });

        const [dup] = await pool.query('CALL sp_check_restaurante_cedula(?, ?)', [cedulaJuridica, req.params.id]);
        if (dup[0].length > 0) return res.status(409).json({ error: 'Ya existe un restaurante con esa cédula jurídica' });

        await pool.query('CALL sp_update_restaurante(?, ?, ?, ?, ?)', [req.params.id, nombre, cedulaJuridica, direccion, tipoComida]);
        res.json({ id: req.params.id, nombre, cedulaJuridica, direccion, tipoComida });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/restaurantes/:id
router.delete('/:id', async (req, res) => {
    try {
        await pool.query('CALL sp_delete_restaurante(?)', [req.params.id]);
        res.status(204).send();
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
