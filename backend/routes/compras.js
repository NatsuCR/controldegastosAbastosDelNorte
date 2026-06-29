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
    cb(null, 'factura-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

router.post('/', upload.single('imagenFactura'), async (req, res) => {
  const { proveedorId, productoId, cantidad, costoUnitario, tasaIva, subtotal, ivaMonto, total, metodoPago, nota } = req.body;
  
  let imagenRuta = null;
  if (req.file) {
    imagenRuta = '/uploads/' + req.file.filename;
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const fecha = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const [resultCompra] = await connection.query(
      `INSERT INTO compras (
        fecha, proveedor_id, producto_id, cantidad, costo_unitario, tasa_iva, subtotal,
        iva_monto, total, metodo_pago, nota, imagen_factura
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [fecha, proveedorId, productoId, cantidad, costoUnitario, tasaIva, subtotal, ivaMonto, total, metodoPago, nota || null, imagenRuta]
    );

    const compraId = resultCompra.insertId;

    const [rowsProd] = await connection.query('SELECT cantidad_por_presentacion FROM productos WHERE id = ?', [productoId]);
    const cantidadInventario = cantidad * rowsProd[0].cantidad_por_presentacion;

    await connection.query(
      `INSERT INTO inventario (
        fecha, tipo_movimiento, producto_id, cantidad, compra_id, venta_id, nota
      ) VALUES (?, 'entrada', ?, ?, ?, NULL, ?)`,
      [fecha, productoId, cantidadInventario, compraId, 'Compra registrada']
    );

    await connection.commit();
    res.json({ id: compraId, imagen_factura: imagenRuta });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: 'Error al registrar compra', details: err.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
