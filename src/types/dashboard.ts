import type { InventarioProducto } from './negocio';
import type { ResumenFiscal } from './fiscales';

export type PeriodoDashboard = 'hoy' | 'semana' | 'mes' | 'anio';

export interface RangoFechas {
  desde: string;
  hasta: string;
}

export interface VentaDia {
  fecha: string;
  etiqueta: string;
  total: number;
}

export interface DashboardData {
  resumen: ResumenFiscal;
  ventasUltimosDias: VentaDia[];
  inventario: InventarioProducto[];
}
