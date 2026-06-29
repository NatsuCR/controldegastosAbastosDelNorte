import { AlertTriangle } from 'lucide-react-native';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

import { colores, radios, espacios } from '../constants/tema';
import type { InventarioProducto } from '../types/negocio';
import { formatearColones, formatearNumero } from '../utils/formato';

interface Props {
  item: InventarioProducto;
  onPress?: () => void;
}

export function InventarioItem({ item, onPress }: Props) {
  const bajo = item.stock <= item.umbralStockBajo;

  return (
    <TouchableOpacity style={[styles.caja, bajo && styles.bajo]} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.encabezado}>
        <Text style={styles.nombre}>{item.nombre}</Text>
        {bajo ? <AlertTriangle color={colores.acento} size={20} /> : null}
      </View>
      <Text style={styles.sku}>SKU: {item.sku ?? 'sin SKU'}</Text>
      <Text style={styles.categoria}>
        {item.categoriaNombre}{item.marca ? ` · Proveedor: ${item.marca}` : ''}
      </Text>
      <Text style={styles.stock}>
        {formatearNumero(item.stock)} {item.unidadMedida}
      </Text>
      <Text style={styles.detalle}>
        Venta {formatearColones(item.precioVentaActual)} · Costo{' '}
        {formatearColones(item.costoCompraActual)} · IVA {formatearNumero(item.tasaIva * 100)}%
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  caja: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.md,
    borderWidth: 1,
    gap: espacios.xs,
    padding: espacios.md,
  },
  bajo: {
    borderColor: colores.acento,
  },
  encabezado: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nombre: {
    color: colores.texto,
    fontSize: 17,
    fontWeight: '800',
  },
  stock: {
    color: colores.primarioOscuro,
    fontSize: 24,
    fontWeight: '900',
  },
  categoria: {
    color: colores.acento,
    fontSize: 13,
    fontWeight: '800',
  },
  sku: {
    color: colores.textoSecundario,
    fontSize: 12,
    fontWeight: '900',
  },
  detalle: {
    color: colores.textoSecundario,
    fontSize: 13,
  },
});
