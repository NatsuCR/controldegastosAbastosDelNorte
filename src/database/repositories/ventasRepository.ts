import type { RegistrarVentaInput } from '../../types/negocio';
import { calcularVenta } from '../../services/calculosFiscales';
import { obtenerBaseDatos } from '../db';
import { crearErrorRepositorio } from './errores';
import { obtenerConfiguracionNegocio } from './configuracionRepository';
import { obtenerStockProducto } from './inventarioRepository';
import { obtenerProductoPorId } from './productosRepository';
import { esPagoSinpe, esTelefonoClienteValido, normalizarTelefonoCliente } from '../../utils/telefono';
import { validarPositivo } from '../../utils/validaciones';

export async function registrarVenta(input: RegistrarVentaInput): Promise<number> {
  try {
    validarPositivo('La cantidad', input.cantidad);
    const producto = await obtenerProductoPorId(input.productoId);
    const cantidadInventario = input.cantidad * producto.cantidadPorPresentacion;
    const stock = await obtenerStockProducto(input.productoId);

    if (stock < cantidadInventario) {
      throw new Error(`stock insuficiente: disponible ${stock} ${producto.unidadMedida}`);
    }

    const clienteTelefono = obtenerTelefonoCliente(input);

    const db = await obtenerBaseDatos();
    const config = await obtenerConfiguracionNegocio();
    const calculo = calcularVenta(
      producto.precioVentaActual,
      input.cantidad,
      producto.tasaIva,
      config.precioVentaIncluyeIva,
    );
    let ventaId = 0;

    await db.withExclusiveTransactionAsync(async (txn) => {
      const fecha = new Date().toISOString();
      const resultado = await txn.runAsync(
        `INSERT INTO ventas (
          fecha, producto_id, cantidad, precio_unitario, tasa_iva, subtotal,
          iva_monto, total, metodo_pago, cliente_telefono, nota
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        fecha, input.productoId, input.cantidad, producto.precioVentaActual,
        producto.tasaIva, calculo.subtotal, calculo.ivaMonto, calculo.total, input.metodoPago,
        clienteTelefono, input.nota?.trim() || null,
      );
      ventaId = resultado.lastInsertRowId;
      await txn.runAsync(
        `INSERT INTO inventario (
          fecha, tipo_movimiento, producto_id, cantidad, compra_id, venta_id, nota
        ) VALUES (?, 'salida', ?, ?, NULL, ?, ?)`,
        fecha, input.productoId, cantidadInventario, ventaId, 'Venta registrada',
      );
    });

    return ventaId;
  } catch (error) {
    throw crearErrorRepositorio('No se pudo registrar la venta', error);
  }
}

function obtenerTelefonoCliente(input: RegistrarVentaInput): string | null {
  if (!esPagoSinpe(input.metodoPago)) {
    return null;
  }

  if (!esTelefonoClienteValido(input.clienteTelefono ?? '')) {
    throw new Error('el celular del cliente es obligatorio para ventas por SINPE Movil');
  }

  return normalizarTelefonoCliente(input.clienteTelefono ?? '');
}
