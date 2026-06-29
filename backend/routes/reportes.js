const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  const { desde, hasta } = req.query;
  const connection = await db.getConnection();

  try {
    const fechaDesde = `${desde} 00:00:00`;
    const fechaHasta = `${hasta} 23:59:59`;

    const [[{ totalVentas }]] = await connection.query(`SELECT COALESCE(SUM(total), 0) as totalVentas FROM ventas WHERE fecha BETWEEN ? AND ?`, [fechaDesde, fechaHasta]);
    const [[{ totalCompras }]] = await connection.query(`SELECT COALESCE(SUM(total), 0) as totalCompras FROM compras WHERE fecha BETWEEN ? AND ?`, [fechaDesde, fechaHasta]);
    const [[{ totalGastos }]] = await connection.query(`SELECT COALESCE(SUM(monto), 0) as totalGastos FROM gastos WHERE fecha BETWEEN ? AND ?`, [fechaDesde, fechaHasta]);

    const [compras] = await connection.query(`
      SELECT c.*, p.nombre as productoNombre, pr.nombre as proveedorNombre 
      FROM compras c
      JOIN productos p ON c.producto_id = p.id
      JOIN proveedores pr ON c.proveedor_id = pr.id
      WHERE c.fecha BETWEEN ? AND ?
      ORDER BY c.fecha DESC
    `, [fechaDesde, fechaHasta]);

    const [ventas] = await connection.query(`
      SELECT v.*, p.nombre as productoNombre 
      FROM ventas v
      JOIN productos p ON v.producto_id = p.id
      WHERE v.fecha BETWEEN ? AND ?
      ORDER BY v.fecha DESC
    `, [fechaDesde, fechaHasta]);

    const [gastos] = await connection.query(`
      SELECT * FROM gastos 
      WHERE fecha BETWEEN ? AND ?
      ORDER BY fecha DESC
    `, [fechaDesde, fechaHasta]);

    const [impuestos] = await connection.query(`
      SELECT 
        (SELECT COALESCE(SUM(iva_monto), 0) FROM ventas WHERE fecha BETWEEN ? AND ?) as ivaCobrado,
        (SELECT COALESCE(SUM(iva_monto), 0) FROM compras WHERE fecha BETWEEN ? AND ?) as ivaPagado
    `, [fechaDesde, fechaHasta, fechaDesde, fechaHasta]);

    res.json({
      resumen: {
        ingresos: parseFloat(totalVentas),
        egresos: parseFloat(totalCompras) + parseFloat(totalGastos),
        ventas: parseFloat(totalVentas),
        compras: parseFloat(totalCompras),
        gastos: parseFloat(totalGastos),
      },
      compras,
      ventas,
      gastos,
      impuestos: {
        ivaCobrado: parseFloat(impuestos[0].ivaCobrado),
        ivaPagado: parseFloat(impuestos[0].ivaPagado)
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
