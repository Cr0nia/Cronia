import { View, Text, StyleSheet } from 'react-native';
import { Info } from 'lucide-react-native';

interface HealthFactorProps {
  value: number;
}

export function HealthFactor({ value }: HealthFactorProps) {
  const getColor = (val: number) => {
    if (val >= 1.5) return '#10b981'; // success
    if (val >= 1.2) return '#f59e0b'; // warning
    return '#ef4444'; // danger
  };

  const getLabel = (val: number) => {
    if (val >= 1.5) return 'Seguro';
    if (val >= 1.2) return 'Atenção';
    return 'Risco';
  };

  const color = getColor(value);
  const label = getLabel(value);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Health Factor</Text>
        <Info color="#6b7280" size={16} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.value, { color }]}>{value.toFixed(2)}</Text>
        <View style={[styles.badge, { backgroundColor: `${color}15` }]}>
          <Text style={[styles.badgeText, { color }]}>{label}</Text>
        </View>
      </View>
      <Text style={styles.description}>
        Quanto maior, mais segura sua posição. Mantenha acima de 1.2 para evitar liquidação.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  value: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
  },
});
