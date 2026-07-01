import { apiClient } from '../../services/apiClient';
import { crearErrorRepositorio } from './errores';
import type { RegistrarCompraInput } from '../../types/negocio';
import { calcularCompra } from '../../services';
import { subirArchivoMultipart } from '../../services/fileUpload';
import { obtenerConfiguracionNegocio } from './configuracionRepository';

export async function registrarCompra(input: RegistrarCompraInput): Promise<number> {
  try {
    const config = await obtenerConfiguracionNegocio();
    
    // Fetch product to get tasaIva
    const productos = await apiClient.get('/productos');
    const producto = productos.find((p: any) => p.id === input.productoId);
    const tasaIva = producto ? producto.tasaIva : 0.13;
    
    // Calculate totals based on the input
    const calculo = calcularCompra(input.costoUnitario, input.cantidad, tasaIva, config.costoProveedorIncluyeIva);

    const payload = {
      ...input,
      tasaIva,
      subtotal: calculo.subtotal,
      ivaMonto: calculo.ivaMonto,
      total: calculo.total,
    };

    if (input.imagenFactura) {
      const campos = { ...payload, imagenFactura: undefined };
      const result = await subirArchivoMultipart('/compras', input.imagenFactura, campos);
      return result.id;
    }

    const result = await apiClient.post('/compras', payload);
    return result.id;
  } catch (error) {
    throw crearErrorRepositorio('No se pudo registrar la compra', error);
  }
}
