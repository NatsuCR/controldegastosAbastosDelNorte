import type { Categoria, Producto, Proveedor } from '../database/models';
import type {
  ConfiguracionNegocio,
  CrearProductoInput,
  InventarioProducto,
  MensajeUsuario,
  RegistrarCompraInput,
  RegistrarVentaCarritoInput,
  RegistrarVentaInput,
  ActualizarProductoInput,
} from '../types/negocio';

export interface NegocioState {
  categorias: Categoria[];
  productos: Producto[];
  proveedores: Proveedor[];
  inventario: InventarioProducto[];
  configuracion: ConfiguracionNegocio;
  cargando: boolean;
  mensaje: MensajeUsuario | null;
  cargarDatos: () => Promise<void>;
  limpiarMensaje: () => void;
  crearCategoria: (nombre: string) => Promise<number | null>;
  crearProducto: (input: CrearProductoInput) => Promise<number | null>;
  crearProveedor: (nombre: string) => Promise<number | null>;
  registrarCompra: (input: RegistrarCompraInput) => Promise<boolean>;
  registrarVenta: (input: RegistrarVentaInput) => Promise<boolean>;
  registrarVentaCarrito: (input: RegistrarVentaCarritoInput) => Promise<boolean>;
  registrarAjusteInventario: (productoId: number, cantidad: number, nota: string) => Promise<boolean>;
  eliminarProducto: (productoId: number) => Promise<boolean>;
  actualizarProducto: (input: ActualizarProductoInput) => Promise<boolean>;
  eliminarProveedor: (proveedorId: number) => Promise<boolean>;
}

export const configuracionInicial: ConfiguracionNegocio = {
  tasaIva: 0.13,
  precioVentaIncluyeIva: true,
  costoProveedorIncluyeIva: true,
};

export function textoError(error: unknown): string {
  return error instanceof Error ? error.message : 'Ocurrio un error inesperado';
}
