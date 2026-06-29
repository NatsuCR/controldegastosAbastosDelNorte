const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../db');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'gasto-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

router.post('/', upload.single('imagenFactura'), async (req, res) => {
  const { categoria, descripcion, monto, nota } = req.body;
  
  let imagenRuta = null;
  if (req.file) {
    imagenRuta = '/uploads/' + req.file.filename;
  }

  try {
    const fecha = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const [result] = await db.query(
      `INSERT INTO gastos (fecha, categoria, descripcion, monto, nota, imagen_factura) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [fecha, categoria, descripcion, monto, nota || null, imagenRuta]
    );

    res.json({ id: result.insertId, imagen_factura: imagenRuta });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar gasto', details: err.message });
  }
});

module.exports = router;
