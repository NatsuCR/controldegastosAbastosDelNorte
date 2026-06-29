import type { ModoCalculoIva, ParametrosCalculoFiscal, ResultadoCalculoFiscal } from '../types/fiscales';

function validarMonto(nombre: string, valor: number): void {
  if (!Number.isFinite(valor) || valor < 0) {
    throw new Error(`${nombre} debe ser un numero positivo o cero`);
  }
}

function validarTasaIva(tasaIva: number): void {
  if (!Number.isFinite(tasaIva) || tasaIva < 0 || tasaIva > 1) {
    throw new Error('La tasa de IVA debe estar entre 0 y 1');
  }
}

export function redondearMoneda(monto: number): number {
  return Math.round(monto + Number.EPSILON);
}

export function calcularMontoFiscal(
  parametros: ParametrosCalculoFiscal,
): ResultadoCalculoFiscal {
  const { montoUnitario, cantidad, tasaIva } = parametros;
  const modoIva: ModoCalculoIva = parametros.modoIva ?? 'incluido';

  validarMonto('El monto unitario', montoUnitario);
  validarMonto('La cantidad', cantidad);
  validarTasaIva(tasaIva);

  const montoBase = montoUnitario * cantidad;

  if (modoIva === 'incluido') {
    const total = redondearMoneda(montoBase);
    const subtotal = tasaIva === 0 ? total : redondearMoneda(total / (1 + tasaIva));
    return { subtotal, ivaMonto: total - subtotal, total };
  }

  const subtotal = redondearMoneda(montoBase);
  const ivaMonto = redondearMoneda(subtotal * tasaIva);
  return { subtotal, ivaMonto, total: subtotal + ivaMonto };
}

export function calcularVenta(
  precioUnitario: number,
  cantidad: number,
  tasaIva: number,
  precioIncluyeIva = true,
): ResultadoCalculoFiscal {
  return calcularMontoFiscal({
    montoUnitario: precioUnitario,
    cantidad,
    tasaIva,
    modoIva: precioIncluyeIva ? 'incluido' : 'aparte',
  });
}

export function calcularCompra(
  costoUnitario: number,
  cantidad: number,
  tasaIva: number,
  costoIncluyeIva = true,
): ResultadoCalculoFiscal {
  return calcularMontoFiscal({
    montoUnitario: costoUnitario,
    cantidad,
    tasaIva,
    modoIva: costoIncluyeIva ? 'incluido' : 'aparte',
  });
}

export function calcularGananciaNeta(
  ventaSubtotal: number,
  costoCompraSubtotal: number,
  gastosOperativos = 0,
): number {
  validarMonto('El subtotal de venta', ventaSubtotal);
  validarMonto('El subtotal de compra', costoCompraSubtotal);
  validarMonto('Los gastos operativos', gastosOperativos);

  return redondearMoneda(ventaSubtotal - costoCompraSubtotal - gastosOperativos);
}

export function calcularIvaNetoPagar(ivaCobrado: number, ivaPagado: number): number {
  validarMonto('El IVA de ventas', ivaCobrado);
  validarMonto('El IVA de compras', ivaPagado);
  return redondearMoneda(ivaCobrado - ivaPagado);
}
