import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import {
  Download,
  FileText,
  X,
  Calendar,
  Users,
  DollarSign,
} from 'lucide-react-native';
import { KurdishText } from './KurdishText';
import { GradientCard } from './GradientCard';
import { trpc } from '@/lib/trpc';

type ExportModalProps = {
  visible: boolean;
  onClose: () => void;
  reportType?: 'monthly' | 'yearly' | 'customer' | 'employee';
};

type ExportOption = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  reportType: 'monthly' | 'yearly' | 'customer' | 'employee';
};

const exportOptions: ExportOption[] = [
  {
    id: 'monthly',
    title: 'التقرير الشهري',
    description: 'تصدير البيانات المالية للشهر الحالي',
    icon: <Calendar size={24} color="#3B82F6" />,
    reportType: 'monthly',
  },
  {
    id: 'yearly',
    title: 'التقرير السنوي',
    description: 'تصدير البيانات المالية للسنة الحالية',
    icon: <FileText size={24} color="#10B981" />,
    reportType: 'yearly',
  },
  {
    id: 'customer',
    title: 'تقرير العملاء',
    description: 'تصدير أرصدة ومعاملات العملاء',
    icon: <Users size={24} color="#F59E0B" />,
    reportType: 'customer',
  },
  {
    id: 'employee',
    title: 'تقرير الموظفين',
    description: 'تصدير أداء وإحصائيات الموظفين',
    icon: <DollarSign size={24} color="#EF4444" />,
    reportType: 'employee',
  },
];

export const ExportModal: React.FC<ExportModalProps> = ({ visible, onClose, reportType }) => {
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'excel'>('excel');
  const [isExporting, setIsExporting] = useState(false);

  const exportMutation = trpc.financial.reports.export.useMutation();

  const handleExport = async (option: ExportOption) => {
    setIsExporting(true);
    try {
      const result = await exportMutation.mutateAsync({
        reportType: option.reportType,
        format: selectedFormat,
        filters: {
          dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          dateTo: new Date().toISOString().split('T')[0],
        },
      });

      if (Platform.OS === 'web') {
        // For web, create a download link
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.download = result.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // For mobile, show success message
        const { Alert } = require('react-native');
        Alert.alert(
          'تم التصدير بنجاح',
          `تم إنشاء الملف: ${result.filename}\nعدد السجلات: ${result.recordsCount}`,
          [{ text: 'موافق', onPress: onClose }]
        );
      }
    } catch (error) {
      if (Platform.OS !== 'web') {
        const { Alert } = require('react-native');
        Alert.alert('خطأ', 'فشل في تصدير التقرير');
      } else {
        console.error('Export failed:', error);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const filteredOptions = reportType 
    ? exportOptions.filter(option => option.reportType === reportType)
    : exportOptions;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <GradientCard style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
              <KurdishText style={styles.title}>تصدير التقارير</KurdishText>
            </View>

            {/* Format Selection */}
            <View style={styles.formatSection}>
              <KurdishText style={styles.sectionTitle}>تنسيق الملف</KurdishText>
              <View style={styles.formatToggle}>
                <TouchableOpacity
                  style={[styles.formatButton, selectedFormat === 'excel' && styles.formatButtonActive]}
                  onPress={() => setSelectedFormat('excel')}
                >
                  <Text style={[styles.formatButtonText, selectedFormat === 'excel' && styles.formatButtonTextActive]}>
                    Excel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.formatButton, selectedFormat === 'csv' && styles.formatButtonActive]}
                  onPress={() => setSelectedFormat('csv')}
                >
                  <Text style={[styles.formatButtonText, selectedFormat === 'csv' && styles.formatButtonTextActive]}>
                    CSV
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Export Options */}
            <View style={styles.optionsSection}>
              <KurdishText style={styles.sectionTitle}>نوع التقرير</KurdishText>
              {filteredOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={styles.optionCard}
                  onPress={() => handleExport(option)}
                  disabled={isExporting}
                >
                  <View style={styles.optionIcon}>
                    {option.icon}
                  </View>
                  <View style={styles.optionContent}>
                    <KurdishText style={styles.optionTitle}>{option.title}</KurdishText>
                    <Text style={styles.optionDescription}>{option.description}</Text>
                  </View>
                  <View style={styles.downloadIcon}>
                    <Download size={20} color="#6B7280" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Loading State */}
            {isExporting && (
              <View style={styles.loadingOverlay}>
                <Text style={styles.loadingText}>جاري التصدير...</Text>
              </View>
            )}
          </GradientCard>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalContent: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
    marginRight: 32,
  },
  formatSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 12,
    textAlign: 'right',
  },
  formatToggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
  },
  formatButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  formatButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  formatButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500' as const,
  },
  formatButtonTextActive: {
    color: '#1F2937',
    fontWeight: '600' as const,
  },
  optionsSection: {
    marginBottom: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'right',
  },
  optionDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
  },
  downloadIcon: {
    marginLeft: 12,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500' as const,
  },
});
