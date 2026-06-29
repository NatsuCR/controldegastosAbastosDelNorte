export type ModoCalculoIva = 'incluido' | 'aparte';

export interface ParametrosCalculoFiscal {
  montoUnitario: number;
  cantidad: number;
  tasaIva: number;
  modoIva?: ModoCalculoIva;
}

export interface ResultadoCalculoFiscal {
  subtotal: number;
  ivaMonto: number;
  total: number;
}

export interface LineaFiscal {
  subtotal: number;
  ivaMonto: number;
  total: number;
  tasaIva: number;
}

export interface LineaGastoFiscal {
  monto: number;
}

export interface ParametrosResumenFiscal {
  ventas: LineaFiscal[];
  compras: LineaFiscal[];
  gastos: LineaGastoFiscal[];
}

export interface ResumenFiscal {
  ingresoBruto: number;
  ivaCobrado: number;
  ivaCobrado13: number;
  ivaCobrado1: number;
  ivaPagadoProveedores: number;
  ivaProveedores13: number;
  ivaProveedores1: number;
  ivaNetoPagar: number;
  totalComprasSinIva: number;
  totalGastosOperativos: number;
  gananciaNetaReal: number;
}
