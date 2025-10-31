import { Button } from '@/components/ui/button';
import { MobileContainer } from '@/components/MobileContainer';
import { router } from 'expo-router';
import {
  ArrowLeft,
  TrendingUp,
  CheckCircle,
  AlertCircle,
} from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';

const AdvanceReceivables = () => {
  const [step, setStep] = useState<'list' | 'simulate' | 'success'>('list');
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [advanceAmount, setAdvanceAmount] = useState(50);

  const eligibleSales = [
    {
      id: '1',
      client: 'Cliente #8KL2',
      totalPending: 300.0,
      installments: '2 parcelas futuras',
      date: '20/10/2024',
    },
    {
      id: '2',
      client: 'Cliente #9MP4',
      totalPending: 1066.67,
      installments: '5 parcelas futuras',
      date: '19/10/2024',
    },
    {
      id: '4',
      client: 'Cliente #5CD1',
      totalPending: 1925.0,
      installments: '11 parcelas futuras',
      date: '17/10/2024',
    },
  ];

  const handleSimulate = (sale: any) => {
    setSelectedSale(sale);
    setStep('simulate');
  };

  const handleAdvance = () => {
    setStep('success');
  };

  const calculateAdvanceValue = () => {
    if (!selectedSale) return 0;
    const amount = (selectedSale.totalPending * advanceAmount) / 100;
    const fee = amount * 0.03; // 3% fee
    return amount - fee;
  };

  const calculateFee = () => {
    if (!selectedSale) return 0;
    const amount = (selectedSale.totalPending * advanceAmount) / 100;
    return amount * 0.03;
  };

  return (
    <MobileContainer>
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 border-b border-border flex-row items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onPress={() => (step === 'list' ? router.back() : setStep('list'))}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Text className="text-xl font-bold text-foreground">Antecipar recebíveis</Text>
        </View>

        {step === 'list' && (
          <>
            <View className="px-6 py-4 bg-card border-b border-border">
              <View className="flex-row items-start gap-3">
                <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <View>
                  <Text className="font-semibold text-foreground mb-1">Liquidez imediata</Text>
                  <Text className="text-sm text-muted-foreground">
                    Antecipe suas parcelas futuras e receba USDC na hora. Taxa de 3%.
                  </Text>
                </View>
              </View>
            </View>

            <ScrollView className="flex-1 px-6 py-6" showsVerticalScrollIndicator={false}>
              <Text className="text-sm font-semibold text-muted-foreground uppercase mb-3">
                Vendas elegíveis
              </Text>
              <View className="space-y-3">
                {eligibleSales.map(sale => (
                  <View key={sale.id} className="bg-card rounded-xl p-4 border border-border">
                    <View className="flex-row items-start justify-between mb-3">
                      <View>
                        <Text className="font-semibold text-foreground">{sale.client}</Text>
                        <Text className="text-sm text-muted-foreground">{sale.installments}</Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-xl font-bold text-foreground">
                          {sale.totalPending.toFixed(2)}
                        </Text>
                        <Text className="text-sm text-muted-foreground">USDC</Text>
                      </View>
                    </View>
                    <Button
                      onPress={() => handleSimulate(sale)}
                      variant="outline"
                      className="w-full">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      <Text>Simular antecipação</Text>
                    </Button>
                  </View>
                ))}
              </View>
            </ScrollView>
          </>
        )}

        {step === 'simulate' && selectedSale && (
          <>
            <ScrollView className="flex-1 px-6 py-6" showsVerticalScrollIndicator={false}>
              <View className="bg-card rounded-xl p-5 mb-6 border border-border">
                <Text className="text-sm text-muted-foreground mb-1">Venda selecionada</Text>
                <Text className="font-semibold text-foreground">{selectedSale.client}</Text>
                <Text className="text-sm text-muted-foreground">{selectedSale.installments}</Text>
              </View>

              <View className="mb-8">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-foreground font-semibold">Quanto deseja antecipar?</Text>
                  <Text className="text-2xl font-bold text-primary">{advanceAmount}%</Text>
                </View>
                <Slider
                  value={advanceAmount}
                  onValueChange={value => setAdvanceAmount(value)}
                  minimumValue={10}
                  maximumValue={100}
                  step={10}
                  minimumTrackTintColor="#6366f1"
                  maximumTrackTintColor="#e5e7eb"
                  thumbTintColor="#6366f1"
                />
                <View className="flex-row justify-between">
                  <Text className="text-xs text-muted-foreground">10%</Text>
                  <Text className="text-xs text-muted-foreground">100%</Text>
                </View>
              </View>

              <View className="bg-primary/10 rounded-2xl p-5 border border-primary/20 space-y-3">
                <View className="flex-row justify-between">
                  <Text className="text-muted-foreground">Valor a antecipar</Text>
                  <Text className="font-semibold text-foreground">
                    {((selectedSale.totalPending * advanceAmount) / 100).toFixed(2)} USDC
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-muted-foreground">Taxa (3%)</Text>
                  <Text className="font-semibold text-foreground">
                    -{calculateFee().toFixed(2)} USDC
                  </Text>
                </View>
                <View className="border-t border-border pt-3 flex-row justify-between">
                  <Text className="font-semibold text-foreground">Receberá agora</Text>
                  <Text className="text-2xl font-bold text-success">
                    {calculateAdvanceValue().toFixed(2)} USDC
                  </Text>
                </View>
              </View>

              <View className="mt-6 bg-warning/10 border border-warning/30 rounded-xl p-4">
                <View className="flex-row gap-3">
                  <AlertCircle className="h-5 w-5 text-warning shrink-0" />
                  <Text className="text-sm text-warning flex-1">
                    As parcelas antecipadas serão automaticamente creditadas conforme vencimento.
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View className="px-6 pb-8 pt-4">
              <Button onPress={handleAdvance} className="w-full h-14 text-lg">
                <Text>Antecipar agora</Text>
              </Button>
            </View>
          </>
        )}

        {step === 'success' && (
          <View className="flex-1 px-6 py-8 flex flex-col items-center justify-center">
            <View className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-10 w-10 text-success" />
            </View>

            <Text className="text-2xl font-bold text-foreground mb-2 text-center">
              Liquidez recebida!
            </Text>
            <Text className="text-muted-foreground text-center mb-8">
              O valor já está disponível na sua carteira
            </Text>

            <View className="w-full bg-card rounded-xl p-5 mb-6 border border-border">
              <View className="items-center mb-4">
                <Text className="text-sm text-muted-foreground mb-1">Você recebeu</Text>
                <Text className="text-4xl font-bold text-success">
                  {calculateAdvanceValue().toFixed(2)} USDC
                </Text>
              </View>
              <View className="border-t border-border pt-4 space-y-2 text-sm">
                <View className="flex-row justify-between text-muted-foreground">
                  <Text>Valor antecipado</Text>
                  <Text>{((selectedSale?.totalPending * advanceAmount) / 100).toFixed(2)} USDC</Text>
                </View>
                <View className="flex-row justify-between text-muted-foreground">
                  <Text>Taxa (3%)</Text>
                  <Text>-{calculateFee().toFixed(2)} USDC</Text>
                </View>
              </View>
            </View>

            <Button onPress={() => router.push('/(merchant)/merchant-dashboard')} className="w-full h-14 text-lg">
              <Text>Voltar ao painel</Text>
            </Button>
          </View>
        )}
      </View>
    </MobileContainer>
  );
};

export default AdvanceReceivables;
