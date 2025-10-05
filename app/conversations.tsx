import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageCircle, Search, User, Clock } from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { useMessaging } from '@/hooks/messaging-context';
import { useAuth } from '@/hooks/auth-context';

export default function ConversationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const messaging = useMessaging();
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    loadConversations();
    const interval = setInterval(() => loadConversations(), 3000);
    return () => clearInterval(interval);
  }, [messaging]);

  const loadConversations = () => {
    if (!messaging) return;
    const userConversations = messaging.getUserConversations();
    setConversations(userConversations);
  };

  const handleOpenChat = (conversation: any) => {
    const otherParticipant = conversation.participants.find(
      (p: any) => p.userId !== user?.id
    );

    if (!otherParticipant) return;

    router.push({
      pathname: '/chat',
      params: {
        recipientId: otherParticipant.userId,
        recipientName: otherParticipant.userName,
        recipientRole: otherParticipant.userRole,
      },
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } else if (diffInHours < 48) {
      return 'دوێنێ';
    } else {
      return date.toLocaleDateString('ckb-IQ');
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const otherParticipant = conv.participants.find(
      (p: any) => p.userId !== user?.id
    );
    return otherParticipant?.userName.includes(searchQuery);
  });

  if (!messaging) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Stack.Screen
          options={{
            title: 'گفتوگۆکان',
            headerStyle: { backgroundColor: '#4F46E5' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'گفتوگۆکان',
          headerStyle: { backgroundColor: '#4F46E5' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />

      <View style={styles.searchContainer}>
        <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="گەڕان لە گفتوگۆکان..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <ScrollView style={styles.conversationsList}>
        {filteredConversations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MessageCircle size={64} color="#D1D5DB" />
            <KurdishText style={styles.emptyText}>
              هیچ گفتوگۆیەک نییە
            </KurdishText>
          </View>
        ) : (
          filteredConversations.map((conversation) => {
            const otherParticipant = conversation.participants.find(
              (p: any) => p.userId !== user?.id
            );

            if (!otherParticipant) return null;

            return (
              <TouchableOpacity
                key={conversation.id}
                style={[
                  styles.conversationCard,
                  conversation.unreadCount > 0 && styles.unreadConversation,
                ]}
                onPress={() => handleOpenChat(conversation)}
              >
                <View style={styles.avatarContainer}>
                  <User size={24} color="#4F46E5" />
                  {conversation.unreadCount > 0 && (
                    <View style={styles.unreadDot} />
                  )}
                </View>

                <View style={styles.conversationInfo}>
                  <View style={styles.conversationHeader}>
                    <KurdishText style={styles.participantName}>
                      {otherParticipant.userName}
                    </KurdishText>
                    <KurdishText style={styles.conversationTime}>
                      {formatTime(conversation.updatedAt)}
                    </KurdishText>
                  </View>

                  <View style={styles.conversationFooter}>
                    <KurdishText
                      style={styles.lastMessage}
                      numberOfLines={1}
                    >
                      {conversation.lastMessage?.content || 'هیچ پەیامێک نییە'}
                    </KurdishText>
                    {conversation.unreadCount > 0 && (
                      <View style={styles.unreadBadge}>
                        <KurdishText style={styles.unreadCount}>
                          {conversation.unreadCount}
                        </KurdishText>
                      </View>
                    )}
                  </View>

                  <View style={styles.roleContainer}>
                    <KurdishText style={styles.roleText}>
                      {otherParticipant.userRole === 'admin'
                        ? 'بەڕێوەبەر'
                        : otherParticipant.userRole === 'employee'
                        ? 'کارمەند'
                        : 'کڕیار'}
                    </KurdishText>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  conversationsList: {
    flex: 1,
    paddingHorizontal: 16,
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
  conversationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 12,
  },
  unreadConversation: {
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5',
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  conversationTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleText: {
    fontSize: 12,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
});
