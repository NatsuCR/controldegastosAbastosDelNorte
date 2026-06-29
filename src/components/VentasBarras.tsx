import { StyleSheet, Text, View } from 'react-native';

import { colores, radios, espacios } from '../constants/tema';
import type { VentaDia } from '../types/dashboard';
import { formatearColones } from '../utils/formato';

interface Props {
  data: VentaDia[];
}

export function VentasBarras({ data }: Props) {
  const maximoReal = Math.max(...data.map((dia) => dia.total), 0);
  const maximo = Math.max(maximoReal, 1);
  const diaMasAlto = data.reduce(
    (mejor, dia) => (dia.total > mejor.total ? dia : mejor),
    data[0] ?? { etiqueta: '', fecha: '', total: 0 }
  );

  return (
    <View style={styles.card}>
      <Text style={styles.titulo}>Ventas ultimos 7 dias</Text>
      {maximoReal > 0 ? (
        <View style={styles.barras}>
          {data.map((dia) => (
            <View style={styles.columna} key={dia.fecha}>
              <View style={styles.barraFondo}>
                <View style={[styles.barra, { height: `${Math.max(8, (dia.total / maximo) * 100)}%` }]} />
              </View>
              <Text style={styles.fecha}>{dia.etiqueta}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.vacio}>
          <Text style={styles.total}>Sin ventas en los ultimos 7 dias</Text>
        </View>
      )}
      {maximoReal > 0 ? (
        <Text style={styles.total}>
          Dia mas alto: {diaMasAlto.etiqueta} - {formatearColones(diaMasAlto.total)}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colores.superficie, borderColor: colores.borde,
    borderRadius: radios.md, borderWidth: 1, gap: espacios.sm, padding: espacios.md },
  titulo: { color: colores.texto, fontSize: 17, fontWeight: '900' },
  barras: { alignItems: 'flex-end', flexDirection: 'row', gap: espacios.sm, height: 150 },
  vacio: { alignItems: 'center', height: 150, justifyContent: 'center' },
  columna: { alignItems: 'center', flex: 1, gap: espacios.xs },
  barraFondo: { backgroundColor: colores.superficieSuave, borderRadius: radios.sm,
    height: 118, justifyContent: 'flex-end', overflow: 'hidden', width: '100%' },
  barra: { backgroundColor: colores.primario, borderRadius: radios.sm, width: '100%' },
  fecha: { color: colores.textoSecundario, fontSize: 11, fontWeight: '700' },
  total: { color: colores.textoSecundario, fontSize: 13 },
});
