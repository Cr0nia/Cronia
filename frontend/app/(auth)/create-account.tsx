import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MobileContainer } from '@/components/MobileContainer';
import { Button } from '@/components/ui/button';
import { router } from 'expo-router';
import { CheckCircle2, Loader2, ArrowLeft } from 'lucide-react-native';
import { useState, useEffect } from 'react';

export default function CreateAccount() {
  const [step, setStep] = useState<'creating' | 'success'>('creating');

  useEffect(() => {
    const timer = setTimeout(() => {
      setStep('success');
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <MobileContainer>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft color="#6b7280" size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {step === 'creating' ? (
            <>
              <View style={styles.loaderContainer}>
                <Loader2 color="#6366f1" size={64} />
              </View>
              <Text style={styles.title}>Criando sua conta...</Text>
              <Text style={styles.subtitle}>
                Estamos registrando sua carteira na Solana via relayer. Isso não custa nada para você.
              </Text>
            </>
          ) : (
            <>
              <View style={styles.successIcon}>
                <CheckCircle2 color="#10b981" size={48} />
              </View>
              <Text style={styles.title}>Conta criada com sucesso!</Text>

              <View style={styles.card}>
                <Text style={styles.cardLabel}>Seu ID Cronia</Text>
                <Text style={styles.cardValue}>5K7Wj...x8Qp</Text>
                <TouchableOpacity>
                  <Text style={styles.cardLink}>Ver transação</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.warning}>
                <Text style={styles.warningText}>
                  <Text style={styles.warningBold}>⚠️ KYC pendente:</Text> Complete seu cadastro para aumentar seus limites.
                </Text>
              </View>
            </>
          )}
        </View>

        {step === 'success' && (
          <View style={styles.footer}>
            <Button onPress={() => router.push('/(tabs)')}>
              <Text style={styles.buttonText}>Ir para o app</Text>
            </Button>
          </View>
        )}
      </View>
    </MobileContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderContainer: {
    marginBottom: 24,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6b7280',
    maxWidth: 400,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
    maxWidth: 400,
  },
  cardLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  cardValue: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#111827',
    marginBottom: 8,
  },
  cardLink: {
    fontSize: 12,
    color: '#6366f1',
  },
  warning: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    maxWidth: 400,
    marginBottom: 32,
  },
  warningText: {
    fontSize: 14,
    color: '#111827',
  },
  warningBold: {
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
});
