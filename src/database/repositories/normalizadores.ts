import type { InventarioProducto } from '../../types/negocio';

const num = (value: unknown) => Number(value ?? 0) || 0;

export function normalizarInventario(item: any): InventarioProducto {
  return {
    productoId: Number(item.productoId ?? item.id ?? 0),
    nombre: String(item.nombre ?? 'Producto sin nombre'),
    sku: item.sku ?? null,
    marca: item.marca ?? null,
    categoriaNombre: String(item.categoriaNombre ?? 'Sin categoria'),
    stock: num(item.stock ?? item.cantidadStock ?? item.stockActual),
    unidadMedida: String(item.unidadMedida ?? 'unidad'),
    umbralStockBajo: num(item.umbralStockBajo ?? item.umbralBajo),
    precioVentaActual: num(item.precioVentaActual ?? item.precio),
    costoCompraActual: num(item.costoCompraActual ?? item.costo),
    tasaIva: num(item.tasaIva),
  };
}
