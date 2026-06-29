import { StyleSheet, Text, View } from 'react-native';

import { colores, radios, espacios } from '../constants/tema';
import { formatearColones } from '../utils/formato';

interface Props {
  label: string;
  value: number;
  destacado?: boolean;
}

export function MetricaCard({ label, value, destacado }: Props) {
  return (
    <View style={[styles.card, destacado && styles.destacada]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.valor, destacado && styles.valorDestacado]}>
        {formatearColones(value)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colores.superficie, borderColor: colores.borde,
    borderRadius: radios.md, borderWidth: 1, flex: 1, gap: espacios.xs,
    minWidth: '47%', padding: espacios.md },
  destacada: { backgroundColor: colores.superficieSuave, borderColor: colores.primario },
  label: { color: colores.textoSecundario, fontSize: 13, fontWeight: '700' },
  valor: { color: colores.texto, fontSize: 20, fontWeight: '900' },
  valorDestacado: { color: colores.primarioOscuro, fontSize: 24 },
});
