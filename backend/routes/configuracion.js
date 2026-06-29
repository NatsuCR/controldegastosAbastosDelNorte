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

module.exports = router;
