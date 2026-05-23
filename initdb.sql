CREATE DATABASE IF NOT EXISTS cletaeats;
USE cletaeats;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  passwordHash VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS clientes (
  id VARCHAR(36) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  identificacion VARCHAR(20) UNIQUE NOT NULL,
  correo VARCHAR(100) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  direccion VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS restaurantes (
  id VARCHAR(36) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  cedulaJuridica VARCHAR(20) UNIQUE NOT NULL,
  direccion VARCHAR(255) NOT NULL,
  tipoComida VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS repartidores (
  id VARCHAR(36) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  cedula VARCHAR(20) UNIQUE NOT NULL,
  correo VARCHAR(100) NOT NULL,
  direccion VARCHAR(255) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  numeroTarjeta VARCHAR(20) NOT NULL,
  estado VARCHAR(20) DEFAULT 'disponible',
  amonestaciones INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS pedidos (
  id VARCHAR(36) PRIMARY KEY,
  clienteId VARCHAR(36) NOT NULL,
  clienteNombre VARCHAR(100) NOT NULL,
  restauranteId VARCHAR(36) NOT NULL,
  restauranteNombre VARCHAR(100) NOT NULL,
  repartidorId VARCHAR(36) NOT NULL,
  repartidorNombre VARCHAR(100) NOT NULL,
  numerosCombo VARCHAR(100) NOT NULL,
  estado VARCHAR(50) DEFAULT 'en preparacion',
  horaRealizacion VARCHAR(50) NOT NULL,
  horaEntrega VARCHAR(50) DEFAULT '',
  total DOUBLE DEFAULT 0
);

DELIMITER $$

-- ========================
-- USERS
-- ========================
DROP PROCEDURE IF EXISTS sp_register_user$$
CREATE PROCEDURE sp_register_user(IN p_id VARCHAR(36), IN p_username VARCHAR(100), IN p_passwordHash VARCHAR(255))
BEGIN
  INSERT INTO users (id, username, passwordHash) VALUES (p_id, p_username, p_passwordHash);
END$$

DROP PROCEDURE IF EXISTS sp_get_user_by_username$$
CREATE PROCEDURE sp_get_user_by_username(IN p_username VARCHAR(100))
BEGIN
  SELECT * FROM users WHERE username = p_username LIMIT 1;
END$$

-- ========================
-- CLIENTES
-- ========================
DROP PROCEDURE IF EXISTS sp_get_clientes$$
CREATE PROCEDURE sp_get_clientes(IN p_search VARCHAR(100))
BEGIN
  IF p_search IS NULL OR p_search = '' THEN
    SELECT * FROM clientes;
  ELSE
    SELECT * FROM clientes
    WHERE nombre LIKE CONCAT('%', p_search, '%')
       OR identificacion LIKE CONCAT('%', p_search, '%')
       OR correo LIKE CONCAT('%', p_search, '%');
  END IF;
END$$

DROP PROCEDURE IF EXISTS sp_get_cliente_by_id$$
CREATE PROCEDURE sp_get_cliente_by_id(IN p_id VARCHAR(36))
BEGIN
  SELECT * FROM clientes WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS sp_create_cliente$$
CREATE PROCEDURE sp_create_cliente(IN p_id VARCHAR(36), IN p_nombre VARCHAR(100), IN p_identificacion VARCHAR(20), IN p_correo VARCHAR(100), IN p_telefono VARCHAR(20), IN p_direccion VARCHAR(255))
BEGIN
  INSERT INTO clientes (id, nombre, identificacion, correo, telefono, direccion)
  VALUES (p_id, p_nombre, p_identificacion, p_correo, p_telefono, p_direccion);
END$$

DROP PROCEDURE IF EXISTS sp_update_cliente$$
CREATE PROCEDURE sp_update_cliente(IN p_id VARCHAR(36), IN p_nombre VARCHAR(100), IN p_identificacion VARCHAR(20), IN p_correo VARCHAR(100), IN p_telefono VARCHAR(20), IN p_direccion VARCHAR(255))
BEGIN
  UPDATE clientes SET nombre=p_nombre, identificacion=p_identificacion, correo=p_correo, telefono=p_telefono, direccion=p_direccion
  WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS sp_delete_cliente$$
CREATE PROCEDURE sp_delete_cliente(IN p_id VARCHAR(36))
BEGIN
  DELETE FROM clientes WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS sp_check_cliente_identificacion$$
CREATE PROCEDURE sp_check_cliente_identificacion(IN p_identificacion VARCHAR(20), IN p_exclude_id VARCHAR(36))
BEGIN
  SELECT id FROM clientes WHERE identificacion = p_identificacion AND id != COALESCE(p_exclude_id, '');
END$$

-- ========================
-- RESTAURANTES
-- ========================
DROP PROCEDURE IF EXISTS sp_get_restaurantes$$
CREATE PROCEDURE sp_get_restaurantes(IN p_search VARCHAR(100))
BEGIN
  IF p_search IS NULL OR p_search = '' THEN
    SELECT * FROM restaurantes;
  ELSE
    SELECT * FROM restaurantes
    WHERE nombre LIKE CONCAT('%', p_search, '%')
       OR cedulaJuridica LIKE CONCAT('%', p_search, '%')
       OR tipoComida LIKE CONCAT('%', p_search, '%');
  END IF;
END$$

DROP PROCEDURE IF EXISTS sp_get_restaurante_by_id$$
CREATE PROCEDURE sp_get_restaurante_by_id(IN p_id VARCHAR(36))
BEGIN
  SELECT * FROM restaurantes WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS sp_create_restaurante$$
CREATE PROCEDURE sp_create_restaurante(IN p_id VARCHAR(36), IN p_nombre VARCHAR(100), IN p_cedulaJuridica VARCHAR(20), IN p_direccion VARCHAR(255), IN p_tipoComida VARCHAR(100))
BEGIN
  INSERT INTO restaurantes (id, nombre, cedulaJuridica, direccion, tipoComida)
  VALUES (p_id, p_nombre, p_cedulaJuridica, p_direccion, p_tipoComida);
END$$

DROP PROCEDURE IF EXISTS sp_update_restaurante$$
CREATE PROCEDURE sp_update_restaurante(IN p_id VARCHAR(36), IN p_nombre VARCHAR(100), IN p_cedulaJuridica VARCHAR(20), IN p_direccion VARCHAR(255), IN p_tipoComida VARCHAR(100))
BEGIN
  UPDATE restaurantes SET nombre=p_nombre, cedulaJuridica=p_cedulaJuridica, direccion=p_direccion, tipoComida=p_tipoComida
  WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS sp_delete_restaurante$$
CREATE PROCEDURE sp_delete_restaurante(IN p_id VARCHAR(36))
BEGIN
  DELETE FROM restaurantes WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS sp_check_restaurante_cedula$$
CREATE PROCEDURE sp_check_restaurante_cedula(IN p_cedulaJuridica VARCHAR(20), IN p_exclude_id VARCHAR(36))
BEGIN
  SELECT id FROM restaurantes WHERE cedulaJuridica = p_cedulaJuridica AND id != COALESCE(p_exclude_id, '');
END$$

-- ========================
-- REPARTIDORES
-- ========================
DROP PROCEDURE IF EXISTS sp_get_repartidores$$
CREATE PROCEDURE sp_get_repartidores(IN p_search VARCHAR(100), IN p_estado VARCHAR(20))
BEGIN
  SELECT * FROM repartidores
  WHERE (p_estado IS NULL OR p_estado = '' OR estado = p_estado)
    AND (p_search IS NULL OR p_search = ''
         OR nombre LIKE CONCAT('%', p_search, '%')
         OR cedula LIKE CONCAT('%', p_search, '%')
         OR correo LIKE CONCAT('%', p_search, '%'));
END$$

DROP PROCEDURE IF EXISTS sp_get_repartidor_by_id$$
CREATE PROCEDURE sp_get_repartidor_by_id(IN p_id VARCHAR(36))
BEGIN
  SELECT * FROM repartidores WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS sp_create_repartidor$$
CREATE PROCEDURE sp_create_repartidor(IN p_id VARCHAR(36), IN p_nombre VARCHAR(100), IN p_cedula VARCHAR(20), IN p_correo VARCHAR(100), IN p_direccion VARCHAR(255), IN p_telefono VARCHAR(20), IN p_numeroTarjeta VARCHAR(20), IN p_estado VARCHAR(20), IN p_amonestaciones INT)
BEGIN
  INSERT INTO repartidores (id, nombre, cedula, correo, direccion, telefono, numeroTarjeta, estado, amonestaciones)
  VALUES (p_id, p_nombre, p_cedula, p_correo, p_direccion, p_telefono, p_numeroTarjeta, p_estado, p_amonestaciones);
END$$

DROP PROCEDURE IF EXISTS sp_update_repartidor$$
CREATE PROCEDURE sp_update_repartidor(IN p_id VARCHAR(36), IN p_nombre VARCHAR(100), IN p_cedula VARCHAR(20), IN p_correo VARCHAR(100), IN p_direccion VARCHAR(255), IN p_telefono VARCHAR(20), IN p_numeroTarjeta VARCHAR(20), IN p_estado VARCHAR(20), IN p_amonestaciones INT)
BEGIN
  UPDATE repartidores SET nombre=p_nombre, cedula=p_cedula, correo=p_correo, direccion=p_direccion, telefono=p_telefono, numeroTarjeta=p_numeroTarjeta, estado=p_estado, amonestaciones=p_amonestaciones
  WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS sp_delete_repartidor$$
CREATE PROCEDURE sp_delete_repartidor(IN p_id VARCHAR(36))
BEGIN
  DELETE FROM repartidores WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS sp_check_repartidor_cedula$$
CREATE PROCEDURE sp_check_repartidor_cedula(IN p_cedula VARCHAR(20), IN p_exclude_id VARCHAR(36))
BEGIN
  SELECT id FROM repartidores WHERE cedula = p_cedula AND id != COALESCE(p_exclude_id, '');
END$$

-- ========================
-- PEDIDOS
-- ========================
DROP PROCEDURE IF EXISTS sp_get_pedidos$$
CREATE PROCEDURE sp_get_pedidos(IN p_search VARCHAR(100), IN p_estado VARCHAR(50))
BEGIN
  SELECT * FROM pedidos
  WHERE (p_estado IS NULL OR p_estado = '' OR estado = p_estado)
    AND (p_search IS NULL OR p_search = ''
         OR clienteNombre LIKE CONCAT('%', p_search, '%')
         OR restauranteNombre LIKE CONCAT('%', p_search, '%')
         OR repartidorNombre LIKE CONCAT('%', p_search, '%'));
END$$

DROP PROCEDURE IF EXISTS sp_get_pedido_by_id$$
CREATE PROCEDURE sp_get_pedido_by_id(IN p_id VARCHAR(36))
BEGIN
  SELECT * FROM pedidos WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS sp_create_pedido$$
CREATE PROCEDURE sp_create_pedido(IN p_id VARCHAR(36), IN p_clienteId VARCHAR(36), IN p_clienteNombre VARCHAR(100), IN p_restauranteId VARCHAR(36), IN p_restauranteNombre VARCHAR(100), IN p_repartidorId VARCHAR(36), IN p_repartidorNombre VARCHAR(100), IN p_numerosCombo VARCHAR(100), IN p_estado VARCHAR(50), IN p_horaRealizacion VARCHAR(50), IN p_horaEntrega VARCHAR(50), IN p_total DOUBLE)
BEGIN
  INSERT INTO pedidos (id, clienteId, clienteNombre, restauranteId, restauranteNombre, repartidorId, repartidorNombre, numerosCombo, estado, horaRealizacion, horaEntrega, total)
  VALUES (p_id, p_clienteId, p_clienteNombre, p_restauranteId, p_restauranteNombre, p_repartidorId, p_repartidorNombre, p_numerosCombo, p_estado, p_horaRealizacion, p_horaEntrega, p_total);
END$$

DROP PROCEDURE IF EXISTS sp_update_pedido$$
CREATE PROCEDURE sp_update_pedido(IN p_id VARCHAR(36), IN p_clienteId VARCHAR(36), IN p_clienteNombre VARCHAR(100), IN p_restauranteId VARCHAR(36), IN p_restauranteNombre VARCHAR(100), IN p_repartidorId VARCHAR(36), IN p_repartidorNombre VARCHAR(100), IN p_numerosCombo VARCHAR(100), IN p_estado VARCHAR(50), IN p_horaRealizacion VARCHAR(50), IN p_horaEntrega VARCHAR(50), IN p_total DOUBLE)
BEGIN
  UPDATE pedidos SET clienteId=p_clienteId, clienteNombre=p_clienteNombre, restauranteId=p_restauranteId, restauranteNombre=p_restauranteNombre, repartidorId=p_repartidorId, repartidorNombre=p_repartidorNombre, numerosCombo=p_numerosCombo, estado=p_estado, horaRealizacion=p_horaRealizacion, horaEntrega=p_horaEntrega, total=p_total
  WHERE id = p_id;
END$$

DROP PROCEDURE IF EXISTS sp_delete_pedido$$
CREATE PROCEDURE sp_delete_pedido(IN p_id VARCHAR(36))
BEGIN
  DELETE FROM pedidos WHERE id = p_id;
END$$

DELIMITER ;
