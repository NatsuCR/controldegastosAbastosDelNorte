import type { RegistrarCompraInput } from '../../types/negocio';
import { calcularCompra } from '../../services/calculosFiscales';
import { validarColonesEnterosPositivos, validarPositivo } from '../../utils/validaciones';
import { obtenerBaseDatos } from '../db';
import { crearErrorRepositorio } from './errores';
import { obtenerConfiguracionNegocio } from './configuracionRepository';
import { obtenerProductoPorId } from './productosRepository';

function costoCambio(actual: number, nuevo: number): boolean {
  return Math.abs(actual - nuevo) >= 0.01;
}

export async function registrarCompra(input: RegistrarCompraInput): Promise<number> {
  try {
    validarPositivo('La cantidad', input.cantidad);
    validarColonesEnterosPositivos('El costo unitario', input.costoUnitario);
    const producto = await obtenerProductoPorId(input.productoId);
    const config = await obtenerConfiguracionNegocio();
    const calculo = calcularCompra(
      input.costoUnitario,
      input.cantidad,
      producto.tasaIva,
      config.costoProveedorIncluyeIva,
    );
    const cantidadInventario = input.cantidad * producto.cantidadPorPresentacion;
    const db = await obtenerBaseDatos();
    let compraId = 0;

    await db.withExclusiveTransactionAsync(async (txn) => {
      const fecha = new Date().toISOString();
      const resultado = await txn.runAsync(
        `INSERT INTO compras (
          fecha, proveedor_id, producto_id, cantidad, costo_unitario, tasa_iva, subtotal,
          iva_monto, total, metodo_pago, nota, imagen_factura
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        fecha, input.proveedorId, input.productoId, input.cantidad, input.costoUnitario,
        producto.tasaIva, calculo.subtotal, calculo.ivaMonto, calculo.total, input.metodoPago,
        input.nota?.trim() || null, input.imagenFactura || null,
      );
      compraId = resultado.lastInsertRowId;
      await txn.runAsync(
        `INSERT INTO inventario (
          fecha, tipo_movimiento, producto_id, cantidad, compra_id, venta_id, nota
        ) VALUES (?, 'entrada', ?, ?, ?, NULL, ?)`,
        fecha, input.productoId, cantidadInventario, compraId, 'Compra registrada',
      );
      await actualizarCostoSiAplica(txn, input, producto.costoCompraActual, fecha);
    });

    return compraId;
  } catch (error) {
    throw crearErrorRepositorio('No se pudo registrar la compra', error);
  }
}

async function actualizarCostoSiAplica(
  txn: Awaited<ReturnType<typeof obtenerBaseDatos>>,
  input: RegistrarCompraInput,
  costoActual: number,
  fecha: string,
): Promise<void> {
  if (!input.actualizarCostoVigente || !costoCambio(costoActual, input.costoUnitario)) {
    return;
  }

  await txn.runAsync(
    `UPDATE historial_precios
     SET vigente_hasta = ?
     WHERE producto_id = ? AND tipo = 'compra' AND vigente_hasta IS NULL`,
    fecha, input.productoId,
  );
  await txn.runAsync(
    `UPDATE productos SET costo_compra_actual = ? WHERE id = ?`,
    input.costoUnitario, input.productoId,
  );
  await txn.runAsync(
    `INSERT INTO historial_precios (producto_id, tipo, valor, vigente_desde, vigente_hasta)
     VALUES (?, 'compra', ?, ?, NULL)`,
    input.productoId, input.costoUnitario, fecha,
  );
}
