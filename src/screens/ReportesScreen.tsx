import { useFocusEffect } from '@react-navigation/native';
import { format } from 'date-fns';
import { Download } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../components/AppButton';
import { MetricaCard } from '../components/MetricaCard';
import { ProductoReporteItem } from '../components/ProductoReporteItem';
import { ReporteFiltros } from '../components/ReporteFiltros';
import { ScreenContainer } from '../components/ScreenContainer';
import { VisorImagenModal } from '../components/VisorImagenModal';
import { colores, espacios, radios } from '../constants/tema';
import { exportarReportePdf } from '../services/reportePdf';
import { useReportesStore } from '../store/useReportesStore';
import type { FiltroReporte } from '../types/reportes';

function filtroInicial(): FiltroReporte {
  const hoy = format(new Date(), 'yyyy-MM-dd');
  return { tipo: 'dia', fechaBase: hoy, desde: hoy, hasta: hoy };
}

export function ReportesScreen() {
  const [filtro, setFiltro] = useState<FiltroReporte>(filtroInicial);
  const [exportando, setExportando] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState<string | null>(null);
  const { reporte, cargando, error, cargarReporte } = useReportesStore();

  useFocusEffect(
    useCallback(() => {
      cargarReporte(filtro);
    }, [filtro, cargarReporte])
  );

  async function exportarPdf() {
    if (!reporte) {
      return;
    }

    setExportando(true);
    await exportarReportePdf(reporte);
    setExportando(false);
  }

  return (
    <ScreenContainer titulo="Reportes" subtitulo="Control fiscal y ventas por producto.">
      <ReporteFiltros filtro={filtro} loading={cargando}
        onAplicar={() => cargarReporte(filtro)} onChange={setFiltro} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {reporte ? (
        <>
          <View style={styles.metricas}>
            <MetricaCard label="Total vendido con IVA" value={reporte.resumen.ingresoBruto} />
            <MetricaCard label="IVA ventas 13%" value={reporte.resumen.ivaCobrado13} />
            <MetricaCard label="IVA ventas 1%" value={reporte.resumen.ivaCobrado1} />
            <MetricaCard label="IVA compras 13%" value={reporte.resumen.ivaProveedores13} />
            <MetricaCard label="IVA compras 1%" value={reporte.resumen.ivaProveedores1} />
            <MetricaCard label="IVA neto TRIBU" value={reporte.resumen.ivaNetoPagar} />
            <MetricaCard label="Compras sin IVA" value={reporte.resumen.totalComprasSinIva} />
            <MetricaCard label="Gastos operativos" value={reporte.resumen.totalGastosOperativos} />
            <MetricaCard label="Ganancia sin IVA" value={reporte.resumen.gananciaNetaReal} destacado />
          </View>
          <AppButton icon={Download} label="Exportar PDF" loading={exportando} onPress={exportarPdf} />
          <Text style={styles.seccion}>Desglose por producto</Text>
          <View style={styles.lista}>
            {reporte.productos.map((producto) => (
              <ProductoReporteItem key={producto.productoId} producto={producto} />
            ))}
            {reporte.productos.length === 0 ? <Text style={styles.vacio}>Sin ventas en este periodo.</Text> : null}
          </View>

          <Text style={[styles.seccion, { marginTop: espacios.lg }]}>Historial de Compras</Text>
          <View style={styles.lista}>
            {reporte.historialCompras.map((compra) => (
              <View key={compra.id} style={styles.itemHistorial}>
                <View style={styles.itemRow}>
                  <Text style={styles.itemFecha}>{format(new Date(compra.fecha), 'dd/MM/yyyy')}</Text>
                  <Text style={styles.itemMonto}>₡{compra.total.toLocaleString('es-CR')}</Text>
                </View>
                <Text style={styles.itemDesc}>{compra.productoNombre} ({compra.cantidad} uds)</Text>
                <Text style={styles.itemProv}>Proveedor: {compra.proveedorNombre}</Text>
                {compra.imagenFactura ? (
                  <View style={styles.botonFactura}>
                    <AppButton label="Mostrar factura" variant="secondary" 
                      onPress={() => setFacturaSeleccionada(compra.imagenFactura)} />
                  </View>
                ) : null}
              </View>
            ))}
            {reporte.historialCompras.length === 0 ? <Text style={styles.vacio}>Sin compras en este periodo.</Text> : null}
          </View>

          <Text style={[styles.seccion, { marginTop: espacios.lg }]}>Historial de Gastos Adicionales</Text>
          <View style={styles.lista}>
            {reporte.historialGastos.map((gasto) => (
              <View key={gasto.id} style={styles.itemHistorial}>
                <View style={styles.itemRow}>
                  <Text style={styles.itemFecha}>{format(new Date(gasto.fecha), 'dd/MM/yyyy')}</Text>
                  <Text style={styles.itemMonto}>₡{gasto.monto.toLocaleString('es-CR')}</Text>
                </View>
                <Text style={styles.itemDesc}>{gasto.descripcion} ({gasto.categoria})</Text>
                {gasto.imagenFactura ? (
                  <View style={styles.botonFactura}>
                    <AppButton label="Mostrar factura" variant="secondary" 
                      onPress={() => setFacturaSeleccionada(gasto.imagenFactura)} />
                  </View>
                ) : null}
              </View>
            ))}
            {reporte.historialGastos.length === 0 ? <Text style={styles.vacio}>Sin gastos en este periodo.</Text> : null}
          </View>
        </>
      ) : null}

      <VisorImagenModal 
        visible={!!facturaSeleccionada}
        imagenUri={facturaSeleccionada}
        onClose={() => setFacturaSeleccionada(null)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  metricas: { flexDirection: 'row', flexWrap: 'wrap', gap: espacios.sm },
  lista: { gap: espacios.sm },
  seccion: { color: colores.texto, fontSize: 18, fontWeight: '900' },
  error: { color: colores.peligro, fontSize: 14, fontWeight: '700' },
  vacio: { color: colores.textoSecundario, fontSize: 14 },
  itemHistorial: { backgroundColor: colores.superficie, padding: espacios.md, borderRadius: radios.sm, borderColor: colores.borde, borderWidth: 1 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: espacios.xs },
  itemFecha: { color: colores.textoSecundario, fontSize: 12 },
  itemMonto: { color: colores.texto, fontSize: 14, fontWeight: '700' },
  itemDesc: { color: colores.texto, fontSize: 14, fontWeight: '600' },
  itemProv: { color: colores.textoSecundario, fontSize: 13, marginTop: 2 },
  botonFactura: { marginTop: espacios.sm, alignItems: 'flex-start' },
});
