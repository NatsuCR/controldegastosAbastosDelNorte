import { Plus } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colores, radios, espacios } from '../constants/tema';
import type { Categoria, Proveedor } from '../database/models';
import { AppButton } from './AppButton';
import { CampoTexto } from './CampoTexto';
import { NombreEditableItem } from './NombreEditableItem';

interface Props {
  categorias: Categoria[];
  proveedores: Proveedor[];
  loading: boolean;
  onCrearCategoria: (nombre: string) => Promise<number | null>;
  onRenombrarCategoria: (id: number, nombre: string) => Promise<boolean>;
  onCrearProveedor: (nombre: string) => Promise<number | null>;
  onActualizarProveedor: (id: number, nombre: string, telefono?: string) => Promise<boolean>;
  onEliminarProveedor: (id: number) => Promise<boolean>;
}

export function CatalogosConfigPanel(props: Props) {
  const [categoria, setCategoria] = useState('');
  const [proveedor, setProveedor] = useState('');

  async function crearCategoria() {
    const id = await props.onCrearCategoria(categoria);
    if (id) {
      setCategoria('');
    }
  }

  async function crearProveedor() {
    const id = await props.onCrearProveedor(proveedor);
    if (id) {
      setProveedor('');
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.titulo}>Categorias</Text>
      <CampoTexto label="Nueva categoria" value={categoria} onChangeText={setCategoria} />
      <AppButton icon={Plus} label="Crear categoria" loading={props.loading}
        onPress={crearCategoria} variant="secondary" />
      {props.categorias.map((item) => (
        <NombreEditableItem key={item.id} label="Categoria" loading={props.loading}
          value={item.nombre} onSave={(nombre) => props.onRenombrarCategoria(item.id, nombre)} />
      ))}
      <Text style={styles.titulo}>Proveedores</Text>
      <CampoTexto label="Nuevo proveedor" value={proveedor} onChangeText={setProveedor} />
      <AppButton icon={Plus} label="Crear proveedor" loading={props.loading}
        onPress={crearProveedor} variant="secondary" />
      {props.proveedores.map((item) => (
        <ProveedorItem key={item.id} proveedor={item} loading={props.loading}
          onSave={props.onActualizarProveedor} onDelete={props.onEliminarProveedor} />
      ))}
    </View>
  );
}

function ProveedorItem(props: {
  proveedor: Proveedor;
  loading: boolean;
  onSave: (id: number, nombre: string, telefono?: string) => Promise<boolean>;
  onDelete: (id: number) => Promise<boolean>;
}) {
  const { proveedor } = props;
  return (
    <NombreEditableItem label="Proveedor" loading={props.loading} value={proveedor.nombre}
      onSave={(nombre) => props.onSave(proveedor.id, nombre, proveedor.telefono ?? undefined)} 
      onDelete={() => {
        import('react-native').then(({ Alert }) => {
          Alert.alert('¿Eliminar proveedor?', 'Se eliminarán sus compras y su inventario.', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Sí, eliminar', style: 'destructive', onPress: () => props.onDelete(proveedor.id) }
          ]);
        });
      }} />
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colores.superficie, borderColor: colores.borde,
    borderRadius: radios.md, borderWidth: 1, gap: espacios.sm, padding: espacios.md },
  titulo: { color: colores.texto, fontSize: 17, fontWeight: '900' },
});
