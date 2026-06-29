import { create } from 'zustand';

import { registrarGasto } from '../database/repositories/gastosRepository';
import type { RegistrarGastoInput } from '../types/gastos';
import type { MensajeUsuario } from '../types/negocio';
import { textoError } from './negocioStoreTipos';

interface GastosState {
  cargando: boolean;
  mensaje: MensajeUsuario | null;
  limpiarMensaje: () => void;
  registrarGasto: (input: RegistrarGastoInput) => Promise<boolean>;
}

export const useGastosStore = create<GastosState>((set) => ({
  cargando: false,
  mensaje: null,
  limpiarMensaje: () => set({ mensaje: null }),
  registrarGasto: async (input) => {
    set({ cargando: true, mensaje: null });

    try {
      await registrarGasto(input);
      set({ cargando: false, mensaje: { tipo: 'exito', texto: 'Gasto registrado' } });
      return true;
    } catch (error) {
      set({ cargando: false, mensaje: { tipo: 'error', texto: textoError(error) } });
      return false;
    }
  },
}));
