import type { InventarioProducto } from '../../types/negocio';
import { obtenerBaseDatos } from '../db';
import { crearErrorRepositorio } from './errores';

interface InventarioRow {
  producto_id: number;
  nombre: string;
  sku: string | null;
  marca: string | null;
  categoria_nombre: string;
  stock: number;
  unidad_medida: string;
  umbral_stock_bajo: number;
  precio_venta_actual: number;
  costo_compra_actual: number;
  tasa_iva: number;
}

function mapInventario(row: InventarioRow): InventarioProducto {
  return {
    productoId: row.producto_id,
    nombre: row.nombre,
    sku: row.sku,
    marca: row.marca,
    categoriaNombre: row.categoria_nombre,
    stock: row.stock,
    unidadMedida: row.unidad_medida,
    umbralStockBajo: row.umbral_stock_bajo,
    precioVentaActual: row.precio_venta_actual,
    costoCompraActual: row.costo_compra_actual,
    tasaIva: row.tasa_iva,
  };
}

export async function listarInventarioActual(): Promise<InventarioProducto[]> {
  try {
    const db = await obtenerBaseDatos();
    const rows = await db.getAllAsync<InventarioRow>(`
      SELECT p.id producto_id, p.nombre, p.sku, p.marca, c.nombre categoria_nombre,
        p.unidad_medida, p.umbral_stock_bajo, p.tasa_iva,
        p.precio_venta_actual, p.costo_compra_actual,
        COALESCE(SUM(
          CASE i.tipo_movimiento WHEN 'entrada' THEN i.cantidad ELSE -i.cantidad END
        ), 0) stock
      FROM productos p
      INNER JOIN categorias c ON c.id = p.categoria_id
      LEFT JOIN inventario i ON i.producto_id = p.id
      WHERE p.activo = 1
      GROUP BY p.id
      ORDER BY p.nombre ASC
    `);
    return rows.map(mapInventario);
  } catch (error) {
    throw crearErrorRepositorio('No se pudo cargar el inventario', error);
  }
}

export async function obtenerStockProducto(productoId: number): Promise<number> {
  try {
    const db = await obtenerBaseDatos();
    const row = await db.getFirstAsync<{ stock: number }>(
      `SELECT COALESCE(SUM(
        CASE tipo_movimiento WHEN 'entrada' THEN cantidad ELSE -cantidad END
      ), 0) stock FROM inventario WHERE producto_id = ?`,
      productoId,
    );
    return row?.stock ?? 0;
  } catch (error) {
    throw crearErrorRepositorio('No se pudo consultar el stock', error);
  }
}

export async function registrarAjusteInventario(productoId: number, cantidad: number, nota: string): Promise<void> {
  try {
    const db = await obtenerBaseDatos();
    const fecha = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO inventario (fecha, tipo_movimiento, producto_id, cantidad, nota) VALUES (?, 'entrada', ?, ?, ?)`,
      fecha, productoId, cantidad, nota
    );
  } catch (error) {
    throw crearErrorRepositorio('No se pudo registrar el ajuste de inventario', error);
  }
}
