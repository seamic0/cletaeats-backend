const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const pool = require('../db');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

const ESTADOS_VALIDOS = ['en preparacion', 'en camino', 'entregado', 'suspendido'];

// GET /api/pedidos?search=texto&estado=en camino
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('CALL sp_get_pedidos(?, ?)', [req.query.search || null, req.query.estado || null]);
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/pedidos/:id
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('CALL sp_get_pedido_by_id(?)', [req.params.id]);
        if (!rows[0][0]) return res.status(404).json({ error: 'Pedido no encontrado' });
        res.json(rows[0][0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/pedidos
router.post('/', async (req, res) => {
    try {
        const { clienteId, clienteNombre, restauranteId, restauranteNombre, repartidorId, repartidorNombre, numerosCombo, horaRealizacion, estado = 'en preparacion', horaEntrega = '', total = 0 } = req.body;

        if (!clienteId || !clienteNombre || !restauranteId || !restauranteNombre || !repartidorId || !repartidorNombre || !numerosCombo || !horaRealizacion)
            return res.status(400).json({ error: 'Todos los campos requeridos deben estar presentes' });

        if (!ESTADOS_VALIDOS.includes(estado))
            return res.status(400).json({ error: `Estado inválido. Debe ser: ${ESTADOS_VALIDOS.join(', ')}` });

        const id = uuidv4();
        await pool.query('CALL sp_create_pedido(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, clienteId, clienteNombre, restauranteId, restauranteNombre, repartidorId, repartidorNombre, numerosCombo, estado, horaRealizacion, horaEntrega, total]);
        res.status(201).json({ id, clienteId, clienteNombre, restauranteId, restauranteNombre, repartidorId, repartidorNombre, numerosCombo, estado, horaRealizacion, horaEntrega, total });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/pedidos/:id
router.put('/:id', async (req, res) => {
    try {
        const { clienteId, clienteNombre, restauranteId, restauranteNombre, repartidorId, repartidorNombre, numerosCombo, horaRealizacion, estado = 'en preparacion', horaEntrega = '', total = 0 } = req.body;

        if (!clienteId || !clienteNombre || !restauranteId || !restauranteNombre || !repartidorId || !repartidorNombre || !numerosCombo || !horaRealizacion)
            return res.status(400).json({ error: 'Todos los campos requeridos deben estar presentes' });

        if (!ESTADOS_VALIDOS.includes(estado))
            return res.status(400).json({ error: `Estado inválido. Debe ser: ${ESTADOS_VALIDOS.join(', ')}` });

        await pool.query('CALL sp_update_pedido(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [req.params.id, clienteId, clienteNombre, restauranteId, restauranteNombre, repartidorId, repartidorNombre, numerosCombo, estado, horaRealizacion, horaEntrega, total]);
        res.json({ id: req.params.id, clienteId, clienteNombre, restauranteId, restauranteNombre, repartidorId, repartidorNombre, numerosCombo, estado, horaRealizacion, horaEntrega, total });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/pedidos/:id
router.delete('/:id', async (req, res) => {
    try {
        await pool.query('CALL sp_delete_pedido(?)', [req.params.id]);
        res.status(204).send();
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
