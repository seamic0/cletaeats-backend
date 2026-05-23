const mysql = require('mysql2/promise');

/**
 * Pool de conexiones a MySQL.
 * Cambia password si tu instalación local tiene contraseña.
 *
 * Desde Android emulador: el host sigue siendo 'localhost' porque
 * el backend corre en tu PC, no dentro del emulador.
 */
const pool = mysql.createPool({
    host:             process.env.DB_HOST     || 'localhost',
    user:             process.env.DB_USER     || 'root',
    password:         process.env.DB_PASSWORD || '1234',
    database:         process.env.DB_NAME     || 'cletaeats',
    waitForConnections: true,
    connectionLimit:  10,
});

module.exports = pool;
