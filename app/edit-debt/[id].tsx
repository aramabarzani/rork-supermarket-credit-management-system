import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Calendar, DollarSign, FileText, Tag, StickyNote, ArrowLeft } from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import { useDebts } from '@/hooks/debt-context';
import { useAuth } from '@/hooks/auth-context';
import { PERMISSIONS } from '@/constants/permissions';
import { DEBT_CATEGORIES } from '@/constants/debt-categories';

export default function EditDebtScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { debts, updateDebt } = useDebts();
  const { hasPermission } = useAuth();
  
  const debt = debts.find(d => d.id === id);
  
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (debt) {
      setAmount(debt.amount.toString());
      setDescription(debt.description);
      setCategory(debt.category);
      setNotes(debt.notes || '');
      setDueDate(debt.dueDate || '');
    }
  }, [debt]);

  if (!debt) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1E3A8A" />
          </TouchableOpacity>
          <KurdishText variant="title" color="#1F2937">
            قەرز نەدۆزرایەوە
          </KurdishText>
        </View>
      </SafeAreaView>
    );
  }

  const handleSubmit = async () => {
    if (!hasPermission(PERMISSIONS.EDIT_DEBT)) {
      Alert.alert('دەسەڵات', 'تۆ دەسەڵاتی دەستکاری قەرزت نییە');
      return;
    }

    if (!amount || !category) {
      Alert.alert('تێبینی', 'تکایە بڕی قەرز و مۆری قەرز دیاری بکە');
      return;
    }

    try {
      setIsLoading(true);
      
      const newAmount = parseFloat(amount);
      const amountDifference = newAmount - debt.amount;
      const newRemainingAmount = debt.remainingAmount + amountDifference;

      await updateDebt(debt.id, {
        amount: newAmount,
        remainingAmount: newRemainingAmount,
        description,
        category,
        notes,
        dueDate: dueDate || undefined,
      });

      Alert.alert('سەرکەوتوو', 'قەرز بە سەرکەوتوویی دەستکاری کرا', [
        {
          text: 'باشە',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error updating debt:', error);
      Alert.alert('هەڵە', 'کێشەیەک ڕوویدا لە دەستکاریکردنی قەرز');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1E3A8A" />
        </TouchableOpacity>
        <KurdishText variant="title" color="#1F2937">
          دەستکاری قەرز
        </KurdishText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <GradientCard style={styles.customerInfo}>
            <KurdishText variant="subtitle" color="#1F2937">
              {debt.customerName}
            </KurdishText>
            <KurdishText variant="caption" color="#6B7280">
              وەسڵ: {debt.receiptNumber}
            </KurdishText>
          </GradientCard>

          <GradientCard style={styles.form}>
            {/* Amount */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <DollarSign size={20} color="#1E3A8A" />
                <KurdishText variant="body" color="#1F2937">
                  بڕی قەرز (دینار)
                </KurdishText>
              </View>
              <TextInput
                style={styles.input}
                placeholder="بڕی قەرز بنووسە"
                placeholderTextColor="#9CA3AF"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                textAlign="right"
              />
              <KurdishText variant="caption" color="#6B7280" style={{ marginTop: 4 }}>
                بڕی ماوە: {debt.remainingAmount.toLocaleString()} دینار
              </KurdishText>
            </View>

            {/* Category Selection */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Tag size={20} color="#1E3A8A" />
                <KurdishText variant="body" color="#1F2937">
                  مۆری قەرز
                </KurdishText>
              </View>
              <View style={styles.categoryGrid}>
                {DEBT_CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryItem,
                      category === cat.id && styles.categoryItemSelected,
                    ]}
                    onPress={() => setCategory(cat.id)}
                  >
                    <KurdishText 
                      variant="body" 
                      color={category === cat.id ? 'white' : '#1F2937'}
                      style={{ fontSize: 20 }}
                    >
                      {cat.icon}
                    </KurdishText>
                    <KurdishText 
                      variant="caption" 
                      color={category === cat.id ? 'white' : '#6B7280'}
                    >
                      {cat.name}
                    </KurdishText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <FileText size={20} color="#1E3A8A" />
                <KurdishText variant="body" color="#1F2937">
                  وەسف
                </KurdishText>
              </View>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="وەسفی قەرز (ئیختیاری)"
                placeholderTextColor="#9CA3AF"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                textAlign="right"
              />
            </View>

            {/* Notes */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <StickyNote size={20} color="#1E3A8A" />
                <KurdishText variant="body" color="#1F2937">
                  تێبینی تایبەتی
                </KurdishText>
              </View>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="تێبینی تایبەتی (ئیختیاری)"
                placeholderTextColor="#9CA3AF"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={2}
                textAlign="right"
              />
            </View>

            {/* Due Date */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Calendar size={20} color="#1E3A8A" />
                <KurdishText variant="body" color="#1F2937">
                  بەرواری گەڕاندنەوە (ئیختیاری)
                </KurdishText>
              </View>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9CA3AF"
                value={dueDate}
                onChangeText={setDueDate}
                textAlign="right"
              />
            </View>
          </GradientCard>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.submitButton, isLoading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <KurdishText variant="subtitle" color="white">
                {isLoading ? 'تکایە چاوەڕێ بە...' : 'پاشەکەوتکردن'}
              </KurdishText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => router.back()}
              disabled={isLoading}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  content: {
    padding: 16,
  },
  customerInfo: {
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
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
  buttonDisabled: {
    opacity: 0.5,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryItem: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minWidth: 80,
    gap: 4,
  },
  categoryItemSelected: {
    backgroundColor: '#1E3A8A',
  },
});
