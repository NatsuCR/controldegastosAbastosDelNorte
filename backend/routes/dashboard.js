const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  const connection = await db.getConnection();
  try {
    const [[{ total_ventas }]] = await connection.query(`
      SELECT COALESCE(SUM(total), 0) as total_ventas
      FROM ventas
      WHERE date(fecha) = curdate()
    `);

    const [[{ compras_total }]] = await connection.query(`
      SELECT COALESCE(SUM(total), 0) as compras_total
      FROM compras
      WHERE date(fecha) = curdate()
    `);

    const [[{ gastos_total }]] = await connection.query(`
      SELECT COALESCE(SUM(monto), 0) as gastos_total
      FROM gastos
      WHERE date(fecha) = curdate()
    `);

    const ingresosDelDia = parseFloat(total_ventas);
    const egresosDelDia = parseFloat(compras_total) + parseFloat(gastos_total);
    const gananciaNeta = ingresosDelDia - egresosDelDia;

    const [[{ total_compras_30d }]] = await connection.query(`
      SELECT COALESCE(SUM(total), 0) as total_compras_30d
      FROM compras
      WHERE fecha >= DATE_SUB(curdate(), INTERVAL 30 DAY)
    `);

    const [[{ total_gastos_30d }]] = await connection.query(`
      SELECT COALESCE(SUM(monto), 0) as total_gastos_30d
      FROM gastos
      WHERE fecha >= DATE_SUB(curdate(), INTERVAL 30 DAY)
    `);

    const [[{ total_ventas_30d }]] = await connection.query(`
      SELECT COALESCE(SUM(total), 0) as total_ventas_30d
      FROM ventas
      WHERE fecha >= DATE_SUB(curdate(), INTERVAL 30 DAY)
    `);

    // Ventas 7 dias
    const [ventasUltimos7Dias] = await connection.query(`
      SELECT date(fecha) as fecha, SUM(total) as monto
      FROM ventas
      WHERE fecha >= DATE_SUB(curdate(), INTERVAL 7 DAY)
      GROUP BY date(fecha)
      ORDER BY date(fecha) ASC
    `);

    // Top 5 productos
    const [productosMasVendidos] = await connection.query(`
      SELECT p.nombre, SUM(v.cantidad) as cantidad
      FROM ventas v
      JOIN productos p ON v.producto_id = p.id
      WHERE v.fecha >= DATE_SUB(curdate(), INTERVAL 30 DAY)
      GROUP BY p.id
      ORDER BY cantidad DESC
      LIMIT 5
    `);

    res.json({
      ingresosDelDia,
      egresosDelDia,
      gananciaNeta,
      totalCompras30d: parseFloat(total_compras_30d),
      totalGastos30d: parseFloat(total_gastos_30d),
      totalVentas30d: parseFloat(total_ventas_30d),
      ventasUltimos7Dias,
      productosMasVendidos
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
