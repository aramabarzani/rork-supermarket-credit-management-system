import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Mail, Send, Calendar, CheckCircle, Clock, X } from 'lucide-react-native';

import { KurdishText } from '@/components/KurdishText';
import type { Newsletter } from '@/types/guidance';

export default function NewsletterManagementScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'all' | 'draft' | 'scheduled' | 'sent'>('all');

  const [showSendModal, setShowSendModal] = useState<boolean>(false);
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);

  const newslettersQuery = { isLoading: false, data: [], refetch: () => {} };

  const sendMutation = { mutate: () => {
    newslettersQuery.refetch();
    setShowSendModal(false);
    setSelectedNewsletter(null);
    Alert.alert('سەرکەوتوو', 'هەواڵنامە بە سەرکەوتوویی نێردرا');
  } };

  const deleteMutation = { mutate: () => {
    newslettersQuery.refetch();
    Alert.alert('سەرکەوتوو', 'هەواڵنامە سڕایەوە');
  } };

  const handleSend = (newsletter: Newsletter) => {
    setSelectedNewsletter(newsletter);
    setShowSendModal(true);
  };

  const confirmSend = (channels: ('email' | 'whatsapp' | 'telegram' | 'viber')[]) => {
    if (selectedNewsletter) {
      sendMutation.mutate({
        id: selectedNewsletter.id,
        channels,
      });
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'سڕینەوە',
      'دڵنیایت لە سڕینەوەی ئەم هەواڵنامەیە؟',
      [
        { text: 'هەڵوەشاندنەوە', style: 'cancel' },
        {
          text: 'سڕینەوە',
          style: 'destructive',
          onPress: () => deleteMutation.mutate({ id }),
        },
      ]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Clock size={16} color="#F59E0B" />;
      case 'scheduled':
        return <Calendar size={16} color="#3B82F6" />;
      case 'sent':
        return <CheckCircle size={16} color="#10B981" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return 'ڕەشنووس';
      case 'scheduled':
        return 'کاتی دیاریکراو';
      case 'sent':
        return 'نێردراوە';
      default:
        return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'update':
        return 'نوێکردنەوە';
      case 'announcement':
        return 'ڕاگەیاندن';
      case 'monthly':
        return 'مانگانە';
      case 'vip':
        return 'VIP';
      default:
        return type;
    }
  };

  if (newslettersQuery.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ title: 'بەڕێوەبردنی هەواڵنامە' }} />
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <Stack.Screen
        options={{
          title: 'بەڕێوەبردنی هەواڵنامە',
          headerStyle: { backgroundColor: '#3B82F6' },
          headerTintColor: '#FFFFFF',
        }}
      />

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            هەموو
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'draft' && styles.activeTab]}
          onPress={() => setActiveTab('draft')}
        >
          <Text style={[styles.tabText, activeTab === 'draft' && styles.activeTabText]}>
            ڕەشنووس
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'scheduled' && styles.activeTab]}
          onPress={() => setActiveTab('scheduled')}
        >
          <Text style={[styles.tabText, activeTab === 'scheduled' && styles.activeTabText]}>
            کاتی دیاریکراو
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'sent' && styles.activeTab]}
          onPress={() => setActiveTab('sent')}
        >
          <Text style={[styles.tabText, activeTab === 'sent' && styles.activeTabText]}>
            نێردراوە
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          {newslettersQuery.data?.map((newsletter) => (
            <View key={newsletter.id} style={styles.newsletterCard}>
              <View style={styles.newsletterHeader}>
                <View style={styles.newsletterTitleRow}>
                  <KurdishText style={styles.newsletterTitle}>{newsletter.titleKu}</KurdishText>
                  <View style={styles.statusBadge}>
                    {getStatusIcon(newsletter.status)}
                    <Text style={styles.statusText}>{getStatusText(newsletter.status)}</Text>
                  </View>
                </View>
                <View style={styles.newsletterMeta}>
                  <Text style={styles.typeText}>{getTypeText(newsletter.type)}</Text>
                  {newsletter.vipOnly && (
                    <View style={styles.vipBadge}>
                      <Text style={styles.vipText}>VIP</Text>
                    </View>
                  )}
                </View>
              </View>

              <KurdishText style={styles.newsletterContent} numberOfLines={3}>
                {newsletter.contentKu}
              </KurdishText>

              <View style={styles.newsletterActions}>
                {newsletter.status !== 'sent' && (
                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={() => handleSend(newsletter)}
                  >
                    <Send size={16} color="#FFFFFF" />
                    <Text style={styles.sendButtonText}>ناردن</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(newsletter.id)}
                >
                  <X size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {newslettersQuery.data?.length === 0 && (
            <View style={styles.emptyState}>
              <Mail size={48} color="#D1D5DB" />
              <KurdishText style={styles.emptyText}>هیچ هەواڵنامەیەک نییە</KurdishText>
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => Alert.alert('دروستکردنی هەواڵنامە', 'ئەم تایبەتمەندییە بەم زووانە دێت')}
      >
        <Mail size={20} color="#FFFFFF" />
        <Text style={styles.createButtonText}>دروستکردنی هەواڵنامەی نوێ</Text>
      </TouchableOpacity>

      <Modal
        visible={showSendModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSendModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <KurdishText style={styles.modalTitle}>هەڵبژاردنی کەناڵەکانی ناردن</KurdishText>

            <TouchableOpacity
              style={styles.channelButton}
              onPress={() => confirmSend(['email'])}
            >
              <Text style={styles.channelButtonText}>ئیمەیڵ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.channelButton}
              onPress={() => confirmSend(['whatsapp'])}
            >
              <Text style={styles.channelButtonText}>واتساپ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.channelButton}
              onPress={() => confirmSend(['telegram'])}
            >
              <Text style={styles.channelButtonText}>تلگرام</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.channelButton}
              onPress={() => confirmSend(['email', 'whatsapp', 'telegram'])}
            >
              <Text style={styles.channelButtonText}>هەموو کەناڵەکان</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowSendModal(false)}
            >
              <Text style={styles.cancelButtonText}>هەڵوەشاندنەوە</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#6B7280',
  },
  activeTabText: {
    color: '#3B82F6',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  newsletterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  newsletterHeader: {
    marginBottom: 12,
  },
  newsletterTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  newsletterTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  statusText: {
    fontSize: 12,
    color: '#6B7280',
  },
  newsletterMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  typeText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500' as const,
  },
  vipBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  vipText: {
    fontSize: 10,
    color: '#F59E0B',
    fontWeight: '700' as const,
  },
  newsletterContent: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  newsletterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  channelButton: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  channelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
});
