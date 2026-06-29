import { create } from 'zustand';

import { obtenerReporte } from '../database/repositories/reportesRepository';
import type { FiltroReporte, ReportePeriodo } from '../types/reportes';
import { textoError } from './negocioStoreTipos';

interface ReportesState {
  reporte: ReportePeriodo | null;
  cargando: boolean;
  error: string | null;
  cargarReporte: (filtro: FiltroReporte) => Promise<void>;
}

export const useReportesStore = create<ReportesState>((set) => ({
  reporte: null,
  cargando: false,
  error: null,
  cargarReporte: async (filtro) => {
    set({ cargando: true, error: null });

    try {
      const reporte = await obtenerReporte(filtro);
      set({ reporte, cargando: false });
    } catch (error) {
      set({ cargando: false, error: textoError(error) });
    }
  },
}));
