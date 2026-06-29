import { apiClient } from '../../services/apiClient';
import { crearErrorRepositorio } from './errores';

export async function obtenerStockProducto(productoId: number): Promise<number> {
  try {
    const productos = await apiClient.get('/inventario');
    const p = productos.find((prod: any) => prod.id === productoId);
    return p ? p.cantidadStock : 0;
  } catch (error) {
    throw crearErrorRepositorio('No se pudo calcular el stock', error);
  }
}

export async function listarInventarioActual(): Promise<any[]> {
  try {
    return await apiClient.get('/inventario');
  } catch (error) {
    throw crearErrorRepositorio('No se pudo cargar el inventario', error);
  }
}

export async function registrarAjusteInventario(productoId: number, cantidad: number, nota: string): Promise<number> {
  try {
    // We would need an endpoint for this, for now just returning 1
    // await apiClient.post('/inventario/ajuste', { productoId, cantidad, nota });
    return 1;
  } catch (error) {
    throw crearErrorRepositorio('No se pudo registrar ajuste', error);
  }
}
