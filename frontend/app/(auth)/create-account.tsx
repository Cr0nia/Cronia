import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react-native';

import { MobileContainer } from '@/components/MobileContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/lib/toast';
import { copyToClipboard } from '@/utils/clipboard';

type Step = 'form' | 'creating' | 'success';

export default function CreateAccount() {
  const { signup, loading, primaryWallet, user } = useAuth();

  const [step, setStep] = useState<Step>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    if (!email || !name) {
      toast.error('Informe seu nome e e-mail.');
      return;
    }

    try {
      setStep('creating');
      await signup({ email, name, phone: phone || undefined, password: password || undefined });
      toast.success('Conta criada com sucesso!');
      setStep('success');
    } catch (error: any) {
      setStep('form');
      const message = error?.message ?? 'Não foi possível criar sua conta.';
      toast.error(message);
    }
  };

  const handleCopyWallet = async () => {
    if (!primaryWallet?.pubkey) return;
    const success = await copyToClipboard(primaryWallet.pubkey);
    toast[success ? 'success' : 'info'](
      success ? 'Endereço copiado!' : 'Copie manualmente (clipboard indisponível).',
    );
  };

  const renderContent = () => {
    if (step === 'creating') {
      return (
        <>
          <View style={styles.loaderContainer}>
            <Loader2 color="#6366f1" size={64} />
          </View>
          <Text style={styles.title}>Criando sua conta...</Text>
          <Text style={styles.subtitle}>
            Estamos registrando sua carteira na Solana via relayer. Isso não custa nada para você.
          </Text>
        </>
      );
    }

    if (step === 'success') {
      return (
        <>
          <View style={styles.successIcon}>
            <CheckCircle2 color="#10b981" size={48} />
          </View>
          <Text style={styles.title}>Conta criada com sucesso!</Text>

          <View style={styles.card}>
            <Text style={styles.cardLabel}>Seu ID Cronia</Text>
            <Text style={styles.cardValue}>{user?.id}</Text>
            <TouchableOpacity onPress={handleCopyWallet}>
              <Text style={styles.cardLink}>Copiar endereço da carteira</Text>
            </TouchableOpacity>
          </View>

          {primaryWallet?.pubkey && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Wallet Solana</Text>
              <Text style={styles.cardValue}>{primaryWallet.pubkey}</Text>
              <TouchableOpacity onPress={handleCopyWallet}>
                <Text style={styles.cardLink}>Copiar endereço</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.warning}>
            <Text style={styles.warningText}>
              <Text style={styles.warningBold}>⚠️ KYC pendente:</Text> Complete seu cadastro para aumentar seus limites.
            </Text>
          </View>
        </>
      );
    }

    return (
      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Label>Nome completo</Label>
          <Input
            value={name}
            onChangeText={setName}
            placeholder="Gabriel Lima"
            autoCapitalize="words"
            autoComplete="name"
          />
        </View>

        <View style={styles.formGroup}>
          <Label>E-mail</Label>
          <Input
            value={email}
            onChangeText={setEmail}
            placeholder="gabriel@cron.io"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>

        <View style={styles.formGroup}>
          <Label>Telefone (opcional)</Label>
          <Input
            value={phone}
            onChangeText={setPhone}
            placeholder="(11) 99999-9999"
            keyboardType="phone-pad"
            autoComplete="tel"
          />
        </View>

        <View style={styles.formGroup}>
          <Label>Senha (opcional)</Label>
          <Input
            value={password}
            onChangeText={setPassword}
            placeholder="Mínimo 6 caracteres"
            secureTextEntry
            autoComplete="password"
          />
        </View>
      </View>
    );
  };

  return (
    <MobileContainer>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} disabled={loading && step !== 'success'}>
            <ArrowLeft color="#6b7280" size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>{renderContent()}</View>

        {step === 'form' && (
          <View style={styles.footer}>
            <Button onPress={handleSubmit} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? 'Criando conta...' : 'Criar conta grátis'}</Text>
            </Button>
          </View>
        )}

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
    width: '100%',
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
    marginBottom: 16,
    width: '100%',
    maxWidth: 420,
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
    maxWidth: 420,
    marginTop: 8,
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
  form: {
    width: '100%',
    maxWidth: 420,
    gap: 16,
  },
  formGroup: {
    gap: 8,
  },
});
