import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Share,
  Platform
} from 'react-native';
import { Receipt, ReceiptTemplate } from '@/types/debt';
import { 
  FileText, 
  Download, 
  Share2, 
  Mail, 
  Printer, 
  X,
  Calendar,
  User,
  DollarSign,
  Hash
} from 'lucide-react-native';

interface ReceiptComponentProps {
  receipt: Receipt;
  template?: ReceiptTemplate;
  onClose?: () => void;
  onPrint?: (receipt: Receipt) => void;
  onEmail?: (receipt: Receipt) => void;
  onShare?: (receipt: Receipt) => void;
  onDownload?: (receipt: Receipt) => void;
}

export default function ReceiptComponent({
  receipt,
  template,
  onClose,
  onPrint,
  onEmail,
  onShare,
  onDownload
}: ReceiptComponentProps) {
  const [showActions, setShowActions] = useState(false);

  const formatCurrency = (amount: number) => {
    if (!amount || isNaN(amount)) return '0 د.ع';
    return new Intl.NumberFormat('ckb-IQ', {
      style: 'currency',
      currency: 'IQD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ckb-IQ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint(receipt);
    } else {
      Alert.alert('چاپکردن', 'تایبەتمەندی چاپکردن لە ئێستادا بەردەست نییە');
    }
    setShowActions(false);
  };

  const handleEmail = () => {
    if (onEmail) {
      onEmail(receipt);
    } else {
      Alert.alert('ئیمەیڵ', 'تایبەتمەندی ئیمەیڵ لە ئێستادا بەردەست نییە');
    }
    setShowActions(false);
  };

  const handleShare = async () => {
    try {
      const content = generateReceiptText();
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({
            title: `وەسڵی ${receipt.type === 'debt' ? 'قەرز' : 'پارەدان'} - ${receipt.receiptNumber}`,
            text: content
          });
        } else {
          await navigator.clipboard.writeText(content);
          Alert.alert('کۆپی کرا', 'ناوەڕۆکی وەسڵ کۆپی کرا');
        }
      } else {
        await Share.share({
          message: content,
          title: `وەسڵی ${receipt.type === 'debt' ? 'قەرز' : 'پارەدان'} - ${receipt.receiptNumber}`
        });
      }
    } catch (error) {
      console.error('Error sharing receipt:', error);
      Alert.alert('هەڵە', 'نەتوانرا وەسڵ هاوبەش بکرێت');
    }
    setShowActions(false);
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload(receipt);
    } else {
      Alert.alert('داگرتن', 'تایبەتمەندی داگرتن لە ئێستادا بەردەست نییە');
    }
    setShowActions(false);
  };

  const generateReceiptText = () => {
    return `
${receipt.companyInfo.name}
${receipt.companyInfo.phone || ''}
${receipt.companyInfo.address || ''}

وەسڵی ${receipt.type === 'debt' ? 'قەرز' : 'پارەدان'}
ژمارە: ${receipt.receiptNumber}
بەروار: ${formatDate(receipt.date)}

کڕیار: ${receipt.customerName}
بڕ: ${formatCurrency(receipt.amount)}

${receipt.notes ? `تێبینی: ${receipt.notes}` : ''}

سوپاس بۆ هاوکاریتان
${receipt.companyInfo.email || ''}
    `.trim();
  };

  return (
    <View style={styles.container}>
      {/* Receipt Header */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.receiptTitle}>
            وەسڵی {receipt.type === 'debt' ? 'قەرز' : 'پارەدان'}
          </Text>
          <Text style={styles.receiptNumber}>#{receipt.receiptNumber}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowActions(true)}
          >
            <FileText size={20} color="#3B82F6" />
          </TouchableOpacity>
          {onClose && (
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <X size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Company Info */}
      <View style={styles.section}>
        <Text style={styles.companyName}>{receipt.companyInfo.name}</Text>
        {receipt.companyInfo.phone && (
          <Text style={styles.companyInfo}>{receipt.companyInfo.phone}</Text>
        )}
        {receipt.companyInfo.address && (
          <Text style={styles.companyInfo}>{receipt.companyInfo.address}</Text>
        )}
        {receipt.companyInfo.email && (
          <Text style={styles.companyInfo}>{receipt.companyInfo.email}</Text>
        )}
      </View>

      {/* Receipt Details */}
      <View style={styles.section}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Hash size={16} color="#6B7280" />
            <Text style={styles.detailLabel}>ژمارەی وەسڵ</Text>
          </View>
          <Text style={styles.detailValue}>{receipt.receiptNumber}</Text>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Calendar size={16} color="#6B7280" />
            <Text style={styles.detailLabel}>بەروار</Text>
          </View>
          <Text style={styles.detailValue}>{formatDate(receipt.date)}</Text>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <User size={16} color="#6B7280" />
            <Text style={styles.detailLabel}>کڕیار</Text>
          </View>
          <Text style={styles.detailValue}>{receipt.customerName}</Text>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <DollarSign size={16} color="#6B7280" />
            <Text style={styles.detailLabel}>بڕ</Text>
          </View>
          <Text style={[styles.detailValue, styles.amountValue]}>
            {formatCurrency(receipt.amount)}
          </Text>
        </View>

        {receipt.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>تێبینی:</Text>
            <Text style={styles.notesText}>{receipt.notes}</Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>سوپاس بۆ هاوکاریتان</Text>
        <Text style={styles.createdBy}>
          دروستکراو لەلایەن: {receipt.createdByName}
        </Text>
      </View>

      {/* Actions Modal */}
      <Modal
        visible={showActions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowActions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>کردارەکان</Text>
              <TouchableOpacity onPress={() => setShowActions(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.actionsList}>
              <TouchableOpacity style={styles.actionItem} onPress={handlePrint}>
                <Printer size={20} color="#3B82F6" />
                <Text style={styles.actionText}>چاپکردن</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionItem} onPress={handleDownload}>
                <Download size={20} color="#10B981" />
                <Text style={styles.actionText}>داگرتن وەک PDF</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionItem} onPress={handleShare}>
                <Share2 size={20} color="#F59E0B" />
                <Text style={styles.actionText}>هاوبەشکردن</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionItem} onPress={handleEmail}>
                <Mail size={20} color="#8B5CF6" />
                <Text style={styles.actionText}>ناردن بە ئیمەیڵ</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerInfo: {
    flex: 1,
  },
  receiptTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  receiptNumber: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'monospace',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  closeButton: {
    padding: 8,
  },
  section: {
    marginBottom: 20,
  },
  companyName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  companyInfo: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
  },
  notesSection: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 8,
  },
  createdBy: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  actionsList: {
    maxHeight: 300,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
    gap: 12,
  },
  actionText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
});