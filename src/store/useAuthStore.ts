import { create } from 'zustand';

export type Rol = 'admin' | 'empleado';

interface Usuario {
  id: number;
  username: string;
  rol: Rol;
}

interface AuthState {
  user: Usuario | null;
  login: (u: Usuario) => void;
  logout: () => void;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  login: (u) => set({ user: u }),
  logout: () => set({ user: null }),
  isAdmin: () => get().user?.rol === 'admin',
}));
