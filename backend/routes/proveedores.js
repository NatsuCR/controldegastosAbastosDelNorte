const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM proveedores WHERE activo = TRUE');
    res.json(rows.map(row => ({
      ...row,
      activo: !!row.activo
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { nombre, telefono, diasVisita } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO proveedores (nombre, telefono, dias_visita, activo) VALUES (?, ?, ?, TRUE)',
      [nombre.trim(), telefono || null, diasVisita || null]
    );
    res.json({ id: result.insertId, nombre, telefono, diasVisita, activo: true });
  } catch (err) {
    res.status(400).json({ error: 'El proveedor ya existe o es inválido' });
  }
});

router.put('/:id', async (req, res) => {
  const { nombre, telefono, diasVisita } = req.body;
  try {
    await db.query(
      'UPDATE proveedores SET nombre = ?, telefono = ?, dias_visita = ? WHERE id = ?',
      [nombre.trim(), telefono || null, diasVisita || null, req.params.id]
    );
    res.json({ message: 'Actualizado' });
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.query('UPDATE proveedores SET activo = FALSE WHERE id = ?', [req.params.id]);
    res.json({ message: 'Proveedor inhabilitado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
