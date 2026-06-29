import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colores, radios, espacios } from '../constants/tema';
import type { ConfiguracionNegocio } from '../types/negocio';
import { AppButton } from './AppButton';
import { CampoNumero } from './CampoNumero';

interface Props {
  configuracion: ConfiguracionNegocio;
  loading: boolean;
  onSave: (input: ConfiguracionNegocio) => Promise<boolean>;
}

export function ConfigFiscalPanel({ configuracion, loading, onSave }: Props) {
  const [ivaDefault, setIvaDefault] = useState(configuracion.tasaIva * 100);
  const [ventaIncluye, setVentaIncluye] = useState(configuracion.precioVentaIncluyeIva);
  const [costoIncluye, setCostoIncluye] = useState(configuracion.costoProveedorIncluyeIva);

  useEffect(() => {
    setIvaDefault(configuracion.tasaIva * 100);
    setVentaIncluye(configuracion.precioVentaIncluyeIva);
    setCostoIncluye(configuracion.costoProveedorIncluyeIva);
  }, [configuracion]);

  return (
    <View style={styles.card}>
      <Text style={styles.titulo}>Impuestos de la tienda</Text>
      <CampoNumero label="IVA para productos nuevos %" value={ivaDefault} onChange={setIvaDefault} />
      <Toggle label="Precios al cliente ya incluyen IVA" value={ventaIncluye}
        onPress={() => setVentaIncluye(!ventaIncluye)} />
      <Toggle label="Costos del proveedor ya incluyen IVA" value={costoIncluye}
        onPress={() => setCostoIncluye(!costoIncluye)} />
      <AppButton label="Guardar reglas" loading={loading} onPress={() => onSave({
        tasaIva: ivaDefault / 100,
        precioVentaIncluyeIva: ventaIncluye,
        costoProveedorIncluyeIva: costoIncluye,
      })} />
    </View>
  );
}

function Toggle({ label, value, onPress }: { label: string; value: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.toggle, value && styles.toggleActivo]}>
      <Text style={styles.toggleTexto}>{label}</Text>
      <Text style={styles.estado}>{value ? 'Si' : 'No'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colores.superficie, borderColor: colores.borde,
    borderRadius: radios.md, borderWidth: 1, gap: espacios.sm, padding: espacios.md },
  titulo: { color: colores.texto, fontSize: 17, fontWeight: '900' },
  toggle: { alignItems: 'center', borderColor: colores.borde, borderRadius: radios.md,
    borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', padding: espacios.md },
  toggleActivo: { backgroundColor: colores.superficieSuave, borderColor: colores.primario },
  toggleTexto: { color: colores.texto, flex: 1, fontSize: 15, fontWeight: '800' },
  estado: { color: colores.primarioOscuro, fontSize: 15, fontWeight: '900' },
});
