import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { MobileContainer } from '@/components/MobileContainer';
import { Button } from '@/components/ui/button';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, CheckCircle2, Clock, ExternalLink } from 'lucide-react-native';
import { toast } from '@/lib/toast';

interface Installment {
  number: number;
  value: number;
  date: string;
  status: 'paid' | 'pending';
}

export default function InvoiceDetail() {
  const { id } = useLocalSearchParams();
  const invoiceId = Array.isArray(id) ? id[0] : id;

  const installments: Installment[] = [
    { number: 1, value: 108.33, date: '15/10/2025', status: 'paid' },
    { number: 2, value: 108.33, date: '15/11/2025', status: 'paid' },
    { number: 3, value: 108.33, date: '15/12/2025', status: 'pending' },
    { number: 4, value: 108.34, date: '15/01/2026', status: 'pending' },
    { number: 5, value: 108.34, date: '15/02/2026', status: 'pending' },
    { number: 6, value: 108.33, date: '15/03/2026', status: 'pending' },
  ];

  const handlePay = () => {
    toast.success('Parcela paga com sucesso!');
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
          <Text style={styles.headerTitle}>
            Detalhes da Fatura {invoiceId ? `#${invoiceId}` : ''}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Invoice Header */}
          <View style={styles.invoiceHeader}>
            <Text style={styles.storeName}>Café & Companhia</Text>
            <Text style={styles.purchaseDate}>Compra realizada em 15/10/2025</Text>
            <View style={styles.totalRow}>
              <Text style={styles.totalValue}>R$ 650,00</Text>
              <Text style={styles.totalDescription}>em 6x sem juros</Text>
            </View>
          </View>

          {/* Next Payment */}
          <View style={styles.nextPaymentCard}>
            <View style={styles.nextPaymentHeader}>
              <View>
                <Text style={styles.nextPaymentLabel}>Próxima parcela (3/6)</Text>
                <Text style={styles.nextPaymentValue}>R$ 108,33</Text>
              </View>
              <View style={styles.nextPaymentDue}>
                <Text style={styles.dueLabel}>Vencimento</Text>
                <Text style={styles.dueDate}>15/12/2025</Text>
              </View>
            </View>
            <Button onPress={handlePay}>
              <Text style={styles.payButtonText}>Pagar agora</Text>
            </Button>
          </View>

          {/* Installments List */}
          <Text style={styles.sectionTitle}>Todas as parcelas</Text>
          <View style={styles.installmentsList}>
            {installments.map((installment) => (
              <View
                key={installment.number}
                style={[
                  styles.installmentCard,
                  installment.status === 'paid' && styles.installmentCardPaid
                ]}
              >
                <View style={styles.installmentLeft}>
                  {installment.status === 'paid' ? (
                    <CheckCircle2 color="#10b981" size={20} />
                  ) : (
                    <Clock color="#6b7280" size={20} />
                  )}
                  <View>
                    <Text style={styles.installmentNumber}>
                      Parcela {installment.number}/6
                    </Text>
                    <Text style={styles.installmentDate}>{installment.date}</Text>
                  </View>
                </View>
                <View style={styles.installmentRight}>
                  <Text style={styles.installmentValue}>
                    R$ {installment.value.toFixed(2)}
                  </Text>
                  {installment.status === 'paid' && (
                    <TouchableOpacity style={styles.receiptButton}>
                      <Text style={styles.receiptText}>Ver recibo</Text>
                      <ExternalLink color="#6366f1" size={12} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              <Text style={styles.infoBold}>📄 Recibos on-chain:</Text> Todas as parcelas pagas geram um recibo verificável na blockchain Solana.
            </Text>
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
  invoiceHeader: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
  },
  storeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  purchaseDate: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  totalValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  nextPaymentCard: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  nextPaymentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  nextPaymentLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  nextPaymentValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  nextPaymentDue: {
    alignItems: 'flex-end',
  },
  dueLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  dueDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  installmentsList: {
    gap: 8,
  },
  installmentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  installmentCardPaid: {
    opacity: 0.6,
  },
  installmentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  installmentNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  installmentDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  installmentRight: {
    alignItems: 'flex-end',
  },
  installmentValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  receiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  receiptText: {
    fontSize: 12,
    color: '#6366f1',
  },
  infoCard: {
    backgroundColor: '#eef2ff',
    borderWidth: 1,
    borderColor: '#c7d2fe',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  infoText: {
    fontSize: 14,
    color: '#111827',
  },
  infoBold: {
    fontWeight: '600',
  },
});
