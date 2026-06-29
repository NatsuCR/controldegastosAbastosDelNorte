import type { RangoFechas } from './dashboard';
import type { ResumenFiscal } from './fiscales';

export type TipoFiltroReporte = 'dia' | 'semana' | 'mes' | 'anio' | 'rango';

export interface FiltroReporte {
  tipo: TipoFiltroReporte;
  fechaBase: string;
  desde: string;
  hasta: string;
}

export interface ProductoReporte {
  productoId: number;
  nombre: string;
  sku: string | null;
  marca: string | null;
  categoriaNombre: string;
  unidadMedida: string;
  cantidadVendida: number;
  montoVendido: number;
  subtotalVendido: number;
}

export interface ReporteCompraHistorial {
  id: number;
  fecha: string;
  proveedorNombre: string;
  productoNombre: string;
  cantidad: number;
  total: number;
  imagenFactura: string | null;
}

export interface ReporteGastoHistorial {
  id: number;
  fecha: string;
  categoria: string;
  descripcion: string;
  monto: number;
  imagenFactura: string | null;
}

export interface ReportePeriodo {
  filtro: FiltroReporte;
  rango: RangoFechas;
  resumen: ResumenFiscal;
  productos: ProductoReporte[];
  historialCompras: ReporteCompraHistorial[];
  historialGastos: ReporteGastoHistorial[];
}
