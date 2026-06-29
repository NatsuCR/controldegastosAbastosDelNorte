import type { Proveedor } from '../models';
import { apiClient } from '../../services/apiClient';
import { crearErrorRepositorio } from './errores';

export async function listarProveedoresActivos(): Promise<Proveedor[]> {
  try {
    return await apiClient.get('/proveedores');
  } catch (error) {
    throw crearErrorRepositorio('No se pudieron cargar los proveedores', error);
  }
}

export async function listarProveedores(): Promise<Proveedor[]> {
  try {
    return await apiClient.get('/proveedores');
  } catch (error) {
    throw crearErrorRepositorio('No se pudieron cargar los proveedores', error);
  }
}

export async function crearProveedorRapido(nombre: string): Promise<number> {
  try {
    const result = await apiClient.post('/proveedores', { nombre, diasVisita: [] });
    return result.id;
  } catch (error) {
    throw crearErrorRepositorio('No se pudo guardar el proveedor', error);
  }
}

export async function actualizarProveedor(id: number, nombre: string, telefono?: string): Promise<void> {
  try {
    await apiClient.put(`/proveedores/${id}`, { nombre, telefono, diasVisita: [] });
  } catch (error) {
    throw crearErrorRepositorio('No se pudo guardar el proveedor', error);
  }
}

export async function guardarProveedor(
  proveedor: Omit<Proveedor, 'id' | 'activo'> & { id?: number },
): Promise<number> {
  try {
    const { nombre, telefono } = proveedor;
    const diasVisita = (proveedor as any).diasVisita || [];
    if (!nombre.trim()) {
      throw new Error('El nombre del proveedor es obligatorio');
    }

    if (proveedor.id) {
      await apiClient.put(`/proveedores/${proveedor.id}`, { nombre, telefono, diasVisita });
      return proveedor.id;
    } else {
      const result = await apiClient.post('/proveedores', { nombre, telefono, diasVisita });
      return result.id;
    }
  } catch (error) {
    throw crearErrorRepositorio('No se pudo guardar el proveedor', error);
  }
}

export async function eliminarProveedor(id: number): Promise<void> {
  try {
    await apiClient.delete(`/proveedores/${id}`);
  } catch (error) {
    throw crearErrorRepositorio('No se pudo eliminar el proveedor', error);
  }
}

export async function inhabilitarProveedor(id: number): Promise<void> {
  try {
    await apiClient.delete(`/proveedores/${id}`);
  } catch (error) {
    throw crearErrorRepositorio('No se pudo eliminar el proveedor', error);
  }
}
