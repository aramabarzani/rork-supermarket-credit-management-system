import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { 
  ArrowLeft,
  Camera,
  CheckCircle,
  User,
  Phone,
  DollarSign,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import { useUsers } from '@/hooks/users-context';
import { useDebts } from '@/hooks/debt-context';
import { useAuth } from '@/hooks/auth-context';
import { PERMISSIONS } from '@/constants/permissions';

export default function ScanCustomerQRScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scannedCustomer, setScannedCustomer] = useState<any>(null);
  
  const usersContext = useUsers();
  const debtsContext = useDebts();
  const authContext = useAuth();
  
  if (!usersContext || !debtsContext || !authContext) {
    return null;
  }
  
  const { getCustomers, updateUser } = usersContext;
  const { getCustomerDebts } = debtsContext;
  const { hasPermission } = authContext;

  const canUseQR = hasPermission(PERMISSIONS.USE_CUSTOMER_QR);

  if (!canUseQR) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1E3A8A" />
          </TouchableOpacity>
          <KurdishText variant="title" color="#1F2937">
            دەسەڵات نییە
          </KurdishText>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContent}>
          <Camera size={64} color="#EF4444" />
          <KurdishText variant="body" color="#6B7280" style={{ marginTop: 16, textAlign: 'center' }}>
            تۆ دەسەڵاتی بەکارهێنانی QR Code ت نییە
          </KurdishText>
        </View>
      </SafeAreaView>
    );
  }

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;

    setScanned(true);
    console.log('QR Code scanned:', data);

    const customers = getCustomers();
    const customer = customers.find(c => c.qrCode?.code === data);

    if (!customer) {
      Alert.alert(
        'هەڵە',
        'QR Code نادروستە یان کڕیار نەدۆزرایەوە',
        [
          { 
            text: 'دووبارە هەوڵبدەرەوە', 
            onPress: () => setScanned(false)
          }
        ]
      );
      return;
    }

    if (!customer.qrCode?.isActive) {
      Alert.alert(
        'هەڵە',
        'QR Code ناچالاکە',
        [
          { 
            text: 'دووبارە هەوڵبدەرەوە', 
            onPress: () => setScanned(false)
          }
        ]
      );
      return;
    }

    const updatedQRCode = {
      ...customer.qrCode,
      usageCount: (customer.qrCode.usageCount || 0) + 1,
      lastUsedAt: new Date().toISOString(),
    };

    updateUser(customer.id, { qrCode: updatedQRCode });
    setScannedCustomer(customer);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ckb-IQ', {
      style: 'currency',
      currency: 'IQD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleViewCustomer = () => {
    if (scannedCustomer) {
      router.push(`/customer-detail/${scannedCustomer.id}`);
    }
  };

  const handleScanAgain = () => {
    setScanned(false);
    setScannedCustomer(null);
  };

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1E3A8A" />
          </TouchableOpacity>
          <KurdishText variant="title" color="#1F2937">
            سکان کردنی QR Code
          </KurdishText>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContent}>
          <Camera size={64} color="#9CA3AF" />
          <KurdishText variant="body" color="#6B7280" style={{ marginTop: 16 }}>
            چاوەڕوان بە...
          </KurdishText>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1E3A8A" />
          </TouchableOpacity>
          <KurdishText variant="title" color="#1F2937">
            سکان کردنی QR Code
          </KurdishText>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContent}>
          <Camera size={64} color="#EF4444" />
          <KurdishText variant="body" color="#1F2937" style={{ marginTop: 16, textAlign: 'center' }}>
            پێویستە ڕێگەپێدان بە کامێرا بدەیت
          </KurdishText>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <KurdishText variant="body" color="white">
              ڕێگەپێدان
            </KurdishText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (scannedCustomer) {
    const debts = getCustomerDebts(scannedCustomer.id);
    const totalDebt = debts.reduce((sum, debt) => sum + debt.remainingAmount, 0);
    const totalPaid = debts.reduce((sum, debt) => sum + (debt.amount - debt.remainingAmount), 0);

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1E3A8A" />
          </TouchableOpacity>
          <KurdishText variant="title" color="#1F2937">
            زانیاری کڕیار
          </KurdishText>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.successIcon}>
            <CheckCircle size={64} color="#10B981" />
          </View>

          <GradientCard style={styles.customerCard}>
            <View style={styles.customerHeader}>
              <User size={32} color="#1E3A8A" />
              <View style={styles.customerInfo}>
                <KurdishText variant="title" color="#1F2937">
                  {scannedCustomer.name}
                </KurdishText>
                <View style={styles.customerMeta}>
                  <Phone size={16} color="#6B7280" />
                  <KurdishText variant="body" color="#6B7280">
                    {scannedCustomer.phone}
                  </KurdishText>
                </View>
              </View>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <DollarSign size={24} color="#EF4444" />
                <KurdishText variant="caption" color="#6B7280">
                  قەرزی ماوە
                </KurdishText>
                <KurdishText variant="subtitle" color="#EF4444">
                  {formatCurrency(totalDebt)}
                </KurdishText>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <DollarSign size={24} color="#10B981" />
                <KurdishText variant="caption" color="#6B7280">
                  کۆی پارەدان
                </KurdishText>
                <KurdishText variant="subtitle" color="#10B981">
                  {formatCurrency(totalPaid)}
                </KurdishText>
              </View>
            </View>
          </GradientCard>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={handleViewCustomer}
            >
              <User size={20} color="white" />
              <KurdishText variant="body" color="white">
                بینینی زانیاری تەواو
              </KurdishText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={handleScanAgain}
            >
              <Camera size={20} color="#1E3A8A" />
              <KurdishText variant="body" color="#1E3A8A">
                سکانی دووبارە
              </KurdishText>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1E3A8A" />
        </TouchableOpacity>
        <KurdishText variant="title" color="#1F2937">
          سکان کردنی QR Code
        </KurdishText>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        >
          <View style={styles.overlay}>
            <View style={styles.scanArea}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
          </View>
        </CameraView>

        <View style={styles.instructionContainer}>
          <GradientCard style={styles.instructionCard}>
            <Camera size={32} color="#1E3A8A" />
            <KurdishText variant="body" color="#1F2937" style={{ marginTop: 12, textAlign: 'center' }}>
              QR Code کڕیار لە ناو چوارگۆشەکە دابنێ
            </KurdishText>
          </GradientCard>
        </View>
      </View>
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permissionButton: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative' as const,
  },
  corner: {
    position: 'absolute' as const,
    width: 40,
    height: 40,
    borderColor: '#10B981',
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  instructionContainer: {
    position: 'absolute' as const,
    bottom: 32,
    left: 16,
    right: 16,
  },
  instructionCard: {
    padding: 20,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  successIcon: {
    alignItems: 'center',
    marginBottom: 24,
  },
  customerCard: {
    padding: 20,
    marginBottom: 24,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  customerInfo: {
    flex: 1,
  },
  customerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#1E3A8A',
  },
  secondaryButton: {
    backgroundColor: '#E0E7FF',
  },
});
