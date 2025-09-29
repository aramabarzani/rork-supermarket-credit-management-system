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
import { Calendar, DollarSign, FileText, User, Tag, StickyNote } from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import { useDebts } from '@/hooks/debt-context';
import { useUsers } from '@/hooks/users-context';
import { useAuth } from '@/hooks/auth-context';
import { PERMISSIONS } from '@/constants/permissions';
import { DEBT_CATEGORIES, getDebtCategoryById } from '@/constants/debt-categories';

export default function AddDebtScreen() {
  const router = useRouter();
  const { addDebt } = useDebts();
  const { getCustomers } = useUsers();
  const { hasPermission } = useAuth();
  
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');

  const customers = getCustomers();

  const handleSubmit = async () => {
    if (!hasPermission(PERMISSIONS.ADD_DEBT)) {
      Alert.alert('دەسەڵات', 'تۆ دەسەڵاتی زیادکردنی قەرزت نییە');
      return;
    }

    if (!selectedCustomer || !amount || !category) {
      Alert.alert('تێبینی', 'تکایە کڕیار، بڕی قەرز و مۆری قەرز دیاری بکە');
      return;
    }

    const customer = customers.find(c => c.id === selectedCustomer);
    if (!customer) return;

    await addDebt({
      customerId: selectedCustomer,
      customerName: customer.name,
      amount: parseFloat(amount),
      remainingAmount: parseFloat(amount),
      description,
      category,
      notes,
      status: 'active',
      dueDate: dueDate || undefined,
    });

    Alert.alert('سەرکەوتوو', 'قەرز بە سەرکەوتوویی تۆمار کرا');
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <GradientCard style={styles.form}>
            {/* Customer Selection */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <User size={20} color="#1E3A8A" />
                <KurdishText variant="body" color="#1F2937">
                  کڕیار
                </KurdishText>
              </View>
              <View style={styles.customerList}>
                {customers.map(customer => (
                  <TouchableOpacity
                    key={customer.id}
                    style={[
                      styles.customerItem,
                      selectedCustomer === customer.id && styles.customerItemSelected,
                    ]}
                    onPress={() => setSelectedCustomer(customer.id)}
                  >
                    <KurdishText 
                      variant="body" 
                      color={selectedCustomer === customer.id ? 'white' : '#1F2937'}
                    >
                      {customer.name}
                    </KurdishText>
                    <KurdishText 
                      variant="caption" 
                      color={selectedCustomer === customer.id ? 'white' : '#6B7280'}
                    >
                      {customer.phone}
                    </KurdishText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

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
  customerList: {
    gap: 8,
  },
  customerItem: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
  },
  customerItemSelected: {
    backgroundColor: '#1E3A8A',
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