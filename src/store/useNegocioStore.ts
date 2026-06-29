import { create } from 'zustand';

import {
  crearCategoriaRapida,
  listarCategorias,
} from '../database/repositories/categoriasRepository';
import { registrarCompra as guardarCompra } from '../database/repositories/comprasRepository';
import { obtenerConfiguracionNegocio } from '../database/repositories/configuracionRepository';
import { listarInventarioActual, registrarAjusteInventario as guardarAjusteInventario } from '../database/repositories/inventarioRepository';
import { crearProductoRapido } from '../database/repositories/productosCrearRepository';
import { listarProductosActivos } from '../database/repositories/productosRepository';
import {
  crearProveedorRapido,
  listarProveedores,
} from '../database/repositories/proveedoresRepository';
import { registrarVenta as guardarVenta } from '../database/repositories/ventasRepository';
import { registrarVentaCarrito as guardarVentaCarrito } from '../database/repositories/ventasCarritoRepository';
import { actualizarProducto as updateProducto, eliminarProducto as deleteProducto } from '../database/repositories/productosAdminRepository';
import { eliminarProveedor as deleteProveedor } from '../database/repositories/proveedoresRepository';
import { configuracionInicial, textoError, type NegocioState } from './negocioStoreTipos';

export const useNegocioStore = create<NegocioState>((set, get) => ({
  categorias: [],
  productos: [],
  proveedores: [],
  inventario: [],
  configuracion: configuracionInicial,
  cargando: false,
  mensaje: null,
  limpiarMensaje: () => set({ mensaje: null }),
  cargarDatos: async () => {
    set({ cargando: true });

    try {
      const [categorias, productos, proveedores, inventario, configuracion] = await Promise.all([
        listarCategorias(),
        listarProductosActivos(),
        listarProveedores(),
        listarInventarioActual(),
        obtenerConfiguracionNegocio(),
      ]);
      set({ categorias, productos, proveedores, inventario, configuracion, cargando: false });
    } catch (error) {
      set({ cargando: false, mensaje: { tipo: 'error', texto: textoError(error) } });
    }
  },
  crearCategoria: async (nombre) => {
    set({ cargando: true, mensaje: null });

    try {
      const categoriaId = await crearCategoriaRapida(nombre);
      await get().cargarDatos();
      set({ mensaje: { tipo: 'exito', texto: 'Categoria lista para usar' } });
      return categoriaId;
    } catch (error) {
      set({ cargando: false, mensaje: { tipo: 'error', texto: textoError(error) } });
      return null;
    }
  },
  crearProducto: async (input) => {
    set({ cargando: true, mensaje: null });

    try {
      const productoId = await crearProductoRapido(input);
      await get().cargarDatos();
      set({ mensaje: { tipo: 'exito', texto: 'Producto creado' } });
      return productoId;
    } catch (error) {
      set({ cargando: false, mensaje: { tipo: 'error', texto: textoError(error) } });
      return null;
    }
  },
  crearProveedor: async (nombre) => {
    set({ cargando: true, mensaje: null });

    try {
      const proveedorId = await crearProveedorRapido(nombre);
      await get().cargarDatos();
      set({ mensaje: { tipo: 'exito', texto: 'Proveedor creado' } });
      return proveedorId;
    } catch (error) {
      set({ cargando: false, mensaje: { tipo: 'error', texto: textoError(error) } });
      return null;
    }
  },
  registrarCompra: async (input) => {
    set({ cargando: true, mensaje: null });

    try {
      await guardarCompra(input);
      await get().cargarDatos();
      set({ mensaje: { tipo: 'exito', texto: 'Compra registrada e inventario actualizado' } });
      return true;
    } catch (error) {
      set({ cargando: false, mensaje: { tipo: 'error', texto: textoError(error) } });
      return false;
    }
  },
  registrarVenta: async (input) => {
    set({ cargando: true, mensaje: null });

    try {
      await guardarVenta(input);
      await get().cargarDatos();
      set({ mensaje: { tipo: 'exito', texto: 'Venta registrada e inventario descontado' } });
      return true;
    } catch (error) {
      set({ cargando: false, mensaje: { tipo: 'error', texto: textoError(error) } });
      return false;
    }
  },
  registrarVentaCarrito: async (input) => {
    set({ cargando: true, mensaje: null });

    try {
      await guardarVentaCarrito(input);
      await get().cargarDatos();
      set({ mensaje: { tipo: 'exito', texto: 'Venta de carrito registrada' } });
      return true;
    } catch (error) {
      set({ cargando: false, mensaje: { tipo: 'error', texto: textoError(error) } });
      return false;
    }
  },
  registrarAjusteInventario: async (productoId, cantidad, nota) => {
    set({ cargando: true, mensaje: null });

    try {
      await guardarAjusteInventario(productoId, cantidad, nota);
      await get().cargarDatos();
      set({ mensaje: { tipo: 'exito', texto: 'Inventario ajustado correctamente' } });
      return true;
    } catch (error) {
      set({ cargando: false, mensaje: { tipo: 'error', texto: textoError(error) } });
      return false;
    }
  },
  eliminarProducto: async (productoId) => {
    set({ cargando: true, mensaje: null });
    try {
      await deleteProducto(productoId);
      await get().cargarDatos();
      set({ mensaje: { tipo: 'exito', texto: 'Producto eliminado correctamente' } });
      return true;
    } catch (error) {
      set({ cargando: false, mensaje: { tipo: 'error', texto: textoError(error) } });
      return false;
    }
  },
  actualizarProducto: async (input) => {
    set({ cargando: true, mensaje: null });
    try {
      await updateProducto(input);
      await get().cargarDatos();
      set({ mensaje: { tipo: 'exito', texto: 'Producto actualizado' } });
      return true;
    } catch (error) {
      set({ cargando: false, mensaje: { tipo: 'error', texto: textoError(error) } });
      return false;
    }
  },
  eliminarProveedor: async (proveedorId) => {
    set({ cargando: true, mensaje: null });
    try {
      await deleteProveedor(proveedorId);
      await get().cargarDatos();
      set({ mensaje: { tipo: 'exito', texto: 'Proveedor eliminado correctamente' } });
      return true;
    } catch (error) {
      set({ cargando: false, mensaje: { tipo: 'error', texto: textoError(error) } });
      return false;
    }
  },
}));
