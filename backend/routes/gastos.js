const express = require('express');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const db = require('../db');

const router = express.Router();
const uploadsDir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

function fechaMysql(value) {
  if (!value) return new Date().toISOString().slice(0, 19).replace('T', ' ');
  return String(value).slice(0, 19).replace('T', ' ');
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'gasto-' + uniqueSuffix + path.extname(file.originalname || '.jpg'));
  },
});
const upload = multer({ storage });

router.post('/', upload.single('imagenFactura'), async (req, res) => {
  const { fecha, categoria, descripcion, monto, nota } = req.body;
  const imagenRuta = req.file ? '/uploads/' + req.file.filename : null;

  try {
    const [result] = await db.query(
      `INSERT INTO gastos (fecha, categoria, descripcion, monto, nota, imagen_factura)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [fechaMysql(fecha), categoria, descripcion, monto, nota || null, imagenRuta]
    );

    res.json({ id: result.insertId, imagen_factura: imagenRuta });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar gasto', details: err.message });
  }
});

module.exports = router;
