import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Bell, ChevronRight, HelpCircle, LogOut, Shield, User as UserIcon } from 'lucide-react-native';

import { MobileContainer } from '@/components/MobileContainer';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { UsersApi } from '@/services/backend';
import { toast } from '@/lib/toast';
import { copyToClipboard } from '@/utils/clipboard';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  badge?: string;
  action: () => void;
}

export default function Profile() {
  const { user, primaryWallet, logout, loading } = useAuth();

  const scoreQuery = useQuery({
    queryKey: ['user-score', user?.id],
    queryFn: () => UsersApi.getScore(user!.id),
    enabled: Boolean(user?.id),
    staleTime: 60_000,
  });

  const kycBadge = useMemo(() => {
    if (!user) return undefined;
    if (user.status === 'approved' || user.kycLevel > 0) return 'KYC completo';
    return 'KYC pendente';
  }, [user]);

  const menuItems: MenuItem[] = [
    {
      icon: <UserIcon color="#6b7280" size={20} />,
      label: 'Dados pessoais',
      action: () => toast.info('Edição de dados ainda não disponível.'),
    },
    {
      icon: <Shield color="#6b7280" size={20} />,
      label: 'Segurança',
      badge: kycBadge,
      action: () => toast.info('Em breve você poderá completar seu KYC pelo app.'),
    },
    {
      icon: <Bell color="#6b7280" size={20} />,
      label: 'Notificações',
      action: () => toast.info('Central de notificações em desenvolvimento.'),
    },
    {
      icon: <HelpCircle color="#6b7280" size={20} />,
      label: 'Ajuda & Suporte',
      action: () => toast.info('Acesse suporte@cronia.io para falar com a equipe.'),
    },
  ];

  const handleCopyWallet = async () => {
    if (!primaryWallet?.pubkey) return;
    const success = await copyToClipboard(primaryWallet.pubkey);
    toast[success ? 'success' : 'info'](
      success ? 'Endereço copiado!' : 'Copie manualmente (clipboard indisponível).',
    );
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Sessão encerrada.');
    router.replace('/(auth)/onboarding');
  };

  return (
    <MobileContainer>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft color="#6b7280" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Perfil</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.userCard}>
            <View style={styles.avatar}>
              <UserIcon color="#6366f1" size={40} />
            </View>
            <Text style={styles.userName}>{user?.name ?? 'Usuário Cronia'}</Text>
            <Text style={styles.userEmail}>{user?.email ?? 'sem e-mail'}</Text>

            <View style={styles.walletRow}>
              <Text style={styles.walletLabel}>Wallet</Text>
              <TouchableOpacity onPress={handleCopyWallet} disabled={!primaryWallet?.pubkey}>
                <Text style={styles.walletValue}>
                  {primaryWallet?.pubkey ?? 'Sem carteira gerada'}
                </Text>
              </TouchableOpacity>
            </View>

            <Button variant="outline" onPress={() => router.push('/(main)/score')}>
              <Text style={styles.scoreButtonText}>
                Ver meu Score ({scoreQuery.data?.score ?? '...'})
              </Text>
            </Button>
          </View>

          <View style={styles.menuList}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={item.action}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIcon}>{item.icon}</View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </View>
                <View style={styles.menuItemRight}>
                  {item.badge && (
                    <View
                      style={[
                        styles.badge,
                        item.badge.includes('completo') && styles.badgeSuccess,
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          item.badge.includes('completo') && styles.badgeTextSuccess,
                        ]}
                      >
                        {item.badge}
                      </Text>
                    </View>
                  )}
                  <ChevronRight color="#6b7280" size={20} />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            activeOpacity={0.7}
            onPress={handleLogout}
            disabled={loading}
          >
            <LogOut color="#ef4444" size={20} />
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>

          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>Cronia v1.0.0</Text>
            <Text style={styles.versionText}>Powered by Solana</Text>
          </View>
        </ScrollView>
      </View>
    </MobileContainer>
  );
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
  userCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  walletRow: {
    width: '100%',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  walletLabel: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  walletValue: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#111827',
  },
  scoreButtonText: {
    fontSize: 16,
    color: '#111827',
  },
  menuList: {
    gap: 8,
  },
  menuItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIcon: {},
  menuLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeSuccess: {
    backgroundColor: '#dcfce7',
  },
  badgeText: {
    fontSize: 12,
    color: '#b45309',
    fontWeight: '600',
  },
  badgeTextSuccess: {
    color: '#047857',
  },
  logoutButton: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#fee2e2',
  },
  logoutText: {
    fontSize: 16,
    color: '#b91c1c',
    fontWeight: '600',
  },
  versionContainer: {
    marginTop: 24,
    alignItems: 'center',
    gap: 4,
  },
  versionText: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
