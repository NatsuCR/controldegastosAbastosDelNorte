import type { FiltroReporte, ReportePeriodo } from '../../types/reportes';
import { apiClient } from '../../services/apiClient';
import { crearErrorRepositorio } from './errores';

export async function obtenerReporte(filtro: FiltroReporte): Promise<ReportePeriodo> {
  try {
    return await apiClient.get(`/reportes?desde=${filtro.desde}&hasta=${filtro.hasta}`);
  } catch (error) {
    throw crearErrorRepositorio('No se pudo generar el reporte', error);
  }
}
