const express = require('express');
const db = require('../db');

const router = express.Router();
const num = (value) => Number(value || 0);

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, c.nombre as categoriaNombre,
        (SELECT COALESCE(SUM(CASE WHEN tipo_movimiento = 'entrada' THEN cantidad ELSE -cantidad END), 0)
         FROM inventario WHERE producto_id = p.id) as cantidadStock
      FROM productos p
      INNER JOIN categorias c ON p.categoria_id = c.id
      WHERE p.activo = TRUE
    `);
    
    res.json(rows.map(row => ({
      id: row.id,
      productoId: row.id,
      categoriaId: row.categoria_id,
      categoriaNombre: row.categoriaNombre,
      nombre: row.nombre,
      sku: row.sku,
      marca: row.marca,
      unidadMedida: row.unidad_medida,
      cantidadPorPresentacion: num(row.cantidad_por_presentacion),
      precioVentaActual: num(row.precio_venta_actual),
      costoCompraActual: num(row.costo_compra_actual),
      tasaIva: num(row.tasa_iva),
      umbralStockBajo: num(row.umbral_stock_bajo),
      cantidadStock: num(row.cantidadStock),
      stock: num(row.cantidadStock),
      activo: !!row.activo
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
