import { apiClient } from '../../services/apiClient';
import { crearErrorRepositorio } from './errores';
import type { ActualizarProductoInput } from '../../types/negocio';

export async function listarProductosTodos(): Promise<any[]> {
  try {
    return await apiClient.get('/productos');
  } catch (error) {
    throw crearErrorRepositorio('No se pudieron cargar todos los productos', error);
  }
}

export async function actualizarProducto(producto: ActualizarProductoInput): Promise<void> {
  try {
    const { productoId: id, nombre, precioVentaActual, costoCompraActual } = producto;
    
    if (!id) throw new Error('El ID es obligatorio para actualizar');
    if (!nombre?.trim()) throw new Error('El nombre es obligatorio');
    if (precioVentaActual < 0) throw new Error('El precio no puede ser negativo');
    if (costoCompraActual < 0) throw new Error('El costo no puede ser negativo');

    await apiClient.put(`/productos/${id}`, producto);
  } catch (error) {
    throw crearErrorRepositorio('No se pudo actualizar el producto', error);
  }
}

export async function eliminarProducto(id: number): Promise<void> {
  try {
    await apiClient.put(`/productos/${id}`, { activo: false });
  } catch (error) {
    throw crearErrorRepositorio('No se pudo deshabilitar el producto', error);
  }
}
