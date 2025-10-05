import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, ArrowLeft, User } from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { useAuth } from '@/hooks/auth-context';
import { useMessaging } from '@/hooks/messaging-context';
import { useUsers } from '@/hooks/users-context';

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const { 
    getOrCreateConversation, 
    sendChatMessage, 
    getConversationMessages,
    markConversationAsRead,
  } = useMessaging();
  const { getUserById } = useUsers();

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [, setOtherUser] = useState<any>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const recipientId = params.recipientId as string;
  const recipientName = params.recipientName as string;
  const recipientRole = params.recipientRole as 'admin' | 'employee' | 'customer';

  useEffect(() => {
    initializeChat();
  }, [recipientId, recipientName, recipientRole]);

  useEffect(() => {
    if (conversationId) {
      loadMessages();
      const interval = setInterval(() => loadMessages(), 3000);
      return () => clearInterval(interval);
    }
  }, [conversationId, getConversationMessages]);

  const initializeChat = async () => {
    try {
      setIsLoading(true);
      const conversation = await getOrCreateConversation(
        recipientId,
        recipientName,
        recipientRole
      );
      setConversationId(conversation.id);
      
      const otherUserData = getUserById(recipientId);
      setOtherUser(otherUserData);
      
      await markConversationAsRead(conversation.id);
    } catch (error) {
      console.error('Error initializing chat:', error);
      Alert.alert('هەڵە', 'نەتوانرا گفتوگۆ دەست پێ بکرێت');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = () => {
    if (!conversationId) return;
    const msgs = getConversationMessages(conversationId);
    setMessages(msgs);
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !conversationId || isSending) return;

    const textToSend = messageText.trim();
    setMessageText('');
    setIsSending(true);

    try {
      const result = await sendChatMessage(conversationId, textToSend);
      if (result.success) {
        loadMessages();
      } else {
        Alert.alert('هەڵە', result.error || 'نەتوانرا پەیام بنێردرێت');
        setMessageText(textToSend);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('هەڵە', 'نەتوانرا پەیام بنێردرێت');
      setMessageText(textToSend);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'ئەمڕۆ';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'دوێنێ';
    } else {
      return date.toLocaleDateString('ckb-IQ');
    }
  };

  const renderMessage = (message: any, index: number) => {
    const isMyMessage = message.senderId === user?.id;
    const showDate = index === 0 || 
      formatDate(message.createdAt) !== formatDate(messages[index - 1]?.createdAt);

    return (
      <View key={message.id}>
        {showDate && (
          <View style={styles.dateSeparator}>
            <View style={styles.dateLine} />
            <KurdishText style={styles.dateText}>{formatDate(message.createdAt)}</KurdishText>
            <View style={styles.dateLine} />
          </View>
        )}
        <View
          style={[
            styles.messageContainer,
            isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer,
          ]}
        >
          <View
            style={[
              styles.messageBubble,
              isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble,
            ]}
          >
            <KurdishText style={[
              styles.messageText,
              isMyMessage ? styles.myMessageText : styles.otherMessageText,
            ]}>
              {message.content}
            </KurdishText>
            <KurdishText style={[
              styles.messageTime,
              isMyMessage ? styles.myMessageTime : styles.otherMessageTime,
            ]}>
              {formatTime(message.createdAt)}
            </KurdishText>
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Stack.Screen
          options={{
            title: 'گفتوگۆ',
            headerStyle: { backgroundColor: '#4F46E5' },
            headerTintColor: '#fff',
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
          title: recipientName || 'گفتوگۆ',
          headerStyle: { backgroundColor: '#4F46E5' },
          headerTintColor: '#fff',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerRight}>
              <View style={styles.userAvatar}>
                <User size={20} color="#4F46E5" />
              </View>
            </View>
          ),
        }}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <User size={64} color="#D1D5DB" />
              <KurdishText style={styles.emptyText}>{'هیچ پەیامێک نییە. دەست بکە بە گفتوگۆ!'}</KurdishText>
            </View>
          ) : (
            messages.map((message, index) => renderMessage(message, index))
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={messageText}
            onChangeText={setMessageText}
            placeholder="پەیامێک بنووسە..."
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={1000}
            editable={!isSending}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!messageText.trim() || isSending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={!messageText.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Send size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  },
  backButton: {
    padding: 8,
    marginLeft: 8,
  },
  headerRight: {
    marginRight: 16,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
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
    textAlign: 'center',
  },
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
    marginHorizontal: 12,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  messageContainer: {
    marginBottom: 8,
    maxWidth: '80%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  myMessageBubble: {
    backgroundColor: '#4F46E5',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#1F2937',
  },
  messageTime: {
    fontSize: 11,
    alignSelf: 'flex-end',
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherMessageTime: {
    color: '#9CA3AF',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    textAlign: 'right',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
});
