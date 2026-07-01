import { apiClient } from '../../services/apiClient';
import { crearErrorRepositorio } from './errores';
import type { RegistrarGastoInput } from '../../types/gastos';

export async function registrarGasto(input: RegistrarGastoInput): Promise<number> {
  try {
    const formData = new FormData();
    formData.append('fecha', input.fecha);
    formData.append('categoria', input.categoria);
    formData.append('descripcion', input.descripcion);
    formData.append('monto', String(input.monto));
    if (input.nota) formData.append('nota', input.nota);
    
    if (input.imagenFactura) {
      const fileName = input.imagenFactura.split('/').pop() || 'factura.jpg';
      formData.append('imagenFactura', {
        uri: input.imagenFactura,
        name: fileName,
        type: 'image/jpeg',
      } as any);
    }

    const result = await apiClient.postForm('/gastos', formData);
    return result.id;
  } catch (error) {
    throw crearErrorRepositorio('No se pudo registrar el gasto', error);
  }
}
