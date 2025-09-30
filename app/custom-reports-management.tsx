import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, Plus, Trash2, Edit, Play } from 'lucide-react-native';
import type { CustomReport, ReportFormat } from '@/types/professional-features';

export default function CustomReportsManagementScreen() {
  const [reports, setReports] = useState<CustomReport[]>([
    {
      id: '1',
      name: 'ڕاپۆرتی قەرزی مانگانە',
      description: 'ڕاپۆرتی تەواوی قەرزەکانی مانگی ڕابردوو',
      format: 'pdf',
      fields: [],
      filters: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin',
    },
  ]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newReport, setNewReport] = useState({
    name: '',
    description: '',
    format: 'pdf' as ReportFormat,
  });

  const handleCreateReport = () => {
    if (!newReport.name.trim()) {
      Alert.alert('هەڵە', 'تکایە ناوی ڕاپۆرت بنووسە');
      return;
    }

    const report: CustomReport = {
      id: Date.now().toString(),
      name: newReport.name,
      description: newReport.description,
      format: newReport.format,
      fields: [],
      filters: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin',
    };

    setReports([...reports, report]);
    setShowCreateModal(false);
    setNewReport({ name: '', description: '', format: 'pdf' });
    Alert.alert('سەرکەوتوو', 'ڕاپۆرت بە سەرکەوتوویی دروست کرا');
  };

  const handleDeleteReport = (id: string) => {
    Alert.alert('دڵنیابوونەوە', 'دڵنیایت لە سڕینەوەی ئەم ڕاپۆرتە؟', [
      { text: 'نەخێر', style: 'cancel' },
      {
        text: 'بەڵێ',
        style: 'destructive',
        onPress: () => {
          setReports(reports.filter((r) => r.id !== id));
          Alert.alert('سەرکەوتوو', 'ڕاپۆرت سڕایەوە');
        },
      },
    ]);
  };

  const handleGenerateReport = (report: CustomReport) => {
    Alert.alert('سەرکەوتوو', `ڕاپۆرتی "${report.name}" دروست دەکرێت...`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'بەڕێوەبردنی ڕاپۆرتی تایبەتی',
          headerStyle: { backgroundColor: '#1e40af' },
          headerTintColor: '#fff',
        }}
      />

      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>ڕاپۆرتە تایبەتیەکان</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Plus size={20} color="#fff" />
            <Text style={styles.addButtonText}>زیادکردنی ڕاپۆرت</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.reportsList}>
          {reports.map((report) => (
            <View key={report.id} style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <FileText size={24} color="#1e40af" />
                <View style={styles.reportInfo}>
                  <Text style={styles.reportName}>{report.name}</Text>
                  <Text style={styles.reportDescription}>
                    {report.description}
                  </Text>
                  <Text style={styles.reportFormat}>
                    فۆرمات: {report.format.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.reportActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.generateButton]}
                  onPress={() => handleGenerateReport(report)}
                >
                  <Play size={16} color="#fff" />
                  <Text style={styles.actionButtonText}>دروستکردن</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => {}}
                >
                  <Edit size={16} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteReport(report.id)}
                >
                  <Trash2 size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>دروستکردنی ڕاپۆرتی نوێ</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>ناوی ڕاپۆرت</Text>
              <TextInput
                style={styles.input}
                value={newReport.name}
                onChangeText={(text) =>
                  setNewReport({ ...newReport, name: text })
                }
                placeholder="ناوی ڕاپۆرت بنووسە"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>وەسف</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newReport.description}
                onChangeText={(text) =>
                  setNewReport({ ...newReport, description: text })
                }
                placeholder="وەسفی ڕاپۆرت بنووسە"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>فۆرمات</Text>
              <View style={styles.formatButtons}>
                {(['pdf', 'excel', 'csv', 'json'] as ReportFormat[]).map(
                  (format) => (
                    <TouchableOpacity
                      key={format}
                      style={[
                        styles.formatButton,
                        newReport.format === format &&
                          styles.formatButtonActive,
                      ]}
                      onPress={() =>
                        setNewReport({ ...newReport, format })
                      }
                    >
                      <Text
                        style={[
                          styles.formatButtonText,
                          newReport.format === format &&
                            styles.formatButtonTextActive,
                        ]}
                      >
                        {format.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelButtonText}>پاشگەزبوونەوە</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleCreateReport}
              >
                <Text style={styles.saveButtonText}>دروستکردن</Text>
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
    backgroundColor: '#f3f4f6',
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#1f2937',
    marginBottom: 15,
    textAlign: 'right' as const,
  },
  addButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: '#1e40af',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  reportsList: {
    padding: 15,
    gap: 15,
  },
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportHeader: {
    flexDirection: 'row' as const,
    gap: 12,
    marginBottom: 15,
  },
  reportInfo: {
    flex: 1,
  },
  reportName: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#1f2937',
    marginBottom: 4,
    textAlign: 'right' as const,
  },
  reportDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
    textAlign: 'right' as const,
  },
  reportFormat: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right' as const,
  },
  reportActions: {
    flexDirection: 'row' as const,
    gap: 8,
    justifyContent: 'flex-end' as const,
  },
  actionButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: 8,
    borderRadius: 6,
    gap: 4,
  },
  generateButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
  },
  editButton: {
    backgroundColor: '#3b82f6',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 500,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'right' as const,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 8,
    textAlign: 'right' as const,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: 'right' as const,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top' as const,
  },
  formatButtons: {
    flexDirection: 'row' as const,
    gap: 8,
    flexWrap: 'wrap' as const,
  },
  formatButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  formatButtonActive: {
    backgroundColor: '#1e40af',
    borderColor: '#1e40af',
  },
  formatButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600' as const,
  },
  formatButtonTextActive: {
    color: '#fff',
  },
  modalActions: {
    flexDirection: 'row' as const,
    gap: 10,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center' as const,
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  saveButton: {
    backgroundColor: '#1e40af',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
