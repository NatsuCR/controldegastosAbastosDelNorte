import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colores, radios } from '../constants/tema';
import type { MetodoPago } from '../database/models';

const METODOS: MetodoPago[] = ['Efectivo', 'SINPE Móvil'];

interface Props {
  value: MetodoPago;
  onChange: (value: MetodoPago) => void;
}

export function SelectorMetodoPago({ value, onChange }: Props) {
  return (
    <View style={styles.contenedor}>
      {METODOS.map((metodo) => {
        const activo = metodo === value;
        return (
          <Pressable
            accessibilityRole="button"
            key={metodo}
            onPress={() => onChange(metodo)}
            style={[styles.opcion, activo && styles.activo]}
          >
            <Text style={[styles.texto, activo && styles.textoActivo]}>{metodo}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    backgroundColor: colores.superficieSuave,
    borderRadius: radios.md,
    flexDirection: 'row',
    padding: 4,
  },
  opcion: {
    alignItems: 'center',
    borderRadius: radios.sm,
    flex: 1,
    minHeight: 42,
    justifyContent: 'center',
  },
  activo: {
    backgroundColor: colores.superficie,
  },
  texto: {
    color: colores.textoSecundario,
    fontSize: 14,
    fontWeight: '700',
  },
  textoActivo: {
    color: colores.primarioOscuro,
  },
});
