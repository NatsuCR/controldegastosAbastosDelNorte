import { MODO_IVA_DEFAULT, TASA_IVA_DEFAULT } from '../../constants/fiscales';
import type { ConfiguracionNegocio } from '../../types/negocio';
import { validarTasaPorcentual } from '../../utils/validaciones';
import { obtenerBaseDatos } from '../db';
import { crearErrorRepositorio } from './errores';

interface ConfiguracionRow {
  clave: string;
  valor: string;
}

function leerBooleano(valor: string | undefined, respaldo: boolean): boolean {
  if (valor === undefined) {
    return respaldo;
  }

  return valor === 'true';
}

export async function obtenerConfiguracionNegocio(): Promise<ConfiguracionNegocio> {
  try {
    const db = await obtenerBaseDatos();
    const rows = await db.getAllAsync<ConfiguracionRow>(`SELECT * FROM configuracion`);
    const valores = Object.fromEntries(rows.map((row) => [row.clave, row.valor]));

    return {
      tasaIva: Number(valores.tasa_iva ?? TASA_IVA_DEFAULT),
      precioVentaIncluyeIva: leerBooleano(
        valores.precio_venta_incluye_iva,
        MODO_IVA_DEFAULT === 'incluido',
      ),
      costoProveedorIncluyeIva: leerBooleano(valores.costo_proveedor_incluye_iva, true),
    };
  } catch (error) {
    throw crearErrorRepositorio('No se pudo cargar la configuracion fiscal', error);
  }
}

export async function guardarConfiguracionNegocio(input: ConfiguracionNegocio): Promise<void> {
  try {
    validarTasaPorcentual('El IVA default', input.tasaIva);
    const db = await obtenerBaseDatos();
    await db.withExclusiveTransactionAsync(async (txn) => {
      await txn.runAsync(`UPDATE configuracion SET valor = ? WHERE clave = 'tasa_iva'`, String(input.tasaIva));
      await txn.runAsync(
        `UPDATE configuracion SET valor = ? WHERE clave = 'precio_venta_incluye_iva'`,
        String(input.precioVentaIncluyeIva),
      );
      await txn.runAsync(
        `UPDATE configuracion SET valor = ? WHERE clave = 'costo_proveedor_incluye_iva'`,
        String(input.costoProveedorIncluyeIva),
      );
    });
  } catch (error) {
    throw crearErrorRepositorio('No se pudo guardar la configuracion fiscal', error);
  }
}
