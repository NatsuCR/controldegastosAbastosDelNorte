import type { Categoria, MetodoPago, Producto, Proveedor } from '../database/models';

export interface ConfiguracionNegocio {
  tasaIva: number;
  precioVentaIncluyeIva: boolean;
  costoProveedorIncluyeIva: boolean;
}

export interface InventarioProducto {
  productoId: number;
  nombre: string;
  sku: string | null;
  marca: string | null;
  categoriaNombre: string;
  stock: number;
  unidadMedida: string;
  umbralStockBajo: number;
  precioVentaActual: number;
  costoCompraActual: number;
  tasaIva: number;
}

export interface DatosNegocio {
  categorias: Categoria[];
  productos: Producto[];
  proveedores: Proveedor[];
  inventario: InventarioProducto[];
  configuracion: ConfiguracionNegocio;
}

export interface RegistrarVentaInput {
  productoId: number;
  cantidad: number;
  metodoPago: MetodoPago;
  clienteTelefono?: string;
  nota?: string;
}

export interface RegistrarVentaLineaInput {
  productoId: number;
  cantidad: number;
}

export interface RegistrarVentaCarritoInput {
  lineas: RegistrarVentaLineaInput[];
  metodoPago: MetodoPago;
  clienteTelefono?: string;
  nota?: string;
}

export interface RegistrarCompraInput {
  proveedorId: number;
  productoId: number;
  cantidad: number;
  costoUnitario: number;
  metodoPago: MetodoPago;
  actualizarCostoVigente: boolean;
  nota?: string;
  imagenFactura?: string;
}

export interface CrearProductoInput {
  categoriaId: number;
  nombre: string;
  sku?: string;
  marca?: string;
  unidadMedida: string;
  cantidadPorPresentacion: number;
  precioVentaActual: number;
  costoCompraActual: number;
  tasaIva: number;
  umbralStockBajo: number;
}

export interface ActualizarProductoInput {
  productoId: number;
  nombre: string;
  sku?: string;
  marca?: string;
  precioVentaActual: number;
  costoCompraActual: number;
  tasaIva: number;
  umbralStockBajo: number;
  activo: boolean;
}

export interface MensajeUsuario {
  tipo: 'exito' | 'error';
  texto: string;
}
