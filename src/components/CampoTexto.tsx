import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

import { colores, radios, espacios } from '../constants/tema';

interface Props extends TextInputProps {
  label: string;
  error?: string;
}

export function CampoTexto({ label, error, style, ...props }: Props) {
  return (
    <View style={styles.grupo}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor="#7B8794"
        style={[styles.input, error ? styles.inputError : null, style]}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  grupo: {
    gap: espacios.xs,
  },
  label: {
    color: colores.texto,
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.md,
    borderWidth: 1,
    color: colores.texto,
    fontSize: 17,
    minHeight: 48,
    paddingHorizontal: espacios.md,
  },
  inputError: {
    borderColor: colores.peligro,
  },
  error: {
    color: colores.peligro,
    fontSize: 13,
  },
});
