import { create } from 'zustand';

import {
  crearCategoriaRapida,
  listarCategorias,
  renombrarCategoria,
} from '../database/repositories/categoriasRepository';
import {
  guardarConfiguracionNegocio,
  obtenerConfiguracionNegocio,
} from '../database/repositories/configuracionRepository';
import { actualizarProducto, listarProductosTodos } from '../database/repositories/productosAdminRepository';
import { crearProductoRapido } from '../database/repositories/productosCrearRepository';
import {
  actualizarProveedor,
  crearProveedorRapido,
  listarProveedores,
  eliminarProveedor as deleteProveedorRepo,
} from '../database/repositories/proveedoresRepository';
import type { Categoria, Producto, Proveedor } from '../database/models';
import type {
  ActualizarProductoInput,
  ConfiguracionNegocio,
  CrearProductoInput,
  MensajeUsuario,
} from '../types/negocio';
import { configuracionInicial, textoError } from './negocioStoreTipos';

interface ConfiguracionState {
  categorias: Categoria[];
  productos: Producto[];
  proveedores: Proveedor[];
  configuracion: ConfiguracionNegocio;
  cargando: boolean;
  mensaje: MensajeUsuario | null;
  cargar: () => Promise<void>;
  guardarConfiguracion: (input: ConfiguracionNegocio) => Promise<boolean>;
  crearCategoria: (nombre: string) => Promise<number | null>;
  renombrarCategoria: (id: number, nombre: string) => Promise<boolean>;
  crearProducto: (input: CrearProductoInput) => Promise<boolean>;
  actualizarProducto: (input: ActualizarProductoInput) => Promise<boolean>;
  crearProveedor: (nombre: string) => Promise<number | null>;
  actualizarProveedor: (id: number, nombre: string, telefono?: string) => Promise<boolean>;
  eliminarProveedor: (id: number) => Promise<boolean>;
}

export const useConfiguracionStore = create<ConfiguracionState>((set, get) => ({
  categorias: [],
  productos: [],
  proveedores: [],
  configuracion: configuracionInicial,
  cargando: false,
  mensaje: null,
  cargar: async () => {
    set({ cargando: true });
    try {
      const [categorias, productos, proveedores, configuracion] = await Promise.all([
        listarCategorias(), listarProductosTodos(), listarProveedores(), obtenerConfiguracionNegocio(),
      ]);
      set({ categorias, productos, proveedores, configuracion, cargando: false });
    } catch (error) {
      set({ cargando: false, mensaje: { tipo: 'error', texto: textoError(error) } });
    }
  },
  guardarConfiguracion: async (input) => ejecutar(set, get, 'Configuracion guardada', () => guardarConfiguracionNegocio(input)),
  crearCategoria: async (nombre) => {
    const id = await ejecutarConResultado(set, get, 'Categoria creada', () => crearCategoriaRapida(nombre));
    return id;
  },
  renombrarCategoria: async (id, nombre) => ejecutar(set, get, 'Categoria actualizada', () => renombrarCategoria(id, nombre)),
  crearProducto: async (input) => ejecutar(set, get, 'Producto creado', () => crearProductoRapido(input)),
  actualizarProducto: async (input) => ejecutar(set, get, 'Producto actualizado', () => actualizarProducto(input)),
  crearProveedor: async (nombre) => ejecutarConResultado(set, get, 'Proveedor creado', () => crearProveedorRapido(nombre)),
  actualizarProveedor: async (id, nombre, telefono) => ejecutar(
    set, get, 'Proveedor actualizado', () => actualizarProveedor(id, nombre, telefono),
  ),
  eliminarProveedor: async (id) => ejecutar(set, get, 'Proveedor eliminado', () => deleteProveedorRepo(id)),
}));

async function ejecutar(
  set: (value: Partial<ConfiguracionState>) => void,
  get: () => ConfiguracionState,
  texto: string,
  accion: () => Promise<unknown>,
) {
  const resultado = await ejecutarConResultado(set, get, texto, accion);
  return resultado !== null;
}

async function ejecutarConResultado<T>(
  set: (value: Partial<ConfiguracionState>) => void,
  get: () => ConfiguracionState,
  texto: string,
  accion: () => Promise<T>,
) {
  set({ cargando: true, mensaje: null });
  try {
    const resultado = await accion();
    await get().cargar();
    set({ mensaje: { tipo: 'exito', texto } });
    return resultado;
  } catch (error) {
    set({ cargando: false, mensaje: { tipo: 'error', texto: textoError(error) } });
    return null;
  }
}
