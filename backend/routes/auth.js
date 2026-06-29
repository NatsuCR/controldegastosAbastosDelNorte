const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Faltan credenciales' });

  try {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE username = ?', [username]);
    if (rows.length === 0) return res.status(401).json({ error: 'Usuario no encontrado' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    
    if (!match) return res.status(401).json({ error: 'Contraseña incorrecta' });

    res.json({
      id: user.id,
      username: user.username,
      rol: user.rol,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Crear usuario (Solo admin)
router.post('/usuarios', async (req, res) => {
  const { username, password, rol } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO usuarios (username, password, rol) VALUES (?, ?, ?)', [username, hash, rol || 'empleado']);
    res.json({ message: 'Usuario creado exitosamente' });
  } catch (err) {
    res.status(400).json({ error: 'El usuario ya existe o hubo un error' });
  }
});

// Listar usuarios
router.get('/usuarios', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, username, rol, creado_en FROM usuarios');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Eliminar usuario
router.delete('/usuarios/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM usuarios WHERE id = ?', [req.params.id]);
    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;
