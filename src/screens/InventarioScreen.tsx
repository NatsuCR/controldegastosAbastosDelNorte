import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BadgeDollarSign, Plus, RefreshCcw } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../components/AppButton';
import { CampoTexto } from '../components/CampoTexto';
import { InventarioItem } from '../components/InventarioItem';
import { MensajeAlerta } from '../components/MensajeAlerta';
import { ScreenContainer } from '../components/ScreenContainer';
import { EditarProductoModal } from '../components/EditarProductoModal';
import { CrearProductoModal } from '../components/CrearProductoModal';
import { colores, espacios } from '../constants/tema';
import type { TabParamList } from '../navigation/types';
import { useNegocioStore } from '../store/useNegocioStore';
import type { InventarioProducto } from '../types/negocio';

type Nav = BottomTabNavigationProp<TabParamList, 'Inventario'>;

export function InventarioScreen() {
  const navigation = useNavigation<Nav>();
  const { inventario, cargarDatos, cargando, mensaje } = useNegocioStore();
  const [busqueda, setBusqueda] = useState('');
  const [productoEditando, setProductoEditando] = useState<InventarioProducto | null>(null);
  const [creandoProducto, setCreandoProducto] = useState(false);

  const inventarioFiltrado = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) {
      return inventario;
    }
    return inventario.filter((item) => {
      const marca = item.marca?.toLowerCase() ?? '';
      const sku = item.sku?.toLowerCase() ?? '';
      return item.nombre.toLowerCase().includes(texto)
        || item.categoriaNombre.toLowerCase().includes(texto)
        || sku.includes(texto)
        || marca.includes(texto);
    });
  }, [busqueda, inventario]);

  useFocusEffect(useCallback(() => { cargarDatos(); }, [cargarDatos]));

  return (
    <ScreenContainer titulo="Inventario" subtitulo="Stock actual por producto activo.">
      <MensajeAlerta mensaje={mensaje} />
      <View style={styles.acciones}>
        <AppButton icon={Plus} label="Registrar compra" onPress={() => navigation.navigate('Compra')} />
        <AppButton icon={Plus} label="Nuevo Producto" onPress={() => setCreandoProducto(true)} variant="secondary" />
        <AppButton icon={BadgeDollarSign} label="Actualizar precios"
          onPress={() => navigation.navigate('Configuracion')} variant="secondary" />
        <AppButton icon={RefreshCcw} label="Refrescar" loading={cargando} onPress={cargarDatos} variant="secondary" />
      </View>
      <CampoTexto label="Buscar en inventario" value={busqueda} onChangeText={setBusqueda} />
      <View style={styles.lista}>
        {inventarioFiltrado.map((item) => (
          <InventarioItem item={item} key={item.productoId} onPress={() => setProductoEditando(item)} />
        ))}
        {inventario.length === 0 ? (
          <Text style={styles.vacio}>No hay productos activos para mostrar.</Text>
        ) : null}
        {inventario.length > 0 && inventarioFiltrado.length === 0 ? (
          <Text style={styles.vacio}>No encontre productos con ese texto.</Text>
        ) : null}
      </View>
      <EditarProductoModal
        visible={!!productoEditando}
        producto={productoEditando}
        onClose={() => setProductoEditando(null)}
      />
      <CrearProductoModal
        visible={creandoProducto}
        onClose={() => setCreandoProducto(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  acciones: {
    gap: espacios.sm,
  },
  lista: {
    gap: espacios.sm,
  },
  vacio: {
    color: colores.textoSecundario,
    fontSize: 15,
    lineHeight: 21,
  },
});
