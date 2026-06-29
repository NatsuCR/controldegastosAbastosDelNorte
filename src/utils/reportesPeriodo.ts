import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from 'date-fns';

import type { RangoFechas } from '../types/dashboard';
import type { FiltroReporte } from '../types/reportes';

export function obtenerRangoReporte(filtro: FiltroReporte): RangoFechas {
  if (filtro.tipo === 'rango') {
    return {
      desde: startOfDay(parseISO(filtro.desde)).toISOString(),
      hasta: endOfDay(parseISO(filtro.hasta)).toISOString(),
    };
  }

  const fecha = parseISO(filtro.fechaBase);

  if (filtro.tipo === 'dia') {
    return rango(startOfDay(fecha), endOfDay(fecha));
  }

  if (filtro.tipo === 'semana') {
    return rango(startOfWeek(fecha, { weekStartsOn: 1 }), endOfWeek(fecha, { weekStartsOn: 1 }));
  }

  if (filtro.tipo === 'mes') {
    return rango(startOfMonth(fecha), endOfMonth(fecha));
  }

  return rango(startOfYear(fecha), endOfYear(fecha));
}

function rango(desde: Date, hasta: Date): RangoFechas {
  return {
    desde: desde.toISOString(),
    hasta: hasta.toISOString(),
  };
}
