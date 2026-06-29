export interface RegistrarGastoInput {
  fecha: string;
  categoria: string;
  descripcion: string;
  monto: number;
  nota?: string;
  imagenFactura?: string;
}
