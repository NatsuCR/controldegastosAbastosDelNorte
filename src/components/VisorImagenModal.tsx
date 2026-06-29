import { X } from 'lucide-react-native';
import { Modal, StyleSheet, View, Image, TouchableOpacity } from 'react-native';

import { colores, espacios } from '../constants/tema';

interface Props {
  visible: boolean;
  imagenUri: string | null;
  onClose: () => void;
}

export function VisorImagenModal({ visible, imagenUri, onClose }: Props) {
  if (!visible || !imagenUri) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.fondo}>
        <TouchableOpacity style={styles.botonCerrar} onPress={onClose}>
          <X color="#FFFFFF" size={32} />
        </TouchableOpacity>
        
        <Image 
          source={{ uri: imagenUri }} 
          style={styles.imagen} 
          resizeMode="contain"
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.9)', 
    justifyContent: 'center',
    alignItems: 'center' 
  },
  botonCerrar: { 
    position: 'absolute', 
    top: 40, 
    right: espacios.lg, 
    zIndex: 10,
    padding: espacios.sm,
  },
  imagen: { 
    width: '100%', 
    height: '80%', 
  }
});
