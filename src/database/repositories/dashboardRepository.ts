import type { DashboardData, PeriodoDashboard } from '../../types/dashboard';
import { apiClient } from '../../services/apiClient';
import { diasUltimaSemana } from '../../utils/periodos';
import { crearErrorRepositorio } from './errores';

export async function obtenerDashboard(periodo: PeriodoDashboard): Promise<DashboardData> {
  try {
    const data = await apiClient.get('/dashboard') as DashboardData;
    const ventasPorFecha = new Map(
      (data.ventasUltimosDias ?? []).map((dia) => [dia.fecha.slice(0, 10), Number(dia.total) || 0])
    );

    return {
      ...data,
      inventario: Array.isArray(data.inventario) ? data.inventario : [],
      ventasUltimosDias: diasUltimaSemana().map((dia) => ({
        ...dia,
        total: ventasPorFecha.get(dia.fecha) ?? 0,
      })),
    };
  } catch (error) {
    throw crearErrorRepositorio('No se pudo cargar el dashboard', error);
  }
}
