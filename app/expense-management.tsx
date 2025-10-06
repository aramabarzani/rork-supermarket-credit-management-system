import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import {
  TrendingDown,
  Plus,
  Calendar,
  Tag,
  Edit,
  Trash2,
  DollarSign,
  PieChart,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  description: string;
  paymentMethod: string;
}

export default function ExpenseManagementScreen() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: '1',
      title: 'کرێی دوکان',
      amount: 500000,
      category: 'کرێ',
      date: new Date().toISOString(),
      description: 'کرێی مانگی ڕابردوو',
      paymentMethod: 'کاش',
    },
    {
      id: '2',
      title: 'کارەبا',
      amount: 150000,
      category: 'خزمەتگوزاری',
      date: new Date().toISOString(),
      description: 'پسوڵەی کارەبا',
      paymentMethod: 'کاش',
    },
  ]);

  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: '',
    category: '',
    description: '',
  });

  const categories = ['کرێ', 'خزمەتگوزاری', 'مووچە', 'کاڵا', 'چاککردنەوە', 'هیتر'];

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const expensesByCategory = categories.map(category => ({
    category,
    amount: expenses
      .filter(e => e.category === category)
      .reduce((sum, e) => sum + e.amount, 0),
    count: expenses.filter(e => e.category === category).length,
  })).filter(item => item.amount > 0);

  const handleAddExpense = () => {
    if (!newExpense.title || !newExpense.amount || !newExpense.category) {
      Alert.alert('هەڵە', 'تکایە هەموو خانەکان پڕبکەرەوە');
      return;
    }

    const expense: Expense = {
      id: Date.now().toString(),
      title: newExpense.title,
      amount: parseFloat(newExpense.amount),
      category: newExpense.category,
      date: new Date().toISOString(),
      description: newExpense.description,
      paymentMethod: 'کاش',
    };

    setExpenses([...expenses, expense]);
    setNewExpense({ title: '', amount: '', category: '', description: '' });
    setShowAddModal(false);
    Alert.alert('سەرکەوتوو', 'خەرجی زیادکرا');
  };

  const deleteExpense = (id: string) => {
    Alert.alert(
      'دڵنیابوونەوە',
      'دڵنیایت لە سڕینەوەی ئەم خەرجییە؟',
      [
        { text: 'نەخێر', style: 'cancel' },
        {
          text: 'بەڵێ',
          style: 'destructive',
          onPress: () => setExpenses(expenses.filter(e => e.id !== id)),
        },
      ]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ckb-IQ', {
      style: 'currency',
      currency: 'IQD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ckb-IQ');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'بەڕێوەبردنی خەرجی' }} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={24} color="white" />
          <KurdishText variant="body" color="white">
            زیادکردنی خەرجی
          </KurdishText>
        </TouchableOpacity>
      </View>

      {/* Statistics */}
      <View style={styles.statsRow}>
        <GradientCard style={styles.statCard} colors={['#EF4444', '#DC2626']}>
          <TrendingDown size={24} color="#EF4444" />
          <KurdishText variant="body" color="#1F2937">
            {formatCurrency(totalExpenses)}
          </KurdishText>
          <KurdishText variant="caption" color="#6B7280">
            کۆی خەرجی
          </KurdishText>
        </GradientCard>

        <GradientCard style={styles.statCard} colors={['#3B82F6', '#2563EB']}>
          <DollarSign size={24} color="#3B82F6" />
          <KurdishText variant="body" color="#1F2937">
            {expenses.length}
          </KurdishText>
          <KurdishText variant="caption" color="#6B7280">
            ژمارەی خەرجی
          </KurdishText>
        </GradientCard>

        <GradientCard style={styles.statCard} colors={['#F59E0B', '#D97706']}>
          <PieChart size={24} color="#F59E0B" />
          <KurdishText variant="body" color="#1F2937">
            {expensesByCategory.length}
          </KurdishText>
          <KurdishText variant="caption" color="#6B7280">
            جۆرەکان
          </KurdishText>
        </GradientCard>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Expenses by Category */}
        <View style={styles.section}>
          <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
            خەرجی بە پێی جۆر
          </KurdishText>
          {expensesByCategory.map((item, index) => (
            <GradientCard key={item.category} style={styles.categoryCard}>
              <View style={styles.categoryHeader}>
                <View style={styles.categoryInfo}>
                  <View style={[styles.categoryDot, { backgroundColor: ['#EF4444', '#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899'][index % 6] }]} />
                  <View>
                    <KurdishText variant="body" color="#1F2937">
                      {item.category}
                    </KurdishText>
                    <KurdishText variant="caption" color="#6B7280">
                      {item.count} خەرجی
                    </KurdishText>
                  </View>
                </View>
                <KurdishText variant="subtitle" color="#EF4444">
                  {formatCurrency(item.amount)}
                </KurdishText>
              </View>
            </GradientCard>
          ))}
        </View>

        {/* All Expenses */}
        <View style={styles.section}>
          <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
            هەموو خەرجیەکان
          </KurdishText>
          {expenses.map(expense => (
            <GradientCard key={expense.id} style={styles.expenseCard}>
              <View style={styles.expenseHeader}>
                <View style={styles.expenseInfo}>
                  <KurdishText variant="subtitle" color="#1F2937">
                    {expense.title}
                  </KurdishText>
                  <View style={styles.categoryRow}>
                    <Tag size={14} color="#6B7280" />
                    <KurdishText variant="caption" color="#6B7280">
                      {expense.category}
                    </KurdishText>
                  </View>
                </View>
                <View style={styles.expenseActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Edit size={20} color="#3B82F6" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => deleteExpense(expense.id)}
                  >
                    <Trash2 size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>

              {expense.description && (
                <KurdishText variant="body" color="#6B7280" style={styles.description}>
                  {expense.description}
                </KurdishText>
              )}

              <View style={styles.expenseDetails}>
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Calendar size={16} color="#3B82F6" />
                    <KurdishText variant="caption" color="#6B7280">
                      {formatDate(expense.date)}
                    </KurdishText>
                  </View>
                  <KurdishText variant="body" color="#EF4444">
                    {formatCurrency(expense.amount)}
                  </KurdishText>
                </View>
              </View>
            </GradientCard>
          ))}
        </View>
      </ScrollView>

      {/* Add Expense Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <KurdishText variant="title" color="#1F2937" style={styles.modalTitle}>
              زیادکردنی خەرجیی نوێ
            </KurdishText>

            <TextInput
              style={styles.input}
              placeholder="ناونیشان"
              placeholderTextColor="#9CA3AF"
              value={newExpense.title}
              onChangeText={(text) => setNewExpense({ ...newExpense, title: text })}
              textAlign="right"
            />

            <TextInput
              style={styles.input}
              placeholder="بڕ"
              placeholderTextColor="#9CA3AF"
              value={newExpense.amount}
              onChangeText={(text) => setNewExpense({ ...newExpense, amount: text })}
              keyboardType="numeric"
              textAlign="right"
            />

            <View style={styles.categorySelector}>
              {categories.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    newExpense.category === category && styles.categoryButtonActive,
                  ]}
                  onPress={() => setNewExpense({ ...newExpense, category })}
                >
                  <KurdishText
                    variant="caption"
                    color={newExpense.category === category ? 'white' : '#6B7280'}
                  >
                    {category}
                  </KurdishText>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="وردەکاری"
              placeholderTextColor="#9CA3AF"
              value={newExpense.description}
              onChangeText={(text) => setNewExpense({ ...newExpense, description: text })}
              textAlign="right"
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <KurdishText variant="body" color="#6B7280">
                  پاشگەزبوونەوە
                </KurdishText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddExpense}
              >
                <KurdishText variant="body" color="white">
                  زیادکردن
                </KurdishText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    padding: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E3A8A',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    padding: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  categoryCard: {
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  expenseCard: {
    marginBottom: 12,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  expenseInfo: {
    flex: 1,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  expenseActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  description: {
    marginBottom: 12,
  },
  expenseDetails: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  categoryButtonActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  saveButton: {
    backgroundColor: '#1E3A8A',
  },
});
