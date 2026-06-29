import type { Proveedor } from '../models';
import { obtenerBaseDatos } from '../db';
import { crearErrorRepositorio } from './errores';

interface ProveedorRow {
  id: number;
  nombre: string;
  telefono: string | null;
  nota: string | null;
}

function mapProveedor(row: ProveedorRow): Proveedor {
  return {
    id: row.id,
    nombre: row.nombre,
    telefono: row.telefono,
    nota: row.nota,
  };
}

export async function listarProveedores(): Promise<Proveedor[]> {
  try {
    const db = await obtenerBaseDatos();
    const rows = await db.getAllAsync<ProveedorRow>(
      `SELECT * FROM proveedores ORDER BY nombre ASC`,
    );
    return rows.map(mapProveedor);
  } catch (error) {
    throw crearErrorRepositorio('No se pudieron cargar los proveedores', error);
  }
}

export async function crearProveedorRapido(nombre: string): Promise<number> {
  try {
    const nombreLimpio = nombre.trim();

    if (!nombreLimpio) {
      throw new Error('el nombre del proveedor es obligatorio');
    }

    const db = await obtenerBaseDatos();
    const resultado = await db.runAsync(
      `INSERT INTO proveedores (nombre, telefono, nota) VALUES (?, NULL, NULL)`,
      nombreLimpio,
    );
    return resultado.lastInsertRowId;
  } catch (error) {
    throw crearErrorRepositorio('No se pudo crear el proveedor', error);
  }
}

export async function actualizarProveedor(
  proveedorId: number,
  nombre: string,
  telefono?: string,
): Promise<void> {
  try {
    const nombreLimpio = nombre.trim();

    if (!nombreLimpio) {
      throw new Error('el nombre del proveedor es obligatorio');
    }

    const db = await obtenerBaseDatos();
    await db.runAsync(
      `UPDATE proveedores SET nombre = ?, telefono = ? WHERE id = ?`,
      nombreLimpio,
      telefono?.trim() || null,
      proveedorId,
    );
  } catch (error) {
    throw crearErrorRepositorio('No se pudo actualizar el proveedor', error);
  }
}

export async function eliminarProveedor(proveedorId: number): Promise<void> {
  try {
    const db = await obtenerBaseDatos();
    await db.withExclusiveTransactionAsync(async (txn) => {
      // Al eliminar un proveedor, sus compras y el inventario asociado a esas compras deben eliminarse
      await txn.runAsync(
        `DELETE FROM inventario WHERE compra_id IN (SELECT id FROM compras WHERE proveedor_id = ?)`,
        proveedorId
      );
      await txn.runAsync(`DELETE FROM compras WHERE proveedor_id = ?`, proveedorId);
      await txn.runAsync(`DELETE FROM proveedores WHERE id = ?`, proveedorId);
    });
  } catch (error) {
    throw crearErrorRepositorio('No se pudo eliminar el proveedor', error);
  }
}
