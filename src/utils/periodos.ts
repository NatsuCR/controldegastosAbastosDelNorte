import {
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
} from 'date-fns';

import type { PeriodoDashboard, RangoFechas, VentaDia } from '../types/dashboard';

export function obtenerRangoPeriodo(periodo: PeriodoDashboard, fecha = new Date()): RangoFechas {
  if (periodo === 'hoy') {
    return rango(startOfDay(fecha), endOfDay(fecha));
  }

  if (periodo === 'semana') {
    return rango(startOfWeek(fecha, { weekStartsOn: 1 }), endOfWeek(fecha, { weekStartsOn: 1 }));
  }

  if (periodo === 'mes') {
    return rango(startOfMonth(fecha), endOfMonth(fecha));
  }

  return rango(startOfYear(fecha), endOfYear(fecha));
}

export function diasUltimaSemana(fecha = new Date()): VentaDia[] {
  const desde = startOfDay(subDays(fecha, 6));
  const hasta = endOfDay(fecha);

  return eachDayOfInterval({ start: desde, end: hasta }).map((dia) => ({
    fecha: format(dia, 'yyyy-MM-dd'),
    etiqueta: format(dia, 'dd/MM'),
    total: 0,
  }));
}

function rango(desde: Date, hasta: Date): RangoFechas {
  return {
    desde: desde.toISOString(),
    hasta: hasta.toISOString(),
  };
}
