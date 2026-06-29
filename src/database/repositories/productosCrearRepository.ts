import { apiClient } from '../../services/apiClient';
import { crearErrorRepositorio } from './errores';
import type { CrearProductoInput } from '../../types/negocio';

export async function guardarProducto(producto: CrearProductoInput): Promise<number> {
  try {
    const { nombre, unidadMedida, cantidadPorPresentacion, precioVentaActual, costoCompraActual } = producto;
    
    if (!nombre?.trim()) throw new Error('El nombre es obligatorio');
    if (!unidadMedida) throw new Error('La unidad de medida es obligatoria');
    if (cantidadPorPresentacion <= 0) throw new Error('La cantidad debe ser mayor a cero');
    if (precioVentaActual < 0) throw new Error('El precio no puede ser negativo');
    if (costoCompraActual < 0) throw new Error('El costo no puede ser negativo');

    const result = await apiClient.post('/productos', producto);
    return result.id;
  } catch (error) {
    throw crearErrorRepositorio('No se pudo crear el producto', error);
  }
}

export async function crearProductoRapido(nombre: string): Promise<number> {
  try {
    const result = await apiClient.post('/productos', { 
      nombre, 
      unidadMedida: 'unidad',
      cantidadPorPresentacion: 1,
      precioVentaActual: 0,
      costoCompraActual: 0,
      tasaIva: 0.13,
      umbralStockBajo: 10,
      categoriaId: 1
    });
    return result.id;
  } catch (error) {
    throw crearErrorRepositorio('No se pudo crear el producto', error);
  }
}
