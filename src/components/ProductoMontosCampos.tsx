import { Controller, type Control } from 'react-hook-form';

import type { ProductoForm } from '../screens/formSchemas';
import { CampoNumero } from './CampoNumero';

interface Props {
  control: Control<ProductoForm>;
  esProduccion: boolean;
}

export function ProductoMontosCampos({ control, esProduccion }: Props) {
  return <>
    <Controller control={control} name="precioVentaActual" render={({ field, fieldState }) => (
      <CampoNumero error={fieldState.error?.message} label="Precio de venta"
        onChange={field.onChange} value={field.value} />
    )} />
    <Controller control={control} name="costoCompraActual" render={({ field, fieldState }) => (
      <CampoNumero error={fieldState.error?.message}
        label={esProduccion ? 'Costo interno unitario (opcional)' : 'Costo de compra'}
        onChange={field.onChange} value={field.value} />
    )} />
  </>;
}
