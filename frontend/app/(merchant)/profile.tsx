import { Button } from '@/components/ui/button';
import { MobileContainer } from '@/components/MobileContainer';
import { router } from 'expo-router';
import {
  ArrowLeft,
  BadgeCheck,
  Upload,
  Shield,
  Bell,
  HelpCircle,
  LogOut,
} from 'lucide-react-native';
import { ScrollView, Text, View } from 'react-native';

const MerchantProfile = () => {
  return (
    <MobileContainer>
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 border-b border-border flex-row items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onPress={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Text className="text-xl font-bold text-foreground">Perfil e configurações</Text>
        </View>

        <ScrollView className="flex-1 px-6 py-6" showsVerticalScrollIndicator={false}>
          {/* Store Info */}
          <View className="bg-card rounded-xl p-5 mb-6 border border-border">
            <View className="flex-row items-center gap-4 mb-4">
              <View className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center">
                <Text className="text-2xl font-bold text-primary">CF</Text>
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-foreground">Cafeteria Central</Text>
                <Text className="text-sm text-muted-foreground">ID: CRNA-2024-8X9K</Text>
              </View>
            </View>
            <View className="flex-row items-center gap-2 text-success">
              <BadgeCheck className="h-5 w-5 text-success" />
              <Text className="font-semibold text-success">Loja Verificada Cronia</Text>
            </View>
          </View>

          {/* KYC Section */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-muted-foreground uppercase mb-3">
              Verificação KYC
            </Text>
            <View className="bg-card rounded-xl p-5 border border-border">
              <View className="flex-row items-start gap-3 mb-4">
                <View className="w-10 h-10 bg-success/20 rounded-full flex items-center justify-center shrink-0">
                  <BadgeCheck className="h-5 w-5 text-success" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-foreground mb-1">Status: Verificada</Text>
                  <Text className="text-sm text-muted-foreground mb-3">
                    Documentos aprovados em 18/10/2024
                  </Text>
                  <View className="space-y-2 text-sm">
                    <KycItem label="CNPJ" />
                    <KycItem label="Comprovante de endereço" />
                    <KycItem label="Dados do responsável" isLast />
                  </View>
                </View>
              </View>
              <Button variant="outline" className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                <Text>Atualizar documentos</Text>
              </Button>
            </View>
          </View>

          {/* CroniaScore */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-muted-foreground uppercase mb-3">
              Reputação comercial
            </Text>
            <View className="bg-primary/10 rounded-xl p-5 border border-primary/20">
              <View className="flex-row justify-between items-center mb-4">
                <View>
                  <Text className="text-sm text-muted-foreground mb-1">CroniaScore</Text>
                  <Text className="text-4xl font-bold text-foreground">850</Text>
                </View>
                <View className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center">
                  <Text className="text-2xl font-bold text-success">A</Text>
                </View>
              </View>
              <Text className="text-sm text-muted-foreground mb-3">
                Excelente! Você tem acesso às melhores condições.
              </Text>
              <Button variant="outline" className="w-full">
                <Text>Ver detalhes do score</Text>
              </Button>
            </View>
          </View>

          {/* Settings */}
          <View className="space-y-2 mb-6">
            <Text className="text-sm font-semibold text-muted-foreground uppercase mb-3">
              Configurações
            </Text>
            <SettingsButton icon={<Shield className="h-5 w-5 text-primary" />} label="Segurança e privacidade" />
            <SettingsButton icon={<Bell className="h-5 w-5 text-primary" />} label="Notificações" />
            <SettingsButton icon={<HelpCircle className="h-5 w-5 text-primary" />} label="Ajuda e suporte" />
          </View>

          {/* Logout */}
          <Button variant="destructive" className="w-full h-12">
            <LogOut className="mr-2 h-5 w-5" color="#FFFFFF" />
            <Text className="text-white">Sair da conta</Text>
          </Button>
        </ScrollView>
      </View>
    </MobileContainer>
  );
};

const KycItem = ({ label, isLast }: { label: string; isLast?: boolean }) => (
  <View className={`flex-row items-center justify-between py-2 ${!isLast && 'border-b border-border'}`}>
    <Text className="text-muted-foreground">{label}</Text>
    <Text className="text-success font-medium">✓ Aprovado</Text>
  </View>
);

const SettingsButton = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <Button variant="ghost" className="w-full justify-start h-14 px-4 flex-row">
    {icon}
    <Text className="text-foreground ml-3">{label}</Text>
  </Button>
);

export default MerchantProfile;
