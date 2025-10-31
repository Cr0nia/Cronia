import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { MobileContainer } from '@/components/MobileContainer';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { router } from 'expo-router';
import { ArrowLeft, Scan } from 'lucide-react-native';
import { useState } from 'react';
import { toast } from '@/lib/toast';

export default function PayQR() {
  const [step, setStep] = useState<'scan' | 'details'>('scan');
  const [installments, setInstallments] = useState('1');

  const purchaseAmount = 650.00;
  const installmentOptions = [1, 2, 3, 6];

  const calculateInstallment = (total: number, months: number) => {
    return (total / months).toFixed(2);
  };

  const handlePay = () => {
    toast.success('Pagamento realizado com sucesso!');
    setTimeout(() => router.push('/(main)/invoices'), 1500);
  };

  return (
    <MobileContainer>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft color="#6b7280" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pagar com QR Code</Text>
          <View style={{ width: 24 }} />
        </View>

        {step === 'scan' ? (
          <View style={styles.scanContainer}>
            <View style={styles.scanBox}>
              <Scan color="#6366f1" size={128} />
            </View>
            <Text style={styles.scanTitle}>Escaneie o QR do lojista</Text>
            <Text style={styles.scanDescription}>
              Posicione o QR Code dentro do quadrado
            </Text>
            <Button variant="outline" onPress={() => setStep('details')}>
              <Text style={styles.simulateButtonText}>Simular pagamento</Text>
            </Button>
          </View>
        ) : (
          <>
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Lojista */}
              <View style={styles.merchantCard}>
                <Text style={styles.merchantLabel}>Lojista</Text>
                <Text style={styles.merchantName}>Café & Companhia</Text>
              </View>

              {/* Valor */}
              <View style={styles.amountCard}>
                <Text style={styles.amountLabel}>Valor da compra</Text>
                <Text style={styles.amountValue}>R$ {purchaseAmount.toFixed(2)}</Text>

                <View style={styles.installmentsSection}>
                  <Text style={styles.installmentsLabel}>Parcelas</Text>
                  <Select value={installments} onValueChange={setInstallments}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {installmentOptions.map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}x de R$ {calculateInstallment(purchaseAmount, num)} {num === 1 ? '' : 'sem juros'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </View>
              </View>

              {/* Resumo */}
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Resumo</Text>
                <View style={styles.summaryContent}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Valor por parcela</Text>
                    <Text style={styles.summaryValue}>
                      R$ {calculateInstallment(purchaseAmount, parseInt(installments))}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Juros</Text>
                    <Text style={[styles.summaryValue, { color: '#10b981' }]}>R$ 0,00</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total</Text>
                    <Text style={styles.summaryTotal}>R$ {purchaseAmount.toFixed(2)}</Text>
                  </View>
                </View>
              </View>

              {/* Impacto no limite */}
              <View style={styles.impactCard}>
                <Text style={styles.impactText}>
                  Após o pagamento, você terá <Text style={styles.impactHighlight}>R$ 200,00</Text> de limite disponível.
                </Text>
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <Button onPress={handlePay}>
                <Text style={styles.buttonText}>Confirmar pagamento</Text>
              </Button>
            </View>
          </>
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
  scanContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  scanBox: {
    width: 256,
    height: 256,
    borderWidth: 4,
    borderColor: '#6366f1',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  scanTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  scanDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  simulateButtonText: {
    fontSize: 16,
    color: '#111827',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  merchantCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  merchantLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  merchantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  amountCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
  },
  installmentsSection: {
    gap: 8,
  },
  installmentsLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  summaryContent: {
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 4,
  },
  summaryTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  impactCard: {
    backgroundColor: '#eef2ff',
    borderWidth: 1,
    borderColor: '#c7d2fe',
    borderRadius: 12,
    padding: 16,
  },
  impactText: {
    fontSize: 14,
    color: '#111827',
  },
  impactHighlight: {
    fontWeight: '600',
    color: '#6366f1',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
});
