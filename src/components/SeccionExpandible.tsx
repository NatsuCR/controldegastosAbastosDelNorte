import { ChevronDown, ChevronUp } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colores, radios, espacios } from '../constants/tema';

interface Props {
  titulo: string;
  resumen?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function SeccionExpandible({ titulo, resumen, defaultOpen = false, children }: Props) {
  const [abierta, setAbierta] = useState(defaultOpen);
  const Icon = abierta ? ChevronUp : ChevronDown;

  return (
    <View style={styles.seccion}>
      <Pressable onPress={() => setAbierta(!abierta)} style={styles.header}>
        <View style={styles.textos}>
          <Text style={styles.titulo}>{titulo}</Text>
          {resumen ? <Text style={styles.resumen}>{resumen}</Text> : null}
        </View>
        <View style={styles.accion}>
          <Text style={styles.accionTexto}>{abierta ? 'Ocultar' : 'Mostrar mas'}</Text>
          <Icon color={colores.primario} size={19} />
        </View>
      </Pressable>
      {abierta ? <View style={styles.contenido}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  seccion: { gap: espacios.sm },
  header: { alignItems: 'center', backgroundColor: colores.superficie,
    borderColor: colores.borde, borderRadius: radios.md, borderWidth: 1,
    flexDirection: 'row', gap: espacios.sm, padding: espacios.md },
  textos: { flex: 1, gap: espacios.xs },
  titulo: { color: colores.texto, fontSize: 17, fontWeight: '900' },
  resumen: { color: colores.textoSecundario, fontSize: 13, lineHeight: 18 },
  accion: { alignItems: 'center', flexDirection: 'row', gap: espacios.xs },
  accionTexto: { color: colores.primarioOscuro, fontSize: 12, fontWeight: '900' },
  contenido: { gap: espacios.sm },
});
