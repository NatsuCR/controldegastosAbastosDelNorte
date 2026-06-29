import type { CrearProductoInput } from '../../types/negocio';
import {
  validarColonesEnterosPositivos,
  validarNoNegativo,
  validarPositivo,
  validarTasaPorcentual,
} from '../../utils/validaciones';
import { obtenerBaseDatos } from '../db';
import { crearErrorRepositorio } from './errores';

export async function crearProductoRapido(input: CrearProductoInput): Promise<number> {
  try {
    validarProducto(input);
    const db = await obtenerBaseDatos();
    let productoId = 0;

    await db.withExclusiveTransactionAsync(async (txn) => {
      const resultado = await txn.runAsync(
        `INSERT INTO productos (
          categoria_id, nombre, sku, marca, unidad_medida, cantidad_por_presentacion,
          precio_venta_actual, costo_compra_actual, tasa_iva, umbral_stock_bajo, activo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        input.categoriaId,
        input.nombre.trim(),
        normalizarSku(input.sku),
        input.marca?.trim() || null,
        input.unidadMedida.trim(),
        input.cantidadPorPresentacion,
        input.precioVentaActual,
        input.costoCompraActual,
        input.tasaIva,
        input.umbralStockBajo,
      );
      productoId = resultado.lastInsertRowId;
      await guardarHistorialInicial(txn, productoId, input);
    });

    return productoId;
  } catch (error) {
    throw crearErrorRepositorio('No se pudo crear el producto', error);
  }
}

function validarProducto(input: CrearProductoInput): void {
  if (!input.nombre.trim() || !input.unidadMedida.trim()) {
    throw new Error('producto y unidad son obligatorios');
  }
  validarPositivo('La categoria', input.categoriaId);
  validarPositivo('La presentacion', input.cantidadPorPresentacion);
  validarColonesEnterosPositivos('El precio de venta', input.precioVentaActual);
  validarColonesEnterosPositivos('El costo de compra', input.costoCompraActual);
  validarTasaPorcentual('El IVA', input.tasaIva);
  validarNoNegativo('El umbral de stock', input.umbralStockBajo);
}

function normalizarSku(sku?: string): string | null {
  return sku?.trim().toUpperCase() || null;
}

async function guardarHistorialInicial(
  txn: Awaited<ReturnType<typeof obtenerBaseDatos>>,
  productoId: number,
  input: CrearProductoInput,
): Promise<void> {
  const fecha = new Date().toISOString();
  await txn.runAsync(
    `INSERT INTO historial_precios (producto_id, tipo, valor, vigente_desde, vigente_hasta)
     VALUES (?, 'venta', ?, ?, NULL)`,
    productoId, input.precioVentaActual, fecha,
  );
  await txn.runAsync(
    `INSERT INTO historial_precios (producto_id, tipo, valor, vigente_desde, vigente_hasta)
     VALUES (?, 'compra', ?, ?, NULL)`,
    productoId, input.costoCompraActual, fecha,
  );
}
