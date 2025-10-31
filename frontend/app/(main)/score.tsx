import { useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, TrendingUp, AlertCircle, Smile, Award } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';

import { MobileContainer } from '@/components/MobileContainer';
import { useAuth } from '@/context/AuthContext';
import { UsersApi } from '@/services/backend';

interface Factor {
  icon: React.ReactNode;
  label: string;
  items: string[];
  color: string;
}

export default function Score() {
  const { user, primaryWallet } = useAuth();

  const scoreQuery = useQuery({
    queryKey: ['user-score', user?.id],
    queryFn: () => UsersApi.getScore(user!.id),
    enabled: Boolean(user?.id),
    staleTime: 60_000,
  });

  const score = scoreQuery.data?.score ?? 0;
  const scoreClass = getScoreClass(score);
  const confirmedPurchases = scoreQuery.data?.confirmedPurchases ?? 0;
  const hasWallet = Boolean(primaryWallet?.pubkey);

  const factors: Factor[] = useMemo(() => {
    const list: Factor[] = [];

    if (!hasWallet) {
      list.push({
        icon: <AlertCircle color="#ef4444" size={20} />,
        label: 'Precisa de atenção',
        items: ['Crie sua carteira Cronia para liberar o crédito.'],
        color: 'destructive',
      });
    }

    if (confirmedPurchases === 0) {
      list.push({
        icon: <TrendingUp color="#f59e0b" size={20} />,
        label: 'Pode melhorar',
        items: ['Confirme sua primeira compra para ganhar 50 pontos extras.'],
        color: 'warning',
      });
    } else {
      list.push({
        icon: <Award color="#10b981" size={20} />,
        label: 'Ótimo',
        items: [
          `Você já confirmou ${confirmedPurchases} compra${confirmedPurchases > 1 ? 's' : ''}.`,
          'Mantém comportamento de pagamento saudável.',
        ],
        color: 'success',
      });
    }

    list.push({
      icon: <Smile color="#6366f1" size={20} />,
      label: 'Bom',
      items: [
        'Use seu crédito com responsabilidade para aumentar o score.',
        'Mantenha o Health Factor acima de 1.2.',
      ],
      color: 'primary',
    });

    return list;
  }, [confirmedPurchases, hasWallet]);

  const getColorStyle = (color: string) => {
    switch(color) {
      case 'destructive': return { backgroundColor: '#fee2e2', color: '#ef4444' };
      case 'warning': return { backgroundColor: '#fef3c7', color: '#f59e0b' };
      case 'primary': return { backgroundColor: '#eef2ff', color: '#6366f1' };
      case 'success': return { backgroundColor: '#d1fae5', color: '#10b981' };
      default: return { backgroundColor: '#f3f4f6', color: '#6b7280' };
    }
  };

  // Cálculo para o círculo de progresso
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(score / 1000, 0), 1) * circumference;

  return (
    <MobileContainer>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft color="#6b7280" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>CroniaScore</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Score Display */}
          <View style={styles.scoreCard}>
            <View style={styles.scoreCircle}>
              <Svg width={192} height={192} style={{ transform: [{ rotate: '-90deg' }] }}>
                <Circle cx={96} cy={96} r={radius} stroke="#e5e7eb" strokeWidth={12} fill="none" />
                <Circle
                  cx={96}
                  cy={96}
                  r={radius}
                  stroke="#10b981"
                  strokeWidth={12}
                  fill="none"
                  strokeDasharray={`${progress} ${circumference}`}
                  strokeLinecap="round"
                />
              </Svg>
              <View style={styles.scoreValue}>
                <Text style={styles.scoreNumber}>
                  {scoreQuery.isLoading ? <ActivityIndicator /> : score}
                </Text>
                <Text style={styles.scoreMax}>de 1000</Text>
              </View>
            </View>
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreBadgeText}>Score {scoreClass}</Text>
            </View>
            <Text style={styles.scoreUpdate}>Atualizações mensais</Text>
          </View>

          {/* Factors */}
          <Text style={styles.sectionTitle}>O que impactou no seu CroniaScore</Text>

          <View style={styles.factorsList}>
            {factors.map((factor, index) => {
              const colorStyle = getColorStyle(factor.color);
              return (
                <View key={index} style={styles.factorCard}>
                  <View style={styles.factorHeader}>
                    <View style={styles.factorLeft}>
                      <View style={[styles.factorIcon, { backgroundColor: colorStyle.backgroundColor }]}>
                        {factor.icon}
                      </View>
                      <Text style={styles.factorLabel}>{factor.label}</Text>
                    </View>
                    <Text style={styles.factorCount}>
                      {factor.items.length} {factor.items.length === 1 ? 'item' : 'itens'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.tipCard}>
            <Text style={styles.tipText}>
              <Text style={styles.tipBold}>💡 Como melhorar:</Text> Pague em dia, mantenha baixa utilização do limite e diversifique suas garantias.
            </Text>
          </View>
        </ScrollView>
      </View>
    </MobileContainer>
  );
}

function getScoreClass(value: number) {
  if (value >= 850) return 'Excelente';
  if (value >= 700) return 'Alto';
  if (value >= 550) return 'Moderado';
  return 'Baixo';
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
  scoreCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreCircle: {
    position: 'relative',
    width: 192,
    height: 192,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  scoreValue: {
    position: 'absolute',
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#111827',
  },
  scoreMax: {
    fontSize: 14,
    color: '#6b7280',
  },
  scoreBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 16,
  },
  scoreBadgeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
  },
  scoreUpdate: {
    fontSize: 14,
    color: '#6b7280',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  factorsList: {
    gap: 12,
  },
  factorCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  factorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  factorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  factorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  factorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  factorCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  tipCard: {
    backgroundColor: '#eef2ff',
    borderWidth: 1,
    borderColor: '#c7d2fe',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  tipText: {
    fontSize: 14,
    color: '#111827',
  },
  tipBold: {
    fontWeight: '600',
  },
});
