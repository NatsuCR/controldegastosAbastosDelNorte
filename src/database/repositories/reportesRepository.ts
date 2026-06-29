import { calcularResumenFiscal } from '../../services/resumenFiscal';
import type { LineaFiscal, LineaGastoFiscal } from '../../types/fiscales';
import type { FiltroReporte, ProductoReporte, ReportePeriodo } from '../../types/reportes';
import { obtenerRangoReporte } from '../../utils/reportesPeriodo';
import { obtenerBaseDatos } from '../db';
import { crearErrorRepositorio } from './errores';
import type { ReporteCompraHistorial, ReporteGastoHistorial } from '../../types/reportes';

export async function obtenerReporte(filtro: FiltroReporte): Promise<ReportePeriodo> {
  try {
    const rango = obtenerRangoReporte(filtro);
    const [ventas, compras, gastos, productos, historialCompras, historialGastos] = await Promise.all([
      listarLineas('ventas', rango.desde, rango.hasta),
      listarLineas('compras', rango.desde, rango.hasta),
      listarGastos(rango.desde, rango.hasta),
      listarProductos(rango.desde, rango.hasta),
      listarHistorialCompras(rango.desde, rango.hasta),
      listarHistorialGastos(rango.desde, rango.hasta),
    ]);

    return {
      filtro,
      rango,
      resumen: calcularResumenFiscal({ ventas, compras, gastos }),
      productos,
      historialCompras,
      historialGastos,
    };
  } catch (error) {
    throw crearErrorRepositorio('No se pudo cargar el reporte', error);
  }
}

async function listarLineas(tabla: 'ventas' | 'compras', desde: string, hasta: string) {
  const db = await obtenerBaseDatos();
  return db.getAllAsync<LineaFiscal>(
    `SELECT subtotal, iva_monto ivaMonto, total, tasa_iva tasaIva
     FROM ${tabla} WHERE fecha BETWEEN ? AND ?`,
    desde,
    hasta,
  );
}

async function listarGastos(desde: string, hasta: string): Promise<LineaGastoFiscal[]> {
  const db = await obtenerBaseDatos();
  return db.getAllAsync<LineaGastoFiscal>(
    `SELECT monto FROM gastos WHERE fecha BETWEEN ? AND ?`,
    desde,
    hasta,
  );
}

async function listarProductos(desde: string, hasta: string): Promise<ProductoReporte[]> {
  const db = await obtenerBaseDatos();
  return db.getAllAsync<ProductoReporte>(
    `SELECT p.id productoId, p.nombre, p.sku, p.marca, c.nombre categoriaNombre,
       p.unidad_medida unidadMedida, COALESCE(SUM(v.cantidad), 0) cantidadVendida,
       COALESCE(SUM(v.total), 0) montoVendido,
       COALESCE(SUM(v.subtotal), 0) subtotalVendido
     FROM ventas v
     INNER JOIN productos p ON p.id = v.producto_id
     INNER JOIN categorias c ON c.id = p.categoria_id
     WHERE v.fecha BETWEEN ? AND ?
     GROUP BY p.id, p.nombre, p.sku, p.marca, c.nombre, p.unidad_medida
     ORDER BY montoVendido DESC`,
    desde,
    hasta,
  );
}

async function listarHistorialCompras(desde: string, hasta: string): Promise<ReporteCompraHistorial[]> {
  const db = await obtenerBaseDatos();
  return db.getAllAsync<ReporteCompraHistorial>(
    `SELECT c.id, c.fecha, pr.nombre AS proveedorNombre, p.nombre AS productoNombre, 
            c.cantidad, c.total, c.imagen_factura AS imagenFactura
     FROM compras c
     INNER JOIN proveedores pr ON c.proveedor_id = pr.id
     INNER JOIN productos p ON c.producto_id = p.id
     WHERE c.fecha BETWEEN ? AND ?
     ORDER BY c.fecha DESC`,
    desde,
    hasta
  );
}

async function listarHistorialGastos(desde: string, hasta: string): Promise<ReporteGastoHistorial[]> {
  const db = await obtenerBaseDatos();
  return db.getAllAsync<ReporteGastoHistorial>(
    `SELECT id, fecha, categoria, descripcion, monto, imagen_factura AS imagenFactura
     FROM gastos 
     WHERE fecha BETWEEN ? AND ?
     ORDER BY fecha DESC`,
    desde,
    hasta
  );
}
