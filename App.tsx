import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { inicializarBaseDatos } from './src/database/db';
import { AppNavigator } from './src/navigation/AppNavigator';

type EstadoInicio = 'cargando' | 'listo' | 'error';

export default function App() {
  const [estado, setEstado] = useState<EstadoInicio>('cargando');
  const [mensaje, setMensaje] = useState('Preparando base de datos local');

  useEffect(() => {
    let activo = true;

    async function prepararAplicacion() {
      try {
        await inicializarBaseDatos();

        if (activo) {
          setEstado('listo');
          setMensaje('Sistema listo');
        }
      } catch (error) {
        if (activo) {
          const detalle = error instanceof Error ? error.message : 'Error desconocido';
          setEstado('error');
          setMensaje(detalle);
        }
      }
    }

    prepararAplicacion();

    return () => {
      activo = false;
    };
  }, []);

  if (estado === 'listo') {
    return (
      <SafeAreaProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.panel}>
        <Text style={styles.titulo}>Abastos del Norte</Text>
        <Text style={styles.estado}>{mensaje}</Text>
        {estado === 'cargando' ? <ActivityIndicator color="#155E75" /> : null}
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAF8',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  panel: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    gap: 16,
    padding: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 4,
  },
  titulo: {
    color: '#0F172A',
    fontSize: 28,
    fontWeight: '700',
  },
  estado: {
    color: '#334155',
    fontSize: 16,
    lineHeight: 22,
  },
});
