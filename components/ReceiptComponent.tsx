import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Share,
  Platform,
  Image
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
  Hash,
  Store
} from 'lucide-react-native';
import { useSettings } from '@/hooks/settings-context';
import { useTenant } from '@/hooks/tenant-context';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

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
  const { settings } = useSettings();
  const { currentTenant } = useTenant();
  const [storeInfo, setStoreInfo] = useState({
    name: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    if (currentTenant) {
      setStoreInfo({
        name: currentTenant.storeNameKurdish || currentTenant.storeName,
        phone: currentTenant.ownerPhone,
        address: currentTenant.address,
      });
    } else if (settings) {
      setStoreInfo({
        name: settings.businessInfo.name,
        phone: settings.businessInfo.phone,
        address: settings.businessInfo.address || '',
      });
    }
  }, [currentTenant, settings]);

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

  const handlePrint = async () => {
    try {
      const html = generateReceiptHTML();
      if (Platform.OS === 'web') {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
          printWindow.print();
        }
      } else {
        await Print.printAsync({ html });
      }
      if (onPrint) {
        onPrint(receipt);
      }
    } catch (error) {
      console.error('Error printing receipt:', error);
      Alert.alert('هەڵە', 'نەتوانرا وەسڵ چاپ بکرێت');
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

  const handleDownload = async () => {
    try {
      const html = generateReceiptHTML();
      if (Platform.OS === 'web') {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
        }
      } else {
        const { uri } = await Print.printToFileAsync({ html });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: `وەسڵی ${receipt.type === 'debt' ? 'قەرز' : 'پارەدان'} - ${receipt.receiptNumber}`
          });
        } else {
          Alert.alert('سەرکەوتوو', 'وەسڵ هەڵگیرا لە: ' + uri);
        }
      }
      if (onDownload) {
        onDownload(receipt);
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
      Alert.alert('هەڵە', 'نەتوانرا وەسڵ دابەزێندرێت');
    }
    setShowActions(false);
  };

  const generateReceiptText = () => {
    return `
${storeInfo.name}
${storeInfo.phone || ''}
${storeInfo.address || ''}

وەسڵی ${receipt.type === 'debt' ? 'قەرز' : 'پارەدان'}
ژمارە: ${receipt.receiptNumber}
بەروار: ${formatDate(receipt.date)}

کڕیار: ${receipt.customerName}
بڕ: ${formatCurrency(receipt.amount)}

${receipt.notes ? `تێبینی: ${receipt.notes}` : ''}

دروستکراو لەلایەن: ${receipt.createdByName}

سوپاس بۆ هاوکاریتان
    `.trim();
  };

  const generateReceiptHTML = () => {
    const logoHtml = receipt.companyInfo.logoUri 
      ? `<img src="${receipt.companyInfo.logoUri}" style="width: 80px; height: 80px; object-fit: contain; margin: 0 auto 16px;" />`
      : '';

    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>وەسڵی ${receipt.type === 'debt' ? 'قەرز' : 'پارەدان'} - ${receipt.receiptNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Arial', sans-serif;
            padding: 20px;
            background: #fff;
            color: #1F2937;
            direction: rtl;
          }
          .receipt {
            max-width: 400px;
            margin: 0 auto;
            border: 2px solid #E5E7EB;
            border-radius: 12px;
            padding: 24px;
            background: #FFFFFF;
          }
          .header {
            text-align: center;
            border-bottom: 2px dashed #E5E7EB;
            padding-bottom: 16px;
            margin-bottom: 16px;
          }
          .logo { margin-bottom: 16px; }
          .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #1F2937;
            margin-bottom: 8px;
          }
          .company-info {
            font-size: 14px;
            color: #6B7280;
            margin-bottom: 4px;
          }
          .receipt-title {
            font-size: 20px;
            font-weight: bold;
            color: ${receipt.type === 'debt' ? '#EF4444' : '#10B981'};
            margin: 16px 0 8px;
            text-align: center;
          }
          .receipt-number {
            font-size: 16px;
            color: #6B7280;
            text-align: center;
            margin-bottom: 16px;
          }
          .details {
            margin: 16px 0;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #F3F4F6;
          }
          .detail-label {
            font-size: 14px;
            color: #6B7280;
          }
          .detail-value {
            font-size: 14px;
            font-weight: 500;
            color: #1F2937;
          }
          .amount {
            font-size: 18px;
            font-weight: bold;
            color: ${receipt.type === 'debt' ? '#EF4444' : '#10B981'};
          }
          .notes {
            margin: 16px 0;
            padding: 12px;
            background: #F9FAFB;
            border-radius: 8px;
          }
          .notes-label {
            font-size: 14px;
            font-weight: 500;
            color: #374151;
            margin-bottom: 4px;
          }
          .notes-text {
            font-size: 14px;
            color: #6B7280;
            line-height: 1.5;
          }
          .footer {
            text-align: center;
            border-top: 2px dashed #E5E7EB;
            padding-top: 16px;
            margin-top: 16px;
          }
          .footer-text {
            font-size: 16px;
            font-weight: 500;
            color: #1F2937;
            margin-bottom: 8px;
          }
          .created-by {
            font-size: 12px;
            color: #9CA3AF;
          }
          @media print {
            body { padding: 0; }
            .receipt { border: none; box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            ${logoHtml}
            <div class="company-name">${storeInfo.name}</div>
            ${storeInfo.phone ? `<div class="company-info">${storeInfo.phone}</div>` : ''}
            ${storeInfo.address ? `<div class="company-info">${storeInfo.address}</div>` : ''}
            ${receipt.companyInfo.email ? `<div class="company-info">${receipt.companyInfo.email}</div>` : ''}
          </div>
          
          <div class="receipt-title">وەسڵی ${receipt.type === 'debt' ? 'قەرز' : 'پارەدان'}</div>
          <div class="receipt-number">#${receipt.receiptNumber}</div>
          
          <div class="details">
            <div class="detail-row">
              <span class="detail-label">بەروار</span>
              <span class="detail-value">${formatDate(receipt.date)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">کڕیار</span>
              <span class="detail-value">${receipt.customerName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">بڕ</span>
              <span class="detail-value amount">${formatCurrency(receipt.amount)}</span>
            </div>
          </div>
          
          ${receipt.notes ? `
            <div class="notes">
              <div class="notes-label">تێبینی:</div>
              <div class="notes-text">${receipt.notes}</div>
            </div>
          ` : ''}
          
          <div class="footer">
            <div class="footer-text">سوپاس بۆ هاوکاریتان</div>
            <div class="created-by">دروستکراو لەلایەن: ${receipt.createdByName}</div>
          </div>
        </div>
      </body>
      </html>
    `;
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

      {/* Store Info */}
      <View style={styles.section}>
        {receipt.companyInfo.logoUri && (
          <View style={styles.logoContainer}>
            <Image 
              source={{ uri: receipt.companyInfo.logoUri }} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        )}
        <View style={styles.storeHeader}>
          <Store size={24} color="#3B82F6" />
          <Text style={styles.companyName}>{storeInfo.name}</Text>
        </View>
        {storeInfo.phone && (
          <Text style={styles.companyInfo}>{storeInfo.phone}</Text>
        )}
        {storeInfo.address && (
          <Text style={styles.companyInfo}>{storeInfo.address}</Text>
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
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  companyName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 80,
    height: 80,
  },
});