import { apiClient } from '../../services/apiClient';
import { crearErrorRepositorio } from './errores';
import type { Producto } from '../models';

export async function listarProductosActivos(): Promise<Producto[]> {
  try {
    return await apiClient.get('/productos');
  } catch (error) {
    throw crearErrorRepositorio('No se pudieron cargar los productos', error);
  }
}

export async function obtenerProductoPorId(id: number): Promise<Producto> {
  try {
    const data = await apiClient.get('/productos');
    const p = data.find((x: Producto) => x.id === id);
    if (!p) throw new Error('No encontrado');
    return p;
  } catch (error) {
    throw crearErrorRepositorio('No se pudo encontrar el producto', error);
  }
}
