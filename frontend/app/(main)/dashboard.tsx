import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { MobileContainer } from '@/components/MobileContainer';
import { AssetCard } from '@/components/AssetCard';
import { HealthFactor } from '@/components/HealthFactor';
import { router } from 'expo-router';
import { ArrowUpRight, Plus, QrCode, Receipt, Lock, User } from 'lucide-react-native';

export default function Dashboard() {
  return (
    <MobileContainer>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Olá,</Text>
              <Text style={styles.title}>Bem-vindo ao Cronia</Text>
            </View>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => router.push('/(main)/profile')}
            >
              <User color="#6366f1" size={20} />
            </TouchableOpacity>
          </View>

          {/* Saldo Total */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Saldo Total</Text>
            <Text style={styles.balanceValue}>R$ 2.845,00</Text>
            <TouchableOpacity style={styles.detailsButton}>
              <Text style={styles.detailsText}>Ver detalhes</Text>
              <ArrowUpRight color="#6366f1" size={16} />
            </TouchableOpacity>
          </View>

          {/* Limite */}
          <View style={styles.limitCard}>
            <View style={styles.limitHeader}>
              <Text style={styles.limitLabel}>Limite de Crédito</Text>
              <TouchableOpacity>
                <Text style={styles.increaseButton}>Aumentar</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.limitContent}>
              <View style={styles.limitValues}>
                <Text style={styles.limitAvailable}>R$ 850,00</Text>
                <Text style={styles.limitAvailableLabel}>disponível</Text>
              </View>

              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: '43%' }]} />
              </View>

              <View style={styles.limitInfo}>
                <Text style={styles.limitInfoText}>Usado: R$ 650,00</Text>
                <Text style={styles.limitInfoText}>Total: R$ 1.500,00</Text>
              </View>
            </View>

            {/* Próxima Parcela */}
            <View style={styles.nextPayment}>
              <View>
                <Text style={styles.nextPaymentLabel}>Próxima parcela</Text>
                <Text style={styles.nextPaymentValue}>R$ 108,33</Text>
              </View>
              <View style={styles.nextPaymentRight}>
                <Text style={styles.nextPaymentLabel}>Vencimento</Text>
                <Text style={styles.nextPaymentValue}>15/11/2025</Text>
              </View>
            </View>
          </View>

          {/* Health Factor */}
          <View style={styles.section}>
            <HealthFactor value={1.85} />
          </View>

          {/* Ações Rápidas */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ações Rápidas</Text>
            <View style={styles.quickActions}>
              <QuickAction
                icon={<Plus color="#6366f1" size={20} />}
                label="Adicionar Ativos"
                onPress={() => router.push('/(main)/add-assets')}
              />
              <QuickAction
                icon={<Lock color="#6366f1" size={20} />}
                label="Bloquear Garantias"
                onPress={() => router.push('/(main)/lock-collateral')}
              />
              <QuickAction
                icon={<QrCode color="#6366f1" size={20} />}
                label="Pagar com QR"
                onPress={() => router.push('/(main)/pay-qr')}
              />
              <QuickAction
                icon={<Receipt color="#6366f1" size={20} />}
                label="Faturas"
                onPress={() => router.push('/(main)/invoices')}
              />
            </View>
          </View>

          {/* Meus Ativos */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Meus Ativos</Text>
            <View style={styles.assetsList}>
              <AssetCard
                icon="◎"
                name="Solana"
                symbol="SOL"
                amount={12.5}
                valueUSDC={1250.00}
                onClick={() => {}}
              />
              <AssetCard
                icon="$"
                name="USD Coin"
                symbol="USDC"
                amount={1595.0}
                valueUSDC={1595.00}
                onClick={() => {}}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </MobileContainer>
  );
}

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}

function QuickAction({ icon, label, onPress }: QuickActionProps) {
  return (
    <TouchableOpacity style={styles.quickActionButton} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.quickActionIcon}>{icon}</View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  greeting: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceCard: {
    backgroundColor: '#eef2ff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailsText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
  limitCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  limitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  limitLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  increaseButton: {
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '500',
  },
  limitContent: {
    marginBottom: 16,
  },
  limitValues: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 8,
  },
  limitAvailable: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  limitAvailableLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6366f1',
  },
  limitInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  limitInfoText: {
    fontSize: 12,
    color: '#6b7280',
  },
  nextPayment: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nextPaymentLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  nextPaymentValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  nextPaymentRight: {
    alignItems: 'flex-end',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    minHeight: 100,
    gap: 8,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    textAlign: 'center',
  },
  assetsList: {
    gap: 12,
  },
});
