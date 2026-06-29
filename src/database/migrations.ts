
import type { SQLiteDatabase } from 'expo-sqlite';

interface ColumnaInfo {
  name: string;
}

async function existeColumna(
  db: SQLiteDatabase,
  tabla: string,
  columna: string,
): Promise<boolean> {
  const columnas = await db.getAllAsync<ColumnaInfo>(`PRAGMA table_info(${tabla})`);
  return columnas.some((item) => item.name === columna);
}

export async function ejecutarMigraciones(db: SQLiteDatabase): Promise<void> {
  if (!(await existeColumna(db, 'productos', 'marca'))) {
    await db.execAsync(`ALTER TABLE productos ADD COLUMN marca TEXT;`);
    await db.execAsync(`UPDATE productos SET marca = 'Sin marca' WHERE marca IS NULL;`);
  }

  if (!(await existeColumna(db, 'productos', 'sku'))) {
    await db.execAsync(`ALTER TABLE productos ADD COLUMN sku TEXT;`);
  }

  await db.execAsync(`CREATE UNIQUE INDEX IF NOT EXISTS idx_productos_sku
    ON productos (sku) WHERE sku IS NOT NULL AND sku <> '';`);

  if (!(await existeColumna(db, 'ventas', 'cliente_telefono'))) {
    await db.execAsync(`ALTER TABLE ventas ADD COLUMN cliente_telefono TEXT;`);
  }

  if (!(await existeColumna(db, 'productos', 'tasa_iva'))) {
    await db.execAsync(`ALTER TABLE productos ADD COLUMN tasa_iva REAL NOT NULL DEFAULT 0.13;`);
  }

  if (!(await existeColumna(db, 'ventas', 'tasa_iva'))) {
    await db.execAsync(`ALTER TABLE ventas ADD COLUMN tasa_iva REAL NOT NULL DEFAULT 0;`);
  }

  if (!(await existeColumna(db, 'compras', 'tasa_iva'))) {
    await db.execAsync(`ALTER TABLE compras ADD COLUMN tasa_iva REAL NOT NULL DEFAULT 0;`);
  }
  if (!(await existeColumna(db, 'compras', 'imagen_factura'))) {
    await db.execAsync(`ALTER TABLE compras ADD COLUMN imagen_factura TEXT;`);
  }

  if (!(await existeColumna(db, 'gastos', 'imagen_factura'))) {
    await db.execAsync(`ALTER TABLE gastos ADD COLUMN imagen_factura TEXT;`);
  }

  await db.execAsync(`
    UPDATE ventas
    SET tasa_iva = COALESCE((SELECT tasa_iva FROM productos WHERE productos.id = ventas.producto_id), 0.13)
    WHERE tasa_iva = 0 AND iva_monto > 0;

    UPDATE compras
    SET tasa_iva = COALESCE((SELECT tasa_iva FROM productos WHERE productos.id = compras.producto_id), 0.13)
    WHERE tasa_iva = 0 AND iva_monto > 0;
  `);
}