import { Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colores, radios, espacios } from '../constants/tema';
import type { Proveedor } from '../database/models';

interface Props {
  proveedores: Proveedor[];
  value: number;
  onChange: (id: number) => void;
}

export function ProveedorSelector({ proveedores, value, onChange }: Props) {
  const [busqueda, setBusqueda] = useState('');
  const proveedoresFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) {
      return proveedores;
    }
    return proveedores.filter((proveedor) => {
      const telefono = proveedor.telefono ?? '';
      return proveedor.nombre.toLowerCase().includes(texto) || telefono.includes(texto);
    });
  }, [busqueda, proveedores]);

  return (
    <View style={styles.lista}>
      <View style={styles.buscador}>
        <Search color={colores.textoSecundario} size={18} />
        <TextInput
          onChangeText={setBusqueda}
          placeholder="Buscar proveedor"
          placeholderTextColor="#7B8794"
          style={styles.input}
          value={busqueda}
        />
      </View>
      {proveedores.length === 0 ? (
        <Text style={styles.vacio}>Sin proveedores registrados.</Text>
      ) : null}
      {proveedoresFiltrados.map((proveedor) => (
        <Pressable
          key={proveedor.id}
          onPress={() => onChange(proveedor.id)}
          style={[styles.item, proveedor.id === value && styles.activo]}
        >
          <Text style={[styles.texto, proveedor.id === value && styles.textoActivo]}>
            {proveedor.nombre}
          </Text>
          {proveedor.id === value ? <Text style={styles.estado}>Seleccionado</Text> : null}
        </Pressable>
      ))}
      {proveedores.length > 0 && proveedoresFiltrados.length === 0 ? (
        <Text style={styles.vacio}>No encontre proveedores con ese texto.</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  lista: {
    gap: espacios.sm,
  },
  item: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.md,
    borderWidth: 1,
    padding: espacios.md,
  },
  buscador: {
    alignItems: 'center',
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: espacios.sm,
    minHeight: 48,
    paddingHorizontal: espacios.md,
  },
  input: {
    color: colores.texto,
    flex: 1,
    fontSize: 16,
  },
  activo: {
    backgroundColor: colores.superficieSuave,
    borderColor: colores.primario,
  },
  texto: {
    color: colores.texto,
    fontSize: 15,
    fontWeight: '800',
  },
  textoActivo: {
    color: colores.primarioOscuro,
  },
  estado: {
    color: colores.primarioOscuro,
    fontSize: 12,
    fontWeight: '900',
    marginTop: espacios.xs,
  },
  vacio: {
    color: colores.textoSecundario,
    fontSize: 14,
  },
});
