export interface Categoria {
  id: number;
  nombre: string;
}

export interface Producto {
  id: number;
  categoriaId: number;
  nombre: string;
  sku: string | null;
  marca: string | null;
  unidadMedida: string;
  cantidadPorPresentacion: number;
  precioVentaActual: number;
  costoCompraActual: number;
  tasaIva: number;
  umbralStockBajo: number;
  activo: boolean;
}

export interface Proveedor {
  id: number;
  nombre: string;
  telefono: string | null;
  nota: string | null;
}
