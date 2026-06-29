import { apiClient } from '../../services/apiClient';
import { crearErrorRepositorio } from './errores';
import type { RegistrarCompraInput } from '../../types/negocio';
import { calcularCompra } from '../../services';
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

    const formData = new FormData();
    formData.append('proveedorId', String(input.proveedorId));
    formData.append('productoId', String(input.productoId));
    formData.append('cantidad', String(input.cantidad));
    formData.append('costoUnitario', String(input.costoUnitario));
    formData.append('tasaIva', String(tasaIva));
    formData.append('subtotal', String(calculo.subtotal));
    formData.append('ivaMonto', String(calculo.ivaMonto));
    formData.append('total', String(calculo.total));
    formData.append('metodoPago', input.metodoPago);
    if (input.nota) formData.append('nota', input.nota);
    
    if (input.imagenFactura) {
      const fileName = input.imagenFactura.split('/').pop() || 'factura.jpg';
      formData.append('imagenFactura', {
        uri: input.imagenFactura,
        name: fileName,
        type: 'image/jpeg',
      } as any);
    }

    const result = await apiClient.postForm('/compras', formData);
    return result.id;
  } catch (error) {
    throw crearErrorRepositorio('No se pudo registrar la compra', error);
  }
}
