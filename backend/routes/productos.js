const express = require('express');
const db = require('../db');

const router = express.Router();
const cleanSku = (value) => {
  const sku = String(value || '').trim();
  return sku ? sku : null;
};

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, c.nombre as categoriaNombre
      FROM productos p
      INNER JOIN categorias c ON p.categoria_id = c.id
      WHERE p.activo = TRUE
    `);
    res.json(rows.map(row => ({
      id: row.id,
      categoriaId: row.categoria_id,
      categoriaNombre: row.categoriaNombre,
      nombre: row.nombre,
      sku: row.sku,
      marca: row.marca,
      unidadMedida: row.unidad_medida,
      cantidadPorPresentacion: row.cantidad_por_presentacion,
      precioVentaActual: row.precio_venta_actual,
      costoCompraActual: row.costo_compra_actual,
      tasaIva: row.tasa_iva,
      umbralStockBajo: row.umbral_stock_bajo,
      activo: !!row.activo
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const {
    categoriaId, nombre, sku, marca, unidadMedida, cantidadPorPresentacion,
    precioVentaActual, costoCompraActual, tasaIva, umbralStockBajo
  } = req.body;
  
  try {
    const [result] = await db.query(
      `INSERT INTO productos (
        categoria_id, nombre, sku, marca, unidad_medida, cantidad_por_presentacion,
        precio_venta_actual, costo_compra_actual, tasa_iva, umbral_stock_bajo, activo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        categoriaId, String(nombre || '').trim(), cleanSku(sku), marca || null, unidadMedida,
        cantidadPorPresentacion, precioVentaActual, costoCompraActual, tasaIva, umbralStockBajo
      ]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    res.status(400).json({ error: 'Error al crear producto', details: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const campos = [];
  const valores = [];

  function setCampo(nombreCampo, valor) {
    campos.push(`${nombreCampo} = ?`);
    valores.push(valor);
  }

  try {
    if ('nombre' in req.body) setCampo('nombre', String(req.body.nombre || '').trim());
    if ('sku' in req.body) setCampo('sku', cleanSku(req.body.sku));
    if ('marca' in req.body) setCampo('marca', req.body.marca || null);
    if ('precioVentaActual' in req.body) setCampo('precio_venta_actual', req.body.precioVentaActual);
    if ('costoCompraActual' in req.body) setCampo('costo_compra_actual', req.body.costoCompraActual);
    if ('tasaIva' in req.body) setCampo('tasa_iva', req.body.tasaIva);
    if ('umbralStockBajo' in req.body) setCampo('umbral_stock_bajo', req.body.umbralStockBajo);
    if ('activo' in req.body) setCampo('activo', req.body.activo ? 1 : 0);
    if (campos.length === 0) return res.status(400).json({ error: 'No hay cambios para guardar' });

    await db.query(`UPDATE productos SET ${campos.join(', ')} WHERE id = ?`, [...valores, req.params.id]);
    res.json({ message: 'Producto actualizado' });
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar producto', details: err.message });
  }
});

module.exports = router;
