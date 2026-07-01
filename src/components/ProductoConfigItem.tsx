import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colores, radios, espacios } from '../constants/tema';
import type { Producto } from '../database/models';
import type { ActualizarProductoInput } from '../types/negocio';
import { formatearColones } from '../utils/formato';
import { AppButton } from './AppButton';
import { CampoNumero } from './CampoNumero';
import { CampoTexto } from './CampoTexto';

interface Props {
  producto: Producto;
  loading: boolean;
  onSave: (input: ActualizarProductoInput) => Promise<boolean>;
}

export function ProductoConfigItem({ producto, loading, onSave }: Props) {
  const [nombre, setNombre] = useState(producto.nombre);
  const [sku, setSku] = useState(producto.sku ?? '');
  const [venta, setVenta] = useState(producto.precioVentaActual);
  const [costo, setCosto] = useState(producto.costoCompraActual);
  const [iva, setIva] = useState(producto.tasaIva * 100);
  const [umbral, setUmbral] = useState(producto.umbralStockBajo);
  const [activo, setActivo] = useState(producto.activo);
  const [abierto, setAbierto] = useState(false);
  const Icon = abierto ? ChevronUp : ChevronDown;

  useEffect(() => {
    setNombre(producto.nombre);
    setSku(producto.sku ?? '');
    setVenta(producto.precioVentaActual);
    setCosto(producto.costoCompraActual);
    setIva(producto.tasaIva * 100);
    setUmbral(producto.umbralStockBajo);
    setActivo(producto.activo);
  }, [producto]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.nombre}>{producto.nombre}</Text>
        <Pressable onPress={() => setActivo(!activo)} style={[styles.estado, activo && styles.estadoActivo]}>
          <Text style={styles.estadoTexto}>{activo ? 'Activo' : 'Inactivo'}</Text>
        </Pressable>
      </View>
      <Text style={styles.detalle}>
        SKU {producto.sku ?? 'sin SKU'} / venta {formatearColones(producto.precioVentaActual)}
      </Text>
      <Pressable onPress={() => setAbierto(!abierto)} style={styles.expandir}>
        <Text style={styles.expandirTexto}>{abierto ? 'Ocultar' : 'Mostrar mas'}</Text>
        <Icon color={colores.primario} size={18} />
      </Pressable>
      {abierto ? (
        <>
          <CampoTexto label="Nombre" value={nombre} onChangeText={setNombre} />
          <CampoTexto autoCapitalize="characters" label="SKU" value={sku} onChangeText={setSku} />
          {producto.marca ? <Text style={styles.detalle}>Proveedor: {producto.marca}</Text> : null}
          <Text style={styles.margen}>Margen nuevo: {formatearColones(venta - costo)}</Text>
          <CampoNumero label="Precio venta" value={venta} onChange={setVenta} />
          <CampoNumero label="Costo base opcional" value={costo} onChange={setCosto} />
          <CampoNumero label="IVA %" value={iva} onChange={setIva} />
          <CampoNumero label="Stock bajo desde" value={umbral} onChange={setUmbral} />
          <AppButton label="Guardar producto" loading={loading} onPress={() => onSave({
            productoId: producto.id, nombre, sku, marca: producto.marca ?? undefined, precioVentaActual: venta,
            costoCompraActual: costo, tasaIva: iva / 100, umbralStockBajo: umbral, activo,
          })} />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colores.superficie, borderColor: colores.borde,
    borderRadius: radios.md, borderWidth: 1, gap: espacios.sm, padding: espacios.md },
  header: { alignItems: 'center', flexDirection: 'row', gap: espacios.sm, justifyContent: 'space-between' },
  nombre: { color: colores.texto, flex: 1, fontSize: 17, fontWeight: '900' },
  detalle: { color: colores.textoSecundario, fontSize: 13 },
  margen: { color: colores.primarioOscuro, fontSize: 15, fontWeight: '900' },
  estado: { borderColor: colores.borde, borderRadius: radios.sm, borderWidth: 1, padding: espacios.sm },
  estadoActivo: { backgroundColor: colores.superficieSuave, borderColor: colores.primario },
  estadoTexto: { color: colores.texto, fontSize: 12, fontWeight: '900' },
  expandir: { alignItems: 'center', flexDirection: 'row', gap: espacios.xs },
  expandirTexto: { color: colores.primarioOscuro, fontSize: 13, fontWeight: '900' },
});
