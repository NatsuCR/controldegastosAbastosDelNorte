import { create } from 'zustand';

import { obtenerDashboard } from '../database/repositories/dashboardRepository';
import type { DashboardData, PeriodoDashboard } from '../types/dashboard';
import { textoError } from './negocioStoreTipos';

interface DashboardState {
  periodo: PeriodoDashboard;
  data: DashboardData | null;
  cargando: boolean;
  error: string | null;
  cargarDashboard: (periodo?: PeriodoDashboard) => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  periodo: 'hoy',
  data: null,
  cargando: false,
  error: null,
  cargarDashboard: async (periodo = get().periodo) => {
    set({ cargando: true, error: null, periodo });

    try {
      const data = await obtenerDashboard(periodo);
      set({ data, cargando: false });
    } catch (error) {
      set({ cargando: false, error: textoError(error) });
    }
  },
}));
