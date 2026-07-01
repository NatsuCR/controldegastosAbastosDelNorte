import { apiClient } from '../../services/apiClient';
import { subirArchivoMultipart } from '../../services/fileUpload';
import { crearErrorRepositorio } from './errores';
import type { RegistrarGastoInput } from '../../types/gastos';

export async function registrarGasto(input: RegistrarGastoInput): Promise<number> {
  try {
    if (input.imagenFactura) {
      const { imagenFactura, ...campos } = input;
      const result = await subirArchivoMultipart('/gastos', imagenFactura, campos);
      return result.id;
    }

    const result = await apiClient.post('/gastos', input);
    return result.id;
  } catch (error) {
    throw crearErrorRepositorio('No se pudo registrar el gasto', error);
  }
}
