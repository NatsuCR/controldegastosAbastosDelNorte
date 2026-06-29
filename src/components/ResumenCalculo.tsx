import { StyleSheet, Text, View } from 'react-native';

import { colores, radios, espacios } from '../constants/tema';
import type { ResultadoCalculoFiscal } from '../types/fiscales';
import { formatearColones } from '../utils/formato';

interface Props {
  titulo: string;
  calculo: ResultadoCalculoFiscal | null;
}

export function ResumenCalculo({ titulo, calculo }: Props) {
  if (!calculo) {
    return null;
  }

  return (
    <View style={styles.caja}>
      <Text style={styles.titulo}>{titulo}</Text>
      <Fila label="Subtotal sin IVA" valor={calculo.subtotal} />
      <Fila label="IVA" valor={calculo.ivaMonto} />
      <Fila label="Total" valor={calculo.total} destacado />
    </View>
  );
}

function Fila({ label, valor, destacado }: { label: string; valor: number; destacado?: boolean }) {
  return (
    <View style={styles.fila}>
      <Text style={[styles.label, destacado && styles.destacado]}>{label}</Text>
      <Text style={[styles.valor, destacado && styles.destacado]}>
        {formatearColones(valor)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  caja: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.md,
    borderWidth: 1,
    gap: espacios.sm,
    padding: espacios.md,
  },
  titulo: {
    color: colores.texto,
    fontSize: 16,
    fontWeight: '800',
  },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: colores.textoSecundario,
    fontSize: 14,
  },
  valor: {
    color: colores.texto,
    fontSize: 15,
    fontWeight: '700',
  },
  destacado: {
    color: colores.primarioOscuro,
    fontSize: 17,
    fontWeight: '900',
  },
});
