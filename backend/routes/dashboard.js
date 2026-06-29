const express = require('express');
const db = require('../db');

const router = express.Router();
const num = (value) => Number(value || 0);

function ymd(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function fechaLocal(fecha) {
  const dia = new Date(fecha);
  return dia.toLocaleDateString('es-CR', { weekday: 'short' });
}

function completarUltimos7Dias(rows) {
  const totales = new Map(rows.map((row) => [ymd(row.fecha), num(row.total)]));
  return Array.from({ length: 7 }, (_, index) => {
    const dia = new Date();
    dia.setDate(dia.getDate() - 6 + index);
    const fecha = ymd(dia);
    return { fecha, etiqueta: fechaLocal(`${fecha}T12:00:00`), total: totales.get(fecha) || 0 };
  });
}

router.get('/', async (req, res) => {
  const connection = await db.getConnection();
  try {
    const [[ventas]] = await connection.query(`
      SELECT COALESCE(SUM(total), 0) ingresoBruto,
        COALESCE(SUM(iva_monto), 0) ivaCobrado,
        COALESCE(SUM(CASE WHEN tasa_iva = 0.13 THEN iva_monto ELSE 0 END), 0) ivaCobrado13,
        COALESCE(SUM(CASE WHEN tasa_iva = 0.01 THEN iva_monto ELSE 0 END), 0) ivaCobrado1
      FROM ventas
    `);
    const [[compras]] = await connection.query(`
      SELECT COALESCE(SUM(subtotal), 0) totalComprasSinIva,
        COALESCE(SUM(iva_monto), 0) ivaPagadoProveedores,
        COALESCE(SUM(CASE WHEN tasa_iva = 0.13 THEN iva_monto ELSE 0 END), 0) ivaProveedores13,
        COALESCE(SUM(CASE WHEN tasa_iva = 0.01 THEN iva_monto ELSE 0 END), 0) ivaProveedores1
      FROM compras
    `);
    const [[gastos]] = await connection.query(`
      SELECT COALESCE(SUM(monto), 0) totalGastosOperativos FROM gastos
    `);
    const [ventasRows] = await connection.query(`
      SELECT DATE(fecha) fecha, SUM(total) total
      FROM ventas
      WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY DATE(fecha)
      ORDER BY DATE(fecha) ASC
    `);
    const [inventario] = await connection.query(`
      SELECT p.id productoId, p.nombre, c.nombre categoriaNombre,
        p.cantidad_por_presentacion stockActual, p.umbral_stock_bajo umbralBajo,
        p.precio_venta_actual precio, p.costo_compra_actual costo
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      ORDER BY p.cantidad_por_presentacion ASC
      LIMIT 10
    `);

    const ivaNetoPagar = num(ventas.ivaCobrado) - num(compras.ivaPagadoProveedores);
    const gananciaNetaReal = num(ventas.ingresoBruto) - num(ventas.ivaCobrado)
      - num(compras.totalComprasSinIva) - num(gastos.totalGastosOperativos);

    res.json({
      resumen: {
        ingresoBruto: num(ventas.ingresoBruto),
        ivaCobrado: num(ventas.ivaCobrado),
        ivaCobrado13: num(ventas.ivaCobrado13),
        ivaCobrado1: num(ventas.ivaCobrado1),
        ivaPagadoProveedores: num(compras.ivaPagadoProveedores),
        ivaProveedores13: num(compras.ivaProveedores13),
        ivaProveedores1: num(compras.ivaProveedores1),
        ivaNetoPagar,
        totalComprasSinIva: num(compras.totalComprasSinIva),
        totalGastosOperativos: num(gastos.totalGastosOperativos),
        gananciaNetaReal,
      },
      ventasUltimosDias: completarUltimos7Dias(ventasRows),
      inventario,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
