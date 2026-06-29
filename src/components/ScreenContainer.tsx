import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colores, espacios } from '../constants/tema';

interface Props {
  titulo: string;
  subtitulo?: string;
  children: ReactNode;
}

export function ScreenContainer({ titulo, subtitulo, children }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.contenido}>
        <View style={styles.encabezado}>
          <Text style={styles.marca}>Abastos del Norte</Text>
          <Text style={styles.titulo}>{titulo}</Text>
          {subtitulo ? <Text style={styles.subtitulo}>{subtitulo}</Text> : null}
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colores.fondo,
  },
  contenido: {
    gap: espacios.md,
    padding: espacios.md,
    paddingBottom: 96,
  },
  encabezado: {
    gap: espacios.xs,
  },
  marca: {
    color: colores.primario,
    fontSize: 14,
    fontWeight: '700',
  },
  titulo: {
    color: colores.texto,
    fontSize: 28,
    fontWeight: '800',
  },
  subtitulo: {
    color: colores.textoSecundario,
    fontSize: 15,
    lineHeight: 21,
  },
});
