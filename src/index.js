const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('/{*path}', cors());
app.use(express.json());

app.use('/api/auth',         require('./routes/auth'));
app.use('/api/clientes',     require('./routes/clientes'));
app.use('/api/restaurantes', require('./routes/restaurantes'));
app.use('/api/repartidores', require('./routes/repartidores'));
app.use('/api/pedidos',      require('./routes/pedidos'));

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`CletaEats API corriendo en http://0.0.0.0:${PORT}`);
    console.log(`Emulador Android: http://10.0.2.2:${PORT}/api`);
});

module.exports = app;
