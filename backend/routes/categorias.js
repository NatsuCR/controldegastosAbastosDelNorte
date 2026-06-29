const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM categorias');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const [result] = await db.query('INSERT INTO categorias (nombre) VALUES (?)', [req.body.nombre.trim()]);
    res.json({ id: result.insertId, nombre: req.body.nombre.trim() });
  } catch (err) {
    res.status(400).json({ error: 'La categoría ya existe o es inválida' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    await db.query('UPDATE categorias SET nombre = ? WHERE id = ?', [req.body.nombre.trim(), req.params.id]);
    res.json({ message: 'Actualizado' });
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar' });
  }
});

module.exports = router;
