import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Trash2 } from 'lucide-react-native';

import { AppButton } from '../components/AppButton';
import { CatalogosConfigPanel } from '../components/CatalogosConfigPanel';
import { ConfigFiscalPanel } from '../components/ConfigFiscalPanel';
import { MensajeAlerta } from '../components/MensajeAlerta';
import { ProductoConfigItem } from '../components/ProductoConfigItem';
import { ScreenContainer } from '../components/ScreenContainer';
import { SeccionExpandible } from '../components/SeccionExpandible';
import { espacios } from '../constants/tema';
import { resetearBaseDatosServidor } from '../database/repositories/resetRepository';
import { useConfiguracionStore } from '../store/useConfiguracionStore';
import { useNegocioStore } from '../store/useNegocioStore';

export function ConfiguracionScreen() {
  const store = useConfiguracionStore();
  const negocioStore = useNegocioStore();

  useFocusEffect(useCallback(() => { store.cargar(); }, [store.cargar]));

  return (
    <ScreenContainer titulo="Configuracion" subtitulo="Catalogos, precios e impuestos.">
      <MensajeAlerta mensaje={store.mensaje} />
      <SeccionExpandible titulo="Impuestos de tienda" resumen="IVA para ventas, compras y productos nuevos.">
        <ConfigFiscalPanel configuracion={store.configuracion} loading={store.cargando}
          onSave={store.guardarConfiguracion} />
      </SeccionExpandible>
      <SeccionExpandible titulo="Productos y precios" resumen="Precio de venta, costo, IVA y stock bajo por producto.">
        <View style={styles.lista}>
          {store.productos.map((producto) => (
            <ProductoConfigItem key={producto.id} producto={producto} loading={store.cargando}
              onSave={store.actualizarProducto} />
          ))}
        </View>
      </SeccionExpandible>
      <SeccionExpandible titulo="Categorias y proveedores" resumen="Catalogos usados en compras e inventario.">
        <CatalogosConfigPanel categorias={store.categorias} proveedores={store.proveedores}
          loading={store.cargando} onCrearCategoria={store.crearCategoria}
          onRenombrarCategoria={store.renombrarCategoria} onCrearProveedor={store.crearProveedor}
          onActualizarProveedor={store.actualizarProveedor} onEliminarProveedor={store.eliminarProveedor} />
      </SeccionExpandible>
      <SeccionExpandible titulo="Peligro" resumen="Zona de borrado total.">
        <AppButton icon={Trash2} label="Borrar toda la base de datos" variant="danger" onPress={() => {
          Alert.alert(
            '¿Borrar TODO?',
            'Esto eliminará productos, ventas, gastos e inventario para siempre. ¡No se puede deshacer!',
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Sí, borrar todo', style: 'destructive', onPress: async () => {
                  try {
                    await resetearBaseDatosServidor();
                    await Promise.all([store.cargar(), negocioStore.cargarDatos()]);
                    Alert.alert('Borrado completo', 'La base de datos se ha reiniciado correctamente.');
                  } catch (e) {
                    Alert.alert('Error', 'No se pudo borrar la base de datos');
                  }
              }}
            ]
          );
        }} />
      </SeccionExpandible>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  lista: { gap: espacios.sm },
});
