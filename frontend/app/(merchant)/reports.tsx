import { Button } from '@/components/ui/button';
import { MobileContainer } from '@/components/MobileContainer';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Download,
  ExternalLink,
  TrendingUp,
  DollarSign,
  Activity,
} from 'lucide-react-native';
import { ScrollView, Text, View } from 'react-native';

const MerchantReports = () => {
  return (
    <MobileContainer>
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 border-b border-border flex-row items-center gap-4">
          <Button variant="ghost" size="icon" onPress={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Text className="text-xl font-bold text-foreground">Relatórios</Text>
        </View>

        <ScrollView className="flex-1 px-6 py-6" showsVerticalScrollIndicator={false}>
          {/* Period Selector */}
          <View className="flex-row gap-2 mb-6">
            <Button variant="default" size="sm">
              <Text>7 dias</Text>
            </Button>
            <Button variant="outline" size="sm">
              <Text>30 dias</Text>
            </Button>
            <Button variant="outline" size="sm">
              <Text>Personalizado</Text>
            </Button>
          </View>

          {/* Summary Cards */}
          <View className="space-y-3 mb-6">
            <View className="bg-primary/10 rounded-xl p-5 border border-primary/20">
              <View className="flex-row items-center gap-2 text-muted-foreground text-sm mb-2">
                <TrendingUp className="h-4 w-4" />
                <Text>Volume total</Text>
              </View>
              <Text className="text-3xl font-bold text-foreground mb-1">8.472,00 USDC</Text>
              <Text className="text-sm text-success">+23% vs período anterior</Text>
            </View>

            <View className="flex-row justify-between">
              <View className="w-[48%] bg-card rounded-xl p-4 border border-border">
                <View className="flex-row items-center gap-2 text-muted-foreground text-sm mb-2">
                  <Activity className="h-4 w-4" />
                  <Text>Transações</Text>
                </View>
                <Text className="text-2xl font-bold text-foreground">64</Text>
              </View>

              <View className="w-[48%] bg-card rounded-xl p-4 border border-border">
                <View className="flex-row items-center gap-2 text-muted-foreground text-sm mb-2">
                  <DollarSign className="h-4 w-4" />
                  <Text>Taxas pagas</Text>
                </View>
                <Text className="text-2xl font-bold text-foreground">152,50</Text>
                <Text className="text-xs text-muted-foreground">USDC</Text>
              </View>
            </View>
          </View>

          {/* Chart Placeholder */}
          <View className="bg-card rounded-xl p-5 mb-6 border border-border">
            <Text className="font-semibold text-foreground mb-4">Volume por dia</Text>
            <View className="h-40 flex-row items-end justify-between gap-2">
              {[40, 65, 55, 80, 70, 90, 85].map((height, i) => (
                <View key={i} className="flex-1 flex-col items-center gap-2">
                  <View
                    className="w-full bg-primary rounded-t-lg"
                    style={{ height: `${height}%` }}
                  />
                  <Text className="text-xs text-muted-foreground">
                    {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"][i]}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Breakdown */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-muted-foreground uppercase mb-3">
              Detalhamento
            </Text>
            <View className="space-y-2">
              {[
                { label: "Vendas à vista (1x)", value: "3.240,00", count: 27 },
                { label: "Vendas parceladas", value: "5.232,00", count: 37 },
                { label: "Antecipações realizadas", value: "1.450,00", count: 3 },
              ].map((item, i) => (
                <View key={i} className="bg-card rounded-xl p-4 border border-border">
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="font-semibold text-foreground">{item.label}</Text>
                      <Text className="text-sm text-muted-foreground">{item.count} transações</Text>
                    </View>
                    <Text className="text-xl font-bold text-foreground">{item.value}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Actions */}
          <View className="space-y-3">
            <Button variant="outline" className="w-full h-12 flex-row">
              <Download className="mr-2 h-5 w-5" />
              <Text>Baixar relatório CSV</Text>
            </Button>
            <Button variant="outline" className="w-full h-12 flex-row">
              <ExternalLink className="mr-2 h-5 w-5" />
              <Text>Ver todas as transações no Explorer</Text>
            </Button>
          </View>
        </ScrollView>
      </View>
    </MobileContainer>
  );
};

export default MerchantReports;
