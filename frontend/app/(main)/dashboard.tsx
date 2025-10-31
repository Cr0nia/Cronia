import { useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight, Lock, Plus, QrCode, Receipt, User } from 'lucide-react-native';

import { MobileContainer } from '@/components/MobileContainer';
import { AssetCard } from '@/components/AssetCard';
import { HealthFactor } from '@/components/HealthFactor';
import { useAuth } from '@/context/AuthContext';
import { CollateralApi, CreditApi, OracleApi, StatementsApi } from '@/services/backend';

export default function Dashboard() {
  const { user, primaryWallet } = useAuth();
  const walletPubkey = primaryWallet?.pubkey;

  const creditQuery = useQuery({
    queryKey: ['credit-account', walletPubkey],
    queryFn: () => CreditApi.getAccount(walletPubkey!),
    enabled: Boolean(walletPubkey),
    staleTime: 30_000,
  });

  const collateralQuery = useQuery({
    queryKey: ['collateral-positions', walletPubkey],
    queryFn: () => CollateralApi.getPositions(walletPubkey!),
    enabled: Boolean(walletPubkey),
    staleTime: 15_000,
  });

  const assetsQuery = useQuery({
    queryKey: ['oracle-assets'],
    queryFn: () => OracleApi.getAssets(),
    staleTime: 60_000,
  });

  const statementQuery = useQuery({
    queryKey: ['latest-statement', walletPubkey],
    queryFn: () => StatementsApi.getLatest(walletPubkey!),
    enabled: Boolean(walletPubkey),
  });

  const creditAccount = creditQuery.data?.database ?? null;
  const limit = creditAccount?.limitUsdc ?? 0;
  const used = creditAccount?.usedUsdc ?? 0;
  const available = Math.max(limit - used, 0);
  const limitProgress = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;

  const positions = collateralQuery.data ?? [];
  const assetsMap = useMemo(() => {
    const result = new Map<string, { name: string; symbol: string }>();
    assetsQuery.data?.forEach(asset => {
      result.set(asset.mint, { name: asset.name, symbol: asset.symbol });
    });
    return result;
  }, [assetsQuery.data]);

  const totalCollateralValue = positions.reduce((sum, position) => sum + (position.valuation ?? 0), 0);

  const nextStatement = statementQuery.data;
  const nextInstallmentValue = nextStatement?.minPayment ?? 0;
  const nextDueDate = nextStatement ? new Date(nextStatement.closeTs) : null;

  const healthFactor = creditAccount?.healthFactor ?? 1;

  const loadingData = walletPubkey
    ? creditQuery.isLoading || collateralQuery.isLoading || statementQuery.isLoading
    : false;

  return (
    <MobileContainer>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Olá,</Text>
              <Text style={styles.title}>{user?.name ?? 'Usuário Cronia'}</Text>
            </View>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => router.push('/(main)/profile')}
            >
              <User color="#6366f1" size={20} />
            </TouchableOpacity>
          </View>

          {!walletPubkey && (
            <View style={styles.warningCard}>
              <Text style={styles.warningText}>
                Crie sua conta para gerar automaticamente uma carteira Solana e liberar seu limite.
              </Text>
            </View>
          )}

          {walletPubkey && loadingData && (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="small" color="#6366f1" />
              <Text style={styles.loadingText}>Sincronizando seus dados on-chain...</Text>
            </View>
          )}

          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Saldo disponível</Text>
            <Text style={styles.balanceValue}>{formatCurrency(available)}</Text>
            <TouchableOpacity style={styles.detailsButton} onPress={() => router.push('/(main)/profile')}>
              <Text style={styles.detailsText}>Ver detalhes</Text>
              <ArrowUpRight color="#e0e7ff" size={16} />
            </TouchableOpacity>
          </View>

          <View style={styles.limitCard}>
            <View style={styles.limitHeader}>
              <Text style={styles.limitLabel}>Limite de Crédito</Text>
              <TouchableOpacity onPress={() => router.push('/(main)/lock-collateral')}>
                <Text style={styles.increaseButton}>Aumentar</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.limitContent}>
              <View style={styles.limitValues}>
                <Text style={styles.limitAvailable}>{formatCurrency(available)}</Text>
                <Text style={styles.limitAvailableLabel}>disponível</Text>
              </View>

              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${limitProgress}%` }]} />
              </View>

              <View style={styles.limitInfo}>
                <Text style={styles.limitInfoText}>Usado: {formatCurrency(used)}</Text>
                <Text style={styles.limitInfoText}>Total: {formatCurrency(limit)}</Text>
              </View>
            </View>

            <View style={styles.nextPayment}>
              <View>
                <Text style={styles.nextPaymentLabel}>Próxima parcela mínima</Text>
                <Text style={styles.nextPaymentValue}>{formatCurrency(nextInstallmentValue)}</Text>
              </View>
              <View style={styles.nextPaymentRight}>
                <Text style={styles.nextPaymentLabel}>Vencimento</Text>
                <Text style={styles.nextPaymentValue}>
                  {nextDueDate ? formatDate(nextDueDate) : '—'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <HealthFactor value={healthFactor || 1} />
          </View>

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

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Meus Ativos</Text>
            {walletPubkey ? (
              positions.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyTitle}>Nenhum ativo bloqueado ainda</Text>
                  <Text style={styles.emptySubtitle}>
                    Bloqueie ativos como garantia para liberar seu limite de crédito.
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={() => router.push('/(main)/lock-collateral')}
                  >
                    <Text style={styles.emptyButtonText}>Bloquear ativos</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.assetsList}>
                  {positions.map(position => {
                    const asset = assetsMap.get(position.mint) ?? {
                      name: position.mint,
                      symbol: position.mint.slice(0, 4),
                    };
                    return (
                      <AssetCard
                        key={position.id}
                        icon={asset.symbol.slice(0, 1)}
                        name={asset.name}
                        symbol={asset.symbol}
                        amount={position.amount}
                        valueUSDC={position.valuation ?? 0}
                        onClick={() => {}}
                      />
                    );
                  })}
                </View>
              )
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>Crie sua conta para ver os ativos</Text>
                <Text style={styles.emptySubtitle}>
                  Assim que sua carteira estiver pronta, seus ativos aparecerão aqui.
                </Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resumo</Text>
            <View style={styles.summaryGrid}>
              <SummaryItem label="Valor total em garantia" value={formatCurrency(totalCollateralValue)} />
              <SummaryItem label="Wallet" value={walletPubkey ?? '—'} mono />
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

function SummaryItem({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, mono && styles.summaryValueMono]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(date: Date) {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
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
    marginBottom: 24,
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
  warningCard: {
    borderRadius: 12,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
    padding: 16,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 14,
    color: '#9a3412',
  },
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#4b5563',
  },
  balanceCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f9fafb',
  },
  detailsButton: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailsText: {
    color: '#e0e7ff',
    fontSize: 14,
    fontWeight: '600',
  },
  limitCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  limitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  limitLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  increaseButton: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
  },
  limitContent: {
    gap: 12,
    marginBottom: 16,
  },
  limitValues: {
    gap: 4,
  },
  limitAvailable: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  limitAvailableLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
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
    fontSize: 14,
    color: '#4b5563',
  },
  nextPayment: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  nextPaymentLabel: {
    fontSize: 13,
    color: '#6b7280',
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
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  quickActionButton: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  assetsList: {
    gap: 12,
  },
  emptyCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 24,
    alignItems: 'flex-start',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyButton: {
    marginTop: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  summaryItem: {
    flexGrow: 1,
    minWidth: 140,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    gap: 6,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  summaryValueMono: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
});
