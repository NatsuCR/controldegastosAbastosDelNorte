const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categorias ORDER BY nombre');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const nombre = String(req.body.nombre || '').trim();
  if (!nombre) return res.status(400).json({ error: 'El nombre de la categoria es obligatorio' });

  try {
    const [existentes] = await db.query('SELECT * FROM categorias WHERE LOWER(nombre) = LOWER(?) LIMIT 1', [nombre]);
    if (existentes[0]) return res.json({ id: existentes[0].id, nombre: existentes[0].nombre });

    const [result] = await db.query('INSERT INTO categorias (nombre) VALUES (?)', [nombre]);
    res.json({ id: result.insertId, nombre });
  } catch (err) {
    res.status(400).json({ error: 'No se pudo guardar la categoria', details: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const nombre = String(req.body.nombre || '').trim();
  if (!nombre) return res.status(400).json({ error: 'El nombre de la categoria es obligatorio' });

  try {
    await db.query('UPDATE categorias SET nombre = ? WHERE id = ?', [nombre, req.params.id]);
    res.json({ message: 'Actualizado' });
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar', details: err.message });
  }
});

module.exports = router;
