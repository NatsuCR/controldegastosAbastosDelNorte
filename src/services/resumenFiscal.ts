import type {
  LineaFiscal,
  LineaGastoFiscal,
  ParametrosResumenFiscal,
  ResumenFiscal,
} from '../types/fiscales';

import { calcularGananciaNeta, calcularIvaNetoPagar, redondearMoneda } from './calculosFiscales';

function sumarLineas(lineas: LineaFiscal[], campo: keyof LineaFiscal): number {
  const total = lineas.reduce((acumulado, linea) => acumulado + linea[campo], 0);
  return redondearMoneda(total);
}

function sumarGastos(gastos: LineaGastoFiscal[]): number {
  const total = gastos.reduce((acumulado, gasto) => acumulado + gasto.monto, 0);
  return redondearMoneda(total);
}

function sumarIvaTarifa(lineas: LineaFiscal[], tasaIva: number): number {
  const total = lineas
    .filter((linea) => Math.abs(linea.tasaIva - tasaIva) < 0.0001)
    .reduce((acumulado, linea) => acumulado + linea.ivaMonto, 0);
  return redondearMoneda(total);
}

export function calcularDebitoFiscal(ventas: LineaFiscal[]): number {
  return sumarLineas(ventas, 'ivaMonto');
}

export function calcularCreditoFiscal(compras: LineaFiscal[]): number {
  return sumarLineas(compras, 'ivaMonto');
}

export function calcularResumenFiscal(parametros: ParametrosResumenFiscal): ResumenFiscal {
  const ingresoBruto = sumarLineas(parametros.ventas, 'total');
  const ivaCobrado = calcularDebitoFiscal(parametros.ventas);
  const ivaPagadoProveedores = calcularCreditoFiscal(parametros.compras);
  const totalComprasSinIva = sumarLineas(parametros.compras, 'subtotal');
  const totalGastosOperativos = sumarGastos(parametros.gastos);
  const ivaCobrado13 = sumarIvaTarifa(parametros.ventas, 0.13);
  const ivaCobrado1 = sumarIvaTarifa(parametros.ventas, 0.01);
  const ivaProveedores13 = sumarIvaTarifa(parametros.compras, 0.13);
  const ivaProveedores1 = sumarIvaTarifa(parametros.compras, 0.01);

  return {
    ingresoBruto,
    ivaCobrado,
    ivaCobrado13,
    ivaCobrado1,
    ivaPagadoProveedores,
    ivaProveedores13,
    ivaProveedores1,
    ivaNetoPagar: calcularIvaNetoPagar(ivaCobrado, ivaPagadoProveedores),
    totalComprasSinIva,
    totalGastosOperativos,
    gananciaNetaReal: calcularGananciaNeta(
      sumarLineas(parametros.ventas, 'subtotal'),
      totalComprasSinIva,
      totalGastosOperativos,
    ),
  };
}
