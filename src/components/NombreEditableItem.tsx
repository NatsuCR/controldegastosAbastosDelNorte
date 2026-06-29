import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { espacios } from '../constants/tema';
import { AppButton } from './AppButton';
import { CampoTexto } from './CampoTexto';

import { Trash2 } from 'lucide-react-native';

interface Props {
  label: string;
  value: string;
  loading: boolean;
  onSave: (value: string) => Promise<boolean>;
  onDelete?: () => void;
}

export function NombreEditableItem({ label, value, loading, onSave, onDelete }: Props) {
  const [texto, setTexto] = useState(value);

  useEffect(() => {
    setTexto(value);
  }, [value]);

  return (
    <View style={styles.row}>
      <CampoTexto label={label} value={texto} onChangeText={setTexto} />
      <View style={styles.acciones}>
        {onDelete && <AppButton icon={Trash2} variant="danger" onPress={onDelete} loading={loading} />}
        <View style={styles.flexGuardar}>
          <AppButton label="Guardar" loading={loading} onPress={() => onSave(texto)} variant="secondary" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: espacios.sm, marginBottom: espacios.sm },
  acciones: { flexDirection: 'row', gap: espacios.sm },
  flexGuardar: { flex: 1 },
});
