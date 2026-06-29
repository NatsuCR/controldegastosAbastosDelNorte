import type { Producto } from '../models';
import type { RegistrarVentaCarritoInput, RegistrarVentaLineaInput } from '../../types/negocio';
import type { ResultadoCalculoFiscal } from '../../types/fiscales';
import { calcularVenta } from '../../services';
import { esPagoSinpe, esTelefonoClienteValido, normalizarTelefonoCliente } from '../../utils/telefono';
import { validarPositivo } from '../../utils/validaciones';
import { apiClient } from '../../services/apiClient';
import { crearErrorRepositorio } from './errores';
import { obtenerConfiguracionNegocio } from './configuracionRepository';
import { obtenerProductoPorId } from './productosRepository'; // We need this function to get product data

// We assume we fetch products through API
export async function registrarVentaCarrito(input: RegistrarVentaCarritoInput): Promise<number[]> {
  try {
    const clienteTelefono = obtenerTelefonoCliente(input);
    const lineas = consolidarLineas(input.lineas);
    const config = await obtenerConfiguracionNegocio();
    
    // In order to calculate, we need product details. Let's fetch all products and find them.
    const allProducts = await apiClient.get('/productos');
    
    const ventas = prepararVentas(lineas, allProducts, config.precioVentaIncluyeIva);
    const ids: number[] = [];

    for (const venta of ventas) {
      const payload = {
        productoId: venta.producto.id,
        cantidad: venta.cantidad,
        precioUnitario: venta.producto.precioVentaActual,
        tasaIva: venta.producto.tasaIva,
        subtotal: venta.calculo.subtotal,
        ivaMonto: venta.calculo.ivaMonto,
        total: venta.calculo.total,
        metodoPago: input.metodoPago,
        clienteTelefono,
        nota: input.nota?.trim() || null
      };

      const result = await apiClient.post('/ventas', payload);
      ids.push(result.id);
    }

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

function prepararVentas(lineas: RegistrarVentaLineaInput[], allProducts: any[], precioIncluyeIva: boolean) {
  const ventas: any[] = [];

  for (const linea of lineas) {
    const producto = allProducts.find(p => p.id === linea.productoId);
    if (!producto) throw new Error(`Producto no encontrado`);

    const cantidadInventario = linea.cantidad * producto.cantidadPorPresentacion;
    
    if (producto.cantidadStock < cantidadInventario) {
      throw new Error(`stock insuficiente para ${producto.nombre}: disponible ${producto.cantidadStock} ${producto.unidadMedida}`);
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
  if (!esPagoSinpe(input.metodoPago)) return null;
  if (!esTelefonoClienteValido(input.clienteTelefono ?? '')) {
    throw new Error('el celular del cliente es obligatorio para ventas por SINPE Movil');
  }
  return normalizarTelefonoCliente(input.clienteTelefono ?? '');
}
