import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { MobileContainer } from '@/components/MobileContainer';
import { Button } from '@/components/ui/button';
import { router } from 'expo-router';
import { ArrowLeft, User, Shield, Bell, HelpCircle, LogOut, ChevronRight } from 'lucide-react-native';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  badge?: string;
  action: () => void;
}

export default function Profile() {
  const menuItems: MenuItem[] = [
    {
      icon: <User color="#6b7280" size={20} />,
      label: 'Dados pessoais',
      action: () => {}
    },
    {
      icon: <Shield color="#6b7280" size={20} />,
      label: 'Segurança',
      badge: 'KYC Pendente',
      action: () => {}
    },
    {
      icon: <Bell color="#6b7280" size={20} />,
      label: 'Notificações',
      action: () => {}
    },
    {
      icon: <HelpCircle color="#6b7280" size={20} />,
      label: 'Ajuda & Suporte',
      action: () => {}
    },
  ];

  return (
    <MobileContainer>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft color="#6b7280" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Perfil</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* User Info */}
          <View style={styles.userCard}>
            <View style={styles.avatar}>
              <User color="#6366f1" size={40} />
            </View>
            <Text style={styles.userName}>Gabriel Lima</Text>
            <Text style={styles.userId}>5K7Wj...x8Qp</Text>
            <Button
              variant="outline"
              onPress={() => router.push('/(main)/score')}
            >
              <Text style={styles.scoreButtonText}>Ver meu Score</Text>
            </Button>
          </View>

          {/* Menu */}
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
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  )}
                  <ChevronRight color="#6b7280" size={20} />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutButton} activeOpacity={0.7}>
            <LogOut color="#ef4444" size={20} />
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>

          {/* Version */}
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
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  userId: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'monospace',
    marginBottom: 16,
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
  menuIcon: {
    // Container for icon
  },
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
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#f59e0b',
  },
  logoutButton: {
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ef4444',
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 24,
    gap: 4,
  },
  versionText: {
    fontSize: 12,
    color: '#6b7280',
  },
});
