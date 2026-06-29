import { Pressable, StyleSheet, Text } from 'react-native';

import { colores, radios, espacios } from '../constants/tema';

interface Props {
  value: boolean;
  onPress: () => void;
}

export function ToggleCosto({ value, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={[styles.base, value && styles.activo]}>
      <Text style={styles.texto}>Actualizar costo vigente</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.md,
    borderWidth: 1,
    padding: espacios.md,
  },
  activo: {
    backgroundColor: colores.superficieSuave,
    borderColor: colores.primario,
  },
  texto: {
    color: colores.texto,
    fontSize: 15,
    fontWeight: '800',
  },
});
