import { CampoTexto } from './CampoTexto';
import { numeroATexto, textoANumero } from '../utils/formularios';

interface Props {
  label: string;
  value: number;
  onChange: (value: number) => void;
  error?: string;
}

export function CampoNumero({ label, value, onChange, error }: Props) {
  return (
    <CampoTexto
      error={error}
      keyboardType="decimal-pad"
      label={label}
      onChangeText={(text) => onChange(textoANumero(text))}
      value={numeroATexto(value)}
    />
  );
}
