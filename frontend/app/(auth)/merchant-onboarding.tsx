
import { MobileContainer } from '@/components/MobileContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { router } from 'expo-router';
import { CheckCircle, Clock, Store } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

const MerchantOnboarding = () => {
  const [step, setStep] = useState<'form' | 'creating' | 'success'>('form');

  const handleSubmit = () => {
    setStep('creating');
    setTimeout(() => setStep('success'), 2000);
  };

  return (
    <MobileContainer>
      <View className="flex-1">
        {step === 'form' && (
          <>
            <ScrollView
              className="flex-1 px-6 py-8"
              showsVerticalScrollIndicator={false}
              contentContainerClassName="flex-grow">
              <View className="mb-8">
                <View className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-4">
                  <Store className="h-8 w-8 text-primary" />
                </View>
                <Text className="text-3xl font-bold text-foreground mb-2">
                  Cadastrar sua loja
                </Text>
                <Text className="text-muted-foreground">
                  Crie sua carteira Solana e comece a receber pagamentos Web3
                </Text>
              </View>

              <View className="space-y-5">
                <View>
                  <Label>Nome do comércio</Label>
                  <Input placeholder="Ex: Cafeteria Central" className="mt-1.5" />
                </View>

                <View>
                  <Label>Tipo de negócio</Label>
                  <Input placeholder="Ex: Alimentação" className="mt-1.5" />
                </View>

                <View>
                  <Label>CNPJ (opcional)</Label>
                  <Input placeholder="00.000.000/0000-00" className="mt-1.5" />
                </View>

                <View>
                  <Label>E-mail</Label>
                  <Input
                    keyboardType="email-address"
                    placeholder="contato@loja.com"
                    className="mt-1.5"
                  />
                </View>

                <View>
                  <Label>Telefone</Label>
                  <Input keyboardType="phone-pad" placeholder="(11) 99999-9999" className="mt-1.5" />
                </View>

                <View className="bg-card rounded-xl p-4 border border-border">
                  <Text className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                    Benefícios Cronia
                  </Text>
                  <View className="space-y-1.5">
                    <Text className="text-sm text-muted-foreground">
                      • Carteira Solana grátis e não-custodial
                    </Text>
                    <Text className="text-sm text-muted-foreground">
                      • Taxas menores que maquininhas tradicionais
                    </Text>
                    <Text className="text-sm text-muted-foreground">
                      • Receba em USDC com liquidez imediata
                    </Text>
                    <Text className="text-sm text-muted-foreground">
                      • Antecipe seus recebíveis quando precisar
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            <View className="px-6 pb-8 pt-4">
              <Button onPress={handleSubmit} className="w-full h-14 text-lg">
                <Text>Criar conta e carteira</Text>
              </Button>
            </View>
          </>
        )}

        {step === 'creating' && (
          <View className="flex-1 flex flex-col items-center justify-center px-6">
            <View className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6">
              <Clock className="h-10 w-10 text-primary" />
            </View>
            <Text className="text-2xl font-bold text-foreground mb-2">
              Criando sua carteira Solana...
            </Text>
            <Text className="text-muted-foreground text-center">
              Aguarde enquanto configuramos tudo para você
            </Text>
          </View>
        )}

        {step === 'success' && (
          <View className="flex-1 flex flex-col items-center justify-center px-6">
            <View className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-10 w-10 text-success" />
            </View>
            <Text className="text-2xl font-bold text-foreground mb-2">Loja cadastrada!</Text>
            <Text className="text-muted-foreground text-center mb-6">
              Sua carteira foi criada com sucesso
            </Text>

            <View className="w-full bg-card rounded-xl p-4 mb-6 border border-border">
              <Text className="text-sm text-muted-foreground mb-1">ID da Loja</Text>
              <Text className="font-mono text-foreground">CRNA-2024-8X9K</Text>
              <Button variant="link" className="text-primary p-0 h-auto mt-2">
                <Text>Ver transação →</Text>
              </Button>
            </View>

            <Button
              onPress={() => router.push('/(merchant)/merchant-dashboard')}
              className="w-full h-14 text-lg">
              <Text>Ir para o painel</Text>
            </Button>
          </View>
        )}
      </View>
    </MobileContainer>
  );
};

export default MerchantOnboarding;
