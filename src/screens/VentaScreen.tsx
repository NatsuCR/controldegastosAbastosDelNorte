import { useFocusEffect } from '@react-navigation/native';
import { Check, Plus } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../components/AppButton';
import { CampoNumero } from '../components/CampoNumero';
import { CampoTexto } from '../components/CampoTexto';
import { CarritoVentaItem } from '../components/CarritoVentaItem';
import { MensajeAlerta } from '../components/MensajeAlerta';
import { ProductoSelector } from '../components/ProductoSelector';
import { ResumenCalculo } from '../components/ResumenCalculo';
import { ScreenContainer } from '../components/ScreenContainer';
import { SelectorMetodoPago } from '../components/SelectorMetodoPago';
import { colores, espacios } from '../constants/tema';
import type { MetodoPago } from '../database/models';
import { calcularVenta, redondearMoneda } from '../services';
import { useNegocioStore } from '../store/useNegocioStore';
import type { ResultadoCalculoFiscal } from '../types/fiscales';
import { esPagoSinpe } from '../utils/telefono';

interface LineaCarrito {
  productoId: number;
  cantidad: number;
}

export function VentaScreen() {
  const store = useNegocioStore();
  const [productoId, setProductoId] = useState(0);
  const [cantidad, setCantidad] = useState(1);
  const [carrito, setCarrito] = useState<LineaCarrito[]>([]);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('Efectivo');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [nota, setNota] = useState('');
  const producto = store.productos.find((item) => item.id === productoId);
  const calculo = useMemo(() => calcularCarrito(carrito, store), [carrito, store]);

  useFocusEffect(useCallback(() => { store.cargarDatos(); }, [store.cargarDatos]));

  function agregarProducto() {
    if (!producto || cantidad <= 0) {
      return;
    }

    setCarrito((actual) => {
      const existe = actual.find((linea) => linea.productoId === producto.id);
      if (existe) {
        return actual.map((linea) => linea.productoId === producto.id
          ? { ...linea, cantidad: linea.cantidad + cantidad } : linea);
      }
      return [...actual, { productoId: producto.id, cantidad }];
    });
    setCantidad(1);
  }

  function cambiarCantidad(productoIdLinea: number, nuevaCantidad: number) {
    if (nuevaCantidad <= 0) {
      setCarrito((actual) => actual.filter((linea) => linea.productoId !== productoIdLinea));
      return;
    }
    setCarrito((actual) => actual.map((linea) => linea.productoId === productoIdLinea
      ? { ...linea, cantidad: nuevaCantidad } : linea));
  }

  async function cobrar() {
    const ok = await store.registrarVentaCarrito({ lineas: carrito, metodoPago, clienteTelefono, nota });
    if (ok) {
      setCarrito([]);
      setClienteTelefono('');
      setNota('');
    }
  }

  return (
    <ScreenContainer titulo="Caja de venta" subtitulo="Agrega productos al carrito y cobra en una sola venta.">
      <MensajeAlerta mensaje={store.mensaje} />
      <ProductoSelector productos={store.productos} value={productoId}
        onChange={setProductoId} tipoPrecio="venta" />
      <CampoNumero label={`Cantidad a vender${producto ? ` (${producto.unidadMedida})` : ''}`} value={cantidad} onChange={setCantidad} />
      <AppButton disabled={!producto || cantidad <= 0} icon={Plus}
        label="Agregar al carrito" onPress={agregarProducto} variant="secondary" />
      <Text style={styles.seccion}>Carrito</Text>
      <View style={styles.lista}>
        {carrito.map((linea) => {
          const item = store.productos.find((producto) => producto.id === linea.productoId);
          return item ? (
            <CarritoVentaItem key={linea.productoId} cantidad={linea.cantidad}
              onCambiarCantidad={(valor) => cambiarCantidad(linea.productoId, valor)}
              onEliminar={() => cambiarCantidad(linea.productoId, 0)} producto={item} />
          ) : null;
        })}
        {carrito.length === 0 ? <Text style={styles.vacio}>Todavia no hay productos.</Text> : null}
      </View>
      <SelectorMetodoPago value={metodoPago} onChange={setMetodoPago} />
      {esPagoSinpe(metodoPago) ? (
        <CampoTexto keyboardType="phone-pad" label="Celular del cliente"
          onChangeText={setClienteTelefono} value={clienteTelefono} />
      ) : null}
      <CampoTexto label="Nota opcional" onChangeText={setNota} value={nota} />
      <ResumenCalculo titulo="Total a cobrar" calculo={calculo} />
      <AppButton disabled={carrito.length === 0} icon={Check} label="Cobrar venta"
        loading={store.cargando} onPress={cobrar} />
    </ScreenContainer>
  );
}

function calcularCarrito(lineas: LineaCarrito[], store: ReturnType<typeof useNegocioStore.getState>) {
  if (lineas.length === 0) {
    return null;
  }

  return lineas.reduce<ResultadoCalculoFiscal>((total, linea) => {
    const producto = store.productos.find((item) => item.id === linea.productoId);
    if (!producto) {
      return total;
    }
    const calculo = calcularVenta(producto.precioVentaActual, linea.cantidad,
      producto.tasaIva, store.configuracion.precioVentaIncluyeIva);
    return {
      subtotal: redondearMoneda(total.subtotal + calculo.subtotal),
      ivaMonto: redondearMoneda(total.ivaMonto + calculo.ivaMonto),
      total: redondearMoneda(total.total + calculo.total),
    };
  }, { subtotal: 0, ivaMonto: 0, total: 0 });
}

const styles = StyleSheet.create({
  lista: { gap: espacios.sm },
  seccion: { color: colores.texto, fontSize: 18, fontWeight: '900' },
  vacio: { color: colores.textoSecundario, fontSize: 14 },
});
