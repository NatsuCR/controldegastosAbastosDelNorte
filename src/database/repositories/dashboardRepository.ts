import { calcularResumenFiscal } from '../../services/resumenFiscal';
import type { DashboardData, PeriodoDashboard } from '../../types/dashboard';
import type { LineaFiscal, LineaGastoFiscal } from '../../types/fiscales';
import { diasUltimaSemana, obtenerRangoPeriodo } from '../../utils/periodos';
import { obtenerBaseDatos } from '../db';
import { crearErrorRepositorio } from './errores';
import { listarInventarioActual } from './inventarioRepository';

interface VentaDiaRow {
  fecha: string;
  total: number;
}

export async function obtenerDashboard(periodo: PeriodoDashboard): Promise<DashboardData> {
  try {
    const [ventas, compras, gastos, ventasUltimosDias, inventario] = await Promise.all([
      listarVentasPeriodo(periodo),
      listarComprasPeriodo(periodo),
      listarGastosPeriodo(periodo),
      listarVentasUltimosDias(),
      listarInventarioActual(),
    ]);

    return {
      resumen: calcularResumenFiscal({ ventas, compras, gastos }),
      ventasUltimosDias,
      inventario,
    };
  } catch (error) {
    throw crearErrorRepositorio('No se pudo cargar el dashboard', error);
  }
}

async function listarVentasPeriodo(periodo: PeriodoDashboard): Promise<LineaFiscal[]> {
  const rango = obtenerRangoPeriodo(periodo);
  const db = await obtenerBaseDatos();
  return db.getAllAsync<LineaFiscal>(
    `SELECT subtotal, iva_monto ivaMonto, total, tasa_iva tasaIva
     FROM ventas WHERE fecha BETWEEN ? AND ?`,
    rango.desde,
    rango.hasta,
  );
}

async function listarComprasPeriodo(periodo: PeriodoDashboard): Promise<LineaFiscal[]> {
  const rango = obtenerRangoPeriodo(periodo);
  const db = await obtenerBaseDatos();
  return db.getAllAsync<LineaFiscal>(
    `SELECT subtotal, iva_monto ivaMonto, total, tasa_iva tasaIva
     FROM compras WHERE fecha BETWEEN ? AND ?`,
    rango.desde,
    rango.hasta,
  );
}

async function listarGastosPeriodo(periodo: PeriodoDashboard): Promise<LineaGastoFiscal[]> {
  const rango = obtenerRangoPeriodo(periodo);
  const db = await obtenerBaseDatos();
  return db.getAllAsync<LineaGastoFiscal>(
    `SELECT monto FROM gastos WHERE fecha BETWEEN ? AND ?`,
    rango.desde,
    rango.hasta,
  );
}

async function listarVentasUltimosDias() {
  const dias = diasUltimaSemana();
  const db = await obtenerBaseDatos();
  const rows = await db.getAllAsync<VentaDiaRow>(
    `SELECT date(fecha, 'localtime') fecha, COALESCE(SUM(total), 0) total
     FROM ventas
     WHERE date(fecha, 'localtime') >= ?
     GROUP BY date(fecha, 'localtime')`,
    dias[0].fecha,
  );
  const totalPorFecha = Object.fromEntries(rows.map((row) => [row.fecha, row.total]));
  return dias.map((dia) => ({ ...dia, total: totalPorFecha[dia.fecha] ?? 0 }));
}
