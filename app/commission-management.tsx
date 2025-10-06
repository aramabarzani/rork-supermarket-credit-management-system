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
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';

interface Commission {
  id: string;
  employeeName: string;
  amount: number;
  percentage: number;
  date: string;
  type: 'debt' | 'payment';
  description: string;
}

export default function CommissionManagementScreen() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [commissions, setCommissions] = useState<Commission[]>([
    {
      id: '1',
      employeeName: 'کارمەند ١',
      amount: 50000,
      percentage: 5,
      date: new Date().toISOString(),
      type: 'payment',
      description: 'کۆمیسیۆنی پارەدان',
    },
  ]);

  const [newCommission, setNewCommission] = useState({
    employeeName: '',
    amount: '',
    percentage: '',
    description: '',
  });

  const totalCommissions = commissions.reduce((sum, c) => sum + c.amount, 0);

  const handleAddCommission = () => {
    if (!newCommission.employeeName || !newCommission.amount) {
      Alert.alert('هەڵە', 'تکایە هەموو خانەکان پڕبکەرەوە');
      return;
    }

    const commission: Commission = {
      id: Date.now().toString(),
      employeeName: newCommission.employeeName,
      amount: parseFloat(newCommission.amount),
      percentage: parseFloat(newCommission.percentage) || 0,
      date: new Date().toISOString(),
      type: 'payment',
      description: newCommission.description,
    };

    setCommissions([...commissions, commission]);
    setNewCommission({ employeeName: '', amount: '', percentage: '', description: '' });
    setShowAddModal(false);
    Alert.alert('سەرکەوتوو', 'کۆمیسیۆن زیادکرا');
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
      <Stack.Screen options={{ title: 'بەڕێوەبردنی کۆمیسیۆن' }} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={24} color="white" />
          <KurdishText variant="body" color="white">
            زیادکردنی کۆمیسیۆن
          </KurdishText>
        </TouchableOpacity>
      </View>

      {/* Statistics */}
      <View style={styles.statsRow}>
        <GradientCard style={styles.statCard} colors={['#10B981', '#059669']}>
          <DollarSign size={24} color="#10B981" />
          <KurdishText variant="body" color="#1F2937">
            {formatCurrency(totalCommissions)}
          </KurdishText>
          <KurdishText variant="caption" color="#6B7280">
            کۆی کۆمیسیۆن
          </KurdishText>
        </GradientCard>

        <GradientCard style={styles.statCard} colors={['#3B82F6', '#2563EB']}>
          <Users size={24} color="#3B82F6" />
          <KurdishText variant="body" color="#1F2937">
            {commissions.length}
          </KurdishText>
          <KurdishText variant="caption" color="#6B7280">
            ژمارەی کۆمیسیۆن
          </KurdishText>
        </GradientCard>

        <GradientCard style={styles.statCard} colors={['#F59E0B', '#D97706']}>
          <TrendingUp size={24} color="#F59E0B" />
          <KurdishText variant="body" color="#1F2937">
            {commissions.length > 0 ? (totalCommissions / commissions.length).toFixed(0) : 0}
          </KurdishText>
          <KurdishText variant="caption" color="#6B7280">
            ناوەند
          </KurdishText>
        </GradientCard>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {commissions.map(commission => (
          <GradientCard key={commission.id} style={styles.commissionCard}>
            <View style={styles.commissionHeader}>
              <View style={styles.commissionInfo}>
                <KurdishText variant="subtitle" color="#1F2937">
                  {commission.employeeName}
                </KurdishText>
                <View style={styles.dateRow}>
                  <Calendar size={14} color="#6B7280" />
                  <KurdishText variant="caption" color="#6B7280">
                    {formatDate(commission.date)}
                  </KurdishText>
                </View>
              </View>
              <View style={styles.commissionActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Edit size={20} color="#3B82F6" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Trash2 size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.commissionDetails}>
              <View style={styles.detailRow}>
                <KurdishText variant="caption" color="#6B7280">
                  بڕی کۆمیسیۆن:
                </KurdishText>
                <KurdishText variant="body" color="#10B981">
                  {formatCurrency(commission.amount)}
                </KurdishText>
              </View>
              {commission.percentage > 0 && (
                <View style={styles.detailRow}>
                  <KurdishText variant="caption" color="#6B7280">
                    ڕێژە:
                  </KurdishText>
                  <KurdishText variant="body" color="#1F2937">
                    {commission.percentage}%
                  </KurdishText>
                </View>
              )}
              {commission.description && (
                <View style={styles.detailRow}>
                  <KurdishText variant="caption" color="#6B7280">
                    وردەکاری:
                  </KurdishText>
                  <KurdishText variant="body" color="#1F2937">
                    {commission.description}
                  </KurdishText>
                </View>
              )}
            </View>
          </GradientCard>
        ))}
      </ScrollView>

      {/* Add Commission Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <KurdishText variant="title" color="#1F2937" style={styles.modalTitle}>
              زیادکردنی کۆمیسیۆنی نوێ
            </KurdishText>

            <TextInput
              style={styles.input}
              placeholder="ناوی کارمەند"
              placeholderTextColor="#9CA3AF"
              value={newCommission.employeeName}
              onChangeText={(text) => setNewCommission({ ...newCommission, employeeName: text })}
              textAlign="right"
            />

            <TextInput
              style={styles.input}
              placeholder="بڕی کۆمیسیۆن"
              placeholderTextColor="#9CA3AF"
              value={newCommission.amount}
              onChangeText={(text) => setNewCommission({ ...newCommission, amount: text })}
              keyboardType="numeric"
              textAlign="right"
            />

            <TextInput
              style={styles.input}
              placeholder="ڕێژە (%)"
              placeholderTextColor="#9CA3AF"
              value={newCommission.percentage}
              onChangeText={(text) => setNewCommission({ ...newCommission, percentage: text })}
              keyboardType="numeric"
              textAlign="right"
            />

            <TextInput
              style={styles.input}
              placeholder="وردەکاری"
              placeholderTextColor="#9CA3AF"
              value={newCommission.description}
              onChangeText={(text) => setNewCommission({ ...newCommission, description: text })}
              textAlign="right"
              multiline
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
                onPress={handleAddCommission}
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
  commissionCard: {
    marginBottom: 12,
  },
  commissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  commissionInfo: {
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  commissionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  commissionDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
