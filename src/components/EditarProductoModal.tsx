import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Trash2, X, PlusCircle } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Modal, StyleSheet, Text, View, ScrollView } from 'react-native';

import { AppButton } from './AppButton';
import { CampoNumero } from './CampoNumero';
import { CampoTexto } from './CampoTexto';
import { colores, espacios, radios } from '../constants/tema';
import { productoSchema, type ProductoForm } from '../screens/formSchemas';
import { useNegocioStore } from '../store/useNegocioStore';
import type { InventarioProducto } from '../types/negocio';

interface Props {
  visible: boolean;
  producto: InventarioProducto | null;
  onClose: () => void;
}

export function EditarProductoModal({ visible, producto, onClose }: Props) {
  const store = useNegocioStore();
  const [ajusteStock, setAjusteStock] = useState('');
  
  const form = useForm<ProductoForm>({
    resolver: zodResolver(productoSchema),
    defaultValues: {
      categoriaId: 1, // default falso, se sobreescribe abajo
      nombre: '', sku: '', marca: '', unidadMedida: 'unidad',
      cantidadPorPresentacion: 1, precioVentaActual: 0, costoCompraActual: 0,
      tasaIvaPorcentaje: 0, umbralStockBajo: 1,
    },
  });

  useEffect(() => {
    if (producto && visible) {
      setAjusteStock('');
      form.reset({
        categoriaId: 1, // El inventario no nos da la categoriaId real, pero para actualizar (excepto categoría) basta con llenar los campos que el formSchema pide, o ignoramos validación de categoriaId en edicion si no se puede cambiar
        nombre: producto.nombre,
        sku: producto.sku ?? '',
        marca: producto.marca ?? '',
        unidadMedida: producto.unidadMedida,
        cantidadPorPresentacion: 1, // Dummy
        precioVentaActual: producto.precioVentaActual,
        costoCompraActual: producto.costoCompraActual,
        tasaIvaPorcentaje: producto.tasaIva * 100,
        umbralStockBajo: producto.umbralStockBajo,
      });
    }
  }, [producto, visible, form]);

  if (!producto) return null;

  async function guardar(data: ProductoForm) {
    if (!producto) return;
    const ok = await store.actualizarProducto({
      productoId: producto.productoId,
      nombre: data.nombre,
      sku: data.sku,
      marca: data.marca,
      precioVentaActual: data.precioVentaActual,
      costoCompraActual: data.costoCompraActual,
      tasaIva: data.tasaIvaPorcentaje / 100,
      umbralStockBajo: data.umbralStockBajo,
      activo: true,
    });
    if (ok) {
      onClose();
    }
  }

  function eliminar() {
    if (!producto) return;
    Alert.alert(
      '¿Eliminar producto?',
      'Se borrarán todas sus ventas, compras y el inventario. Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sí, eliminar', style: 'destructive', onPress: async () => {
            const ok = await store.eliminarProducto(producto.productoId);
            if (ok) onClose();
        }}
      ]
    );
  }

  async function ajustarStock() {
    const cantidad = Number(ajusteStock);
    if (!producto || isNaN(cantidad) || cantidad <= 0) {
      Alert.alert('Error', 'Ingresa una cantidad válida mayor a cero.');
      return;
    }
    const ok = await store.registrarAjusteInventario(producto.productoId, cantidad, 'Producción propia / Ajuste manual');
    if (ok) {
      setAjusteStock('');
      onClose();
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.fondo}>
        <View style={styles.modal}>
          <View style={styles.encabezado}>
            <Text style={styles.titulo}>Editar Producto</Text>
            <AppButton icon={X} onPress={onClose} variant="secondary" />
          </View>
          <ScrollView contentContainerStyle={styles.scroll}>
            <Controller control={form.control} name="nombre" render={({ field, fieldState }) => (
              <CampoTexto error={fieldState.error?.message} label="Nombre del producto"
                onChangeText={field.onChange} value={field.value} />
            )} />
            <Controller control={form.control} name="sku" render={({ field }) => (
              <CampoTexto autoCapitalize="characters" label="SKU" onChangeText={field.onChange}
                value={field.value ?? ''} />
            )} />
            <Controller control={form.control} name="marca" render={({ field }) => (
              <CampoTexto label="Marca / Proveedor" onChangeText={field.onChange}
                value={field.value ?? ''} />
            )} />
            <View style={styles.fila}>
              <View style={styles.mitad}>
                <Controller control={form.control} name="precioVentaActual" render={({ field, fieldState }) => (
                  <CampoNumero error={fieldState.error?.message} label="Precio de venta"
                    onChange={field.onChange} value={field.value} />
                )} />
              </View>
              <View style={styles.mitad}>
                <Controller control={form.control} name="costoCompraActual" render={({ field, fieldState }) => (
                  <CampoNumero error={fieldState.error?.message} label="Costo de compra"
                    onChange={field.onChange} value={field.value} />
                )} />
              </View>
            </View>
            <View style={styles.fila}>
              <View style={styles.mitad}>
                <Controller control={form.control} name="tasaIvaPorcentaje" render={({ field, fieldState }) => (
                  <CampoNumero error={fieldState.error?.message} label="IVA %"
                    onChange={field.onChange} value={field.value} />
                )} />
              </View>
              <View style={styles.mitad}>
                <Controller control={form.control} name="umbralStockBajo" render={({ field, fieldState }) => (
                  <CampoNumero error={fieldState.error?.message} label="Avisar stock bajo en"
                    onChange={field.onChange} value={field.value} />
                )} />
              </View>
            </View>

            <View style={styles.seccionAjuste}>
              <Text style={styles.tituloSecundario}>Ajuste manual de stock</Text>
              <Text style={styles.textoAyuda}>Úsalo para registrar producción propia o entradas sin proveedor.</Text>
              <View style={styles.filaAjuste}>
                <View style={styles.mitad}>
                  <CampoTexto label="Cantidad a sumar" keyboardType="numeric" value={ajusteStock} onChangeText={setAjusteStock} />
                </View>
                <View style={styles.botonAjuste}>
                  <AppButton icon={PlusCircle} label="Sumar" onPress={ajustarStock} loading={store.cargando} />
                </View>
              </View>
            </View>

            <View style={styles.acciones}>
              <AppButton icon={Trash2} label="Eliminar" variant="danger" onPress={eliminar} loading={store.cargando} />
              <AppButton icon={Save} label="Guardar" onPress={form.handleSubmit(guardar)} loading={store.cargando} />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: colores.superficie, borderTopLeftRadius: radios.md, borderTopRightRadius: radios.md, maxHeight: '80%' },
  encabezado: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: espacios.md, borderBottomWidth: 1, borderColor: colores.borde },
  titulo: { color: colores.texto, fontSize: 18, fontWeight: '800' },
  scroll: { padding: espacios.md, gap: espacios.sm },
  fila: { flexDirection: 'row', gap: espacios.sm },
  mitad: { flex: 1 },
  acciones: { flexDirection: 'row', justifyContent: 'space-between', marginTop: espacios.sm },
  seccionAjuste: { marginTop: espacios.md, padding: espacios.sm, backgroundColor: colores.fondo, borderRadius: radios.sm, borderWidth: 1, borderColor: colores.borde },
  tituloSecundario: { color: colores.texto, fontSize: 16, fontWeight: '700' },
  textoAyuda: { color: colores.textoSecundario, fontSize: 12, marginBottom: espacios.sm },
  filaAjuste: { flexDirection: 'row', gap: espacios.sm, alignItems: 'flex-end' },
  botonAjuste: { paddingBottom: 4 },
});
