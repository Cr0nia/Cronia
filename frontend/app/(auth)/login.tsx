import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, LogIn } from 'lucide-react-native';

import { MobileContainer } from '@/components/MobileContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/lib/toast';

export default function Login() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    if (!email || !password) {
      toast.error('Informe e-mail e senha.');
      return;
    }

    try {
      await login({ email, password });
      toast.success('Login realizado com sucesso!');
      router.replace('/(tabs)');
    } catch (error: any) {
      const message = error?.message ?? 'Não foi possível entrar.';
      toast.error(message);
    }
  };

  return (
    <MobileContainer>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} disabled={loading}>
            <ArrowLeft color="#6b7280" size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.iconWrapper}>
            <View style={styles.iconBackground}>
              <LogIn color="#6366f1" size={32} />
            </View>
          </View>
          <Text style={styles.title}>Bem-vindo de volta</Text>
          <Text style={styles.subtitle}>Acesse sua conta para continuar</Text>

          <View style={styles.form}>
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
              <Label>Senha</Label>
              <Input
                value={password}
                onChangeText={setPassword}
                placeholder="Sua senha"
                secureTextEntry
                autoComplete="password"
              />
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Button onPress={handleSubmit} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Entrando...' : 'Entrar'}</Text>
          </Button>
        </View>
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
  iconWrapper: {
    marginBottom: 16,
  },
  iconBackground: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
    marginBottom: 24,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },
  formGroup: {
    gap: 8,
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
