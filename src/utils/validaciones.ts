export function validarColonesEnteros(nombre: string, valor: number): void {
  if (!Number.isFinite(valor) || valor < 0 || !Number.isInteger(valor)) {
    throw new Error(`${nombre} debe ser un monto entero en colones`);
  }
}

export function validarColonesEnterosPositivos(nombre: string, valor: number): void {
  validarColonesEnteros(nombre, valor);
  if (valor <= 0) {
    throw new Error(`${nombre} debe ser mayor a cero`);
  }
}

export function validarPositivo(nombre: string, valor: number): void {
  if (!Number.isFinite(valor) || valor <= 0) {
    throw new Error(`${nombre} debe ser mayor a cero`);
  }
}

export function validarNoNegativo(nombre: string, valor: number): void {
  if (!Number.isFinite(valor) || valor < 0) {
    throw new Error(`${nombre} no puede ser negativo`);
  }
}

export function validarTasaPorcentual(nombre: string, valor: number): void {
  if (!Number.isFinite(valor) || valor < 0 || valor > 1) {
    throw new Error(`${nombre} debe estar entre 0% y 100%`);
  }
}
