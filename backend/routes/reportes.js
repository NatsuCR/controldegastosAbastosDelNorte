const express = require('express');
const db = require('../db');

const router = express.Router();
const num = (value) => Number(value || 0);

function rangoQuery(desde, hasta) {
  if (!desde || !hasta) return null;
  return [`${String(desde).slice(0, 10)} 00:00:00`, `${String(hasta).slice(0, 10)} 23:59:59`];
}

function resumen(row) {
  const ivaNetoPagar = num(row.ivaCobrado) - num(row.ivaPagadoProveedores);
  const gananciaNetaReal = num(row.ingresoBruto) - num(row.ivaCobrado)
    - num(row.totalComprasSinIva) - num(row.totalGastosOperativos);
  return {
    ingresoBruto: num(row.ingresoBruto),
    ivaCobrado: num(row.ivaCobrado),
    ivaCobrado13: num(row.ivaCobrado13),
    ivaCobrado1: num(row.ivaCobrado1),
    ivaPagadoProveedores: num(row.ivaPagadoProveedores),
    ivaProveedores13: num(row.ivaProveedores13),
    ivaProveedores1: num(row.ivaProveedores1),
    ivaNetoPagar,
    totalComprasSinIva: num(row.totalComprasSinIva),
    totalGastosOperativos: num(row.totalGastosOperativos),
    gananciaNetaReal,
  };
}

router.get('/', async (req, res) => {
  const rango = rangoQuery(req.query.desde, req.query.hasta);
  if (!rango) return res.status(400).json({ error: 'Rango de fechas obligatorio' });

  const [fechaDesde, fechaHasta] = rango;
  const connection = await db.getConnection();
  try {
    const [[totales]] = await connection.query(`
      SELECT
        (SELECT COALESCE(SUM(total), 0) FROM ventas WHERE fecha BETWEEN ? AND ?) ingresoBruto,
        (SELECT COALESCE(SUM(iva_monto), 0) FROM ventas WHERE fecha BETWEEN ? AND ?) ivaCobrado,
        (SELECT COALESCE(SUM(CASE WHEN tasa_iva = 0.13 THEN iva_monto ELSE 0 END), 0) FROM ventas WHERE fecha BETWEEN ? AND ?) ivaCobrado13,
        (SELECT COALESCE(SUM(CASE WHEN tasa_iva = 0.01 THEN iva_monto ELSE 0 END), 0) FROM ventas WHERE fecha BETWEEN ? AND ?) ivaCobrado1,
        (SELECT COALESCE(SUM(subtotal), 0) FROM compras WHERE fecha BETWEEN ? AND ?) totalComprasSinIva,
        (SELECT COALESCE(SUM(iva_monto), 0) FROM compras WHERE fecha BETWEEN ? AND ?) ivaPagadoProveedores,
        (SELECT COALESCE(SUM(CASE WHEN tasa_iva = 0.13 THEN iva_monto ELSE 0 END), 0) FROM compras WHERE fecha BETWEEN ? AND ?) ivaProveedores13,
        (SELECT COALESCE(SUM(CASE WHEN tasa_iva = 0.01 THEN iva_monto ELSE 0 END), 0) FROM compras WHERE fecha BETWEEN ? AND ?) ivaProveedores1,
        (SELECT COALESCE(SUM(monto), 0) FROM gastos WHERE fecha BETWEEN ? AND ?) totalGastosOperativos
    `, Array(9).fill([fechaDesde, fechaHasta]).flat());

    const [productos] = await connection.query(`
      SELECT p.id productoId, p.nombre, p.sku, p.marca, ca.nombre categoriaNombre,
        p.unidad_medida unidadMedida, SUM(v.cantidad) cantidadVendida,
        SUM(v.total) montoVendido, SUM(v.subtotal) subtotalVendido
      FROM ventas v
      JOIN productos p ON v.producto_id = p.id
      LEFT JOIN categorias ca ON p.categoria_id = ca.id
      WHERE v.fecha BETWEEN ? AND ?
      GROUP BY p.id, p.nombre, p.sku, p.marca, ca.nombre, p.unidad_medida
      ORDER BY montoVendido DESC
    `, [fechaDesde, fechaHasta]);

    const [historialCompras] = await connection.query(`
      SELECT c.id, c.fecha, pr.nombre proveedorNombre, p.nombre productoNombre,
        c.cantidad, c.total, c.imagen_factura imagenFactura
      FROM compras c
      JOIN productos p ON c.producto_id = p.id
      JOIN proveedores pr ON c.proveedor_id = pr.id
      WHERE c.fecha BETWEEN ? AND ?
      ORDER BY c.fecha DESC
    `, [fechaDesde, fechaHasta]);

    const [historialGastos] = await connection.query(`
      SELECT id, fecha, categoria, descripcion, monto, imagen_factura imagenFactura
      FROM gastos
      WHERE fecha BETWEEN ? AND ?
      ORDER BY fecha DESC
    `, [fechaDesde, fechaHasta]);

    res.json({
      rango: { desde: fechaDesde, hasta: fechaHasta },
      resumen: resumen(totales),
      productos: productos.map((p) => ({
        ...p,
        cantidadVendida: num(p.cantidadVendida),
        montoVendido: num(p.montoVendido),
        subtotalVendido: num(p.subtotalVendido),
      })),
      historialCompras: historialCompras.map((c) => ({ ...c, cantidad: num(c.cantidad), total: num(c.total) })),
      historialGastos: historialGastos.map((g) => ({ ...g, monto: num(g.monto) })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
