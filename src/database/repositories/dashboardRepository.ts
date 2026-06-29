import type { DashboardData, PeriodoDashboard } from '../../types/dashboard';
import { apiClient } from '../../services/apiClient';
import { crearErrorRepositorio } from './errores';

export async function obtenerDashboard(periodo: PeriodoDashboard): Promise<DashboardData> {
  try {
    return await apiClient.get('/dashboard');
  } catch (error) {
    throw crearErrorRepositorio('No se pudo cargar el dashboard', error);
  }
}
