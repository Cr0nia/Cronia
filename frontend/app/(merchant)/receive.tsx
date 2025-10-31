import { Button } from '@/components/ui/button';
import { MobileContainer } from '@/components/MobileContainer';
import { router } from 'expo-router';
import {
  ArrowLeft,
  QrCode,
  Copy,
  CheckCircle,
  ExternalLink,
} from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, Text, View, TextInput } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

const ReceivePayment = () => {
  const [step, setStep] = useState<'form' | 'qr' | 'success'>('form');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const handleGenerate = () => {
    if (amount) {
      setStep('qr');
    }
  };

  const simulatePayment = () => {
    setTimeout(() => setStep('success'), 2000);
  };

  const recentTransactions = [
    { value: '45.00', time: 'há 5 min', status: 'confirmed' },
    { value: '128.50', time: 'há 23 min', status: 'confirmed' },
    { value: '89.00', time: 'há 1h', status: 'confirmed' },
  ];

  return (
    <MobileContainer>
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 border-b border-border flex-row items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onPress={() => (step === 'form' ? router.back() : setStep('form'))}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Text className="text-xl font-bold text-foreground">Receber pagamento</Text>
        </View>

        {step === 'form' && (
          <>
            <ScrollView className="flex-1 px-6 py-6" showsVerticalScrollIndicator={false}>
              <View className="space-y-5">
                <View>
                  <Text className="text-foreground mb-1.5">Valor (USDC)</Text>
                  <TextInput
                    keyboardType="numeric"
                    placeholder="0.00"
                    value={amount}
                    onChangeText={setAmount}
                    className="mt-1.5 text-2xl h-14 border border-border rounded-md px-4"
                  />
                </View>

                <View>
                  <Text className="text-foreground mb-1.5">Observação (opcional)</Text>
                  <TextInput
                    placeholder="Ex: Pedido #1234"
                    value={note}
                    onChangeText={setNote}
                    className="mt-1.5 border border-border rounded-md px-4 h-10"
                  />
                </View>

                <View className="bg-card rounded-xl p-4 border border-border">
                  <Text className="text-sm text-muted-foreground mb-3">Você receberá</Text>
                  <Text className="text-3xl font-bold text-foreground mb-1">
                    {amount ? (parseFloat(amount) * 0.982).toFixed(2) : '0.00'} USDC
                  </Text>
                  <Text className="text-sm text-muted-foreground">
                    Taxa Cronia: 1,8% • Cliente pode parcelar
                  </Text>
                </View>
              </View>

              {/* Recent Transactions */}
              <View className="mt-8">
                <Text className="text-sm font-semibold text-muted-foreground uppercase mb-3">
                  Últimas transações
                </Text>
                <View className="space-y-2">
                  {recentTransactions.map((tx, i) => (
                    <View
                      key={i}
                      className="bg-card rounded-xl p-4 border border-border flex-row items-center justify-between">
                      <View>
                        <Text className="font-semibold text-foreground">{tx.value} USDC</Text>
                        <Text className="text-sm text-muted-foreground">{tx.time}</Text>
                      </View>
                      <View className="flex-row items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-success" />
                        <Text className="text-sm text-success">Confirmado</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View className="px-6 pb-8 pt-4">
              <Button onPress={handleGenerate} className="w-full h-14 text-lg">
                <QrCode className="mr-2 h-5 w-5" color="#FFFFFF" />
                <Text className="text-white">Gerar QR Code</Text>
              </Button>
            </View>
          </>
        )}

        {step === 'qr' && (
          <View className="flex-1 px-6 py-8 flex-col items-center justify-center">
            <View className="bg-white rounded-2xl p-8 mb-6">
              <QRCode value={`solana:YOUR_WALLET_ADDRESS?amount=${amount}&label=${note}`} size={192} />
            </View>

            <View className="text-center mb-6">
              <Text className="text-3xl font-bold text-foreground mb-1">{amount} USDC</Text>
              {note && <Text className="text-muted-foreground">{note}</Text>}
            </View>

            <View className="w-full space-y-3 mb-8">
              <Button variant="outline" className="w-full h-12 flex-row">
                <Copy className="mr-2 h-5 w-5" />
                <Text>Copiar link de pagamento</Text>
              </Button>
              <Text className="text-center text-sm text-muted-foreground">
                Compatível com Solana Pay
              </Text>
            </View>

            <Button onPress={simulatePayment} variant="secondary" className="w-full h-12">
              <Text>Simular pagamento recebido</Text>
            </Button>
          </View>
        )}

        {step === 'success' && (
          <View className="flex-1 px-6 py-8 flex-col items-center justify-center">
            <View className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-10 w-10 text-success" />
            </View>

            <Text className="text-2xl font-bold text-foreground mb-2 text-center">
              Pagamento recebido!
            </Text>
            <Text className="text-muted-foreground text-center mb-8">
              O valor já está disponível na sua carteira
            </Text>

            <View className="w-full bg-card rounded-xl p-5 mb-6 border border-border space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Valor bruto</Text>
                <Text className="font-semibold text-foreground">{amount} USDC</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Taxa (1,8%)</Text>
                <Text className="font-semibold text-foreground">
                  -{(parseFloat(amount) * 0.018).toFixed(2)} USDC
                </Text>
              </View>
              <View className="border-t border-border pt-3 flex-row justify-between">
                <Text className="font-semibold text-foreground">Crédito líquido</Text>
                <Text className="text-xl font-bold text-success">
                  {(parseFloat(amount) * 0.982).toFixed(2)} USDC
                </Text>
              </View>
              <Button variant="link" className="text-primary p-0 h-auto w-full justify-center">
                <ExternalLink className="mr-2 h-4 w-4" />
                <Text>Ver no Explorer</Text>
              </Button>
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

export default ReceivePayment;
