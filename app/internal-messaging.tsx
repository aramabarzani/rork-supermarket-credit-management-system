import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageCircle, Send, Mail, MailOpen, Trash2, Share2, Filter, Plus, Users } from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { useMessaging } from '@/hooks/messaging-context';
import { useAuth } from '@/hooks/auth-context';

type TabType = 'inbox' | 'sent';
type ShareMethod = 'email' | 'whatsapp' | 'telegram' | 'viber' | 'sms';

export default function InternalMessagingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const messaging = useMessaging();
  const [activeTab, setActiveTab] = useState<TabType>('inbox');
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);

  const [newMessage, setNewMessage] = useState({
    recipientId: '',
    recipientName: '',
    recipientRole: 'employee' as 'admin' | 'employee' | 'customer',
    subject: '',
    content: '',
  });

  if (!messaging) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Stack.Screen
          options={{
            title: 'پەیامە ناوخۆییەکان',
            headerStyle: { backgroundColor: '#4F46E5' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <KurdishText style={styles.emptyText}>چاوەڕوان بە...</KurdishText>
        </View>
      </SafeAreaView>
    );
  }

  const handleSendMessage = async () => {
    if (!newMessage.recipientId || !newMessage.subject || !newMessage.content) {
      Alert.alert('هەڵە', 'تکایە هەموو خانەکان پڕ بکەرەوە');
      return;
    }

    if (!user) {
      Alert.alert('هەڵە', 'بەکارهێنەر نەدۆزرایەوە');
      return;
    }

    setIsSending(true);
    const result = await messaging.sendMessage({
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role as 'admin' | 'employee' | 'customer',
      recipientId: newMessage.recipientId,
      recipientName: newMessage.recipientName,
      recipientRole: newMessage.recipientRole,
      subject: newMessage.subject,
      content: newMessage.content,
    });
    setIsSending(false);

    if (result.success) {
      Alert.alert('سەرکەوتوو', 'پەیام بە سەرکەوتوویی نێردرا');
      setShowNewMessage(false);
      setNewMessage({
        recipientId: '',
        recipientName: '',
        recipientRole: 'employee',
        subject: '',
        content: '',
      });
    } else {
      Alert.alert('هەڵە', result.error || 'هەڵەیەک ڕوویدا');
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    await messaging.markAsRead(messageId);
  };

  const handleDelete = (messageId: string) => {
    Alert.alert('دڵنیابوونەوە', 'دڵنیایت لە سڕینەوەی ئەم پەیامە؟', [
      { text: 'نەخێر', style: 'cancel' },
      {
        text: 'بەڵێ',
        style: 'destructive',
        onPress: () => {
          Alert.alert('سەرکەوتوو', 'پەیام سڕایەوە');
        },
      },
    ]);
  };

  const handleShare = (method: ShareMethod) => {
    if (!selectedMessageId) return;
    Alert.alert('سەرکەوتوو', 'پەیام هاوبەش کرا');
    setShowShareModal(false);
  };

  const displayMessages = activeTab === 'inbox' ? messaging.getInboxMessages() : messaging.getSentMessages();

  const filteredMessages = displayMessages.filter((msg) => {
    const matchesSearch =
      msg.senderName.includes(searchQuery) ||
      msg.recipientName.includes(searchQuery) ||
      msg.subject.includes(searchQuery) ||
      msg.content.includes(searchQuery);

    return matchesSearch;
  });

  const stats = {
    totalMessages: messaging.messages.length,
    unreadMessages: messaging.getUnreadCount(),
    sentMessages: messaging.getSentMessages().length,
  };

  const handleOpenConversations = () => {
    router.push('/conversations');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'پەیامە ناوخۆییەکان',
          headerStyle: { backgroundColor: '#4F46E5' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />

      <TouchableOpacity 
        style={styles.conversationsButton}
        onPress={handleOpenConversations}
      >
        <Users size={24} color="#FFFFFF" />
        <KurdishText style={styles.conversationsButtonText}>گفتوگۆکان لەگەڵ کڕیاران</KurdishText>
        {messaging.getTotalUnreadConversations() > 0 && (
          <View style={styles.conversationsBadge}>
            <KurdishText style={styles.conversationsBadgeText}>
              {messaging.getTotalUnreadConversations()}
            </KurdishText>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Mail size={24} color="#4F46E5" />
          <KurdishText style={styles.statValue}>{stats?.totalMessages || 0}</KurdishText>
          <KurdishText style={styles.statLabel}>کۆی گشتی</KurdishText>
        </View>
        <View style={styles.statCard}>
          <MailOpen size={24} color="#10B981" />
          <KurdishText style={styles.statValue}>{stats?.unreadMessages || 0}</KurdishText>
          <KurdishText style={styles.statLabel}>نەخوێندراوە</KurdishText>
        </View>
        <View style={styles.statCard}>
          <Send size={24} color="#F59E0B" />
          <KurdishText style={styles.statValue}>{stats?.sentMessages || 0}</KurdishText>
          <KurdishText style={styles.statLabel}>نێردراو</KurdishText>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="گەڕان لە پەیامەکان..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'inbox' && styles.activeTab]}
          onPress={() => setActiveTab('inbox')}
        >
          <KurdishText style={[styles.tabText, activeTab === 'inbox' && styles.activeTabText]}>
            وەرگیراو
          </KurdishText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sent' && styles.activeTab]}
          onPress={() => setActiveTab('sent')}
        >
          <KurdishText style={[styles.tabText, activeTab === 'sent' && styles.activeTabText]}>
            نێردراو
          </KurdishText>
        </TouchableOpacity>
      </View>

      {messaging.isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : (
        <ScrollView style={styles.messagesList}>
          {filteredMessages?.map((message) => (
            <TouchableOpacity
              key={message.id}
              style={[styles.messageCard, !message.isRead && styles.unreadMessage]}
              onPress={() => !message.isRead && handleMarkAsRead(message.id)}
            >
              <View style={styles.messageHeader}>
                <View style={styles.messageInfo}>
                  <KurdishText style={styles.messageName}>
                    {activeTab === 'inbox' ? message.senderName : message.recipientName}
                  </KurdishText>
                  <KurdishText style={styles.messageRole}>
                    {message.senderRole === 'admin'
                      ? 'بەڕێوەبەر'
                      : message.senderRole === 'employee'
                      ? 'کارمەند'
                      : 'کڕیار'}
                  </KurdishText>
                </View>
                <View style={styles.messageActions}>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedMessageId(message.id);
                      setShowShareModal(true);
                    }}
                  >
                    <Share2 size={18} color="#6B7280" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(message.id)}>
                    <Trash2 size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>

              <KurdishText style={styles.messageSubject}>{message.subject}</KurdishText>
              <KurdishText style={styles.messageContent} numberOfLines={2}>
                {message.content}
              </KurdishText>

              <View style={styles.messageFooter}>
                <KurdishText style={styles.messageDate}>
                  {new Date(message.createdAt).toLocaleDateString('ar-IQ')}
                </KurdishText>
                {!message.isRead && activeTab === 'inbox' && (
                  <View style={styles.unreadBadge}>
                    <KurdishText style={styles.unreadBadgeText}>نوێ</KurdishText>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}

          {filteredMessages?.length === 0 && (
            <View style={styles.emptyContainer}>
              <MessageCircle size={64} color="#D1D5DB" />
              <KurdishText style={styles.emptyText}>هیچ پەیامێک نییە</KurdishText>
            </View>
          )}
        </ScrollView>
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setShowNewMessage(true)}>
        <Plus size={24} color="#fff" />
      </TouchableOpacity>

      <Modal visible={showNewMessage} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <KurdishText style={styles.modalTitle}>پەیامی نوێ</KurdishText>
              <TouchableOpacity onPress={() => setShowNewMessage(false)}>
                <KurdishText style={styles.modalClose}>×</KurdishText>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <KurdishText style={styles.label}>ناسنامەی وەرگر</KurdishText>
              <TextInput
                style={styles.input}
                value={newMessage.recipientId}
                onChangeText={(text) => setNewMessage({ ...newMessage, recipientId: text })}
                placeholder="ناسنامەی وەرگر"
                placeholderTextColor="#9CA3AF"
              />

              <KurdishText style={styles.label}>ناوی وەرگر</KurdishText>
              <TextInput
                style={styles.input}
                value={newMessage.recipientName}
                onChangeText={(text) => setNewMessage({ ...newMessage, recipientName: text })}
                placeholder="ناوی وەرگر"
                placeholderTextColor="#9CA3AF"
              />

              <KurdishText style={styles.label}>بابەت</KurdishText>
              <TextInput
                style={styles.input}
                value={newMessage.subject}
                onChangeText={(text) => setNewMessage({ ...newMessage, subject: text })}
                placeholder="بابەتی پەیام"
                placeholderTextColor="#9CA3AF"
              />

              <KurdishText style={styles.label}>ناوەڕۆک</KurdishText>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newMessage.content}
                onChangeText={(text) => setNewMessage({ ...newMessage, content: text })}
                placeholder="ناوەڕۆکی پەیام"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSendMessage}
                disabled={isSending}
              >
                {isSending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Send size={20} color="#fff" />
                    <KurdishText style={styles.sendButtonText}>ناردن</KurdishText>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showShareModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.shareModal}>
            <KurdishText style={styles.shareTitle}>هاوبەشکردن بە</KurdishText>

            <TouchableOpacity style={styles.shareOption} onPress={() => handleShare('email')}>
              <Mail size={24} color="#4F46E5" />
              <KurdishText style={styles.shareOptionText}>ئیمەیڵ</KurdishText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareOption} onPress={() => handleShare('whatsapp')}>
              <MessageCircle size={24} color="#25D366" />
              <KurdishText style={styles.shareOptionText}>واتساپ</KurdishText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareOption} onPress={() => handleShare('telegram')}>
              <Send size={24} color="#0088cc" />
              <KurdishText style={styles.shareOptionText}>تێلێگرام</KurdishText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.shareOption} onPress={() => handleShare('viber')}>
              <MessageCircle size={24} color="#7360F2" />
              <KurdishText style={styles.shareOptionText}>ڤایبەر</KurdishText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowShareModal(false)}
            >
              <KurdishText style={styles.cancelButtonText}>پاشگەزبوونەوە</KurdishText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
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
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeTab: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadMessage: {
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageInfo: {
    flex: 1,
  },
  messageName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  messageRole: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  messageActions: {
    flexDirection: 'row',
    gap: 12,
  },
  messageSubject: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  messageContent: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  messageDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  unreadBadge: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unreadBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  modalClose: {
    fontSize: 32,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  shareModal: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
  },
  shareTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  shareOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    marginBottom: 12,
    gap: 12,
  },
  shareOptionText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  conversationsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  conversationsButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  conversationsBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  conversationsBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
