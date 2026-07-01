import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, Trash2 } from 'lucide-react-native';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';

import { AppButton } from './AppButton';
import { colores, espacios, radios } from '../constants/tema';

interface Props {
  value?: string;
  onChange: (uri?: string) => void;
}

export function SelectorImagenFactura({ value, onChange }: Props) {
  async function tomarFoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a la cámara para tomar la foto.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      await guardarImagenLocal(result.assets[0].uri);
    }
  }

  async function elegirGaleria() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a la galería para seleccionar la foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      await guardarImagenLocal(result.assets[0].uri);
    }
  }

  async function guardarImagenLocal(uriOriginal: string) {
    try {
      const dirInfo = await FileSystem.getInfoAsync(FileSystem.documentDirectory + 'imagenesFacturas/');
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'imagenesFacturas/', { intermediates: true });
      }
      const extension = uriOriginal.match(/\.(png|jpe?g|webp)(?:\?|$)/i)?.[1] ?? 'jpg';
      const nombreArchivo = `factura_${Date.now()}.${extension}`;
      const nuevaRuta = FileSystem.documentDirectory + 'imagenesFacturas/' + nombreArchivo;
      
      await FileSystem.copyAsync({
        from: uriOriginal,
        to: nuevaRuta,
      });
      onChange(nuevaRuta);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la imagen.');
    }
  }

  return (
    <View style={styles.contenedor}>
      <Text style={styles.label}>Factura (opcional)</Text>
      {value ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: value }} style={styles.preview} />
          <AppButton icon={Trash2} variant="danger" onPress={() => onChange(undefined)} label="Quitar imagen" />
        </View>
      ) : (
        <View style={styles.botones}>
          <View style={styles.btnWrapper}>
            <AppButton icon={Camera} variant="secondary" onPress={tomarFoto} label="Cámara" />
          </View>
          <View style={styles.btnWrapper}>
            <AppButton icon={ImageIcon} variant="secondary" onPress={elegirGaleria} label="Galería" />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { gap: espacios.sm },
  label: { color: colores.texto, fontSize: 14, fontWeight: '700' },
  botones: { flexDirection: 'row', gap: espacios.sm },
  btnWrapper: { flex: 1 },
  previewContainer: { gap: espacios.sm, alignItems: 'center' },
  preview: { width: '100%', height: 200, borderRadius: radios.md, resizeMode: 'cover' },
});
