import { apiClient } from '../../services/apiClient';
import { crearErrorRepositorio } from './errores';

export async function resetearBaseDatosServidor(): Promise<void> {
  try {
    await apiClient.post('/configuracion/reset', {});
  } catch (error) {
    throw crearErrorRepositorio('No se pudo borrar la base de datos', error);
  }
}
