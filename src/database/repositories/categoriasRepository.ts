import type { Categoria } from '../models';
import { obtenerBaseDatos } from '../db';
import { crearErrorRepositorio } from './errores';

export async function listarCategorias(): Promise<Categoria[]> {
  try {
    const db = await obtenerBaseDatos();
    return await db.getAllAsync<Categoria>(`SELECT * FROM categorias ORDER BY nombre ASC`);
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

    const db = await obtenerBaseDatos();
    const existente = await db.getFirstAsync<{ id: number }>(
      `SELECT id FROM categorias WHERE lower(nombre) = lower(?)`,
      nombreLimpio,
    );

    if (existente) {
      return existente.id;
    }

    const resultado = await db.runAsync(
      `INSERT INTO categorias (nombre) VALUES (?)`,
      nombreLimpio,
    );
    return resultado.lastInsertRowId;
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

    const db = await obtenerBaseDatos();
    await db.runAsync(`UPDATE categorias SET nombre = ? WHERE id = ?`, nombreLimpio, categoriaId);
  } catch (error) {
    throw crearErrorRepositorio('No se pudo actualizar la categoria', error);
  }
}
