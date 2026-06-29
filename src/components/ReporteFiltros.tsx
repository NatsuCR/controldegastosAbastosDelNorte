import { Search } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colores, radios, espacios } from '../constants/tema';
import type { FiltroReporte, TipoFiltroReporte } from '../types/reportes';
import { AppButton } from './AppButton';
import { CampoFecha } from './CampoFecha';

const TIPOS: Array<{ label: string; value: TipoFiltroReporte }> = [
  { label: 'Día', value: 'dia' },
  { label: 'Semana', value: 'semana' },
  { label: 'Mes', value: 'mes' },
  { label: 'Año', value: 'anio' },
  { label: 'Rango', value: 'rango' },
];

interface Props {
  filtro: FiltroReporte;
  loading: boolean;
  onChange: (filtro: FiltroReporte) => void;
  onAplicar: () => void;
}

export function ReporteFiltros({ filtro, loading, onChange, onAplicar }: Props) {
  function setTipo(tipo: TipoFiltroReporte) {
    onChange({ ...filtro, tipo });
  }

  return (
    <View style={styles.caja}>
      <View style={styles.tipos}>
        {TIPOS.map((tipo) => {
          const activo = filtro.tipo === tipo.value;
          return (
            <Pressable key={tipo.value} onPress={() => setTipo(tipo.value)}
              style={[styles.tipo, activo && styles.activo]}>
              <Text style={[styles.textoTipo, activo && styles.textoActivo]}>{tipo.label}</Text>
            </Pressable>
          );
        })}
      </View>
      {filtro.tipo === 'rango' ? (
        <>
          <CampoFecha label="Desde" value={filtro.desde}
            onChange={(desde) => onChange({ ...filtro, desde })} />
          <CampoFecha label="Hasta" value={filtro.hasta}
            onChange={(hasta) => onChange({ ...filtro, hasta })} />
        </>
      ) : (
        <CampoFecha label="Fecha base" value={filtro.fechaBase}
          onChange={(fechaBase) => onChange({ ...filtro, fechaBase })} />
      )}
      <AppButton icon={Search} label="Aplicar filtro" loading={loading} onPress={onAplicar} />
    </View>
  );
}

const styles = StyleSheet.create({
  caja: { gap: espacios.sm },
  tipos: { backgroundColor: colores.superficieSuave, borderRadius: radios.md,
    flexDirection: 'row', padding: 4 },
  tipo: { alignItems: 'center', borderRadius: radios.sm, flex: 1,
    justifyContent: 'center', minHeight: 40 },
  activo: { backgroundColor: colores.superficie },
  textoTipo: { color: colores.textoSecundario, fontSize: 12, fontWeight: '800' },
  textoActivo: { color: colores.primarioOscuro },
});
