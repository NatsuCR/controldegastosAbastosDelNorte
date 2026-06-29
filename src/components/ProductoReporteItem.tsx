import { StyleSheet, Text, View } from 'react-native';

import { colores, radios, espacios } from '../constants/tema';
import type { ProductoReporte } from '../types/reportes';
import { formatearColones, formatearNumero } from '../utils/formato';

interface Props {
  producto: ProductoReporte;
}

export function ProductoReporteItem({ producto }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.nombre}>{producto.nombre}</Text>
        <Text style={styles.monto}>{formatearColones(producto.montoVendido)}</Text>
      </View>
      <Text style={styles.detalle}>SKU: {producto.sku ?? 'sin SKU'}</Text>
      <Text style={styles.detalle}>
        {producto.categoriaNombre}{producto.marca ? ` / Proveedor: ${producto.marca}` : ''}
      </Text>
      <Text style={styles.detalle}>
        {formatearNumero(producto.cantidadVendida)} {producto.unidadMedida} vendidos
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colores.superficie, borderColor: colores.borde,
    borderRadius: radios.md, borderWidth: 1, gap: espacios.xs, padding: espacios.md },
  header: { flexDirection: 'row', gap: espacios.sm, justifyContent: 'space-between' },
  nombre: { color: colores.texto, flex: 1, fontSize: 16, fontWeight: '900' },
  monto: { color: colores.primarioOscuro, fontSize: 16, fontWeight: '900' },
  detalle: { color: colores.textoSecundario, fontSize: 13 },
});
