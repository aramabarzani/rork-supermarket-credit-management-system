import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft,
  QrCode,
  Share2,
  RefreshCw,
  Trash2,
  CheckCircle,
  XCircle,
  Calendar,
  Eye,
  Clock,
} from 'lucide-react-native';
import QRCode from 'react-native-qrcode-svg';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import { useUsers } from '@/hooks/users-context';
import { useAuth } from '@/hooks/auth-context';
import { PERMISSIONS } from '@/constants/permissions';
import { CustomerQRCode } from '@/types/customer';

export default function CustomerQRManagementScreen() {
  const router = useRouter();
  
  const usersContext = useUsers();
  const authContext = useAuth();
  
  if (!usersContext || !authContext) {
    return null;
  }
  
  const { getCustomers, updateUser } = usersContext;
  const { hasPermission, user } = authContext;

  const canGenerate = hasPermission(PERMISSIONS.GENERATE_CUSTOMER_QR);
  const canUse = hasPermission(PERMISSIONS.USE_CUSTOMER_QR);

  if (!canGenerate && !canUse) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1E3A8A" />
          </TouchableOpacity>
          <KurdishText variant="title" color="#1F2937">
            دەسەڵات نییە
          </KurdishText>
        </View>
        <View style={styles.centerContent}>
          <XCircle size={64} color="#EF4444" />
          <KurdishText variant="body" color="#6B7280" style={{ marginTop: 16, textAlign: 'center' }}>
            تۆ دەسەڵاتی بەکارهێنانی QR Code ت نییە
          </KurdishText>
        </View>
      </SafeAreaView>
    );
  }

  const customers = getCustomers();

  const generateQRCode = (customerId: string) => {
    if (!canGenerate) {
      Alert.alert('دەسەڵات نییە', 'تۆ دەسەڵاتی دروستکردنی QR Code ت نییە');
      return;
    }

    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    const qrCode: CustomerQRCode = {
      id: `qr-${Date.now()}`,
      customerId: customer.id,
      code: `CUSTOMER-${customer.id}-${Date.now()}`,
      isActive: true,
      createdAt: new Date().toISOString(),
      createdBy: user?.id || '',
      usageCount: 0,
    };

    updateUser(customer.id, { qrCode });
    Alert.alert('سەرکەوتوو', 'QR Code بە سەرکەوتوویی دروستکرا');
  };

  const regenerateQRCode = (customerId: string) => {
    if (!canGenerate) {
      Alert.alert('دەسەڵات نییە', 'تۆ دەسەڵاتی نوێکردنەوەی QR Code ت نییە');
      return;
    }

    Alert.alert(
      'دڵنیابوونەوە',
      'دڵنیایت لە دروستکردنەوەی QR Code نوێ؟ کۆدی کۆن ناچالاک دەبێت.',
      [
        { text: 'نەخێر', style: 'cancel' },
        { 
          text: 'بەڵێ', 
          onPress: () => generateQRCode(customerId)
        },
      ]
    );
  };

  const deleteQRCode = (customerId: string) => {
    if (!canGenerate) {
      Alert.alert('دەسەڵات نییە', 'تۆ دەسەڵاتی سڕینەوەی QR Code ت نییە');
      return;
    }

    Alert.alert(
      'دڵنیابوونەوە',
      'دڵنیایت لە سڕینەوەی QR Code؟',
      [
        { text: 'نەخێر', style: 'cancel' },
        { 
          text: 'بەڵێ', 
          style: 'destructive',
          onPress: () => {
            const customer = customers.find(c => c.id === customerId);
            if (customer) {
              updateUser(customer.id, { qrCode: undefined });
              Alert.alert('سەرکەوتوو', 'QR Code سڕایەوە');
            }
          }
        },
      ]
    );
  };

  const toggleQRCodeStatus = (customerId: string) => {
    if (!canGenerate) {
      Alert.alert('دەسەڵات نییە', 'تۆ دەسەڵاتی گۆڕینی دۆخی QR Code ت نییە');
      return;
    }

    const customer = customers.find(c => c.id === customerId);
    if (!customer || !customer.qrCode) return;

    const updatedQRCode = {
      ...customer.qrCode,
      isActive: !customer.qrCode.isActive,
    };

    updateUser(customer.id, { qrCode: updatedQRCode });
    Alert.alert(
      'سەرکەوتوو', 
      updatedQRCode.isActive ? 'QR Code چالاککرا' : 'QR Code ناچالاککرا'
    );
  };

  const shareQRCode = async (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer || !customer.qrCode) return;

    try {
      await Share.share({
        message: `QR Code بۆ کڕیار: ${customer.name}\nکۆد: ${customer.qrCode.code}`,
      });
    } catch (error) {
      console.error('Error sharing QR code:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ckb-IQ');
  };

  const renderCustomerQRCard = (customer: any) => {
    const hasQRCode = !!customer.qrCode;

    return (
      <GradientCard key={customer.id} style={styles.customerCard}>
        <View style={styles.customerHeader}>
          <View style={styles.customerInfo}>
            <KurdishText variant="subtitle" color="#1F2937">
              {customer.name}
            </KurdishText>
            <KurdishText variant="caption" color="#6B7280">
              {customer.phone}
            </KurdishText>
          </View>
          {hasQRCode && (
            <View style={[
              styles.statusBadge,
              { backgroundColor: customer.qrCode.isActive ? '#10B981' : '#EF4444' }
            ]}>
              <KurdishText variant="caption" color="white">
                {customer.qrCode.isActive ? 'چالاک' : 'ناچالاک'}
              </KurdishText>
            </View>
          )}
        </View>

        {hasQRCode ? (
          <>
            <View style={styles.qrCodeContainer}>
              <View style={styles.qrCodeWrapper}>
                <QRCode
                  value={customer.qrCode.code}
                  size={200}
                  backgroundColor="white"
                  color="#1E3A8A"
                />
              </View>
              <KurdishText variant="caption" color="#6B7280" style={styles.qrCodeText}>
                {customer.qrCode.code}
              </KurdishText>
            </View>

            <View style={styles.qrInfoContainer}>
              <View style={styles.qrInfoRow}>
                <Calendar size={16} color="#6B7280" />
                <KurdishText variant="caption" color="#6B7280">
                  دروستکراوە: {formatDate(customer.qrCode.createdAt)}
                </KurdishText>
              </View>
              <View style={styles.qrInfoRow}>
                <Eye size={16} color="#6B7280" />
                <KurdishText variant="caption" color="#6B7280">
                  بەکارهێنان: {customer.qrCode.usageCount} جار
                </KurdishText>
              </View>
              {customer.qrCode.lastUsedAt && (
                <View style={styles.qrInfoRow}>
                  <Clock size={16} color="#6B7280" />
                  <KurdishText variant="caption" color="#6B7280">
                    دوایین بەکارهێنان: {formatDate(customer.qrCode.lastUsedAt)}
                  </KurdishText>
                </View>
              )}
            </View>

            <View style={styles.actionButtons}>
              {canUse && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.secondaryButton]}
                  onPress={() => shareQRCode(customer.id)}
                >
                  <Share2 size={20} color="#1E3A8A" />
                  <KurdishText variant="body" color="#1E3A8A">
                    هاوبەشکردن
                  </KurdishText>
                </TouchableOpacity>
              )}

              {canGenerate && (
                <>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.primaryButton]}
                    onPress={() => toggleQRCodeStatus(customer.id)}
                  >
                    {customer.qrCode.isActive ? (
                      <XCircle size={20} color="white" />
                    ) : (
                      <CheckCircle size={20} color="white" />
                    )}
                    <KurdishText variant="body" color="white">
                      {customer.qrCode.isActive ? 'ناچالاککردن' : 'چالاککردن'}
                    </KurdishText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.warningButton]}
                    onPress={() => regenerateQRCode(customer.id)}
                  >
                    <RefreshCw size={20} color="#F59E0B" />
                    <KurdishText variant="body" color="#F59E0B">
                      نوێکردنەوە
                    </KurdishText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.dangerButton]}
                    onPress={() => deleteQRCode(customer.id)}
                  >
                    <Trash2 size={20} color="#EF4444" />
                    <KurdishText variant="body" color="#EF4444">
                      سڕینەوە
                    </KurdishText>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </>
        ) : (
          <View style={styles.noQRContainer}>
            <QrCode size={48} color="#9CA3AF" />
            <KurdishText variant="body" color="#6B7280" style={{ marginTop: 12 }}>
              QR Code دروست نەکراوە
            </KurdishText>
            {canGenerate && (
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton, { marginTop: 16 }]}
                onPress={() => generateQRCode(customer.id)}
              >
                <QrCode size={20} color="white" />
                <KurdishText variant="body" color="white">
                  دروستکردنی QR Code
                </KurdishText>
              </TouchableOpacity>
            )}
          </View>
        )}
      </GradientCard>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1E3A8A" />
        </TouchableOpacity>
        <KurdishText variant="title" color="#1F2937">
          بەڕێوەبردنی QR Code
        </KurdishText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <GradientCard style={styles.infoCard}>
          <QrCode size={32} color="#1E3A8A" />
          <KurdishText variant="body" color="#1F2937" style={{ marginTop: 12, textAlign: 'center' }}>
            بەڕێوەبردنی QR Code بۆ کڕیارەکان
          </KurdishText>
          <KurdishText variant="caption" color="#6B7280" style={{ marginTop: 8, textAlign: 'center' }}>
            دروستکردن، چالاککردن، ناچالاککردن و هاوبەشکردنی QR Code بۆ کڕیارەکان
          </KurdishText>
        </GradientCard>

        {customers.map(customer => renderCustomerQRCard(customer))}

        {customers.length === 0 && (
          <View style={styles.emptyState}>
            <QrCode size={64} color="#9CA3AF" />
            <KurdishText variant="body" color="#6B7280" style={{ marginTop: 16 }}>
              هیچ کڕیارێک نییە
            </KurdishText>
          </View>
        )}
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
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  infoCard: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  customerCard: {
    padding: 16,
    marginBottom: 16,
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  customerInfo: {
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  qrCodeContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  qrCodeWrapper: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
  },
  qrCodeText: {
    textAlign: 'center',
    fontFamily: 'monospace' as const,
  },
  qrInfoContainer: {
    gap: 8,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  qrInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
    flex: 1,
    minWidth: '45%',
  },
  primaryButton: {
    backgroundColor: '#1E3A8A',
  },
  secondaryButton: {
    backgroundColor: '#E0E7FF',
  },
  warningButton: {
    backgroundColor: '#FEF3C7',
  },
  dangerButton: {
    backgroundColor: '#FEE2E2',
  },
  noQRContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
});
