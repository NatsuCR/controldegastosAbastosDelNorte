import * as SQLite from 'expo-sqlite';

import { ejecutarMigraciones } from './migrations';
import { sentenciasSchema } from './schema';
import { insertarDatosIniciales } from './seed';

const NOMBRE_BASE_DATOS = 'control_quesos_cr.db';

let promesaBaseDatos: Promise<SQLite.SQLiteDatabase> | null = null;

export async function obtenerBaseDatos(): Promise<SQLite.SQLiteDatabase> {
  try {
    if (!promesaBaseDatos) {
      promesaBaseDatos = SQLite.openDatabaseAsync(NOMBRE_BASE_DATOS);
    }

    return await promesaBaseDatos;
  } catch (error) {
    promesaBaseDatos = null;
    const detalle = error instanceof Error ? error.message : 'error desconocido';
    throw new Error(`No se pudo abrir la base de datos local: ${detalle}`);
  }
}

export async function resetearBaseDatos(): Promise<SQLite.SQLiteDatabase> {
  try {
    if (promesaBaseDatos) {
      const db = await promesaBaseDatos;
      await db.closeAsync();
    }
    await SQLite.deleteDatabaseAsync(NOMBRE_BASE_DATOS);
  } catch (error) {
    const detalle = error instanceof Error ? error.message : String(error);
    const ignorable = detalle.includes('not found') || detalle.includes('No such file');
    if (!ignorable) {
      promesaBaseDatos = null;
      throw new Error(`No se pudo reiniciar la base de datos: ${detalle}`);
    }
  }

  promesaBaseDatos = null;
  return await inicializarBaseDatos();
}

export async function inicializarBaseDatos(): Promise<SQLite.SQLiteDatabase> {
  const db = await obtenerBaseDatos();

  try {
    await db.execAsync('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');

    for (const sentencia of sentenciasSchema) {
      await db.execAsync(sentencia);
    }

    await ejecutarMigraciones(db);
    await insertarDatosIniciales(db);
    return db;
  } catch (error) {
    const detalle = error instanceof Error ? error.message : 'error desconocido';
    throw new Error(`No se pudo inicializar la base de datos: ${detalle}`);
  }
}
