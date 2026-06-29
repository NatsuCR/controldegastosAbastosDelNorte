import { X } from 'lucide-react-native';
import { Modal, StyleSheet, Text, View, ScrollView } from 'react-native';

import { AppButton } from './AppButton';
import { NuevoProductoPanel } from './NuevoProductoPanel';
import { colores, espacios, radios } from '../constants/tema';
import { useNegocioStore } from '../store/useNegocioStore';
import type { CrearProductoInput } from '../types/negocio';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function CrearProductoModal({ visible, onClose }: Props) {
  const store = useNegocioStore();

  async function crearProducto(input: CrearProductoInput) {
    const id = await store.crearProducto(input);
    if (id) {
      onClose();
    }
    return id;
  }

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.fondo}>
        <View style={styles.modal}>
          <View style={styles.encabezado}>
            <Text style={styles.titulo}>Crear Nuevo Producto</Text>
            <AppButton icon={X} onPress={onClose} variant="secondary" />
          </View>
          <ScrollView contentContainerStyle={styles.scroll}>
            <NuevoProductoPanel
              categorias={store.categorias}
              loading={store.cargando}
              onCrearCategoria={store.crearCategoria}
              onCrearProducto={crearProducto}
              proveedorNombre="Producción Interna"
            />
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
});
