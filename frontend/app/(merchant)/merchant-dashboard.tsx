import { Button } from '@/components/ui/button';
import { MobileContainer } from '@/components/MobileContainer';
import { router } from 'expo-router';
import {
  QrCode,
  FileText,
  TrendingUp,
  DollarSign,
  Activity,
  BadgeCheck,
  ArrowRight,
} from 'lucide-react-native';
import { ScrollView, Text, View } from 'react-native';

const MerchantDashboard = () => {
  return (
    <MobileContainer>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-2xl font-bold text-foreground">Painel Lojista</Text>
              <Text className="text-sm text-muted-foreground">Cafeteria Central</Text>
            </View>
            <Button
              variant="ghost"
              size="icon"
              onPress={() => router.push('/(merchant)/profile')}>
              <Activity className="h-5 w-5" />
            </Button>
          </View>

          {/* Verified Badge */}
          <View className="bg-success/10 border border-success/30 rounded-xl p-4 mb-6 flex-row items-center gap-3">
            <BadgeCheck className="h-6 w-6 text-success shrink-0" />
            <View>
              <Text className="font-semibold text-success">Loja Verificada Cronia</Text>
              <Text className="text-sm text-success/80">Taxas reduzidas ativas</Text>
            </View>
          </View>

          {/* Balance Card */}
          <View className="bg-primary/10 rounded-2xl p-6 mb-6 border border-primary/20">
            <Text className="text-muted-foreground text-sm mb-1">Saldo disponível</Text>
            <View className="flex-row items-baseline mb-4">
              <Text className="text-4xl font-bold text-foreground">8.472,00 </Text>
              <Text className="text-xl text-muted-foreground">USDC</Text>
            </View>
            <Button onPress={() => router.push('/(merchant)/receive')} className="w-full h-12">
              <QrCode className="mr-2 h-5 w-5" color="#FFFFFF" />
              <Text className="text-white">Receber pagamento</Text>
            </Button>
          </View>

          {/* Stats Grid */}
          <View className="flex-row flex-wrap justify-between mb-2">
            <StatCard
              icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
              label="Total de vendas"
              value="R$ 34.280"
              footer="Últimos 30 dias"
            />
            <StatCard
              icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
              label="Taxa média"
              value="1,8%"
              footer="-0,7% vs tradicional"
              footerClass="text-success"
            />
            <StatCard
              icon={<Activity className="h-4 w-4 text-muted-foreground" />}
              label="Volume do mês"
              value="248"
              footer="transações"
            />
            <StatCard
              icon={<FileText className="h-4 w-4 text-muted-foreground" />}
              label="A receber"
              value="12.450"
              footer="USDC em parcelas"
            />
          </View>

          {/* Quick Actions */}
          <View className="space-y-3 mb-6">
            <Text className="text-sm font-semibold text-muted-foreground uppercase">Ações rápidas</Text>

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
};

const StatCard = ({ icon, label, value, footer, footerClass }: any) => (
  <View className="w-[48%] bg-card rounded-xl p-4 border border-border mb-4">
    <View className="flex-row items-center gap-2 text-muted-foreground text-sm mb-2">
      {icon}
      <Text className="text-muted-foreground">{label}</Text>
    </View>
    <Text className="text-2xl font-bold text-foreground">{value}</Text>
    <Text className={`text-xs mt-1 ${footerClass || 'text-muted-foreground'}`}>{footer}</Text>
  </View>
);

const QuickActionButton = ({ icon, label, onPress }: any) => (
  <Button
    variant="outline"
    className="w-full h-14 justify-between flex-row"
    onPress={onPress}>
    <View className="flex-row items-center gap-3">
      {icon}
      <Text className="text-foreground">{label}</Text>
    </View>
    <ArrowRight className="h-5 w-5 text-muted-foreground" />
  </Button>
);

export default MerchantDashboard;
