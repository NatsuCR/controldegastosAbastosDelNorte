import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput, Alert } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { colores, espacios, radios } from '../constants/tema';
import { AppButton } from '../components/AppButton';
import { LogIn } from 'lucide-react-native';
import { apiClient } from '../services/apiClient';

export function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);

  async function handleLogin() {
    if (!username || !password) {
      Alert.alert('Error', 'Completa los campos');
      return;
    }
    setLoading(true);
    try {
      const data = await apiClient.post('/auth/login', { username, password });
      login(data);
    } catch (err: any) {
      Alert.alert('Error', 'Usuario o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Abastos del Norte</Text>
        <Text style={styles.subtitle}>Sistema Central</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Usuario"
          placeholderTextColor={colores.textoSecundario}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor={colores.textoSecundario}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        
        <AppButton icon={LogIn} label="Entrar" onPress={handleLogin} loading={loading} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colores.fondo,
    justifyContent: 'center',
    padding: espacios.lg,
  },
  card: {
    backgroundColor: colores.superficie,
    padding: espacios.lg,
    borderRadius: radios.md,
    gap: espacios.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colores.texto,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colores.textoSecundario,
    textAlign: 'center',
    marginBottom: espacios.md,
  },
  input: {
    backgroundColor: colores.superficieSuave,
    padding: espacios.md,
    borderRadius: radios.md,
    color: colores.texto,
  }
});
