import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface AssetCardProps {
  icon: string;
  name: string;
  symbol: string;
  amount: number;
  valueUSDC: number;
  onClick: () => void;
}

export function AssetCard({ icon, name, symbol, amount, valueUSDC, onClick }: AssetCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onClick} activeOpacity={0.7}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.amount}>
            {amount.toFixed(2)} {symbol}
          </Text>
        </View>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>R$ {valueUSDC.toFixed(2)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  amount: {
    fontSize: 14,
    color: '#6b7280',
  },
  valueContainer: {
    alignItems: 'flex-end',
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
});
