import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { DollarSign, FileText, CreditCard } from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import { useDebts } from '@/hooks/debt-context';
import { useAuth } from '@/hooks/auth-context';
import { PERMISSIONS } from '@/constants/permissions';

export default function AddPaymentScreen() {
  const router = useRouter();
  const { debts, addPayment } = useDebts();
  const { hasPermission } = useAuth();
  
  const [selectedDebt, setSelectedDebt] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const activeDebts = debts.filter(d => d.status !== 'paid');

  const handleSubmit = async () => {
    if (!hasPermission(PERMISSIONS.ADD_PAYMENT)) {
      Alert.alert('دەسەڵات', 'تۆ دەسەڵاتی تۆمارکردنی پارەدانت نییە');
      return;
    }

    if (!selectedDebt || !amount) {
      Alert.alert('تێبینی', 'تکایە قەرز و بڕی پارە دیاری بکە');
      return;
    }

    const debt = debts.find(d => d.id === selectedDebt);
    if (!debt) return;

    const paymentAmount = parseFloat(amount);
    if (paymentAmount > debt.remainingAmount) {
      Alert.alert('تێبینی', 'بڕی پارەدان زیاترە لە قەرزی ماوە');
      return;
    }

    await addPayment({
      debtId: selectedDebt,
      amount: paymentAmount,
      notes,
    });

    Alert.alert('سەرکەوتوو', 'پارەدان بە سەرکەوتوویی تۆمار کرا');
    router.back();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ckb-IQ', {
      style: 'currency',
      currency: 'IQD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <GradientCard style={styles.form}>
            {/* Debt Selection */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <CreditCard size={20} color="#1E3A8A" />
                <KurdishText variant="body" color="#1F2937">
                  قەرز
                </KurdishText>
              </View>
              <ScrollView style={styles.debtList} showsVerticalScrollIndicator={false}>
                {activeDebts.map(debt => (
                  <TouchableOpacity
                    key={debt.id}
                    style={[
                      styles.debtItem,
                      selectedDebt === debt.id && styles.debtItemSelected,
                    ]}
                    onPress={() => setSelectedDebt(debt.id)}
                  >
                    <View>
                      <KurdishText 
                        variant="body" 
                        color={selectedDebt === debt.id ? 'white' : '#1F2937'}
                      >
                        {debt.customerName}
                      </KurdishText>
                      <KurdishText 
                        variant="caption" 
                        color={selectedDebt === debt.id ? 'white' : '#6B7280'}
                      >
                        {debt.description || 'بێ تێبینی'}
                      </KurdishText>
                    </View>
                    <View style={styles.debtAmount}>
                      <KurdishText 
                        variant="caption" 
                        color={selectedDebt === debt.id ? 'white' : '#6B7280'}
                      >
                        ماوە:
                      </KurdishText>
                      <KurdishText 
                        variant="body" 
                        color={selectedDebt === debt.id ? 'white' : '#EF4444'}
                      >
                        {formatCurrency(debt.remainingAmount)}
                      </KurdishText>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Amount */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <DollarSign size={20} color="#1E3A8A" />
                <KurdishText variant="body" color="#1F2937">
                  بڕی پارەدان (دینار)
                </KurdishText>
              </View>
              <TextInput
                style={styles.input}
                placeholder="بڕی پارە بنووسە"
                placeholderTextColor="#9CA3AF"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                textAlign="right"
              />
            </View>

            {/* Notes */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <FileText size={20} color="#1E3A8A" />
                <KurdishText variant="body" color="#1F2937">
                  تێبینی
                </KurdishText>
              </View>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="تێبینی (ئیختیاری)"
                placeholderTextColor="#9CA3AF"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                textAlign="right"
              />
            </View>
          </GradientCard>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
            >
              <KurdishText variant="subtitle" color="white">
                تۆمارکردن
              </KurdishText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => router.back()}
            >
              <KurdishText variant="subtitle" color="#6B7280">
                پاشگەزبوونەوە
              </KurdishText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 16,
  },
  form: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  debtList: {
    maxHeight: 200,
  },
  debtItem: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  debtItemSelected: {
    backgroundColor: '#1E3A8A',
  },
  debtAmount: {
    alignItems: 'flex-end',
  },
  actions: {
    gap: 12,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#1E3A8A',
  },
  cancelButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
});