export function crearErrorRepositorio(accion: string, error: unknown): Error {
  const detalle = error instanceof Error ? error.message : 'error desconocido';
  return new Error(`${accion}: ${detalle}`);
}
