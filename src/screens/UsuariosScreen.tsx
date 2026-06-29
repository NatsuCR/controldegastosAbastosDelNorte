import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, Alert, TextInput } from 'react-native';
import { Shield, ShieldAlert, Trash2 } from 'lucide-react-native';
import { colores, espacios, radios } from '../constants/tema';
import { AppButton } from '../components/AppButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { apiClient } from '../services/apiClient';
import { useAuthStore } from '../store/useAuthStore';

export function UsuariosScreen() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState<'admin' | 'empleado'>('empleado');
  const logout = useAuthStore(s => s.logout);

  async function cargarUsuarios() {
    try {
      const data = await apiClient.get('/auth/usuarios');
      setUsuarios(data);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    cargarUsuarios();
  }, []);

  async function handleCrear() {
    if (!username || !password) {
      Alert.alert('Error', 'Completa los campos');
      return;
    }
    setLoading(true);
    try {
      await apiClient.post('/auth/usuarios', { username, password, rol });
      Alert.alert('Éxito', 'Usuario creado');
      setUsername('');
      setPassword('');
      cargarUsuarios();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleEliminar(id: number) {
    Alert.alert('Confirmar', '¿Eliminar usuario?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try {
          await apiClient.delete(`/auth/usuarios/${id}`);
          cargarUsuarios();
        } catch (err) {
          console.log(err);
        }
      }}
    ]);
  }

  return (
    <ScreenContainer titulo="Gestión de Usuarios">
      <View style={styles.cajaForm}>
        <Text style={styles.subtitulo}>Nuevo Usuario</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre de usuario"
          placeholderTextColor={colores.textoSecundario}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor={colores.textoSecundario}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <View style={styles.rolesRow}>
          <AppButton 
            label="Empleado" 
            variant={rol === 'empleado' ? 'primary' : 'secondary'}
            onPress={() => setRol('empleado')}
            style={{ flex: 1 }}
          />
          <AppButton 
            label="Admin" 
            variant={rol === 'admin' ? 'primary' : 'secondary'}
            onPress={() => setRol('admin')}
            style={{ flex: 1 }}
          />
        </View>
        <AppButton label="Crear Usuario" onPress={handleCrear} loading={loading} />
      </View>

      <Text style={[styles.subtitulo, { marginTop: espacios.lg, marginBottom: espacios.sm }]}>Usuarios Existentes</Text>
      <ScrollView contentContainerStyle={styles.lista}>
        {usuarios.map(u => (
          <View key={u.id} style={styles.userCard}>
            <View style={styles.userInfo}>
              {u.rol === 'admin' ? <Shield color={colores.acento} size={20} /> : <ShieldAlert color={colores.textoSecundario} size={20} />}
              <Text style={styles.username}>{u.username}</Text>
              <View style={[styles.badge, u.rol === 'admin' && styles.badgeAdmin]}>
                <Text style={[styles.badgeText, u.rol === 'admin' && styles.badgeTextAdmin]}>{u.rol.toUpperCase()}</Text>
              </View>
            </View>
            <AppButton icon={Trash2} variant="danger" onPress={() => handleEliminar(u.id)} />
          </View>
        ))}
      </ScrollView>

      <AppButton label="Cerrar Mi Sesión" variant="danger" onPress={logout} style={{ marginTop: espacios.lg }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  cajaForm: {
    backgroundColor: colores.superficie,
    padding: espacios.lg,
    borderRadius: radios.md,
    gap: espacios.md,
  },
  subtitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colores.texto,
  },
  input: {
    backgroundColor: colores.superficieSuave,
    padding: espacios.md,
    borderRadius: radios.sm,
    color: colores.texto,
  },
  rolesRow: {
    flexDirection: 'row',
    gap: espacios.sm,
  },
  lista: {
    gap: espacios.sm,
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: colores.superficie,
    padding: espacios.md,
    borderRadius: radios.sm,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacios.sm,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: colores.texto,
  },
  badge: {
    backgroundColor: colores.superficieSuave,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radios.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colores.textoSecundario,
  },
  badgeAdmin: {
    backgroundColor: `${colores.acento}33`,
  },
  badgeTextAdmin: {
    color: colores.acento,
  }
});
