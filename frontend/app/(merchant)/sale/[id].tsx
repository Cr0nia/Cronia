import { Button } from '@/components/ui/button';
import { MobileContainer } from '@/components/MobileContainer';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  ExternalLink,
  CheckCircle,
  Copy,
} from 'lucide-react-native';
import { ScrollView, Text, View } from 'react-native';

const MerchantSaleDetail = () => {
  const { id } = useLocalSearchParams();
  const saleId = Array.isArray(id) ? id[0] : id ?? '—';

  const installments = [
    {
      num: 1,
      value: 150.0,
      status: 'paid',
      date: '20/10/2024',
      net: 147.3,
    },
    {
      num: 2,
      value: 150.0,
      status: 'paid',
      date: '20/11/2024',
      net: 147.3,
    },
    {
      num: 3,
      value: 150.0,
      status: 'pending',
      date: '20/12/2024',
      net: 147.3,
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
          <Text className="text-xl font-bold text-foreground">Venda #{saleId}</Text>
        </View>

        <ScrollView className="flex-1 px-6 py-6" showsVerticalScrollIndicator={false}>
          {/* Sale Info */}
          <View className="bg-card rounded-xl p-5 mb-6 border border-border">
            <View className="flex-row justify-between mb-4">
              <View>
                <Text className="text-sm text-muted-foreground">Cliente</Text>
                <Text className="font-semibold text-foreground">Cliente #8KL2</Text>
              </View>
              <View className="items-end">
                <Text className="text-sm text-muted-foreground">Data</Text>
                <Text className="font-semibold text-foreground">20/10/2024</Text>
              </View>
            </View>

            <View className="border-t border-border pt-4 space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Valor total</Text>
                <Text className="font-semibold text-foreground">450.00 USDC</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Parcelas</Text>
                <Text className="font-semibold text-foreground">3x de 150.00 USDC</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Taxa Cronia (1,8%)</Text>
                <Text className="font-semibold text-foreground">-8.10 USDC</Text>
              </View>
              <View className="border-t border-border pt-3 flex-row justify-between">
                <Text className="font-semibold text-foreground">Valor líquido</Text>
                <Text className="text-xl font-bold text-success">441.90 USDC</Text>
              </View>
            </View>

            <Button variant="link" className="text-primary p-0 h-auto w-full justify-center mt-4">
              <ExternalLink className="mr-2 h-4 w-4" />
              <Text>Ver no Explorer</Text>
            </Button>
          </View>

          {/* Installments */}
          <View>
            <Text className="text-sm font-semibold text-muted-foreground uppercase mb-3">
              Parcelas
            </Text>
            <View className="space-y-2">
              {installments.map(inst => (
                <View key={inst.num} className="bg-card rounded-xl p-4 border border-border">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center gap-3">
                      {inst.status === 'paid' ? (
                        <View className="w-8 h-8 bg-success/20 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-success" />
                        </View>
                      ) : (
                        <View className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                          <Text className="text-sm font-semibold text-muted-foreground">
                            {inst.num}
                          </Text>
                        </View>
                      )}
                      <View>
                        <Text className="font-semibold text-foreground">Parcela {inst.num}/3</Text>
                        <Text className="text-sm text-muted-foreground">{inst.date}</Text>
                      </View>
                    </View>
                    <View className="items-end">
                      <Text className="font-semibold text-foreground">
                        {inst.value.toFixed(2)} USDC
                      </Text>
                      <Text className="text-sm text-success">Líquido: {inst.net.toFixed(2)}</Text>
                    </View>
                  </View>
                  {inst.status === 'paid' && (
                    <View className="mt-2 pt-2 border-t border-border">
                      <Button variant="link" className="text-primary p-0 h-auto text-xs">
                        <Copy className="mr-1 h-3 w-3" />
                        <Text>Copiar hash da transação</Text>
                      </Button>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </MobileContainer>
  );
};

export default MerchantSaleDetail;
