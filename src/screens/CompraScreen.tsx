import { zodResolver } from '@hookform/resolvers/zod';
import { useFocusEffect } from '@react-navigation/native';
import { Save } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AppButton } from '../components/AppButton';
import { CampoNumero } from '../components/CampoNumero';
import { MensajeAlerta } from '../components/MensajeAlerta';
import { NuevoProductoPanel } from '../components/NuevoProductoPanel';
import { ProductoSelector } from '../components/ProductoSelector';
import { ProveedorCompraPanel } from '../components/ProveedorCompraPanel';
import { ResumenCalculo } from '../components/ResumenCalculo';
import { ScreenContainer } from '../components/ScreenContainer';
import { SelectorMetodoPago } from '../components/SelectorMetodoPago';
import { SelectorImagenFactura } from '../components/SelectorImagenFactura';
import { SeccionExpandible } from '../components/SeccionExpandible';
import { ToggleCosto } from '../components/ToggleCosto';
import { calcularCompra } from '../services/calculosFiscales';
import { useNegocioStore } from '../store/useNegocioStore';
import { compraSchema, type CompraForm } from './formSchemas';
import type { CrearProductoInput } from '../types/negocio';
export function CompraScreen() {
  const store = useNegocioStore();
  const [nuevoProveedor, setNuevoProveedor] = useState('');
  const form = useForm<CompraForm>({
    resolver: zodResolver(compraSchema),
    defaultValues: {
      proveedorId: 0, productoId: 0, cantidad: 1, costoUnitario: 0,
      metodoPago: 'Efectivo', actualizarCostoVigente: false, nota: '', imagenFactura: undefined,
    },
  });
  const values = form.watch();
  const producto = store.productos.find((item) => item.id === values.productoId);
  const proveedor = store.proveedores.find((item) => item.id === values.proveedorId);
  useFocusEffect(useCallback(() => {
    store.cargarDatos();
    return () => store.limpiarMensaje();
  }, [store.cargarDatos, store.limpiarMensaje]));
  useEffect(() => {
    if (!values.productoId && store.productos[0]) {
      form.setValue('productoId', store.productos[0].id, { shouldValidate: true });
      form.setValue('costoUnitario', store.productos[0].costoCompraActual);
    }
    if (!values.proveedorId && store.proveedores[0]) {
      form.setValue('proveedorId', store.proveedores[0].id, { shouldValidate: true });
    }
  }, [form, store.productos, store.proveedores, values.productoId, values.proveedorId]);
  const calculo = useMemo(() => {
    if (!values.costoUnitario || values.cantidad <= 0) {
      return null;
    }
    return calcularCompra(
      values.costoUnitario,
      values.cantidad,
      producto?.tasaIva ?? store.configuracion.tasaIva,
      store.configuracion.costoProveedorIncluyeIva,
    );
  }, [producto, store.configuracion, values.cantidad, values.costoUnitario]);
  async function crearProveedor() {
    const id = await store.crearProveedor(nuevoProveedor);
    if (id) {
      form.setValue('proveedorId', id, { shouldValidate: true });
      setNuevoProveedor('');
    }
  }
  
  async function onSubmit(data: CompraForm) {
    const ok = await store.registrarCompra(data);
    if (ok) {
      form.reset({ ...data, cantidad: 1, costoUnitario: producto?.costoCompraActual ?? data.costoUnitario, imagenFactura: undefined });
    }
  }
  function seleccionarProducto(id: number) {
    const seleccionado = store.productos.find((item) => item.id === id);
    form.setValue('productoId', id, { shouldValidate: true });
    form.setValue('costoUnitario', seleccionado?.costoCompraActual ?? 0, { shouldValidate: true });
  }

  async function crearProducto(input: CrearProductoInput) {
    const id = await store.crearProducto(input);
    if (id) {
      form.setValue('productoId', id, { shouldValidate: true });
      form.setValue('costoUnitario', input.costoCompraActual, { shouldValidate: true });
    }
    return id;
  }

  return (
    <ScreenContainer titulo="Registrar compra" subtitulo="Entrada de producto al inventario.">
      <MensajeAlerta mensaje={store.mensaje} />
      <ProveedorCompraPanel
        loading={store.cargando}
        nuevoProveedor={nuevoProveedor}
        onCrearProveedor={crearProveedor}
        onNuevoProveedor={setNuevoProveedor}
        onSeleccionar={(id) => form.setValue('proveedorId', id, { shouldValidate: true })}
        proveedorId={values.proveedorId}
        proveedores={store.proveedores}
      />
      <ProductoSelector productos={store.productos} value={values.productoId}
        onChange={seleccionarProducto} tipoPrecio="compra" />
      <SeccionExpandible titulo="Crear producto nuevo" resumen="Usalo solo si el producto no existe.">
        <NuevoProductoPanel categorias={store.categorias} loading={store.cargando}
          onCrearCategoria={store.crearCategoria} onCrearProducto={crearProducto}
          proveedorNombre={proveedor?.nombre} />
      </SeccionExpandible>
      <Controller control={form.control} name="cantidad" render={({ field, fieldState }) => (
        <CampoNumero error={fieldState.error?.message}
          label="Cantidad que entra al stock" onChange={field.onChange} value={field.value} />
      )} />
      <Controller control={form.control} name="costoUnitario" render={({ field, fieldState }) => (
        <CampoNumero error={fieldState.error?.message}
          label="Costo unitario pagado" onChange={field.onChange} value={field.value} />
      )} />
      <SelectorMetodoPago value={values.metodoPago} onChange={(value) => form.setValue('metodoPago', value)} />
      <Controller control={form.control} name="imagenFactura" render={({ field }) => (
        <SelectorImagenFactura value={field.value} onChange={field.onChange} />
      )} />
      <ToggleCosto value={values.actualizarCostoVigente}
        onPress={() => form.setValue('actualizarCostoVigente', !values.actualizarCostoVigente)} />
      <ResumenCalculo titulo="Total de compra" calculo={calculo} />
      <AppButton icon={Save} label="Guardar compra" loading={store.cargando}
        onPress={form.handleSubmit(onSubmit)} />
    </ScreenContainer>
  );
}
