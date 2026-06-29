import type { Producto } from '../models';
import type { RegistrarVentaCarritoInput, RegistrarVentaLineaInput } from '../../types/negocio';
import type { ResultadoCalculoFiscal } from '../../types/fiscales';
import { calcularVenta } from '../../services';
import { esPagoSinpe, esTelefonoClienteValido, normalizarTelefonoCliente } from '../../utils/telefono';
import { validarPositivo } from '../../utils/validaciones';
import { obtenerBaseDatos } from '../db';
import { crearErrorRepositorio } from './errores';
import { obtenerConfiguracionNegocio } from './configuracionRepository';
import { obtenerStockProducto } from './inventarioRepository';
import { obtenerProductoPorId } from './productosRepository';

interface VentaPreparada {
  producto: Producto;
  cantidad: number;
  cantidadInventario: number;
  calculo: ResultadoCalculoFiscal;
}

export async function registrarVentaCarrito(input: RegistrarVentaCarritoInput): Promise<number[]> {
  try {
    const clienteTelefono = obtenerTelefonoCliente(input);
    const lineas = consolidarLineas(input.lineas);
    const config = await obtenerConfiguracionNegocio();
    const ventas = await prepararVentas(lineas, config.precioVentaIncluyeIva);
    const db = await obtenerBaseDatos();
    const ids: number[] = [];

    await db.withExclusiveTransactionAsync(async (txn) => {
      const fecha = new Date().toISOString();

      for (const venta of ventas) {
        const resultado = await insertarVenta(txn, venta, input, clienteTelefono, fecha);
        ids.push(resultado.lastInsertRowId);
        await insertarSalidaInventario(txn, venta, resultado.lastInsertRowId, fecha);
      }
    });

    return ids;
  } catch (error) {
    throw crearErrorRepositorio('No se pudo registrar la venta', error);
  }
}

function consolidarLineas(lineas: RegistrarVentaLineaInput[]) {
  if (lineas.length === 0) {
    throw new Error('agrega al menos un producto al carrito');
  }

  const totales = new Map<number, number>();
  lineas.forEach((linea) => {
    validarPositivo('La cantidad', linea.cantidad);
    totales.set(linea.productoId, (totales.get(linea.productoId) ?? 0) + linea.cantidad);
  });
  return [...totales].map(([productoId, cantidad]) => ({ productoId, cantidad }));
}

async function prepararVentas(lineas: RegistrarVentaLineaInput[], precioIncluyeIva: boolean) {
  const ventas: VentaPreparada[] = [];

  for (const linea of lineas) {
    const producto = await obtenerProductoPorId(linea.productoId);
    const cantidadInventario = linea.cantidad * producto.cantidadPorPresentacion;
    const stock = await obtenerStockProducto(linea.productoId);

    if (stock < cantidadInventario) {
      throw new Error(`stock insuficiente para ${producto.nombre}: disponible ${stock} ${producto.unidadMedida}`);
    }

    ventas.push({
      producto,
      cantidad: linea.cantidad,
      cantidadInventario,
      calculo: calcularVenta(producto.precioVentaActual, linea.cantidad, producto.tasaIva, precioIncluyeIva),
    });
  }

  return ventas;
}

function obtenerTelefonoCliente(input: RegistrarVentaCarritoInput): string | null {
  if (!esPagoSinpe(input.metodoPago)) {
    return null;
  }

  if (!esTelefonoClienteValido(input.clienteTelefono ?? '')) {
    throw new Error('el celular del cliente es obligatorio para ventas por SINPE Movil');
  }

  return normalizarTelefonoCliente(input.clienteTelefono ?? '');
}

function insertarVenta(txn: Awaited<ReturnType<typeof obtenerBaseDatos>>, venta: VentaPreparada,
  input: RegistrarVentaCarritoInput, clienteTelefono: string | null, fecha: string) {
  const p = venta.producto;
  return txn.runAsync(
    `INSERT INTO ventas (
      fecha, producto_id, cantidad, precio_unitario, tasa_iva, subtotal,
      iva_monto, total, metodo_pago, cliente_telefono, nota
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    fecha, p.id, venta.cantidad, p.precioVentaActual, p.tasaIva,
    venta.calculo.subtotal, venta.calculo.ivaMonto, venta.calculo.total,
    input.metodoPago, clienteTelefono, input.nota?.trim() || null,
  );
}

function insertarSalidaInventario(
  txn: Awaited<ReturnType<typeof obtenerBaseDatos>>,
  venta: VentaPreparada,
  ventaId: number,
  fecha: string,
) {
  return txn.runAsync(
    `INSERT INTO inventario (
      fecha, tipo_movimiento, producto_id, cantidad, compra_id, venta_id, nota
    ) VALUES (?, 'salida', ?, ?, NULL, ?, ?)`,
    fecha, venta.producto.id, venta.cantidadInventario, ventaId, 'Venta en carrito',
  );
}
