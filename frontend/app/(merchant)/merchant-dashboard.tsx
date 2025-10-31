import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  DollarSign,
  FileText,
  QrCode,
  TrendingUp,
} from 'lucide-react-native';

import { MobileContainer } from '@/components/MobileContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MerchantsApi } from '@/services/backend';
import { toast } from '@/lib/toast';

export default function MerchantDashboard() {
  const [merchantId, setMerchantId] = useState('');
  const [apiKey, setApiKey] = useState('');

  const metricsQuery = useQuery({
    queryKey: ['merchant-metrics', merchantId, apiKey],
    queryFn: () => MerchantsApi.metrics(merchantId!, apiKey!, {}),
    enabled: false,
  });

  const salesQuery = useQuery({
    queryKey: ['merchant-sales', merchantId, apiKey],
    queryFn: () => MerchantsApi.sales(merchantId!, apiKey!, { status: 'confirmed' }),
    enabled: false,
  });

  const loadData = async () => {
    if (!merchantId || !apiKey) {
      toast.error('Informe ID do merchant e API key.');
      return;
    }
    try {
      await Promise.all([metricsQuery.refetch(), salesQuery.refetch()]);
      toast.success('Dados do merchant atualizados.');
    } catch (error: any) {
      toast.error(error?.message ?? 'Não foi possível carregar os dados.');
    }
  };

  const metrics = metricsQuery.data ?? {
    totalIntents: 0,
    confirmedIntents: 0,
    volumeConfirmedUsdc: 0,
    volumeCreatedUsdc: 0,
    takeRateBps: 0,
    avgTakeOnConfirmedUsdc: 0,
  };

  const confirmedVolume = metrics.volumeConfirmedUsdc ?? 0;
  const availableBalance = metrics.avgTakeOnConfirmedUsdc ?? 0;

  return (
    <MobileContainer>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Painel Lojista</Text>
              <Text style={styles.subtitle}>
                {merchantId ? `Merchant ${merchantId}` : 'Carregue os dados da sua loja'}
              </Text>
            </View>
            <Button variant="ghost" size="icon" onPress={() => router.push('/(merchant)/profile')}>
              <Activity className="h-5 w-5 text-purple-500" />
            </Button>
          </View>

          <View style={styles.formCard}>
            <View style={styles.formRow}>
              <View style={styles.formField}>
                <Label>ID do merchant</Label>
                <Input
                  value={merchantId}
                  onChangeText={setMerchantId}
                  placeholder="merch_..."
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.formField}>
                <Label>API key</Label>
                <Input
                  value={apiKey}
                  onChangeText={setApiKey}
                  placeholder="sk_live_..."
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            </View>
            <Button onPress={loadData} disabled={metricsQuery.isFetching || salesQuery.isFetching}>
              <Text style={styles.buttonText}>
                {metricsQuery.isFetching || salesQuery.isFetching ? 'Sincronizando...' : 'Carregar dados'}
              </Text>
            </Button>
          </View>

          <View style={styles.badgeCard}>
            <BadgeCheck className="h-6 w-6 text-success" />
            <View>
              <Text style={styles.badgeTitle}>Integração Cronia para lojistas</Text>
              <Text style={styles.badgeSubtitle}>
                Use a API key acima para consultar vendas e antecipar recebíveis.
              </Text>
            </View>
          </View>

          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Saldo disponível estimado</Text>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceValue}>{formatCurrency(availableBalance)}</Text>
              <Text style={styles.balanceUnit}>USDC</Text>
            </View>
            <Button onPress={() => router.push('/(merchant)/receive')} className="w-full h-12">
              <QrCode className="mr-2 h-5 w-5" color="#FFFFFF" />
              <Text style={styles.receiveText}>Gerar QR de cobrança</Text>
            </Button>
          </View>

          <View style={styles.statGrid}>
            <StatCard
              icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
              label="Receita confirmada"
              value={formatCurrency(confirmedVolume)}
              footer="Volume confirmado"
            />
            <StatCard
              icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
              label="Take rate"
              value={`${(metrics.takeRateBps ?? 0) / 100}%`}
              footer={`Net médio: ${formatCurrency(metrics.avgTakeOnConfirmedUsdc ?? 0)}`}
              footerClass="text-success"
            />
            <StatCard
              icon={<Activity className="h-4 w-4 text-muted-foreground" />}
              label="Intenções confirmadas"
              value={metrics.confirmedIntents ?? 0}
              footer={`${metrics.totalIntents ?? 0} totais`}
            />
            <StatCard
              icon={<FileText className="h-4 w-4 text-muted-foreground" />}
              label="Últimas vendas"
              value={salesQuery.data?.length ?? 0}
              footer="intents confirmadas"
            />
          </View>

          <View style={styles.quickActions}>
            <Text style={styles.quickActionsTitle}>Ações rápidas</Text>
            <QuickActionButton
              icon={<Activity className="h-5 w-5 text-primary" />}
              label="Minhas vendas"
              onPress={() => router.push('/(merchant)/sales')}
            />
            <QuickActionButton
              icon={<TrendingUp className="h-5 w-5 text-primary" />}
              label="Antecipar recebíveis"
              onPress={() => router.push('/(merchant)/advance')}
            />
            <QuickActionButton
              icon={<FileText className="h-5 w-5 text-primary" />}
              label="Relatórios e extratos"
              onPress={() => router.push('/(merchant)/reports')}
            />
          </View>
        </View>
      </ScrollView>
    </MobileContainer>
  );
}

const StatCard = ({
  icon,
  label,
  value,
  footer,
  footerClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  footer: string;
  footerClass?: string;
}) => (
  <View style={styles.statCard}>
    <View style={styles.statHeader}>
      {icon}
      <Text style={styles.statLabel}>{label}</Text>
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={[styles.statFooter, footerClass ? { color: '#15803d' } : null]}>{footer}</Text>
  </View>
);

const QuickActionButton = ({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) => (
  <Button variant="outline" className="w-full h-14 justify-between flex-row" onPress={onPress}>
    <View className="flex-row items-center gap-3">
      {icon}
      <Text className="text-foreground">{label}</Text>
    </View>
    <ArrowRight className="h-5 w-5 text-muted-foreground" />
  </Button>
);

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'USD' });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formField: {
    flex: 1,
    gap: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  badgeCard: {
    backgroundColor: '#dcfce7',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  badgeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#047857',
  },
  badgeSubtitle: {
    fontSize: 13,
    color: '#047857',
  },
  balanceCard: {
    backgroundColor: '#312e81',
    borderRadius: 20,
    padding: 24,
    gap: 16,
  },
  balanceLabel: {
    color: '#c7d2fe',
    fontSize: 14,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#e0e7ff',
  },
  balanceUnit: {
    fontSize: 18,
    color: '#a5b4fc',
  },
  receiveText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 6,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  statFooter: {
    fontSize: 12,
    color: '#6b7280',
  },
  quickActions: {
    gap: 12,
  },
  quickActionsTitle: {
    fontSize: 14,
    textTransform: 'uppercase',
    fontWeight: '600',
    color: '#6b7280',
  },
});
