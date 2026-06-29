import type { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colores, radios } from '../constants/tema';

interface Props {
  label?: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary' | 'danger';
}

export function AppButton({ label, onPress, disabled, loading, icon: Icon, variant = 'primary' }: Props) {
  const esSecundario = variant === 'secondary';
  const esDanger = variant === 'danger';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={[styles.base, esSecundario && styles.secundario, esDanger && styles.danger, (disabled || loading) && styles.disabled]}
    >
      {loading ? <ActivityIndicator color={esSecundario ? colores.primario : '#FFFFFF'} /> : null}
      {!loading && Icon ? <Icon color={esSecundario ? colores.primario : '#FFFFFF'} size={18} /> : null}
      {label ? <Text style={[styles.texto, esSecundario && styles.textoSecundario]}>{label}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    backgroundColor: colores.primario,
    borderRadius: radios.md,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 16,
  },
  secundario: {
    backgroundColor: colores.superficieSuave,
    borderColor: colores.primario,
    borderWidth: 1,
  },
  danger: {
    backgroundColor: '#EF4444', // red-500
  },
  disabled: {
    opacity: 0.55,
  },
  texto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  textoSecundario: {
    color: colores.primario,
  },
});
