import { apiClient } from '../../services/apiClient';
import { crearErrorRepositorio } from './errores';
import type { ConfiguracionNegocio } from '../../types/negocio';

export async function obtenerConfiguracionNegocio(): Promise<ConfiguracionNegocio> {
  try {
    const config = await apiClient.get('/configuracion');
    return {
      tasaIva: config.tasaIva ?? 0.13,
      precioVentaIncluyeIva: config.precioVentaIncluyeIva ?? true,
      costoProveedorIncluyeIva: config.costoProveedorIncluyeIva ?? false,
    };
  } catch (error) {
    throw crearErrorRepositorio('No se pudo cargar la configuración', error);
  }
}

export async function guardarConfiguracionNegocio(config: ConfiguracionNegocio): Promise<void> {
  try {
    await apiClient.put('/configuracion', config);
  } catch (error) {
    throw crearErrorRepositorio('No se pudo guardar la configuración', error);
  }
}
