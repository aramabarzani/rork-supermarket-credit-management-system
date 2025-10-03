import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  Modal,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import {
  Store,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  User,
  FileText,
  AlertCircle,
  MessageCircle,
  Trash2,
} from 'lucide-react-native';
import { useStoreRequests } from '@/hooks/store-request-context';
import { useTenant } from '@/hooks/tenant-context';
import { useNotifications } from '@/hooks/notification-context';
import { useAuth } from '@/hooks/auth-context';
import { useUsers } from '@/hooks/users-context';
import { SUBSCRIPTION_PLANS } from '@/types/subscription';
import { StoreRequest } from '@/types/store-request';

export default function StoreRequestsScreen() {
  const { requests, isLoading, approveRequest, rejectRequest, deleteRequest } = useStoreRequests();
  const { createTenant, deleteTenant } = useTenant();
  const { addNotification } = useNotifications();
  const { user } = useAuth();
  const { addUser } = useUsers();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<StoreRequest | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const filteredRequests = useMemo(() => {
    let filtered = requests;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(r => r.status === filterStatus);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.storeName.toLowerCase().includes(query) ||
        r.storeNameKurdish.toLowerCase().includes(query) ||
        r.ownerName.toLowerCase().includes(query) ||
        r.ownerPhone.includes(query) ||
        r.city.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [requests, searchQuery, filterStatus]);

  const stats = useMemo(() => {
    return {
      total: requests.length,
      pending: requests.filter(r => r.status === 'pending').length,
      approved: requests.filter(r => r.status === 'approved').length,
      rejected: requests.filter(r => r.status === 'rejected').length,
    };
  }, [requests]);

  const handleApprove = async (request: StoreRequest) => {
    Alert.alert(
      'پەسەندکردنی داواکاری',
      `دڵنیایت لە پەسەندکردنی داواکاری ${request.storeNameKurdish}؟`,
      [
        { text: 'پاشگەزبوونەوە', style: 'cancel' },
        {
          text: 'پەسەندکردن',
          onPress: async () => {
            try {
              const plan = SUBSCRIPTION_PLANS[request.plan];
              const duration = plan.duration === -1 ? 365 : plan.duration;

              const newTenant = await createTenant({
                adminId: request.ownerPhone,
                adminName: request.ownerName,
                adminPhone: request.ownerPhone,
                adminEmail: request.ownerEmail,
                storeName: request.storeName,
                storeNameKurdish: request.storeNameKurdish,
                ownerName: request.ownerName,
                ownerPhone: request.ownerPhone,
                ownerEmail: request.ownerEmail,
                address: request.address,
                city: request.city,
                plan: request.plan,
                status: 'active',
                startDate: new Date().toISOString(),
                expiryDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString(),
              });

              console.log('[Store Requests] Tenant created:', {
                tenantId: newTenant.id,
                storeName: request.storeNameKurdish,
              });

              let newUser;
              try {
                newUser = await addUser({
                  name: request.ownerName,
                  phone: request.ownerPhone,
                  email: request.ownerEmail,
                  role: 'admin',
                  password: request.ownerPassword,
                  tenantId: newTenant.id,
                  storeName: request.storeName,
                  storeNameKurdish: request.storeNameKurdish,
                });
              } catch (userError: any) {
                console.error('[Store Requests] Failed to create admin user:', userError);
                Alert.alert('هەڵە', userError?.message || 'کێشەیەک ڕوویدا لە دروستکردنی هەژماری بەڕێوەبەر');
                return;
              }

              if (!newUser) {
                console.error('[Store Requests] Failed to create admin user - returned null');
                Alert.alert('هەڵە', 'کێشەیەک ڕوویدا لە دروستکردنی هەژماری بەڕێوەبەر');
                return;
              }

              console.log('[Store Requests] Admin user created:', {
                userId: newUser.id,
                phone: newUser.phone,
                role: newUser.role,
                tenantId: newUser.tenantId,
              });

              await approveRequest(request.id, user?.name || 'Admin', approvalNotes);

              console.log('[Store Requests] Request approved and tenant linked:', {
                requestId: request.id,
                tenantId: newTenant.id,
                adminUserId: newUser.id,
                note: 'Old request credentials are now invalid. User must login with new tenant-specific account.',
              });

              await addNotification({
                title: 'داواکاریەکەت پەسەندکرا - هەژماری نوێ دروستکرا',
                titleKurdish: 'داواکاریەکەت پەسەندکرا - هەژماری نوێ دروستکرا',
                message: `پیرۆزە! داواکاریەکەت بۆ ${request.storeNameKurdish} پەسەندکرا.\n\n🔐 زانیاری چوونەژوورەوە:\nژمارەی مۆبایل: ${request.ownerPhone}\nوشەی نهێنی: ${request.ownerPassword}\n\n⚠️ گرنگ: ئەمە هەژمارێکی نوێیە کە تایبەتە بە فرۆشگاکەت. داتای تۆ بە تەواوی جیاوازە لە هەژمارەکانی تر.\n\nتکایە وشەی نهێنیەکەت بگۆڕە دوای یەکەم جار چوونەژوورەوە.`,
                messageKurdish: `پیرۆزە! داواکاریەکەت بۆ ${request.storeNameKurdish} پەسەندکرا.\n\n🔐 زانیاری چوونەژوورەوە:\nژمارەی مۆبایل: ${request.ownerPhone}\nوشەی نهێنی: ${request.ownerPassword}\n\n⚠️ گرنگ: ئەمە هەژمارێکی نوێیە کە تایبەتە بە فرۆشگاکەت. داتای تۆ بە تەواوی جیاوازە لە هەژمارەکانی تر.\n\nتکایە وشەی نهێنیەکەت بگۆڕە دوای یەکەم جار چوونەژوورەوە.`,
                type: 'store_request_approved',
                priority: 'high',
                recipientId: request.ownerPhone,
                recipientType: 'admin',
                isRead: false,
                channels: ['in_app', 'sms'],
                metadata: {
                  requestId: request.id,
                  tenantId: newTenant.id,
                  storeName: request.storeName,
                  plan: request.plan,
                  loginPhone: request.ownerPhone,
                  temporaryPassword: request.ownerPassword,
                  mustChangePassword: true,
                },
              });

              Alert.alert('سەرکەوتوو', 'داواکاریەکە پەسەندکرا و فرۆشگاکە دروستکرا');
              setApprovalNotes('');
            } catch (error) {
              console.error('Approval error:', error);
              Alert.alert('هەڵە', 'کێشەیەک ڕوویدا لە پەسەندکردنی داواکاریەکە');
            }
          },
        },
      ]
    );
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    if (!rejectionReason.trim()) {
      Alert.alert('هەڵە', 'تکایە هۆکاری ڕەتکردنەوە بنووسە');
      return;
    }

    try {
      await rejectRequest(selectedRequest.id, user?.name || 'Admin', rejectionReason);

      await addNotification({
        title: 'داواکاریەکەت ڕەتکرایەوە',
        titleKurdish: 'داواکاریەکەت ڕەتکرایەوە',
        message: `داواکاریەکەت بۆ ${selectedRequest.storeNameKurdish} ڕەتکرایەوە. هۆکار: ${rejectionReason}`,
        messageKurdish: `داواکاریەکەت بۆ ${selectedRequest.storeNameKurdish} ڕەتکرایەوە. هۆکار: ${rejectionReason}`,
        type: 'store_request_rejected',
        priority: 'high',
        recipientId: selectedRequest.ownerPhone,
        recipientType: 'admin',
        isRead: false,
        channels: ['in_app', 'sms'],
        metadata: {
          requestId: selectedRequest.id,
          storeName: selectedRequest.storeName,
          rejectionReason,
        },
      });

      Alert.alert('سەرکەوتوو', 'داواکاریەکە ڕەتکرایەوە');
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Rejection error:', error);
      Alert.alert('هەڵە', 'کێشەیەک ڕوویدا لە ڕەتکردنەوەی داواکاریەکە');
    }
  };

  const handleDeleteAccount = async (request: StoreRequest) => {
    Alert.alert(
      'سڕینەوەی هەژمار',
      `دڵنیایت لە سڕینەوەی هەژماری ${request.storeNameKurdish}?\n\n⚠️ ئاگاداری: ئەم کردارە ناگەڕێتەوە و هەموو زانیاریەکانی پەیوەست بە ئەم هەژمارە دەسڕێتەوە.`,
      [
        { text: 'پاشگەزبوونەوە', style: 'cancel' },
        {
          text: 'سڕینەوە',
          style: 'destructive',
          onPress: async () => {
            try {
              if (request.tenantId) {
                await deleteTenant(request.tenantId);
              }
              
              await deleteRequest(request.id);

              await addNotification({
                title: 'هەژمارەکەت سڕایەوە',
                titleKurdish: 'هەژمارەکەت سڕایەوە',
                message: `هەژماری ${request.storeNameKurdish} بە سەرکەوتوویی سڕایەوە لەلایەن بەڕێوەبەرەوە.`,
                messageKurdish: `هەژماری ${request.storeNameKurdish} بە سەرکەوتوویی سڕایەوە لەلایەن بەڕێوەبەرەوە.`,
                type: 'store_deleted',
                priority: 'high',
                recipientId: request.ownerPhone,
                recipientType: 'admin',
                isRead: false,
                channels: ['in_app', 'sms'],
                metadata: {
                  requestId: request.id,
                  storeName: request.storeName,
                },
              });

              Alert.alert('سەرکەوتوو', 'هەژمارەکە بە سەرکەوتوویی سڕایەوە');
            } catch (error) {
              console.error('Delete account error:', error);
              Alert.alert('هەڵە', 'کێشەیەک ڕوویدا لە سڕینەوەی هەژمارەکە');
            }
          },
        },
      ]
    );
  };

  const handleWhatsAppContact = (phone: string, storeName: string) => {
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    const message = encodeURIComponent(
      `سڵاو، پەیوەندیم پێوە دەکەم دەربارەی داواکاری سیستەمی بەڕێوەبردنی قەرز بۆ ${storeName}. چۆنم یارمەتیت بدەم؟`
    );
    
    const webUrl = `https://wa.me/${cleanPhone}?text=${message}`;
    
    Linking.openURL(webUrl).catch((error) => {
      console.error('WhatsApp error:', error);
      Alert.alert(
        'هەڵە',
        'کێشەیەک ڕوویدا لە کردنەوەی وەتسئاپ. تکایە دڵنیابە لەوەی کە وەتسئاپ دامەزراوە لەسەر ئامێرەکەت.',
        [
          { text: 'باشە', style: 'cancel' },
          {
            text: 'کۆپی کردنی ژمارە',
            onPress: () => {
              Alert.alert('ژمارەی تەلەفۆن', cleanPhone);
            }
          }
        ]
      );
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'approved': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'approved': return CheckCircle;
      case 'rejected': return XCircle;
      default: return Store;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'چاوەڕوانە';
      case 'approved': return 'پەسەندکراوە';
      case 'rejected': return 'ڕەتکراوەتەوە';
      default: return status;
    }
  };

  const renderStatsCard = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Store size={24} color="#3b82f6" />
        <Text style={styles.statValue}>{stats.total}</Text>
        <Text style={styles.statLabel}>کۆی گشتی</Text>
      </View>
      <View style={styles.statCard}>
        <Clock size={24} color="#f59e0b" />
        <Text style={styles.statValue}>{stats.pending}</Text>
        <Text style={styles.statLabel}>چاوەڕوانە</Text>
      </View>
      <View style={styles.statCard}>
        <CheckCircle size={24} color="#10b981" />
        <Text style={styles.statValue}>{stats.approved}</Text>
        <Text style={styles.statLabel}>پەسەندکراوە</Text>
      </View>
      <View style={styles.statCard}>
        <XCircle size={24} color="#ef4444" />
        <Text style={styles.statValue}>{stats.rejected}</Text>
        <Text style={styles.statLabel}>ڕەتکراوەتەوە</Text>
      </View>
    </View>
  );

  const renderFilterButtons = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filterScroll}
      contentContainerStyle={styles.filterContainer}
    >
      {[
        { key: 'all', label: 'هەموو', count: stats.total },
        { key: 'pending', label: 'چاوەڕوانە', count: stats.pending },
        { key: 'approved', label: 'پەسەندکراوە', count: stats.approved },
        { key: 'rejected', label: 'ڕەتکراوەتەوە', count: stats.rejected },
      ].map((filter) => (
        <TouchableOpacity
          key={filter.key}
          style={[
            styles.filterButton,
            filterStatus === filter.key && styles.filterButtonActive,
          ]}
          onPress={() => setFilterStatus(filter.key as any)}
        >
          <Text
            style={[
              styles.filterButtonText,
              filterStatus === filter.key && styles.filterButtonTextActive,
            ]}
          >
            {filter.label} ({filter.count})
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderRequestCard = (request: StoreRequest) => {
    const StatusIcon = getStatusIcon(request.status);
    const plan = SUBSCRIPTION_PLANS[request.plan];

    return (
      <View key={request.id} style={styles.requestCard}>
        <View style={styles.requestHeader}>
          <View style={styles.requestInfo}>
            <View style={styles.requestNameRow}>
              <Store size={20} color="#1f2937" />
              <Text style={styles.requestName}>{request.storeNameKurdish}</Text>
            </View>
            <Text style={styles.requestNameEn}>{request.storeName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) + '20' }]}>
            <StatusIcon size={16} color={getStatusColor(request.status)} />
            <Text style={[styles.statusText, { color: getStatusColor(request.status) }]}>
              {getStatusText(request.status)}
            </Text>
          </View>
        </View>

        <View style={styles.requestDetails}>
          <View style={styles.detailRow}>
            <User size={16} color="#6b7280" />
            <Text style={styles.detailText}>{request.ownerName}</Text>
          </View>
          <View style={styles.detailRowWithAction}>
            <View style={styles.detailRow}>
              <Phone size={16} color="#6b7280" />
              <Text style={styles.detailText}>{request.ownerPhone}</Text>
            </View>
            <TouchableOpacity
              style={styles.whatsappButton}
              onPress={() => handleWhatsAppContact(request.ownerPhone, request.storeNameKurdish)}
            >
              <MessageCircle size={16} color="#25D366" />
              <Text style={styles.whatsappButtonText}>وەتسئاپ</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.detailRow}>
            <MapPin size={16} color="#6b7280" />
            <Text style={styles.detailText}>{request.city} - {request.address}</Text>
          </View>
          <View style={styles.detailRow}>
            <CreditCard size={16} color="#6b7280" />
            <Text style={styles.detailText}>{plan.nameKurdish}</Text>
          </View>
          <View style={styles.detailRow}>
            <Calendar size={16} color="#6b7280" />
            <Text style={styles.detailText}>
              {new Date(request.createdAt).toLocaleDateString('ku')}
            </Text>
          </View>
          {request.reviewedAt && (
            <View style={styles.detailRow}>
              <FileText size={16} color="#6b7280" />
              <Text style={styles.detailText}>
                پێداچوونەوە: {new Date(request.reviewedAt).toLocaleDateString('ku')}
              </Text>
            </View>
          )}
          {request.rejectionReason && (
            <View style={styles.rejectionBox}>
              <AlertCircle size={16} color="#ef4444" />
              <Text style={styles.rejectionText}>{request.rejectionReason}</Text>
            </View>
          )}
          {request.notes && (
            <View style={styles.notesBox}>
              <FileText size={16} color="#3b82f6" />
              <Text style={styles.notesText}>{request.notes}</Text>
            </View>
          )}
        </View>

        {request.status === 'pending' && (
          <View style={styles.requestActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => handleApprove(request)}
            >
              <CheckCircle size={18} color="#fff" />
              <Text style={styles.actionButtonText}>پەسەندکردن</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => {
                setSelectedRequest(request);
                setShowRejectModal(true);
              }}
            >
              <XCircle size={18} color="#fff" />
              <Text style={styles.actionButtonText}>ڕەتکردنەوە</Text>
            </TouchableOpacity>
          </View>
        )}
        {request.status === 'approved' && (
          <View style={styles.requestActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteAccount(request)}
            >
              <Trash2 size={18} color="#fff" />
              <Text style={styles.actionButtonText}>سڕینەوەی هەژمار</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderRejectModal = () => (
    <Modal
      visible={showRejectModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowRejectModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>ڕەتکردنەوەی داواکاری</Text>
          <Text style={styles.modalSubtitle}>
            {selectedRequest?.storeNameKurdish}
          </Text>

          <TextInput
            style={styles.modalInput}
            placeholder="هۆکاری ڕەتکردنەوە بنووسە..."
            value={rejectionReason}
            onChangeText={setRejectionReason}
            multiline
            numberOfLines={4}
            textAlign="right"
            textAlignVertical="top"
          />

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={() => {
                setShowRejectModal(false);
                setSelectedRequest(null);
                setRejectionReason('');
              }}
            >
              <Text style={styles.modalCancelButtonText}>پاشگەزبوونەوە</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalConfirmButton]}
              onPress={handleReject}
            >
              <Text style={styles.modalConfirmButtonText}>ڕەتکردنەوە</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'داواکاریەکانی فرۆشگا',
          headerBackTitle: 'گەڕانەوە',
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderStatsCard()}

        <View style={styles.searchContainer}>
          <Search size={20} color="#6b7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="گەڕان بە ناو، ژمارە، شار..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign="right"
          />
        </View>

        {renderFilterButtons()}

        <View style={styles.requestsContainer}>
          {isLoading ? (
            <Text style={styles.emptyText}>چاوەڕوان بە...</Text>
          ) : filteredRequests.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Store size={64} color="#d1d5db" />
              <Text style={styles.emptyText}>هیچ داواکاریەک نەدۆزرایەوە</Text>
            </View>
          ) : (
            filteredRequests.map(renderRequestCard)
          )}
        </View>
      </ScrollView>

      {renderRejectModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginLeft: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#1f2937',
  },
  filterScroll: {
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  requestsContainer: {
    gap: 16,
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  requestInfo: {
    flex: 1,
  },
  requestNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  requestName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  requestNameEn: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 28,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  requestDetails: {
    gap: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailRowWithAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailText: {
    fontSize: 14,
    color: '#4b5563',
  },
  whatsappButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#25D366',
  },
  whatsappButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#25D366',
  },
  rejectionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  rejectionText: {
    flex: 1,
    fontSize: 14,
    color: '#dc2626',
    lineHeight: 20,
  },
  notesBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  notesText: {
    flex: 1,
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  approveButton: {
    backgroundColor: '#10b981',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  deleteButton: {
    backgroundColor: '#dc2626',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 16,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 20,
    minHeight: 100,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#e5e7eb',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  modalConfirmButton: {
    backgroundColor: '#ef4444',
  },
  modalConfirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
