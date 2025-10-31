import { TouchableOpacity, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

export function Checkbox({ checked, onCheckedChange, className }: CheckboxProps) {
  return (
    <TouchableOpacity
      style={[styles.container, checked && styles.containerChecked]}
      onPress={() => onCheckedChange(!checked)}
      activeOpacity={0.7}
    >
      {checked && <Check color="#ffffff" size={16} strokeWidth={3} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerChecked: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
});
