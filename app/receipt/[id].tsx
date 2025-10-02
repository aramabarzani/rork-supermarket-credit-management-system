import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams } from 'expo-router';
import {
  Download,
  Share2,
  Printer,
  User,
  DollarSign,
  FileText,
  CheckCircle,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import { useReceipts } from '@/hooks/receipt-context';
import { useSettings } from '@/hooks/settings-context';

export default function ReceiptDetailScreen() {
  const { id } = useLocalSearchParams();
  const { getReceiptById } = useReceipts();
  const { settings } = useSettings();
  const receiptRef = useRef(null);

  const receipt = getReceiptById(id as string);

  if (!receipt) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Stack.Screen
          options={{
            title: 'وەسڵ',
            headerStyle: { backgroundColor: '#1E3A8A' },
            headerTintColor: 'white',
          }}
        />
        <View style={styles.errorContainer}>
          <FileText size={64} color="#9CA3AF" />
          <KurdishText variant="title" color="#6B7280" style={{ marginTop: 16 }}>وەسڵ نەدۆزرایەوە</KurdishText>
        </View>
      </SafeAreaView>
    );
  }

  const formatCurrency = (amount: number) => {
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
      minute: '2-digit',
    });
  };

  const handleDownload = () => {
    if (Platform.OS === 'web') {
      Alert.alert('دابەزاندن', 'وەسڵەکە دادەبەزێت...');
    } else {
      Alert.alert('دابەزاندن', 'لە ئەپی ڕاستەقینەدا، وەسڵەکە وەک PDF دادەبەزێت');
    }
  };

  const handleShare = () => {
    Alert.alert('هاوبەشکردن', 'هاوبەشکردنی وەسڵ لەگەڵ کەسانی تر');
  };

  const handlePrint = () => {
    Alert.alert('چاپکردن', 'چاپکردنی وەسڵ');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'وەسڵ #' + receipt.receiptNumber,
          headerStyle: { backgroundColor: '#1E3A8A' },
          headerTintColor: 'white',
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View ref={receiptRef} style={styles.receiptContainer}>
          {/* Header */}
          <GradientCard style={styles.headerCard} colors={['#1E3A8A', '#3B82F6']}>
            <View style={styles.businessInfo}>
              <KurdishText variant="title" color="white" style={styles.businessName}>
                {settings.businessInfo.name}
              </KurdishText>
              <KurdishText variant="body" color="white" style={styles.businessDetails}>
                {settings.businessInfo.address}
              </KurdishText>
              <KurdishText variant="body" color="white" style={styles.businessDetails}>
                {settings.businessInfo.phone}
              </KurdishText>
            </View>
            
            <View style={styles.receiptNumberContainer}>
              <KurdishText variant="caption" color="white">ژمارەی وەسڵ</KurdishText>
              <KurdishText variant="subtitle" color="white">#{receipt.receiptNumber}</KurdishText>
            </View>
          </GradientCard>

          {/* Status Badge */}
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: '#10B981' }]}>
              <CheckCircle size={20} color="white" />
              <KurdishText variant="body" color="white">پارەدراوەتەوە</KurdishText>
            </View>
          </View>

          {/* Customer Info */}
          <GradientCard style={styles.section}>
            <View style={styles.sectionHeader}>
              <User size={24} color="#1E3A8A" />
              <KurdishText variant="subtitle" color="#1F2937">زانیاری کڕیار</KurdishText>
            </View>
            <View style={styles.infoRow}>
              <KurdishText variant="body" color="#6B7280">ناو</KurdishText>
              <KurdishText variant="body" color="#1F2937">{receipt.customerName}</KurdishText>
            </View>

          </GradientCard>

          {/* Payment Info */}
          <GradientCard style={styles.section}>
            <View style={styles.sectionHeader}>
              <DollarSign size={24} color="#10B981" />
              <KurdishText variant="subtitle" color="#1F2937">زانیاری پارەدان</KurdishText>
            </View>
            <View style={styles.infoRow}>
              <KurdishText variant="body" color="#6B7280">بڕی پارەدان</KurdishText>
              <KurdishText variant="subtitle" color="#10B981">{formatCurrency(receipt.amount)}</KurdishText>
            </View>

            <View style={styles.infoRow}>
              <KurdishText variant="body" color="#6B7280">بەروار</KurdishText>
              <KurdishText variant="body" color="#1F2937">{formatDate(receipt.date)}</KurdishText>
            </View>
          </GradientCard>

          {/* Debt Info */}
          {receipt.relatedId && (
            <GradientCard style={styles.section}>
              <View style={styles.sectionHeader}>
                <FileText size={24} color="#F59E0B" />
                <KurdishText variant="subtitle" color="#1F2937">زانیاری {receipt.type === 'debt' ? 'قەرز' : 'پارەدان'}</KurdishText>
              </View>
              <View style={styles.infoRow}>
                <KurdishText variant="body" color="#6B7280">ژمارە</KurdishText>
                <KurdishText variant="body" color="#1F2937">#{receipt.relatedId.substring(0, 8)}</KurdishText>
              </View>
            </GradientCard>
          )}

          {/* Notes */}
          {receipt.notes && (
            <GradientCard style={styles.section}>
              <KurdishText variant="subtitle" color="#1F2937" style={{ marginBottom: 12 }}>تێبینیەکان</KurdishText>
              <KurdishText variant="body" color="#6B7280">{receipt.notes}</KurdishText>
            </GradientCard>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <KurdishText variant="caption" color="#9CA3AF" style={{ textAlign: 'center' }}>سوپاس بۆ بەکارهێنانی خزمەتگوزارییەکانمان</KurdishText>
            <KurdishText variant="caption" color="#9CA3AF" style={{ textAlign: 'center', marginTop: 8 }}>{new Date().toLocaleDateString('ckb-IQ')}</KurdishText>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionButton} onPress={handleDownload}>
          <Download size={20} color="#1E3A8A" />
          <KurdishText variant="caption" color="#1E3A8A">دابەزاندن</KurdishText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Share2 size={20} color="#10B981" />
          <KurdishText variant="caption" color="#10B981">هاوبەش</KurdishText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handlePrint}>
          <Printer size={20} color="#F59E0B" />
          <KurdishText variant="caption" color="#F59E0B">چاپ</KurdishText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    flex: 1,
  },
  receiptContainer: {
    padding: 16,
  },
  headerCard: {
    marginBottom: 16,
  },
  businessInfo: {
    marginBottom: 16,
  },
  businessName: {
    marginBottom: 8,
  },
  businessDetails: {
    marginBottom: 4,
  },
  receiptNumberContainer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  footer: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  actionBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
});
