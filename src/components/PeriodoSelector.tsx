import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colores, radios } from '../constants/tema';
import type { PeriodoDashboard } from '../types/dashboard';

const PERIODOS: Array<{ label: string; value: PeriodoDashboard }> = [
  { label: 'Hoy', value: 'hoy' },
  { label: 'Semana', value: 'semana' },
  { label: 'Mes', value: 'mes' },
  { label: 'Año', value: 'anio' },
];

interface Props {
  value: PeriodoDashboard;
  onChange: (periodo: PeriodoDashboard) => void;
}

export function PeriodoSelector({ value, onChange }: Props) {
  return (
    <View style={styles.base}>
      {PERIODOS.map((periodo) => {
        const activo = periodo.value === value;
        return (
          <Pressable key={periodo.value} onPress={() => onChange(periodo.value)}
            style={[styles.opcion, activo && styles.activo]}>
            <Text style={[styles.texto, activo && styles.textoActivo]}>{periodo.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { backgroundColor: colores.superficieSuave, borderRadius: radios.md,
    flexDirection: 'row', padding: 4 },
  opcion: { alignItems: 'center', borderRadius: radios.sm, flex: 1,
    justifyContent: 'center', minHeight: 42 },
  activo: { backgroundColor: colores.superficie },
  texto: { color: colores.textoSecundario, fontSize: 13, fontWeight: '800' },
  textoActivo: { color: colores.primarioOscuro },
});
