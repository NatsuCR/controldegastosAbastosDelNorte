import type { ActualizarProductoInput } from '../../types/negocio';
import type { Producto } from '../models';
import { obtenerBaseDatos } from '../db';
import { crearErrorRepositorio } from './errores';
import { mapProducto } from './productosRepository';
import {
  validarColonesEnterosPositivos,
  validarNoNegativo,
  validarTasaPorcentual,
} from '../../utils/validaciones';

export async function listarProductosTodos(): Promise<Producto[]> {
  try {
    const db = await obtenerBaseDatos();
    const rows = await db.getAllAsync<Parameters<typeof mapProducto>[0]>(
      `SELECT * FROM productos ORDER BY activo DESC, nombre ASC`,
    );
    return rows.map(mapProducto);
  } catch (error) {
    throw crearErrorRepositorio('No se pudieron cargar los productos', error);
  }
}

export async function eliminarProducto(productoId: number): Promise<void> {
  try {
    const db = await obtenerBaseDatos();
    await db.withExclusiveTransactionAsync(async (txn) => {
      await txn.runAsync(`DELETE FROM inventario WHERE producto_id = ?`, productoId);
      await txn.runAsync(`DELETE FROM compras WHERE producto_id = ?`, productoId);
      await txn.runAsync(`DELETE FROM ventas WHERE producto_id = ?`, productoId);
      await txn.runAsync(`DELETE FROM historial_precios WHERE producto_id = ?`, productoId);
      await txn.runAsync(`DELETE FROM productos WHERE id = ?`, productoId);
    });
  } catch (error) {
    throw crearErrorRepositorio('No se pudo eliminar el producto', error);
  }
}

export async function actualizarProducto(input: ActualizarProductoInput): Promise<void> {
  try {
    if (!input.nombre.trim()) {
      throw new Error('el nombre del producto es obligatorio');
    }
    validarColonesEnterosPositivos('El precio de venta', input.precioVentaActual);
    validarColonesEnterosPositivos('El costo de compra', input.costoCompraActual);
    validarTasaPorcentual('El IVA', input.tasaIva);
    validarNoNegativo('El umbral de stock', input.umbralStockBajo);

    const db = await obtenerBaseDatos();
    const actual = await db.getFirstAsync<{
      precio_venta_actual: number;
      costo_compra_actual: number;
    }>(`SELECT precio_venta_actual, costo_compra_actual FROM productos WHERE id = ?`, input.productoId);

    if (!actual) {
      throw new Error('producto no encontrado');
    }

    await db.withExclusiveTransactionAsync(async (txn) => {
      await txn.runAsync(
        `UPDATE productos SET nombre = ?, sku = ?, marca = ?, precio_venta_actual = ?,
          costo_compra_actual = ?, tasa_iva = ?, umbral_stock_bajo = ?, activo = ?
         WHERE id = ?`,
        input.nombre.trim(), normalizarSku(input.sku), input.marca?.trim() || null,
        input.precioVentaActual, input.costoCompraActual, input.tasaIva,
        input.umbralStockBajo, input.activo ? 1 : 0, input.productoId,
      );
      await guardarHistorial(txn, input, actual);
    });
  } catch (error) {
    throw crearErrorRepositorio('No se pudo actualizar el producto', error);
  }
}

function normalizarSku(sku?: string): string | null {
  return sku?.trim().toUpperCase() || null;
}

async function guardarHistorial(
  txn: Awaited<ReturnType<typeof obtenerBaseDatos>>,
  input: ActualizarProductoInput,
  actual: { precio_venta_actual: number; costo_compra_actual: number },
) {
  const fecha = new Date().toISOString();
  await guardarCambio(txn, input.productoId, 'venta', actual.precio_venta_actual, input.precioVentaActual, fecha);
  await guardarCambio(txn, input.productoId, 'compra', actual.costo_compra_actual, input.costoCompraActual, fecha);
}

async function guardarCambio(
  txn: Awaited<ReturnType<typeof obtenerBaseDatos>>,
  productoId: number,
  tipo: 'venta' | 'compra',
  anterior: number,
  nuevo: number,
  fecha: string,
) {
  if (Math.abs(anterior - nuevo) < 1) {
    return;
  }

  await txn.runAsync(
    `UPDATE historial_precios SET vigente_hasta = ?
     WHERE producto_id = ? AND tipo = ? AND vigente_hasta IS NULL`,
    fecha, productoId, tipo,
  );
  await txn.runAsync(
    `INSERT INTO historial_precios (producto_id, tipo, valor, vigente_desde, vigente_hasta)
     VALUES (?, ?, ?, ?, NULL)`,
    productoId, tipo, nuevo, fecha,
  );
}
