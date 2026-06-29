import { Plus, Truck } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { colores, radios, espacios } from '../constants/tema';
import type { Proveedor } from '../database/models';
import { AppButton } from './AppButton';
import { CampoTexto } from './CampoTexto';
import { ProveedorSelector } from './ProveedorSelector';

interface Props {
  proveedores: Proveedor[];
  proveedorId: number;
  nuevoProveedor: string;
  loading: boolean;
  onSeleccionar: (id: number) => void;
  onNuevoProveedor: (nombre: string) => void;
  onCrearProveedor: () => void;
}

export function ProveedorCompraPanel(props: Props) {
  const seleccionado = props.proveedores.find((item) => item.id === props.proveedorId);

  return (
    <View style={styles.card}>
      <View style={styles.encabezado}>
        <Truck color={colores.primario} size={20} />
        <View style={styles.titulos}>
          <Text style={styles.titulo}>Proveedor de esta compra</Text>
          <Text style={styles.subtitulo}>{seleccionado?.nombre ?? 'Selecciona o crea uno'}</Text>
        </View>
      </View>
      {props.proveedores.length > 0 ? (
        <ProveedorSelector
          proveedores={props.proveedores}
          value={props.proveedorId}
          onChange={props.onSeleccionar}
        />
      ) : (
        <Text style={styles.vacio}>Aun no hay proveedores registrados.</Text>
      )}
      <View style={styles.nuevo}>
        <CampoTexto
          label="Nuevo proveedor"
          onChangeText={props.onNuevoProveedor}
          value={props.nuevoProveedor}
        />
        <AppButton
          disabled={!props.nuevoProveedor.trim()}
          icon={Plus}
          label="Crear y usar"
          loading={props.loading}
          onPress={props.onCrearProveedor}
          variant="secondary"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colores.superficie, borderColor: colores.borde,
    borderRadius: radios.md, borderWidth: 1, gap: espacios.sm, padding: espacios.md },
  encabezado: { alignItems: 'center', flexDirection: 'row', gap: espacios.sm },
  titulos: { flex: 1, gap: espacios.xs },
  titulo: { color: colores.texto, fontSize: 17, fontWeight: '900' },
  subtitulo: { color: colores.textoSecundario, fontSize: 13, fontWeight: '700' },
  nuevo: { gap: espacios.sm },
  vacio: { color: colores.textoSecundario, fontSize: 14 },
});
