import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Clipboard } from 'react-native';
import { MobileContainer } from '@/components/MobileContainer';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { router } from 'expo-router';
import { ArrowLeft, Copy, QrCode, Share2, CheckCircle2 } from 'lucide-react-native';
import { useState } from 'react';
import { toast } from '@/lib/toast';
import * as Sharing from 'expo-sharing';

export default function AddAssets() {
  const [copied, setCopied] = useState(false);
  const address = '5K7Wj2xTn...k8Qp3vR';

  const handleCopy = async () => {
    await Clipboard.setStringAsync(address);
    setCopied(true);
    toast.success('Endereço copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      // Em produção, você compartilharia o QR code como imagem
      toast.info('Funcionalidade de compartilhamento em desenvolvimento');
    }
  };

  return (
    <MobileContainer>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft color="#6b7280" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Adicionar Ativos</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Tabs defaultValue="receive">
            <View style={styles.tabsContainer}>
              <TabsList>
                <TabsTrigger value="receive">
                  <Text>Receber</Text>
                </TabsTrigger>
                <TabsTrigger value="migrate">
                  <Text>Migrar</Text>
                </TabsTrigger>
              </TabsList>
            </View>

            <TabsContent value="receive">
              <View style={styles.tabContent}>
                {/* QR Code */}
                <View style={styles.qrCard}>
                  <View style={styles.qrCode}>
                    <QrCode color="#f9fafb" size={128} />
                  </View>
                  <Text style={styles.qrDescription}>
                    Escaneie este QR Code para enviar ativos
                  </Text>
                </View>

                {/* Endereço */}
                <View style={styles.addressCard}>
                  <Text style={styles.addressLabel}>Seu endereço Solana</Text>
                  <View style={styles.addressRow}>
                    <Text style={styles.addressText}>{address}</Text>
                    <TouchableOpacity
                      onPress={handleCopy}
                      style={styles.copyButton}
                      activeOpacity={0.7}
                    >
                      {copied ? (
                        <CheckCircle2 color="#10b981" size={20} />
                      ) : (
                        <Copy color="#6b7280" size={20} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Botões de Ação */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleCopy}
                    activeOpacity={0.7}
                  >
                    <Copy color="#111827" size={16} />
                    <Text style={styles.actionButtonText}>Copiar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleShare}
                    activeOpacity={0.7}
                  >
                    <Share2 color="#111827" size={16} />
                    <Text style={styles.actionButtonText}>Compartilhar</Text>
                  </TouchableOpacity>
                </View>

                {/* Avisos */}
                <View style={styles.warningCard}>
                  <Text style={styles.warningText}>
                    <Text style={styles.warningBold}>⚠️ Atenção:</Text> Envie apenas ativos da rede Solana. Tokens de outras redes serão perdidos.
                  </Text>
                </View>

                <View style={styles.infoCard}>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoBold}>💡 Dica:</Text> Aceitos: SOL, USDC (Solana), e NFTs verificados.
                  </Text>
                </View>
              </View>
            </TabsContent>

            <TabsContent value="migrate">
              <View style={styles.tabContent}>
                <View style={styles.migrateCard}>
                  <Text style={styles.migrateTitle}>Migrar de outra carteira</Text>
                  <Text style={styles.migrateDescription}>
                    Conecte sua carteira existente para transferir ativos automaticamente.
                  </Text>
                  <Button>
                    <Text style={styles.buttonText}>Conectar carteira</Text>
                  </Button>
                </View>

                <View style={styles.migrateCard}>
                  <Text style={styles.migrateTitle}>Receber de Exchange</Text>
                  <Text style={styles.migrateDescription}>
                    Saque seus ativos de uma exchange diretamente para o Cronia.
                  </Text>
                  <Button variant="outline">
                    <Text style={styles.outlineButtonText}>Ver instruções</Text>
                  </Button>
                </View>
              </View>
            </TabsContent>
          </Tabs>
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
  },
  tabsContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  tabContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 16,
  },
  qrCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  qrCode: {
    width: 192,
    height: 192,
    backgroundColor: '#111827',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  qrDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  addressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  addressLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  addressText: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#111827',
    flex: 1,
  },
  copyButton: {
    padding: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    height: 48,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  warningCard: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 12,
    padding: 16,
  },
  warningText: {
    fontSize: 14,
    color: '#111827',
  },
  warningBold: {
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#eef2ff',
    borderWidth: 1,
    borderColor: '#c7d2fe',
    borderRadius: 12,
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#111827',
  },
  infoBold: {
    fontWeight: '600',
  },
  migrateCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    gap: 12,
  },
  migrateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  migrateDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
});
