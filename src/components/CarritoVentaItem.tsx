import { Minus, Plus, Trash2, type LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colores, radios, espacios } from '../constants/tema';
import type { Producto } from '../database/models';
import { formatearColones, formatearNumero } from '../utils/formato';

interface Props {
  producto: Producto;
  cantidad: number;
  onCambiarCantidad: (cantidad: number) => void;
  onEliminar: () => void;
}

export function CarritoVentaItem(props: Props) {
  const { producto, cantidad } = props;
  const total = producto.precioVentaActual * cantidad;

  return (
    <View style={styles.item}>
      <View style={styles.info}>
        <Text style={styles.nombre}>{producto.nombre}</Text>
        <Text style={styles.detalle}>SKU: {producto.sku ?? 'sin SKU'}</Text>
        <Text style={styles.detalle}>
          {formatearNumero(cantidad)} x {formatearColones(producto.precioVentaActual)}
        </Text>
        <Text style={styles.total}>{formatearColones(total)}</Text>
      </View>
      <View style={styles.controles}>
        <IconButton icon={Minus} onPress={() => props.onCambiarCantidad(cantidad - 1)} />
        <Text style={styles.cantidad}>{formatearNumero(cantidad)}</Text>
        <IconButton icon={Plus} onPress={() => props.onCambiarCantidad(cantidad + 1)} />
        <IconButton danger icon={Trash2} onPress={props.onEliminar} />
      </View>
    </View>
  );
}

function IconButton(props: { icon: LucideIcon; onPress: () => void; danger?: boolean }) {
  const Icon = props.icon;

  return (
    <Pressable onPress={props.onPress} style={[styles.boton, props.danger && styles.peligro]}>
      <Icon color={props.danger ? colores.peligro : colores.primario} size={18} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: { backgroundColor: colores.superficie, borderColor: colores.borde,
    borderRadius: radios.md, borderWidth: 1, gap: espacios.sm, padding: espacios.md },
  info: { gap: espacios.xs },
  nombre: { color: colores.texto, fontSize: 16, fontWeight: '900' },
  detalle: { color: colores.textoSecundario, fontSize: 13 },
  total: { color: colores.primarioOscuro, fontSize: 17, fontWeight: '900' },
  controles: { alignItems: 'center', flexDirection: 'row', gap: espacios.sm },
  boton: { alignItems: 'center', backgroundColor: colores.superficieSuave,
    borderRadius: radios.sm, height: 38, justifyContent: 'center', width: 38 },
  peligro: { backgroundColor: '#FEE4E2' },
  cantidad: { color: colores.texto, fontSize: 16, fontWeight: '900', minWidth: 38, textAlign: 'center' },
});
