import type { SQLiteDatabase } from 'expo-sqlite';

const FECHA_ACTUAL_SQL = "strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";

export async function insertarDatosIniciales(db: SQLiteDatabase): Promise<void> {
  try {
    await db.execAsync(`
      INSERT OR IGNORE INTO configuracion (clave, valor) VALUES
        ('tasa_iva', '0.13'),
        ('precio_venta_incluye_iva', 'true'),
        ('costo_proveedor_incluye_iva', 'true'),
        ('umbral_stock_bajo_default', '2');
    `);
  } catch (error) {
    const detalle = error instanceof Error ? error.message : 'error desconocido';
    throw new Error(`No se pudieron cargar los datos iniciales: ${detalle}`);
  }
}
