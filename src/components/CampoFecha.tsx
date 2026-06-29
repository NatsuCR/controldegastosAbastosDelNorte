import { addDays, addMonths, addYears, format, parseISO } from 'date-fns';
import { CalendarDays, Check, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colores, radios, espacios } from '../constants/tema';

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

function leerFecha(value: string): Date {
  const fecha = parseISO(value);
  return Number.isNaN(fecha.getTime()) ? new Date() : fecha;
}

function guardarFecha(fecha: Date): string {
  return format(fecha, 'yyyy-MM-dd');
}

export function CampoFecha({ label, value, onChange, error }: Props) {
  const [abierto, setAbierto] = useState(false);
  const fecha = useMemo(() => leerFecha(value), [value]);
  const mover = (nuevaFecha: Date) => onChange(guardarFecha(nuevaFecha));

  return (
    <View style={styles.grupo}>
      <Text style={styles.label}>{label}</Text>
      <Pressable onPress={() => setAbierto(!abierto)}
        style={[styles.campo, error ? styles.errorBorde : null]}>
        <CalendarDays color={colores.primario} size={19} />
        <Text style={styles.valor}>{format(fecha, 'dd/MM/yyyy')}</Text>
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {abierto ? (
        <View style={styles.panel}>
          <Fila label="Dia" valor={format(fecha, 'dd')}
            onMenos={() => mover(addDays(fecha, -1))} onMas={() => mover(addDays(fecha, 1))} />
          <Fila label="Mes" valor={format(fecha, 'MM')}
            onMenos={() => mover(addMonths(fecha, -1))} onMas={() => mover(addMonths(fecha, 1))} />
          <Fila label="Ano" valor={format(fecha, 'yyyy')}
            onMenos={() => mover(addYears(fecha, -1))} onMas={() => mover(addYears(fecha, 1))} />
          <View style={styles.acciones}>
            <BotonTexto label="Hoy" onPress={() => mover(new Date())} />
            <BotonTexto icon={Check} label="Listo" onPress={() => setAbierto(false)} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

function Fila(props: { label: string; valor: string; onMenos: () => void; onMas: () => void }) {
  return (
    <View style={styles.fila}>
      <Text style={styles.filaLabel}>{props.label}</Text>
      <BotonIcono icon={ChevronLeft} onPress={props.onMenos} />
      <Text style={styles.filaValor}>{props.valor}</Text>
      <BotonIcono icon={ChevronRight} onPress={props.onMas} />
    </View>
  );
}

function BotonIcono({ icon: Icon, onPress }: { icon: typeof ChevronLeft; onPress: () => void }) {
  return <Pressable onPress={onPress} style={styles.icono}><Icon color={colores.primario} size={20} /></Pressable>;
}

function BotonTexto({ icon: Icon, label, onPress }: { icon?: typeof Check; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.boton}>
      {Icon ? <Icon color="#FFFFFF" size={17} /> : null}
      <Text style={styles.botonTexto}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  grupo: { gap: espacios.xs },
  label: { color: colores.texto, fontSize: 14, fontWeight: '700' },
  campo: { alignItems: 'center', backgroundColor: colores.superficie,
    borderColor: colores.borde, borderRadius: radios.md, borderWidth: 1,
    flexDirection: 'row', gap: espacios.sm, minHeight: 48, paddingHorizontal: espacios.md },
  errorBorde: { borderColor: colores.peligro },
  valor: { color: colores.texto, fontSize: 17, fontWeight: '700' },
  error: { color: colores.peligro, fontSize: 13 },
  panel: { backgroundColor: colores.superficieSuave, borderRadius: radios.md,
    gap: espacios.sm, padding: espacios.sm },
  fila: { alignItems: 'center', flexDirection: 'row', gap: espacios.sm },
  filaLabel: { color: colores.textoSecundario, flex: 1, fontSize: 14, fontWeight: '800' },
  filaValor: { color: colores.texto, fontSize: 16, fontWeight: '900', minWidth: 54, textAlign: 'center' },
  icono: { alignItems: 'center', backgroundColor: colores.superficie, borderRadius: radios.sm,
    height: 38, justifyContent: 'center', width: 38 },
  acciones: { flexDirection: 'row', gap: espacios.sm },
  boton: { alignItems: 'center', backgroundColor: colores.primario, borderRadius: radios.sm,
    flex: 1, flexDirection: 'row', gap: espacios.xs, justifyContent: 'center', minHeight: 40 },
  botonTexto: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
});
