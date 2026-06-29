import type { RegistrarGastoInput } from '../../types/gastos';
import { validarColonesEnterosPositivos } from '../../utils/validaciones';
import { obtenerBaseDatos } from '../db';
import { crearErrorRepositorio } from './errores';

export async function registrarGasto(input: RegistrarGastoInput): Promise<number> {
  try {
    validarColonesEnterosPositivos('El gasto', input.monto);
    const db = await obtenerBaseDatos();
    const resultado = await db.runAsync(
      `INSERT INTO gastos (fecha, categoria, descripcion, monto, nota, imagen_factura) VALUES (?, ?, ?, ?, ?, ?)`,
      input.fecha,
      input.categoria.trim(),
      input.descripcion.trim(),
      input.monto,
      input.nota?.trim() || null,
      input.imagenFactura ?? null
    );

    return resultado.lastInsertRowId;
  } catch (error) {
    throw crearErrorRepositorio('No se pudo registrar el gasto', error);
  }
}
