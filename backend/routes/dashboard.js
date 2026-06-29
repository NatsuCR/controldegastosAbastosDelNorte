const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  const connection = await db.getConnection();
  try {
    // 1. Resumen Fiscal (Totales de ventas, compras, gastos)
    const [[ventas]] = await connection.query(`
      SELECT 
        COALESCE(SUM(total), 0) as ingresoBruto,
        COALESCE(SUM(iva_monto), 0) as ivaCobrado,
        COALESCE(SUM(CASE WHEN tasa_iva = 0.13 THEN iva_monto ELSE 0 END), 0) as ivaCobrado13,
        COALESCE(SUM(CASE WHEN tasa_iva = 0.01 THEN iva_monto ELSE 0 END), 0) as ivaCobrado1
      FROM ventas
    `);

    const [[compras]] = await connection.query(`
      SELECT 
        COALESCE(SUM(subtotal), 0) as totalComprasSinIva,
        COALESCE(SUM(iva_monto), 0) as ivaPagadoProveedores,
        COALESCE(SUM(CASE WHEN tasa_iva = 0.13 THEN iva_monto ELSE 0 END), 0) as ivaProveedores13,
        COALESCE(SUM(CASE WHEN tasa_iva = 0.01 THEN iva_monto ELSE 0 END), 0) as ivaProveedores1
      FROM compras
    `);

    const [[gastos]] = await connection.query(`
      SELECT COALESCE(SUM(monto), 0) as totalGastosOperativos
      FROM gastos
    `);

    const ivaNetoPagar = parseFloat(ventas.ivaCobrado) - parseFloat(compras.ivaPagadoProveedores);
    const gananciaNetaReal = (parseFloat(ventas.ingresoBruto) - parseFloat(ventas.ivaCobrado)) 
                           - parseFloat(compras.totalComprasSinIva) 
                           - parseFloat(gastos.totalGastosOperativos);

    const resumen = {
      ingresoBruto: parseFloat(ventas.ingresoBruto),
      ivaCobrado: parseFloat(ventas.ivaCobrado),
      ivaCobrado13: parseFloat(ventas.ivaCobrado13),
      ivaCobrado1: parseFloat(ventas.ivaCobrado1),
      ivaPagadoProveedores: parseFloat(compras.ivaPagadoProveedores),
      ivaProveedores13: parseFloat(compras.ivaProveedores13),
      ivaProveedores1: parseFloat(compras.ivaProveedores1),
      ivaNetoPagar,
      totalComprasSinIva: parseFloat(compras.totalComprasSinIva),
      totalGastosOperativos: parseFloat(gastos.totalGastosOperativos),
      gananciaNetaReal
    };

    // 2. Ventas últimos días
    const [ventasRows] = await connection.query(`
      SELECT date(fecha) as fecha, SUM(total) as total
      FROM ventas
      WHERE fecha >= DATE_SUB(curdate(), INTERVAL 7 DAY)
      GROUP BY date(fecha)
      ORDER BY date(fecha) ASC
    `);
    const ventasUltimosDias = ventasRows.map(r => ({
      fecha: r.fecha,
      etiqueta: new Date(r.fecha).toLocaleDateString('es-CR', { weekday: 'short' }),
      total: parseFloat(r.total)
    }));

    // 3. Inventario (Alertas de stock bajo)
    const [inventario] = await connection.query(`
      SELECT 
        p.id as productoId,
        p.nombre,
        c.nombre as categoriaNombre,
        p.cantidad_por_presentacion as stockActual,
        p.umbral_stock_bajo as umbralBajo,
        p.precio_venta_actual as precio,
        p.costo_compra_actual as costo
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      ORDER BY p.cantidad_por_presentacion ASC
      LIMIT 10
    `);

    res.json({
      resumen,
      ventasUltimosDias,
      inventario
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
