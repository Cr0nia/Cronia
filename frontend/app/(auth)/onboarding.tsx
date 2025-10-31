import { View, Text } from 'react-native';
import { MobileContainer } from '@/components/MobileContainer';
import { Button } from '@/components/ui/button';
import { router } from 'expo-router';
import { Wallet, Shield, Zap } from 'lucide-react-native';

export default function Onboarding() {
  return (
    <MobileContainer>
      <View className="flex-1">
        <View className="flex-1 items-center justify-center p-6">
          <View className="relative mb-8">
            <View className="h-24 w-24 items-center justify-center rounded-2xl bg-indigo-500">
              <Wallet color="#ffffff" size={48} />
            </View>
            <View className="absolute -bottom-2 -right-2 h-8 w-8 items-center justify-center rounded-full bg-emerald-500">
              <Zap color="#ffffff" size={20} />
            </View>
          </View>

          <Text className="mb-4 text-center text-4xl font-bold text-gray-900">
            Bem-vindo ao Cronia
          </Text>

          <Text className="mb-12 max-w-sm text-center text-base text-gray-500">
            Crédito parcelado usando seus ativos cripto como garantia. Simples, transparente e seguro.
          </Text>

          <View className="w-full max-w-sm space-y-4">
            <FeatureItem
              icon={<Wallet color="#6366f1" size={20} />}
              title="Carteira grátis"
              description="Crie sua carteira Solana sem custo"
            />
            <FeatureItem
              icon={<Shield color="#6366f1" size={20} />}
              title="Garantia segura"
              description="Seus ativos bloqueados on-chain"
            />
            <FeatureItem
              icon={<Zap color="#6366f1" size={20} />}
              title="Crédito instantâneo"
              description="Parcele suas compras na hora"
            />
          </View>
        </View>

        <View className="space-y-3 p-6">
          <Button
            onPress={() => router.push('/(auth)/create-account')}
          >
            <Text className="text-lg font-semibold text-white">Criar conta grátis</Text>
          </Button>
          <Button
            onPress={() => router.push('/(auth)/merchant-onboarding')}
          >
            <Text className="text-lg font-semibold text-white">Sou Lojista</Text>
          </Button>
          <Button variant="ghost">
            <Text className="text-lg text-gray-500">Já tenho conta</Text>
          </Button>
        </View>
      </View>
    </MobileContainer>
  );
}

interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureItem({ icon, title, description }: FeatureItemProps) {
  return (
    <View className="flex-row items-start gap-4 rounded-xl bg-white p-4">
      <View className="h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="mb-1 text-base font-semibold text-gray-900">{title}</Text>
        <Text className="text-sm text-gray-500">{description}</Text>
      </View>
    </View>
  );
}