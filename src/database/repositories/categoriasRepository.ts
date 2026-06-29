import type { Categoria } from '../models';
import { apiClient } from '../../services/apiClient';
import { crearErrorRepositorio } from './errores';

export async function listarCategorias(): Promise<Categoria[]> {
  try {
    return await apiClient.get('/categorias');
  } catch (error) {
    throw crearErrorRepositorio('No se pudieron cargar las categorias', error);
  }
}

export async function crearCategoriaRapida(nombre: string): Promise<number> {
  try {
    const nombreLimpio = nombre.trim();
    if (!nombreLimpio) {
      throw new Error('el nombre de la categoria es obligatorio');
    }

    const result = await apiClient.post('/categorias', { nombre: nombreLimpio });
    return result.id;
  } catch (error) {
    throw crearErrorRepositorio('No se pudo crear la categoria', error);
  }
}

export async function renombrarCategoria(categoriaId: number, nombre: string): Promise<void> {
  try {
    const nombreLimpio = nombre.trim();
    if (!nombreLimpio) {
      throw new Error('el nombre de la categoria es obligatorio');
    }

    await apiClient.put(`/categorias/${categoriaId}`, { nombre: nombreLimpio });
  } catch (error) {
    throw crearErrorRepositorio('No se pudo actualizar la categoria', error);
  }
}
