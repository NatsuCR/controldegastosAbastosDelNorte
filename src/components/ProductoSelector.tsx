import { Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colores, radios, espacios } from '../constants/tema';
import type { Producto } from '../database/models';
import { formatearColones, formatearNumero } from '../utils/formato';

interface Props {
  productos: Producto[];
  value: number;
  onChange: (productoId: number) => void;
  tipoPrecio: 'venta' | 'compra';
}

export function ProductoSelector({ productos, value, onChange, tipoPrecio }: Props) {
  const [busqueda, setBusqueda] = useState('');
  const productosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) {
      return productos;
    }

    return productos.filter((producto) => {
      const marca = producto.marca?.toLowerCase() ?? '';
      const sku = producto.sku?.toLowerCase() ?? '';
      return producto.nombre.toLowerCase().includes(texto) || marca.includes(texto) || sku.includes(texto);
    });
  }, [busqueda, productos]);

  return (
    <View style={styles.lista}>
      <View style={styles.buscador}>
        <Search color={colores.textoSecundario} size={18} />
        <TextInput
          onChangeText={setBusqueda}
          placeholder="Buscar producto o proveedor"
          placeholderTextColor="#7B8794"
          style={styles.input}
          value={busqueda}
        />
      </View>
      {productosFiltrados.map((producto) => (
        <ProductoItem
          key={producto.id}
          producto={producto}
          activo={producto.id === value}
          onPress={() => onChange(producto.id)}
          tipoPrecio={tipoPrecio}
        />
      ))}
      {productosFiltrados.length === 0 ? (
        <Text style={styles.vacio}>No encontre productos con ese texto.</Text>
      ) : null}
    </View>
  );
}

function ProductoItem(props: {
  producto: Producto;
  activo: boolean;
  onPress: () => void;
  tipoPrecio: 'venta' | 'compra';
}) {
  const { producto, activo, tipoPrecio } = props;
  const precio = tipoPrecio === 'venta' ? producto.precioVentaActual : producto.costoCompraActual;
  const medida = producto.unidadMedida === 'unidad' && producto.cantidadPorPresentacion === 1
    ? ''
    : ` / ${formatearNumero(producto.cantidadPorPresentacion)} ${producto.unidadMedida}`;

  return (
    <Pressable accessibilityRole="button" onPress={props.onPress}
      style={[styles.item, activo && styles.itemActivo]}>
      <Text style={[styles.nombre, activo && styles.textoActivo]}>{producto.nombre}</Text>
      <Text style={styles.marca}>SKU: {producto.sku ?? 'sin SKU'}</Text>
      {producto.marca ? <Text style={styles.marca}>Proveedor: {producto.marca}</Text> : null}
      <Text style={styles.detalle}>
        {formatearColones(precio)}{medida} / IVA {formatearNumero(producto.tasaIva * 100)}%
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  lista: { gap: espacios.sm },
  buscador: { alignItems: 'center', backgroundColor: colores.superficie,
    borderColor: colores.borde, borderRadius: radios.md, borderWidth: 1,
    flexDirection: 'row', gap: espacios.sm, minHeight: 48, paddingHorizontal: espacios.md },
  input: { color: colores.texto, flex: 1, fontSize: 16 },
  item: { backgroundColor: colores.superficie, borderColor: colores.borde,
    borderRadius: radios.md, borderWidth: 1, gap: espacios.xs, padding: espacios.md },
  itemActivo: { backgroundColor: colores.superficieSuave, borderColor: colores.primario },
  nombre: { color: colores.texto, fontSize: 17, fontWeight: '800' },
  detalle: { color: colores.textoSecundario, fontSize: 14 },
  marca: { color: colores.acento, fontSize: 13, fontWeight: '800' },
  textoActivo: { color: colores.primarioOscuro },
  vacio: { color: colores.textoSecundario, fontSize: 14, lineHeight: 20 },
});
