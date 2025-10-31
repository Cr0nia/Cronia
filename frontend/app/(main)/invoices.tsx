import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { MobileContainer } from '@/components/MobileContainer';
import { Button } from '@/components/ui/button';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

interface Invoice {
  id: number;
  store: string;
  total: number;
  installments: number;
  nextDue: string;
  paid: number;
  pending: number;
}

export default function Invoices() {
  const invoices: Invoice[] = [
    {
      id: 1,
      store: 'Café & Companhia',
      total: 650.00,
      installments: 6,
      nextDue: '15/11/2025',
      paid: 2,
      pending: 4,
    },
    {
      id: 2,
      store: 'Tech Store',
      total: 1200.00,
      installments: 3,
      nextDue: '20/11/2025',
      paid: 1,
      pending: 2,
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
          <Text style={styles.headerTitle}>Faturas & Parcelas</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.invoicesList}>
            {invoices.map(invoice => (
              <View key={invoice.id} style={styles.invoiceCard}>
                <View style={styles.invoiceHeader}>
                  <View>
                    <Text style={styles.storeName}>{invoice.store}</Text>
                    <Text style={styles.installmentInfo}>
                      {invoice.installments}x de R$ {(invoice.total / invoice.installments).toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.totalContainer}>
                    <Text style={styles.totalValue}>R$ {invoice.total.toFixed(2)}</Text>
                    <Text style={styles.totalLabel}>total</Text>
                  </View>
                </View>

                <View style={styles.progressContainer}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Próximo vencimento</Text>
                    <Text style={styles.progressValue}>{invoice.nextDue}</Text>
                  </View>

                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBar,
                        { width: `${(invoice.paid / invoice.installments) * 100}%` }
                      ]}
                    />
                  </View>

                  <View style={styles.progressFooter}>
                    <Text style={styles.paidText}>{invoice.paid} pagas</Text>
                    <Text style={styles.pendingText}>{invoice.pending} pendentes</Text>
                  </View>
                </View>

                <Button
                  variant="outline"
                  onPress={() => router.push(`/(main)/invoice-detail/${invoice.id}`)}
                >
                  <Text style={styles.detailsButtonText}>Ver detalhes</Text>
                </Button>
              </View>
            ))}
          </View>

          <View style={styles.tipCard}>
            <Text style={styles.tipText}>
              <Text style={styles.tipBold}>💡 Dica:</Text> Pague suas parcelas em dia para manter seu score alto e aumentar seu limite!
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
  invoicesList: {
    gap: 16,
  },
  invoiceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  invoiceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  installmentInfo: {
    fontSize: 14,
    color: '#6b7280',
  },
  totalContainer: {
    alignItems: 'flex-end',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  progressContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6366f1',
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paidText: {
    fontSize: 12,
    color: '#10b981',
  },
  pendingText: {
    fontSize: 12,
    color: '#6b7280',
  },
  detailsButtonText: {
    fontSize: 16,
    color: '#111827',
  },
  tipCard: {
    backgroundColor: '#eef2ff',
    borderWidth: 1,
    borderColor: '#c7d2fe',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  tipText: {
    fontSize: 14,
    color: '#111827',
  },
  tipBold: {
    fontWeight: '600',
  },
});
