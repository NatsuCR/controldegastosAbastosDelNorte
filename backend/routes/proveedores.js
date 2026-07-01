const express = require('express');
const db = require('../db');

const router = express.Router();
const dias = (value) => Array.isArray(value) ? JSON.stringify(value) : value || null;

function mapProveedor(row) {
  return { ...row, activo: !!row.activo };
}

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM proveedores WHERE activo = TRUE ORDER BY nombre');
    res.json(rows.map(mapProveedor));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { nombre, telefono, diasVisita } = req.body;
  const nombreLimpio = String(nombre || '').trim();
  if (!nombreLimpio) return res.status(400).json({ error: 'El nombre del proveedor es obligatorio' });

  try {
    const [rows] = await db.query('SELECT * FROM proveedores WHERE LOWER(nombre) = LOWER(?) LIMIT 1', [nombreLimpio]);
    if (rows[0]) {
      await db.query(
        'UPDATE proveedores SET activo = TRUE, telefono = COALESCE(?, telefono), dias_visita = COALESCE(?, dias_visita) WHERE id = ?',
        [telefono || null, dias(diasVisita), rows[0].id]
      );
      return res.json(mapProveedor({ ...rows[0], telefono: telefono || rows[0].telefono, activo: true }));
    }

    const [result] = await db.query(
      'INSERT INTO proveedores (nombre, telefono, dias_visita, activo) VALUES (?, ?, ?, TRUE)',
      [nombreLimpio, telefono || null, dias(diasVisita)]
    );
    res.json({ id: result.insertId, nombre: nombreLimpio, telefono: telefono || null, activo: true });
  } catch (err) {
    res.status(400).json({ error: 'No se pudo guardar el proveedor', details: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { nombre, telefono, diasVisita } = req.body;
  const nombreLimpio = String(nombre || '').trim();
  if (!nombreLimpio) return res.status(400).json({ error: 'El nombre del proveedor es obligatorio' });

  try {
    await db.query(
      'UPDATE proveedores SET nombre = ?, telefono = ?, dias_visita = ? WHERE id = ?',
      [nombreLimpio, telefono || null, dias(diasVisita), req.params.id]
    );
    res.json({ message: 'Actualizado' });
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar', details: err.message });
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
