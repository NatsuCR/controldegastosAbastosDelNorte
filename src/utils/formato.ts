export function formatearColones(monto: number): string {
  return new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(monto);
}

export function formatearNumero(valor: number): string {
  return Number.isInteger(valor) ? String(valor) : valor.toFixed(2);
}
