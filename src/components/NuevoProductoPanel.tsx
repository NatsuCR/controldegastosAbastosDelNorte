import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';

import { colores, radios, espacios } from '../constants/tema';
import type { Categoria } from '../database/models';
import { productoSchema, type ProductoForm } from '../screens/formSchemas';
import type { CrearProductoInput } from '../types/negocio';
import { AppButton } from './AppButton';
import { CampoNumero } from './CampoNumero';
import { CampoTexto } from './CampoTexto';
import { CategoriaSelector } from './CategoriaSelector';
import { ProductoMontosCampos } from './ProductoMontosCampos';

interface Props {
  categorias: Categoria[];
  loading: boolean;
  modo?: 'proveedor' | 'produccion';
  proveedorNombre?: string;
  onCrearCategoria: (nombre: string) => Promise<number | null>;
  onCrearProducto: (input: CrearProductoInput) => Promise<number | null>;
}

export function NuevoProductoPanel(props: Props) {
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const esProduccion = props.modo === 'produccion';
  const form = useForm<ProductoForm>({
    resolver: zodResolver(productoSchema),
    defaultValues: {
      categoriaId: 0, nombre: '', marca: '', unidadMedida: esProduccion ? 'unidad' : 'kg',
      cantidadPorPresentacion: 1, precioVentaActual: 0, costoCompraActual: 0,
      stockInicial: 0, tasaIvaPorcentaje: 0, umbralStockBajo: 1,
    },
  });
  const categoriaId = form.watch('categoriaId');

  useEffect(() => {
    if (!categoriaId && props.categorias[0]) {
      form.setValue('categoriaId', props.categorias[0].id, { shouldValidate: true });
    }
    form.setValue('marca', props.proveedorNombre ?? '');
  }, [categoriaId, form, props.categorias, props.proveedorNombre]);

  async function crearCategoria() {
    const id = await props.onCrearCategoria(nuevaCategoria);
    if (id) {
      form.setValue('categoriaId', id, { shouldValidate: true });
      setNuevaCategoria('');
    }
  }

  async function crearProducto(data: ProductoForm) {
    const randomSku = `PROD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const id = await props.onCrearProducto({
      ...data,
      sku: randomSku,
      marca: props.proveedorNombre,
      unidadMedida: data.unidadMedida,
      cantidadPorPresentacion: 1,
      stockInicial: esProduccion ? data.stockInicial : 0,
      tasaIva: data.tasaIvaPorcentaje / 100,
    });
    if (id) {
      form.reset({ ...data, nombre: '', precioVentaActual: 0 });
    }
  }

  return (
    <View style={styles.caja}>
      <Text style={styles.titulo}>{esProduccion ? 'Producto de produccion interna' : 'Producto nuevo del proveedor'}</Text>
      <Text style={styles.ayuda}>
        {esProduccion ? 'Registra lo que hiciste y suma la cantidad al stock.'
          : `Proveedor: ${props.proveedorNombre ?? 'sin proveedor seleccionado'}`}
      </Text>
      <CategoriaSelector categorias={props.categorias} value={categoriaId}
        onChange={(id) => form.setValue('categoriaId', id, { shouldValidate: true })} />
      <CampoTexto label="Nueva categoria" onChangeText={setNuevaCategoria} value={nuevaCategoria} />
      <AppButton icon={Plus} label="Agregar categoria" onPress={crearCategoria} variant="secondary" />
      <Controller control={form.control} name="nombre" render={({ field, fieldState }) => (
        <CampoTexto error={fieldState.error?.message} label="Producto"
          onChangeText={field.onChange} value={field.value} />
      )} />
      <Controller control={form.control} name="unidadMedida" render={({ field }) => (
        <View style={styles.selectorUnidad}>
          <Text style={styles.labelUnidad}>¿Cómo se vende/compra?</Text>
          <View style={styles.botonesUnidad}>
            <AppButton variant={field.value === 'kg' ? 'primary' : 'secondary'} label="Por Kilo (kg)" onPress={() => field.onChange('kg')} />
            <AppButton variant={field.value === 'unidad' ? 'primary' : 'secondary'} label="Por Unidad" onPress={() => field.onChange('unidad')} />
          </View>
        </View>
      )} />
      {esProduccion ? (
        <Controller control={form.control} name="stockInicial" render={({ field, fieldState }) => (
          <CampoNumero error={fieldState.error?.message} label="Cantidad producida para stock"
            onChange={field.onChange} value={field.value} />
        )} />
      ) : null}
      <ProductoMontosCampos control={form.control} esProduccion={esProduccion} />
      <Controller control={form.control} name="tasaIvaPorcentaje" render={({ field, fieldState }) => (
        <CampoNumero error={fieldState.error?.message} label="IVA %"
          onChange={field.onChange} value={field.value} />
      )} />
      <AppButton disabled={!props.proveedorNombre} icon={Plus} label="Crear producto" loading={props.loading}
        onPress={form.handleSubmit(crearProducto)} />
    </View>
  );
}

const styles = StyleSheet.create({
  caja: { backgroundColor: colores.superficie, borderColor: colores.borde,
    borderRadius: radios.md, borderWidth: 1, gap: espacios.sm, padding: espacios.md },
  titulo: { color: colores.texto, fontSize: 17, fontWeight: '900' },
  ayuda: { color: colores.textoSecundario, fontSize: 13, lineHeight: 18 },
  selectorUnidad: { gap: espacios.xs },
  labelUnidad: { color: colores.texto, fontSize: 14, fontWeight: '700' },
  botonesUnidad: { flexDirection: 'row', gap: espacios.sm },
});
