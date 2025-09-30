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
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { trpc } from '@/lib/trpc';
import { KurdishText } from '@/components/KurdishText';
import { useAuth } from '@/hooks/auth-context';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Plus, 
  Search, 
  RefreshCw,
  Building2,
  Users,
  ShoppingCart,
  Store,
  Package
} from 'lucide-react-native';
import type { License, LicenseType } from '@/types/license';

type BusinessType = 'supermarket' | 'grocery' | 'retail' | 'wholesale' | 'other';

export default function LicenseManagementScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const isOwner = user?.role === 'admin' && user?.id === 'admin';
  const isAdmin = user?.role === 'admin' && user?.id !== 'admin';
  const isEmployee = user?.role === 'employee';

  const licensesQuery = trpc.license.getAll.useQuery();
  const licenseStatsQuery = trpc.license.getStats.useQuery();
  const createLicenseMutation = trpc.license.create.useMutation();
  const updateStatusMutation = trpc.license.updateStatus.useMutation();
  const renewLicenseMutation = trpc.license.renew.useMutation();
  const deactivateMutation = trpc.license.deactivate.useMutation();

  const [newLicense, setNewLicense] = useState({
    clientName: '',
    businessName: '',
    businessType: 'supermarket' as BusinessType,
    type: 'monthly' as LicenseType,
    maxUsers: 5,
    maxCustomers: 100,
    maxBranches: 1,
    features: ['customer_management', 'debt_tracking', 'payment_tracking'],
    durationMonths: 1,
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    address: '',
    city: '',
  });

  const handleCreateLicense = async () => {
    if (!isOwner) {
      Alert.alert('هەڵە', 'تۆ دەسەڵاتی دروستکردنی لایسێنس نەدەتەوێت. تکایە پەیوەندی بکە بە دابینکەر.');
      return;
    }

    if (!newLicense.clientName || !newLicense.businessName || !newLicense.contactPerson || !newLicense.contactPhone) {
      Alert.alert('هەڵە', 'تکایە هەموو خانە پێویستەکان پڕبکەرەوە');
      return;
    }

    try {
      await createLicenseMutation.mutateAsync(newLicense);
      setShowCreateModal(false);
      setNewLicense({
        clientName: '',
        businessName: '',
        businessType: 'supermarket',
        type: 'monthly',
        maxUsers: 5,
        maxCustomers: 100,
        maxBranches: 1,
        features: ['customer_management', 'debt_tracking', 'payment_tracking'],
        durationMonths: 1,
        contactPerson: '',
        contactPhone: '',
        contactEmail: '',
        address: '',
        city: '',
      });
      licensesQuery.refetch();
      licenseStatsQuery.refetch();
      Alert.alert('سەرکەوتوو', 'لایسەنس دروستکرا');
    } catch {
      Alert.alert('هەڵە', 'کێشە لە دروستکردنی لایسەنس');
    }
  };

  const handleUpdateStatus = async (licenseId: string, status: 'active' | 'suspended' | 'expired' | 'trial') => {
    if (!isOwner) {
      Alert.alert('هەڵە', 'تۆ دەسەڵاتی گۆڕانکاری لە لایسێنس نەدەتەوێت. تکایە پەیوەندی بکە بە دابینکەر.');
      return;
    }

    try {
      await updateStatusMutation.mutateAsync({ licenseId, status });
      licensesQuery.refetch();
      licenseStatsQuery.refetch();
      Alert.alert('سەرکەوتوو', 'دۆخی لایسەنس نوێکرایەوە');
    } catch {
      Alert.alert('هەڵە', 'کێشە لە نوێکردنەوەی دۆخ');
    }
  };

  const handleRenewLicense = async (licenseId: string, durationMonths: number) => {
    if (!isOwner) {
      Alert.alert('هەڵە', 'تۆ دەسەڵاتی نوێکردنەوەی لایسێنس نەدەتەوێت. تکایە پەیوەندی بکە بە دابینکەر.');
      return;
    }

    try {
      await renewLicenseMutation.mutateAsync({ licenseId, durationMonths });
      licensesQuery.refetch();
      licenseStatsQuery.refetch();
      Alert.alert('سەرکەوتوو', 'لایسەنس نوێکرایەوە');
    } catch {
      Alert.alert('هەڵە', 'کێشە لە نوێکردنەوەی لایسەنس');
    }
  };

  const handleDeactivate = async (licenseId: string) => {
    if (!isOwner) {
      Alert.alert('هەڵە', 'تۆ دەسەڵاتی ناچالاککردنی لایسێنس نەدەتەوێت. تکایە پەیوەندی بکە بە دابینکەر.');
      return;
    }

    Alert.alert(
      'دڵنیایی',
      'دڵنیایت لە ناچالاککردنی ئەم لایسەنسە؟',
      [
        { text: 'پاشگەزبوونەوە', style: 'cancel' },
        {
          text: 'ناچالاککردن',
          style: 'destructive',
          onPress: async () => {
            try {
              await deactivateMutation.mutateAsync({ licenseId });
              licensesQuery.refetch();
              Alert.alert('سەرکەوتوو', 'لایسەنس ناچالاککرا');
            } catch {
              Alert.alert('هەڵە', 'کێشە لە ناچالاککردنی لایسەنس');
            }
          },
        },
      ]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={20} color="#10b981" />;
      case 'expired':
        return <XCircle size={20} color="#ef4444" />;
      case 'suspended':
        return <AlertTriangle size={20} color="#f59e0b" />;
      case 'trial':
        return <Clock size={20} color="#3b82f6" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'چالاک';
      case 'expired':
        return 'بەسەرچووە';
      case 'suspended':
        return 'ڕاگیراوە';
      case 'trial':
        return 'تاقیکردنەوە';
      default:
        return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'trial':
        return 'تاقیکردنەوە';
      case 'monthly':
        return 'مانگانە';
      case 'yearly':
        return 'ساڵانە';
      case 'lifetime':
        return 'هەمیشەیی';
      default:
        return type;
    }
  };

  const getBusinessTypeText = (type: string) => {
    switch (type) {
      case 'supermarket':
        return 'سوپەرمارکێت';
      case 'grocery':
        return 'بەقاڵی';
      case 'retail':
        return 'فرۆشگای خورد';
      case 'wholesale':
        return 'فرۆشگای کۆ';
      case 'other':
        return 'هیتر';
      default:
        return type;
    }
  };

  const getBusinessTypeIcon = (type: string) => {
    switch (type) {
      case 'supermarket':
        return <ShoppingCart size={16} color="#6b7280" />;
      case 'grocery':
        return <Store size={16} color="#6b7280" />;
      case 'retail':
        return <Building2 size={16} color="#6b7280" />;
      case 'wholesale':
        return <Package size={16} color="#6b7280" />;
      default:
        return <Building2 size={16} color="#6b7280" />;
    }
  };

  const filteredLicenses = licensesQuery.data?.filter(license =>
    license.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    license.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    license.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
    license.city?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (isEmployee) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: 'بەڕێوەبردنی لایسێنس',
            headerStyle: { backgroundColor: '#3b82f6' },
            headerTintColor: '#fff',
          }}
        />
        <View style={styles.noAccessContainer}>
          <AlertTriangle size={64} color="#f59e0b" />
          <KurdishText style={styles.noAccessTitle}>دەسەڵات نییە</KurdishText>
          <KurdishText style={styles.noAccessText}>
            تۆ دەسەڵاتی دەستگەیشتن بە ئەم بەشە نەدەتەوێت.
          </KurdishText>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <KurdishText style={styles.backButtonText}>گەڕانەوە</KurdishText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (licensesQuery.isLoading || licenseStatsQuery.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const stats = licenseStatsQuery.data;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'بەڕێوەبردنی لایسەنس',
          headerStyle: { backgroundColor: '#3b82f6' },
          headerTintColor: '#fff',
        }}
      />

      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#6b7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="گەڕان بە ناو، بازرگانی، کلیل یان شار..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => {
              licensesQuery.refetch();
              licenseStatsQuery.refetch();
            }}
          >
            <RefreshCw size={20} color="#fff" />
          </TouchableOpacity>

          {isOwner && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Plus size={20} color="#fff" />
              <KurdishText style={styles.addButtonText}>لایسەنسی نوێ</KurdishText>
            </TouchableOpacity>
          )}

          {isAdmin && (
            <View style={styles.readOnlyBadge}>
              <AlertTriangle size={16} color="#f59e0b" />
              <KurdishText style={styles.readOnlyText}>تەنیا بینین</KurdishText>
            </View>
          )}
        </View>
      </View>

      <ScrollView style={styles.content}>
        {stats && (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <KurdishText style={styles.statValue}>{stats.total}</KurdishText>
                <KurdishText style={styles.statLabel}>کۆی گشتی</KurdishText>
              </View>

              <View style={styles.statCard}>
                <KurdishText style={styles.statValue}>{stats.active}</KurdishText>
                <KurdishText style={styles.statLabel}>چالاک</KurdishText>
              </View>

              <View style={styles.statCard}>
                <KurdishText style={styles.statValue}>{stats.trial}</KurdishText>
                <KurdishText style={styles.statLabel}>تاقیکردنەوە</KurdishText>
              </View>

              <View style={styles.statCard}>
                <KurdishText style={styles.statValue}>{stats.expiringSoon}</KurdishText>
                <KurdishText style={styles.statLabel}>نزیکە بەسەربچێت</KurdishText>
              </View>
            </View>

            <View style={styles.businessTypeStats}>
              <KurdishText style={styles.sectionTitle}>جۆری بازرگانی</KurdishText>
              <View style={styles.businessTypeGrid}>
                <View style={styles.businessTypeStat}>
                  <ShoppingCart size={20} color="#3b82f6" />
                  <KurdishText style={styles.businessTypeLabel}>سوپەرمارکێت</KurdishText>
                  <Text style={styles.businessTypeValue}>{stats.byBusinessType.supermarket}</Text>
                </View>
                <View style={styles.businessTypeStat}>
                  <Store size={20} color="#10b981" />
                  <KurdishText style={styles.businessTypeLabel}>ب��قاڵی</KurdishText>
                  <Text style={styles.businessTypeValue}>{stats.byBusinessType.grocery}</Text>
                </View>
                <View style={styles.businessTypeStat}>
                  <Building2 size={20} color="#f59e0b" />
                  <KurdishText style={styles.businessTypeLabel}>خورد</KurdishText>
                  <Text style={styles.businessTypeValue}>{stats.byBusinessType.retail}</Text>
                </View>
                <View style={styles.businessTypeStat}>
                  <Package size={20} color="#8b5cf6" />
                  <KurdishText style={styles.businessTypeLabel}>کۆ</KurdishText>
                  <Text style={styles.businessTypeValue}>{stats.byBusinessType.wholesale}</Text>
                </View>
              </View>
            </View>
          </>
        )}

        <KurdishText style={styles.sectionTitle}>لیستی لایسەنسەکان</KurdishText>

        {filteredLicenses.map((license) => (
          <View key={license.id} style={styles.licenseCard}>
            <View style={styles.licenseHeader}>
              <View style={styles.licenseInfo}>
                <View style={styles.businessNameRow}>
                  {getBusinessTypeIcon(license.businessType)}
                  <KurdishText style={styles.businessName}>{license.businessName}</KurdishText>
                </View>
                <KurdishText style={styles.clientName}>{license.clientName}</KurdishText>
                <Text style={styles.licenseKey}>{license.key}</Text>
              </View>
              <View style={styles.statusBadge}>
                {getStatusIcon(license.status)}
                <KurdishText style={styles.statusText}>
                  {getStatusText(license.status)}
                </KurdishText>
              </View>
            </View>

            <View style={styles.licenseDetails}>
              <View style={styles.detailRow}>
                <KurdishText style={styles.detailLabel}>جۆری بازرگانی:</KurdishText>
                <KurdishText style={styles.detailValue}>
                  {getBusinessTypeText(license.businessType)}
                </KurdishText>
              </View>

              <View style={styles.detailRow}>
                <KurdishText style={styles.detailLabel}>جۆری لایسەنس:</KurdishText>
                <KurdishText style={styles.detailValue}>
                  {getTypeText(license.type)}
                </KurdishText>
              </View>

              <View style={styles.detailRow}>
                <KurdishText style={styles.detailLabel}>بەکارهێنەران:</KurdishText>
                <Text style={styles.detailValue}>{license.maxUsers}</Text>
              </View>

              <View style={styles.detailRow}>
                <KurdishText style={styles.detailLabel}>کڕیاران:</KurdishText>
                <Text style={styles.detailValue}>{license.maxCustomers}</Text>
              </View>

              <View style={styles.detailRow}>
                <KurdishText style={styles.detailLabel}>لقەکان:</KurdishText>
                <Text style={styles.detailValue}>{license.maxBranches}</Text>
              </View>

              <View style={styles.detailRow}>
                <KurdishText style={styles.detailLabel}>کەسی پەیوەندی:</KurdishText>
                <Text style={styles.detailValue}>{license.contactPerson}</Text>
              </View>

              <View style={styles.detailRow}>
                <KurdishText style={styles.detailLabel}>ژمارەی مۆبایل:</KurdishText>
                <Text style={styles.detailValue}>{license.contactPhone}</Text>
              </View>

              {license.city && (
                <View style={styles.detailRow}>
                  <KurdishText style={styles.detailLabel}>شار:</KurdishText>
                  <Text style={styles.detailValue}>{license.city}</Text>
                </View>
              )}

              {license.expiresAt && (
                <View style={styles.detailRow}>
                  <KurdishText style={styles.detailLabel}>بەسەردەچێت:</KurdishText>
                  <Text style={styles.detailValue}>
                    {new Date(license.expiresAt).toLocaleDateString('en-GB')}
                  </Text>
                </View>
              )}

              <View style={styles.detailRow}>
                <KurdishText style={styles.detailLabel}>ژمارەی چالاککردن:</KurdishText>
                <Text style={styles.detailValue}>{license.activationCount}</Text>
              </View>
            </View>

            {isOwner && (
              <View style={styles.licenseActions}>
                {license.status === 'active' && (
                  <>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.suspendButton]}
                      onPress={() => handleUpdateStatus(license.id, 'suspended')}
                    >
                      <KurdishText style={styles.actionButtonText}>ڕاگرتن</KurdishText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deactivateButton]}
                      onPress={() => handleDeactivate(license.id)}
                    >
                      <KurdishText style={styles.actionButtonText}>ناچالاککردن</KurdishText>
                    </TouchableOpacity>
                  </>
                )}

                {license.status === 'suspended' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.activateButton]}
                    onPress={() => handleUpdateStatus(license.id, 'active')}
                  >
                    <KurdishText style={styles.actionButtonText}>چالاککردن</KurdishText>
                  </TouchableOpacity>
                )}

                {(license.status === 'active' || license.status === 'trial' || license.status === 'expired') && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.renewButton]}
                    onPress={() => handleRenewLicense(license.id, license.type === 'yearly' ? 12 : 1)}
                  >
                    <KurdishText style={styles.actionButtonText}>نوێکردنەوە</KurdishText>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {isAdmin && (
              <View style={styles.adminInfoBox}>
                <AlertTriangle size={16} color="#f59e0b" />
                <KurdishText style={styles.adminInfoText}>
                  بۆ گۆڕانکاری لە لایسێنس، پەیوەندی بکە بە دابینکەر
                </KurdishText>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalScrollView} contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <KurdishText style={styles.modalTitle}>دروستکردنی لایسەنسی نوێ</KurdishText>

              <View style={styles.inputGroup}>
                <KurdishText style={styles.inputLabel}>ناوی کڕیار *</KurdishText>
                <TextInput
                  style={styles.input}
                  value={newLicense.clientName}
                  onChangeText={(text) => setNewLicense({ ...newLicense, clientName: text })}
                  placeholder="ناوی کڕیار بنووسە..."
                />
              </View>

              <View style={styles.inputGroup}>
                <KurdishText style={styles.inputLabel}>ناوی بازرگانی *</KurdishText>
                <TextInput
                  style={styles.input}
                  value={newLicense.businessName}
                  onChangeText={(text) => setNewLicense({ ...newLicense, businessName: text })}
                  placeholder="ناوی بازرگانی بنووسە..."
                />
              </View>

              <View style={styles.inputGroup}>
                <KurdishText style={styles.inputLabel}>جۆری بازرگانی</KurdishText>
                <View style={styles.typeButtons}>
                  {(['supermarket', 'grocery', 'retail', 'wholesale', 'other'] as BusinessType[]).map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeButton,
                        newLicense.businessType === type && styles.typeButtonActive,
                      ]}
                      onPress={() => setNewLicense({ ...newLicense, businessType: type })}
                    >
                      <KurdishText
                        style={[
                          styles.typeButtonText,
                          newLicense.businessType === type && styles.typeButtonTextActive,
                        ]}
                      >
                        {getBusinessTypeText(type)}
                      </KurdishText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <KurdishText style={styles.inputLabel}>جۆری لایسەنس</KurdishText>
                <View style={styles.typeButtons}>
                  {(['trial', 'monthly', 'yearly', 'lifetime'] as LicenseType[]).map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeButton,
                        newLicense.type === type && styles.typeButtonActive,
                      ]}
                      onPress={() => setNewLicense({ ...newLicense, type })}
                    >
                      <KurdishText
                        style={[
                          styles.typeButtonText,
                          newLicense.type === type && styles.typeButtonTextActive,
                        ]}
                      >
                        {getTypeText(type)}
                      </KurdishText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <KurdishText style={styles.inputLabel}>ژمارەی بەکارهێنەران</KurdishText>
                <TextInput
                  style={styles.input}
                  value={String(newLicense.maxUsers)}
                  onChangeText={(text) =>
                    setNewLicense({ ...newLicense, maxUsers: parseInt(text) || 0 })
                  }
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <KurdishText style={styles.inputLabel}>ژمارەی کڕیاران</KurdishText>
                <TextInput
                  style={styles.input}
                  value={String(newLicense.maxCustomers)}
                  onChangeText={(text) =>
                    setNewLicense({ ...newLicense, maxCustomers: parseInt(text) || 0 })
                  }
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <KurdishText style={styles.inputLabel}>ژمارەی لقەکان</KurdishText>
                <TextInput
                  style={styles.input}
                  value={String(newLicense.maxBranches)}
                  onChangeText={(text) =>
                    setNewLicense({ ...newLicense, maxBranches: parseInt(text) || 1 })
                  }
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <KurdishText style={styles.inputLabel}>کەسی پەیوەندی *</KurdishText>
                <TextInput
                  style={styles.input}
                  value={newLicense.contactPerson}
                  onChangeText={(text) => setNewLicense({ ...newLicense, contactPerson: text })}
                  placeholder="ناوی کەسی پەیوەندی..."
                />
              </View>

              <View style={styles.inputGroup}>
                <KurdishText style={styles.inputLabel}>ژمارەی مۆبایل *</KurdishText>
                <TextInput
                  style={styles.input}
                  value={newLicense.contactPhone}
                  onChangeText={(text) => setNewLicense({ ...newLicense, contactPhone: text })}
                  placeholder="07XX XXX XXXX"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <KurdishText style={styles.inputLabel}>ئیمەیڵ</KurdishText>
                <TextInput
                  style={styles.input}
                  value={newLicense.contactEmail}
                  onChangeText={(text) => setNewLicense({ ...newLicense, contactEmail: text })}
                  placeholder="example@email.com"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputGroup}>
                <KurdishText style={styles.inputLabel}>ناونیشان</KurdishText>
                <TextInput
                  style={styles.input}
                  value={newLicense.address}
                  onChangeText={(text) => setNewLicense({ ...newLicense, address: text })}
                  placeholder="ناونیشانی بازرگانی..."
                />
              </View>

              <View style={styles.inputGroup}>
                <KurdishText style={styles.inputLabel}>شار</KurdishText>
                <TextInput
                  style={styles.input}
                  value={newLicense.city}
                  onChangeText={(text) => setNewLicense({ ...newLicense, city: text })}
                  placeholder="ناوی شار..."
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowCreateModal(false)}
                >
                  <KurdishText style={styles.cancelButtonText}>پاشگەزبوونەوە</KurdishText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.createButton]}
                  onPress={handleCreateLicense}
                  disabled={createLicenseMutation.isPending}
                >
                  {createLicenseMutation.isPending ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <KurdishText style={styles.createButtonText}>دروستکردن</KurdishText>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  refreshButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  businessTypeStats: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  businessTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  businessTypeStat: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    gap: 4,
  },
  businessTypeLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  businessTypeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  licenseCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  licenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  licenseInfo: {
    flex: 1,
  },
  businessNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  businessName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  clientName: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  licenseKey: {
    fontSize: 12,
    color: '#9ca3af',
    fontFamily: 'monospace',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
  },
  licenseDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  licenseActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  suspendButton: {
    backgroundColor: '#f59e0b',
  },
  activateButton: {
    backgroundColor: '#10b981',
  },
  renewButton: {
    backgroundColor: '#3b82f6',
  },
  deactivateButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 16,
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    minWidth: '30%',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  typeButtonText: {
    fontSize: 12,
    color: '#6b7280',
  },
  typeButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
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
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#3b82f6',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  noAccessContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  noAccessTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  noAccessText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  readOnlyBadge: {
    flex: 1,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  readOnlyText: {
    color: '#92400e',
    fontSize: 14,
    fontWeight: '600',
  },
  adminInfoBox: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  adminInfoText: {
    flex: 1,
    fontSize: 13,
    color: '#92400e',
    lineHeight: 18,
  },
});
