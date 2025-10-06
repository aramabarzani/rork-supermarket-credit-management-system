import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import {
  Bell,
  Plus,
  Calendar,
  Clock,
  User,
  Edit,
  Trash2,
  CheckCircle,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';

interface Reminder {
  id: string;
  title: string;
  description: string;
  customerName: string;
  date: string;
  time: string;
  isActive: boolean;
  isCompleted: boolean;
  type: 'payment' | 'followup' | 'meeting' | 'other';
}

export default function ReminderManagementScreen() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: '1',
      title: 'بیرخستنەوەی پارەدان',
      description: 'پارەدانی قەرزی مانگی ڕابردوو',
      customerName: 'کڕیار ١',
      date: new Date().toISOString(),
      time: '10:00',
      isActive: true,
      isCompleted: false,
      type: 'payment',
    },
  ]);

  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    customerName: '',
    date: '',
    time: '',
  });

  const activeReminders = reminders.filter(r => r.isActive && !r.isCompleted);
  const completedReminders = reminders.filter(r => r.isCompleted);

  const handleAddReminder = () => {
    if (!newReminder.title || !newReminder.customerName) {
      Alert.alert('هەڵە', 'تکایە هەموو خانەکان پڕبکەرەوە');
      return;
    }

    const reminder: Reminder = {
      id: Date.now().toString(),
      title: newReminder.title,
      description: newReminder.description,
      customerName: newReminder.customerName,
      date: newReminder.date || new Date().toISOString(),
      time: newReminder.time || '09:00',
      isActive: true,
      isCompleted: false,
      type: 'payment',
    };

    setReminders([...reminders, reminder]);
    setNewReminder({ title: '', description: '', customerName: '', date: '', time: '' });
    setShowAddModal(false);
    Alert.alert('سەرکەوتوو', 'بیرخستنەوە زیادکرا');
  };

  const toggleReminderStatus = (id: string) => {
    setReminders(reminders.map(r =>
      r.id === id ? { ...r, isActive: !r.isActive } : r
    ));
  };

  const markAsCompleted = (id: string) => {
    setReminders(reminders.map(r =>
      r.id === id ? { ...r, isCompleted: true } : r
    ));
    Alert.alert('سەرکەوتوو', 'بیرخستنەوە وەک تەواوکراو نیشانکرا');
  };

  const deleteReminder = (id: string) => {
    Alert.alert(
      'دڵنیابوونەوە',
      'دڵنیایت لە سڕینەوەی ئەم بیرخستنەوەیە؟',
      [
        { text: 'نەخێر', style: 'cancel' },
        {
          text: 'بەڵێ',
          style: 'destructive',
          onPress: () => setReminders(reminders.filter(r => r.id !== id)),
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ckb-IQ');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: 'بەڕێوەبردنی بیرخستنەوە' }} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={24} color="white" />
          <KurdishText variant="body" color="white">
            زیادکردنی بیرخستنەوە
          </KurdishText>
        </TouchableOpacity>
      </View>

      {/* Statistics */}
      <View style={styles.statsRow}>
        <GradientCard style={styles.statCard} colors={['#3B82F6', '#2563EB']}>
          <Bell size={24} color="#3B82F6" />
          <KurdishText variant="body" color="#1F2937">
            {activeReminders.length}
          </KurdishText>
          <KurdishText variant="caption" color="#6B7280">
            چالاک
          </KurdishText>
        </GradientCard>

        <GradientCard style={styles.statCard} colors={['#10B981', '#059669']}>
          <CheckCircle size={24} color="#10B981" />
          <KurdishText variant="body" color="#1F2937">
            {completedReminders.length}
          </KurdishText>
          <KurdishText variant="caption" color="#6B7280">
            تەواوکراو
          </KurdishText>
        </GradientCard>

        <GradientCard style={styles.statCard} colors={['#F59E0B', '#D97706']}>
          <Calendar size={24} color="#F59E0B" />
          <KurdishText variant="body" color="#1F2937">
            {reminders.length}
          </KurdishText>
          <KurdishText variant="caption" color="#6B7280">
            کۆی گشتی
          </KurdishText>
        </GradientCard>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Active Reminders */}
        <View style={styles.section}>
          <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
            بیرخستنەوە چالاکەکان
          </KurdishText>
          {activeReminders.map(reminder => (
            <GradientCard key={reminder.id} style={styles.reminderCard}>
              <View style={styles.reminderHeader}>
                <View style={styles.reminderInfo}>
                  <KurdishText variant="subtitle" color="#1F2937">
                    {reminder.title}
                  </KurdishText>
                  <View style={styles.customerRow}>
                    <User size={14} color="#6B7280" />
                    <KurdishText variant="caption" color="#6B7280">
                      {reminder.customerName}
                    </KurdishText>
                  </View>
                </View>
                <Switch
                  value={reminder.isActive}
                  onValueChange={() => toggleReminderStatus(reminder.id)}
                  trackColor={{ false: '#D1D5DB', true: '#10B981' }}
                  thumbColor={reminder.isActive ? '#fff' : '#f4f3f4'}
                />
              </View>

              {reminder.description && (
                <KurdishText variant="body" color="#6B7280" style={styles.description}>
                  {reminder.description}
                </KurdishText>
              )}

              <View style={styles.reminderDetails}>
                <View style={styles.detailItem}>
                  <Calendar size={16} color="#3B82F6" />
                  <KurdishText variant="caption" color="#6B7280">
                    {formatDate(reminder.date)}
                  </KurdishText>
                </View>
                <View style={styles.detailItem}>
                  <Clock size={16} color="#F59E0B" />
                  <KurdishText variant="caption" color="#6B7280">
                    {reminder.time}
                  </KurdishText>
                </View>
              </View>

              <View style={styles.reminderActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.completeButton]}
                  onPress={() => markAsCompleted(reminder.id)}
                >
                  <CheckCircle size={16} color="#10B981" />
                  <KurdishText variant="caption" color="#10B981">
                    تەواوکردن
                  </KurdishText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                >
                  <Edit size={16} color="#3B82F6" />
                  <KurdishText variant="caption" color="#3B82F6">
                    دەستکاری
                  </KurdishText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => deleteReminder(reminder.id)}
                >
                  <Trash2 size={16} color="#EF4444" />
                  <KurdishText variant="caption" color="#EF4444">
                    سڕینەوە
                  </KurdishText>
                </TouchableOpacity>
              </View>
            </GradientCard>
          ))}
        </View>

        {/* Completed Reminders */}
        {completedReminders.length > 0 && (
          <View style={styles.section}>
            <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
              بیرخستنەوە تەواوکراوەکان
            </KurdishText>
            {completedReminders.map(reminder => (
              <GradientCard key={reminder.id} style={[styles.reminderCard, styles.completedCard]}>
                <View style={styles.reminderHeader}>
                  <View style={styles.reminderInfo}>
                    <KurdishText variant="subtitle" color="#6B7280">
                      {reminder.title}
                    </KurdishText>
                    <View style={styles.customerRow}>
                      <User size={14} color="#9CA3AF" />
                      <KurdishText variant="caption" color="#9CA3AF">
                        {reminder.customerName}
                      </KurdishText>
                    </View>
                  </View>
                  <CheckCircle size={24} color="#10B981" />
                </View>
              </GradientCard>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Reminder Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <KurdishText variant="title" color="#1F2937" style={styles.modalTitle}>
              زیادکردنی بیرخستنەوەی نوێ
            </KurdishText>

            <TextInput
              style={styles.input}
              placeholder="ناونیشان"
              placeholderTextColor="#9CA3AF"
              value={newReminder.title}
              onChangeText={(text) => setNewReminder({ ...newReminder, title: text })}
              textAlign="right"
            />

            <TextInput
              style={styles.input}
              placeholder="ناوی کڕیار"
              placeholderTextColor="#9CA3AF"
              value={newReminder.customerName}
              onChangeText={(text) => setNewReminder({ ...newReminder, customerName: text })}
              textAlign="right"
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="وردەکاری"
              placeholderTextColor="#9CA3AF"
              value={newReminder.description}
              onChangeText={(text) => setNewReminder({ ...newReminder, description: text })}
              textAlign="right"
              multiline
              numberOfLines={3}
            />

            <TextInput
              style={styles.input}
              placeholder="کات (HH:MM)"
              placeholderTextColor="#9CA3AF"
              value={newReminder.time}
              onChangeText={(text) => setNewReminder({ ...newReminder, time: text })}
              textAlign="right"
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
                onPress={handleAddReminder}
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
  reminderCard: {
    marginBottom: 12,
  },
  completedCard: {
    opacity: 0.7,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reminderInfo: {
    flex: 1,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  description: {
    marginBottom: 12,
  },
  reminderDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reminderActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  completeButton: {
    backgroundColor: '#F0FDF4',
  },
  editButton: {
    backgroundColor: '#EFF6FF',
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
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
