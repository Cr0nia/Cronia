import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { MobileContainer } from '@/components/MobileContainer';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { router } from 'expo-router';
import { ArrowLeft, Info } from 'lucide-react-native';
import { useState } from 'react';
import { toast } from '@/lib/toast';

interface Asset {
  id: string;
  name: string;
  symbol: string;
  amount: number;
  valueUSDC: number;
  ltv: number;
  risk: string;
}

export default function LockCollateral() {
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);

  const assets: Asset[] = [
    { id: 'sol', name: 'Solana', symbol: 'SOL', amount: 12.5, valueUSDC: 1250.00, ltv: 70, risk: 'Baixo' },
    { id: 'usdc', name: 'USD Coin', symbol: 'USDC', amount: 1595.0, valueUSDC: 1595.00, ltv: 90, risk: 'Baixo' },
  ];

  const toggleAsset = (id: string) => {
    setSelectedAssets(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const calculateLimit = () => {
    const selected = assets.filter(a => selectedAssets.includes(a.id));
    return selected.reduce((sum, asset) => sum + (asset.valueUSDC * asset.ltv / 100), 0);
  };

  const handleLock = () => {
    toast.success('Ativos bloqueados com sucesso!');
    setTimeout(() => router.push('/(main)/dashboard'), 1500);
  };

  return (
    <MobileContainer>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft color="#6b7280" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bloquear Garantias</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              Selecione os ativos que deseja usar como garantia. Quanto maior o valor bloqueado, maior seu limite.
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Selecione os ativos</Text>

          <View style={styles.assetsList}>
            {assets.map(asset => (
              <View key={asset.id} style={styles.assetCard}>
                <View style={styles.assetRow}>
                  <Checkbox
                    checked={selectedAssets.includes(asset.id)}
                    onCheckedChange={() => toggleAsset(asset.id)}
                  />
                  <View style={styles.assetInfo}>
                    <View style={styles.assetHeader}>
                      <View>
                        <Text style={styles.assetName}>{asset.name}</Text>
                        <Text style={styles.assetAmount}>
                          {asset.amount} {asset.symbol}
                        </Text>
                      </View>
                      <Text style={styles.assetValue}>R$ {asset.valueUSDC.toFixed(2)}</Text>
                    </View>
                    <View style={styles.assetMeta}>
                      <Text style={styles.ltvText}>
                        LTV: <Text style={styles.ltvValue}>{asset.ltv}%</Text>
                      </Text>
                      <View style={[
                        styles.riskBadge,
                        asset.risk === 'Baixo' ? styles.riskLow : styles.riskMedium
                      ]}>
                        <Text style={[
                          styles.riskText,
                          asset.risk === 'Baixo' ? styles.riskTextLow : styles.riskTextMedium
                        ]}>
                          Risco {asset.risk}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {selectedAssets.length > 0 && (
            <>
              <View style={styles.limitCard}>
                <View style={styles.limitHeader}>
                  <Text style={styles.limitTitle}>Seu novo limite</Text>
                  <Info color="#6b7280" size={16} />
                </View>
                <Text style={styles.limitValue}>R$ {calculateLimit().toFixed(2)}</Text>
                <Text style={styles.healthFactor}>
                  Health Factor estimado: <Text style={styles.healthFactorValue}>1.85</Text>
                </Text>
              </View>

              <View style={styles.warningCard}>
                <Text style={styles.warningText}>
                  <Text style={styles.warningBold}>⚠️ Importante:</Text> Se o valor dos seus ativos cair muito, você pode ser liquidado. Mantenha seu Health Factor acima de 1.2.
                </Text>
              </View>
            </>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            onPress={handleLock}
            disabled={selectedAssets.length === 0}
          >
            <Text style={styles.buttonText}>Bloquear e liberar limite</Text>
          </Button>
        </View>
      </View>
    </MobileContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  infoCard: {
    backgroundColor: '#eef2ff',
    borderWidth: 1,
    borderColor: '#c7d2fe',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    color: '#111827',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  assetsList: {
    gap: 12,
    marginBottom: 24,
  },
  assetCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  assetRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  assetInfo: {
    flex: 1,
  },
  assetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  assetName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  assetAmount: {
    fontSize: 14,
    color: '#6b7280',
  },
  assetValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  assetMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  ltvText: {
    fontSize: 12,
    color: '#6b7280',
  },
  ltvValue: {
    color: '#6366f1',
    fontWeight: '600',
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskLow: {
    backgroundColor: '#d1fae5',
  },
  riskMedium: {
    backgroundColor: '#fef3c7',
  },
  riskText: {
    fontSize: 12,
  },
  riskTextLow: {
    color: '#10b981',
  },
  riskTextMedium: {
    color: '#f59e0b',
  },
  limitCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
  },
  limitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  limitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  limitValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 8,
  },
  healthFactor: {
    fontSize: 14,
    color: '#6b7280',
  },
  healthFactorValue: {
    color: '#10b981',
    fontWeight: '600',
  },
  warningCard: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  warningText: {
    fontSize: 14,
    color: '#111827',
  },
  warningBold: {
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
});
