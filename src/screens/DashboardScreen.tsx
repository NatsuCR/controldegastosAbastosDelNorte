import { useFocusEffect } from '@react-navigation/native';
import { RefreshCcw } from 'lucide-react-native';
import { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../components/AppButton';
import { InventarioItem } from '../components/InventarioItem';
import { MetricaCard } from '../components/MetricaCard';
import { PeriodoSelector } from '../components/PeriodoSelector';
import { ScreenContainer } from '../components/ScreenContainer';
import { VentasBarras } from '../components/VentasBarras';
import { colores, espacios } from '../constants/tema';
import { useDashboardStore } from '../store/useDashboardStore';

export function DashboardScreen() {
  const { periodo, data, cargando, error, cargarDashboard } = useDashboardStore();

  useFocusEffect(useCallback(() => { cargarDashboard(); }, [cargarDashboard]));

  return (
    <ScreenContainer titulo="Inicio" subtitulo="Resumen rapido del negocio.">
      <PeriodoSelector value={periodo} onChange={cargarDashboard} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {data ? (
        <>
          <View style={styles.metricas}>
            <MetricaCard label="Total vendido con IVA" value={data.resumen.ingresoBruto} />
            <MetricaCard label="Total compras proveedores" value={data.resumen.totalComprasSinIva} />
            <MetricaCard label="IVA ventas 13%" value={data.resumen.ivaCobrado13} />
            <MetricaCard label="IVA ventas 1%" value={data.resumen.ivaCobrado1} />
            <MetricaCard label="IVA compras 13%" value={data.resumen.ivaProveedores13} />
            <MetricaCard label="IVA compras 1%" value={data.resumen.ivaProveedores1} />
            <MetricaCard label="IVA neto TRIBU" value={data.resumen.ivaNetoPagar} />
            <MetricaCard label="Gastos operativos" value={data.resumen.totalGastosOperativos} />
            <MetricaCard label="Ganancia sin IVA" value={data.resumen.gananciaNetaReal} destacado />
          </View>
          <VentasBarras data={data.ventasUltimosDias} />
          <Text style={styles.seccion}>Stock actual</Text>
          <View style={styles.lista}>
            {data.inventario.map((item) => <InventarioItem item={item} key={item.productoId} />)}
          </View>
        </>
      ) : null}
      <AppButton icon={RefreshCcw} label="Actualizar" loading={cargando}
        onPress={() => cargarDashboard()} variant="secondary" />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  metricas: { flexDirection: 'row', flexWrap: 'wrap', gap: espacios.sm },
  lista: { gap: espacios.sm },
  seccion: { color: colores.texto, fontSize: 18, fontWeight: '900' },
  error: { color: colores.peligro, fontSize: 14, fontWeight: '700' },
});
