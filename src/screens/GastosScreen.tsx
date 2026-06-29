import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Save } from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';

import { AppButton } from '../components/AppButton';
import { CampoFecha } from '../components/CampoFecha';
import { CampoNumero } from '../components/CampoNumero';
import { CampoTexto } from '../components/CampoTexto';
import { MensajeAlerta } from '../components/MensajeAlerta';
import { ScreenContainer } from '../components/ScreenContainer';
import { SelectorImagenFactura } from '../components/SelectorImagenFactura';
import { useGastosStore } from '../store/useGastosStore';
import { gastoSchema, type GastoForm } from './formSchemas';

export function GastosScreen() {
  const store = useGastosStore();
  const form = useForm<GastoForm>({
    resolver: zodResolver(gastoSchema),
    defaultValues: {
      fecha: format(new Date(), 'yyyy-MM-dd'),
      categoria: 'Transporte',
      descripcion: '',
      monto: 0,
      nota: '',
      imagenFactura: undefined,
    },
  });

  async function onSubmit(data: GastoForm) {
    const ok = await store.registrarGasto({
      ...data,
      fecha: new Date(`${data.fecha}T12:00:00`).toISOString(),
    });

    if (ok) {
      form.reset({ ...data, descripcion: '', monto: 0, nota: '', imagenFactura: undefined });
    }
  }

  return (
    <ScreenContainer titulo="Gastos Adicionales" subtitulo="Gastos operativos, no compras a proveedor.">
      <MensajeAlerta mensaje={store.mensaje} />
      <Controller control={form.control} name="fecha" render={({ field, fieldState }) => (
        <CampoFecha error={fieldState.error?.message} label="Fecha"
          onChange={field.onChange} value={field.value} />
      )} />
      <Controller control={form.control} name="categoria" render={({ field, fieldState }) => (
        <CampoTexto error={fieldState.error?.message} label="Categoria"
          onChangeText={field.onChange} value={field.value} />
      )} />
      <Controller control={form.control} name="descripcion" render={({ field, fieldState }) => (
        <CampoTexto error={fieldState.error?.message} label="Descripcion"
          onChangeText={field.onChange} value={field.value} />
      )} />
      <Controller control={form.control} name="monto" render={({ field, fieldState }) => (
        <CampoNumero error={fieldState.error?.message} label="Monto"
          onChange={field.onChange} value={field.value} />
      )} />
      <Controller control={form.control} name="nota" render={({ field }) => (
        <CampoTexto label="Nota opcional" onChangeText={field.onChange} value={field.value ?? ''} />
      )} />
      
      <Controller control={form.control} name="imagenFactura" render={({ field }) => (
        <SelectorImagenFactura value={field.value} onChange={field.onChange} />
      )} />

      <AppButton icon={Save} label="Guardar gasto" loading={store.cargando}
        onPress={form.handleSubmit(onSubmit)} />
    </ScreenContainer>
  );
}
