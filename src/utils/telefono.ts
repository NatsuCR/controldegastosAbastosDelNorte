export function normalizarTelefonoCliente(valor: string): string {
  const digitos = valor.replace(/\D/g, '');

  if (digitos.length === 11 && digitos.startsWith('506')) {
    return digitos.slice(3);
  }

  return digitos;
}

export function esTelefonoClienteValido(valor: string): boolean {
  return normalizarTelefonoCliente(valor).length === 8;
}

export function esPagoSinpe(valor: string): boolean {
  return valor.toUpperCase().includes('SINPE');
}
