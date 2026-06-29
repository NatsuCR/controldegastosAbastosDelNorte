import type { Producto } from '../models';
import { obtenerBaseDatos } from '../db';
import { crearErrorRepositorio } from './errores';

interface ProductoRow {
  id: number;
  categoria_id: number;
  nombre: string;
  sku: string | null;
  marca: string | null;
  unidad_medida: string;
  cantidad_por_presentacion: number;
  precio_venta_actual: number;
  costo_compra_actual: number;
  tasa_iva: number;
  umbral_stock_bajo: number;
  activo: number;
}

export function mapProducto(row: ProductoRow): Producto {
  return {
    id: row.id,
    categoriaId: row.categoria_id,
    nombre: row.nombre,
    sku: row.sku,
    marca: row.marca,
    unidadMedida: row.unidad_medida,
    cantidadPorPresentacion: row.cantidad_por_presentacion,
    precioVentaActual: row.precio_venta_actual,
    costoCompraActual: row.costo_compra_actual,
    tasaIva: row.tasa_iva,
    umbralStockBajo: row.umbral_stock_bajo,
    activo: row.activo === 1,
  };
}

export async function listarProductosActivos(): Promise<Producto[]> {
  try {
    const db = await obtenerBaseDatos();
    const rows = await db.getAllAsync<ProductoRow>(
      `SELECT * FROM productos WHERE activo = 1 ORDER BY nombre ASC`,
    );
    return rows.map(mapProducto);
  } catch (error) {
    throw crearErrorRepositorio('No se pudieron cargar los productos', error);
  }
}

export async function obtenerProductoPorId(productoId: number): Promise<Producto> {
  try {
    const db = await obtenerBaseDatos();
    const row = await db.getFirstAsync<ProductoRow>(
      `SELECT * FROM productos WHERE id = ? AND activo = 1`,
      productoId,
    );

    if (!row) {
      throw new Error('producto no encontrado o inactivo');
    }

    return mapProducto(row);
  } catch (error) {
    throw crearErrorRepositorio('No se pudo cargar el producto', error);
  }
}
