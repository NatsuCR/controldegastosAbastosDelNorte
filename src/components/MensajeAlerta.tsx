import { StyleSheet, Text, View } from 'react-native';

import { colores, radios, espacios } from '../constants/tema';
import type { MensajeUsuario } from '../types/negocio';

interface Props {
  mensaje: MensajeUsuario | null;
}

export function MensajeAlerta({ mensaje }: Props) {
  if (!mensaje) {
    return null;
  }

  const esError = mensaje.tipo === 'error';

  return (
    <View style={[styles.caja, esError ? styles.error : styles.exito]}>
      <Text style={[styles.texto, esError ? styles.textoError : styles.textoExito]}>
        {mensaje.texto}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  caja: {
    borderRadius: radios.md,
    borderWidth: 1,
    padding: espacios.md,
  },
  error: {
    backgroundColor: '#FFF4F2',
    borderColor: '#F5B7AE',
  },
  exito: {
    backgroundColor: '#EFF8F0',
    borderColor: '#A7D8A9',
  },
  texto: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  textoError: {
    color: colores.peligro,
  },
  textoExito: {
    color: colores.exito,
  },
});
