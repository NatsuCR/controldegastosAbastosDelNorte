export function textoANumero(texto: string): number {
  const normalizado = texto.replace(',', '.');
  const numero = Number(normalizado);
  return Number.isFinite(numero) ? numero : 0;
}

export function numeroATexto(valor: number): string {
  if (!Number.isFinite(valor) || valor === 0) {
    return '';
  }

  return String(valor);
}
