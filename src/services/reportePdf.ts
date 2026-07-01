import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import type { ReportePeriodo } from '../types/reportes';
import { apiAssetUrl } from './apiClient';
import { formatearColones, formatearNumero } from '../utils/formato';

export async function exportarReportePdf(reporte: ReportePeriodo): Promise<void> {
  const archivo = await Print.printToFileAsync({ html: crearHtmlReporte(reporte) });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(archivo.uri);
  }
}

function crearHtmlReporte(reporte: ReportePeriodo): string {
  const filas = reporte.productos.map((producto) => `
    <tr>
      <td>${producto.nombre}</td>
      <td>${producto.sku ?? ''}</td>
      <td>${producto.categoriaNombre}</td>
      <td>${producto.marca ?? ''}</td>
      <td>${formatearNumero(producto.cantidadVendida)} ${producto.unidadMedida}</td>
      <td>${formatearColones(producto.montoVendido)}</td>
    </tr>
  `).join('');
  const compras = reporte.historialCompras.map((compra) => filaHistorial(
    compra.fecha,
    `${compra.productoNombre} / ${compra.proveedorNombre}`,
    compra.total,
    compra.imagenFactura,
  )).join('');
  const gastos = reporte.historialGastos.map((gasto) => filaHistorial(
    gasto.fecha,
    `${gasto.descripcion} (${gasto.categoria})`,
    gasto.monto,
    gasto.imagenFactura,
  )).join('');

  return `
    <html>
      <head>${estilos()}</head>
      <body>
        <h1>Abastos del Norte</h1>
        <h2>Reporte financiero</h2>
        <p>${new Date(reporte.rango.desde).toLocaleDateString('es-CR')} -
          ${new Date(reporte.rango.hasta).toLocaleDateString('es-CR')}</p>
        ${bloqueFinanciero(reporte)}
        <h2>Desglose por producto</h2>
        <table>
          <thead><tr><th>Producto</th><th>SKU</th><th>Categoria</th><th>Proveedor</th><th>Cantidad</th><th>Monto</th></tr></thead>
          <tbody>${filas || '<tr><td colspan="6">Sin ventas en el periodo</td></tr>'}</tbody>
        </table>
        <h2>Facturas de compras</h2>
        ${compras || '<p>Sin compras en el periodo</p>'}
        <h2>Facturas de gastos adicionales</h2>
        ${gastos || '<p>Sin gastos en el periodo</p>'}
      </body>
    </html>
  `;
}

function filaHistorial(fecha: string, detalle: string, monto: number, imagen?: string | null): string {
  const url = apiAssetUrl(imagen);
  return `
    <div class="historial">
      <div><strong>${detalle}</strong></div>
      <div>${new Date(fecha).toLocaleDateString('es-CR')} - ${formatearColones(monto)}</div>
      ${url ? `<img src="${url}" />` : '<em>Sin foto de factura</em>'}
    </div>
  `;
}

function bloqueFinanciero(reporte: ReportePeriodo): string {
  const r = reporte.resumen;
  const items = [
    ['Total vendido con IVA', r.ingresoBruto],
    ['IVA ventas 13%', r.ivaCobrado13],
    ['IVA ventas 1%', r.ivaCobrado1],
    ['IVA compras 13%', r.ivaProveedores13],
    ['IVA compras 1%', r.ivaProveedores1],
    ['IVA neto TRIBU', r.ivaNetoPagar],
    ['Compras sin IVA', r.totalComprasSinIva],
    ['Gastos operativos', r.totalGastosOperativos],
    ['Ganancia sin IVA', r.gananciaNetaReal],
  ];

  return `<div class="grid">${items.map(([label, value]) => `
    <div class="metric"><span>${label}</span><strong>${formatearColones(Number(value))}</strong></div>
  `).join('')}</div>`;
}

function estilos(): string {
  return `<style>
    body { color: #14213D; font-family: Arial, sans-serif; padding: 28px; }
    h1 { color: #0F766E; margin-bottom: 0; }
    h2 { margin-top: 24px; }
    .grid { display: grid; gap: 10px; grid-template-columns: 1fr 1fr; }
    .metric { border: 1px solid #D7DEE2; border-radius: 8px; padding: 12px; }
    .metric span { color: #52606D; display: block; font-size: 12px; }
    .metric strong { display: block; font-size: 18px; margin-top: 6px; }
    table { border-collapse: collapse; margin-top: 12px; width: 100%; }
    th, td { border-bottom: 1px solid #D7DEE2; padding: 8px; text-align: left; }
    th { background: #EEF6F4; }
    .historial { border: 1px solid #D7DEE2; border-radius: 8px; margin: 10px 0; padding: 12px; page-break-inside: avoid; }
    .historial img { display: block; margin-top: 10px; max-height: 420px; max-width: 100%; object-fit: contain; }
  </style>`;
}
