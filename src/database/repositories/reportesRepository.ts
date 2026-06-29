import type { FiltroReporte, ReportePeriodo } from '../../types/reportes';
import { apiClient } from '../../services/apiClient';
import { obtenerRangoReporte } from '../../utils/reportesPeriodo';
import { crearErrorRepositorio } from './errores';

const RESUMEN_CERO = {
  ingresoBruto: 0,
  ivaCobrado: 0,
  ivaCobrado13: 0,
  ivaCobrado1: 0,
  ivaPagadoProveedores: 0,
  ivaProveedores13: 0,
  ivaProveedores1: 0,
  ivaNetoPagar: 0,
  totalComprasSinIva: 0,
  totalGastosOperativos: 0,
  gananciaNetaReal: 0,
};

export async function obtenerReporte(filtro: FiltroReporte): Promise<ReportePeriodo> {
  try {
    const rango = obtenerRangoReporte(filtro);
    const desde = encodeURIComponent(rango.desde.slice(0, 10));
    const hasta = encodeURIComponent(rango.hasta.slice(0, 10));
    const data = await apiClient.get(`/reportes?desde=${desde}&hasta=${hasta}`) as ReportePeriodo;

    return {
      filtro,
      rango,
      resumen: { ...RESUMEN_CERO, ...(data.resumen ?? {}) },
      productos: Array.isArray(data.productos) ? data.productos : [],
      historialCompras: Array.isArray(data.historialCompras) ? data.historialCompras : [],
      historialGastos: Array.isArray(data.historialGastos) ? data.historialGastos : [],
    };
  } catch (error) {
    throw crearErrorRepositorio('No se pudo generar el reporte', error);
  }
}
