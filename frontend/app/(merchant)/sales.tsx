import { Button } from '@/components/ui/button';
import { MobileContainer } from '@/components/MobileContainer';
import { router } from 'expo-router';
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react-native';
import { ScrollView, Text, View, TouchableOpacity } from 'react-native';

const MerchantSales = () => {
  const sales = [
    {
      id: '1',
      client: 'Cliente #8KL2',
      total: 450.0,
      installments: '3x',
      status: 'active',
      date: '20/10/2024',
    },
    {
      id: '2',
      client: 'Cliente #9MP4',
      total: 1280.5,
      installments: '6x',
      status: 'active',
      date: '19/10/2024',
    },
    {
      id: '3',
      client: 'Cliente #2AB9',
      total: 89.0,
      installments: '1x',
      status: 'completed',
      date: '18/10/2024',
    },
    {
      id: '4',
      client: 'Cliente #5CD1',
      total: 2100.0,
      installments: '12x',
      status: 'active',
      date: '17/10/2024',
    },
    {
      id: '5',
      client: 'Cliente #7EF3',
      total: 340.0,
      installments: '2x',
      status: 'completed',
      date: '16/10/2024',
    },
  ];

  return (
    <MobileContainer>
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 border-b border-border flex-row items-center gap-4">
          <Button variant="ghost" size="icon" onPress={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Text className="text-xl font-bold text-foreground">Minhas vendas</Text>
        </View>

        {/* Stats */}
        <View className="px-6 py-4 bg-card border-b border-border">
          <View className="flex-row justify-around">
            <View className="items-center">
              <Text className="text-2xl font-bold text-foreground">248</Text>
              <Text className="text-xs text-muted-foreground">Total</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-success">234</Text>
              <Text className="text-xs text-muted-foreground">Pagas</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-warning">14</Text>
              <Text className="text-xs text-muted-foreground">Pendentes</Text>
            </View>
          </View>
        </View>

        {/* Sales List */}
        <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
          <View className="space-y-3">
            {sales.map(sale => (
              <TouchableOpacity
                key={sale.id}
                onPress={() => router.push(`/(merchant)/sale/${sale.id}`)}>
                <View className="bg-card rounded-xl p-4 border border-border">
                  <View className="flex-row items-start justify-between mb-3">
                    <View>
                      <Text className="font-semibold text-foreground">{sale.client}</Text>
                      <Text className="text-sm text-muted-foreground">{sale.date}</Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      {sale.status === 'completed' ? (
                        <CheckCircle className="h-5 w-5 text-success" />
                      ) : (
                        <Clock className="h-5 w-5 text-warning" />
                      )}
                    </View>
                  </View>

                  <View className="flex-row items-end justify-between">
                    <View>
                      <Text className="text-2xl font-bold text-foreground">
                        {sale.total.toFixed(2)} USDC
                      </Text>
                      <Text className="text-sm text-muted-foreground">{sale.installments}</Text>
                    </View>
                    <View
                      className={`px-3 py-1 rounded-full ${
                        sale.status === 'completed'
                          ? 'bg-success/10'
                          : 'bg-warning/10'
                      }`}>
                      <Text
                        className={`text-xs font-medium ${
                          sale.status === 'completed' ? 'text-success' : 'text-warning'
                        }`}>
                        {sale.status === 'completed' ? 'Concluída' : 'Em andamento'}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </MobileContainer>
  );
};

export default MerchantSales;
