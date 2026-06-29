import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colores, radios, espacios } from '../constants/tema';
import type { Categoria } from '../database/models';

interface Props {
  categorias: Categoria[];
  value: number;
  onChange: (id: number) => void;
}

export function CategoriaSelector({ categorias, value, onChange }: Props) {
  return (
    <View style={styles.lista}>
      {categorias.map((categoria) => (
        <Pressable
          key={categoria.id}
          onPress={() => onChange(categoria.id)}
          style={[styles.item, categoria.id === value && styles.activo]}
        >
          <Text style={styles.texto}>{categoria.nombre}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  lista: {
    gap: espacios.sm,
  },
  item: {
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
