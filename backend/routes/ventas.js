const express = require('express');
const db = require('../db');

const router = express.Router();

router.post('/', async (req, res) => {
  const { productoId, cantidad, metodoPago, clienteTelefono, nota, subtotal, ivaMonto, total, tasaIva, precioUnitario } = req.body;
  
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const fecha = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const [resultVenta] = await connection.query(
      `INSERT INTO ventas (
        fecha, producto_id, cantidad, precio_unitario, tasa_iva, subtotal,
        iva_monto, total, metodo_pago, cliente_telefono, nota
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [fecha, productoId, cantidad, precioUnitario, tasaIva, subtotal, ivaMonto, total, metodoPago, clienteTelefono || null, nota || null]
    );

    const ventaId = resultVenta.insertId;

    const [rowsProd] = await connection.query('SELECT cantidad_por_presentacion FROM productos WHERE id = ?', [productoId]);
    const cantidadInventario = cantidad * rowsProd[0].cantidad_por_presentacion;

    await connection.query(
      `INSERT INTO inventario (
        fecha, tipo_movimiento, producto_id, cantidad, compra_id, venta_id, nota
      ) VALUES (?, 'salida', ?, ?, NULL, ?, ?)`,
      [fecha, productoId, cantidadInventario, ventaId, 'Venta registrada']
    );

    await connection.commit();
    res.json({ id: ventaId });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: 'Error al registrar venta', details: err.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
