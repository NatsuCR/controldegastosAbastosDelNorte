const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM configuracion');
    const config = {};
    rows.forEach(row => {
      let value = row.valor;
      if (value === 'true') value = true;
      else if (value === 'false') value = false;
      else if (!isNaN(parseFloat(value))) value = parseFloat(value);
      config[row.clave] = value;
    });
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', async (req, res) => {
  const config = req.body;
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    for (const [clave, valor] of Object.entries(config)) {
      await connection.query(
        'INSERT INTO configuracion (clave, valor) VALUES (?, ?) ON DUPLICATE KEY UPDATE valor = ?',
        [clave, String(valor), String(valor)]
      );
    }
    await connection.commit();
    res.json({ message: 'Configuración guardada' });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

router.post('/reset', async (req, res) => {
  const connection = await db.getConnection();
  const tablas = ['inventario', 'ventas', 'compras', 'gastos', 'productos', 'proveedores', 'categorias'];

  try {
    await connection.beginTransaction();
    for (const tabla of tablas) {
      await connection.query(`DELETE FROM ${tabla}`);
      await connection.query(`ALTER TABLE ${tabla} AUTO_INCREMENT = 1`);
    }
    await connection.query('DELETE FROM configuracion');
    await connection.query(
      `INSERT INTO configuracion (clave, valor) VALUES
       ('tasaIva', '0.13'),
       ('precioVentaIncluyeIva', 'true'),
       ('costoProveedorIncluyeIva', 'false')`
    );
    await connection.commit();
    res.json({ message: 'Base de datos reiniciada' });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: 'No se pudo reiniciar la base de datos', details: err.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
