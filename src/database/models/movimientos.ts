export type TipoPrecio = 'venta' | 'compra';
export type TipoMovimientoInventario = 'entrada' | 'salida';
export type MetodoPago = 'Efectivo' | 'SINPE Móvil';

export interface HistorialPrecio {
  id: number;
  productoId: number;
  tipo: TipoPrecio;
  valor: number;
  vigenteDesde: string;
  vigenteHasta: string | null;
}

export interface Compra {
  id: number;
  fecha: string;
  proveedorId: number;
  productoId: number;
  cantidad: number;
  costoUnitario: number;
  subtotal: number;
  ivaMonto: number;
  total: number;
  metodoPago: MetodoPago;
  clienteTelefono: string | null;
  nota: string | null;
}

export interface Venta {
  id: number;
  fecha: string;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  ivaMonto: number;
  total: number;
  metodoPago: MetodoPago;
  nota: string | null;
}

export interface MovimientoInventario {
  id: number;
  fecha: string;
  tipoMovimiento: TipoMovimientoInventario;
  productoId: number;
  cantidad: number;
  compraId: number | null;
  ventaId: number | null;
  nota: string | null;
}

export interface Gasto {
  id: number;
  fecha: string;
  categoria: string;
  descripcion: string;
  monto: number;
  nota: string | null;
}

export interface Configuracion {
  clave: string;
  valor: string;
}
