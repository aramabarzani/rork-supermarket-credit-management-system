import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  ArrowLeft,
  Send,
  User,
  Mail,
  MessageSquare,
  Bell,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import { useUsers } from '@/hooks/users-context';
import { useAuth } from '@/hooks/auth-context';
import { PERMISSIONS } from '@/constants/permissions';

export default function SendNotificationScreen() {
  const router = useRouter();
  const { customerId } = useLocalSearchParams();
  const { getCustomers } = useUsers();
  const { hasPermission } = useAuth();
  
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const customer = getCustomers().find(c => c.id === customerId);

  if (!customer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1E3A8A" />
          </TouchableOpacity>
          <KurdishText variant="title" color="#1F2937">
            کڕیار نەدۆزرایەوە
          </KurdishText>
        </View>
      </SafeAreaView>
    );
  }

  if (!hasPermission(PERMISSIONS.SEND_NOTIFICATIONS)) {
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
        <View style={styles.noPermissionContainer}>
          <KurdishText variant="body" color="#6B7280" style={styles.noPermissionText}>
            تۆ دەسەڵاتی ناردنی ئاگاداریت نییە
          </KurdishText>
        </View>
      </SafeAreaView>
    );
  }

  const handleSendNotification = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('هەڵە', 'بابەت و پەیام پێویستە');
      return;
    }

    if (!customer.email) {
      Alert.alert('هەڵە', 'ئەم کڕیارە ئیمەیڵی نییە');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate sending notification
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert('سەرکەوتوو', 'ئاگاداری بە سەرکەوتوویی نێردرا', [
        { text: 'باشە', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error sending notification:', error);
      Alert.alert('هەڵە', 'نەتوانرا ئاگاداری بنێردرێت');
    } finally {
      setIsLoading(false);
    }
  };

  const predefinedMessages = [
    {
      subject: 'یادەوەری پارەدان',
      message: 'بەڕێز کڕیار، تکایە یادت بێت کە قەرزەکەت لە کاتی خۆیدا بدەیتەوە. سوپاس بۆ هاوکاریت.',
    },
    {
      subject: 'پیرۆزبایی',
      message: 'پیرۆزبایی لە بۆنەی جەژنەوە! سوپاس بۆ ئەوەی کڕیارێکی باشی ئێمەیت.',
    },
    {
      subject: 'داشکاندنی تایبەت',
      message: 'بەڕێز کڕیار، داشکاندنێکی تایبەتمان هەیە تەنها بۆ کڕیارە باشەکانمان وەک تۆ!',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1E3A8A" />
        </TouchableOpacity>
        <KurdishText variant="title" color="#1F2937">
          ناردنی ئاگاداری
        </KurdishText>
        <TouchableOpacity 
          onPress={handleSendNotification} 
          style={styles.sendButton}
          disabled={isLoading}
        >
          <Send size={24} color="#1E3A8A" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Customer Info */}
        <GradientCard style={styles.section}>
          <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
            ناردن بۆ
          </KurdishText>
          
          <View style={styles.customerInfo}>
            <View style={styles.avatar}>
              <User size={24} color="#1E3A8A" />
            </View>
            <View style={styles.customerDetails}>
              <KurdishText variant="body" color="#1F2937">
                {customer.name}
              </KurdishText>
              <View style={styles.contactInfo}>
                <Mail size={14} color="#6B7280" />
                <KurdishText variant="caption" color="#6B7280">
                  {customer.email || 'ئیمەیڵ نییە'}
                </KurdishText>
              </View>
            </View>
          </View>
        </GradientCard>

        {/* Message Form */}
        <GradientCard style={styles.section}>
          <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
            پەیام
          </KurdishText>
          
          <View style={styles.inputGroup}>
            <View style={styles.inputContainer}>
              <MessageSquare size={20} color="#6B7280" />
              <TextInput
                style={styles.input}
                placeholder="بابەتی پەیام"
                placeholderTextColor="#9CA3AF"
                value={subject}
                onChangeText={setSubject}
                textAlign="right"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={[styles.inputContainer, styles.messageContainer]}>
              <TextInput
                style={[styles.input, styles.messageInput]}
                placeholder="ناوەڕۆکی پەیام..."
                placeholderTextColor="#9CA3AF"
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={6}
                textAlign="right"
                textAlignVertical="top"
              />
            </View>
          </View>
        </GradientCard>

        {/* Predefined Messages */}
        <GradientCard style={styles.section}>
          <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
            پەیامە ئامادەکراوەکان
          </KurdishText>
          
          {predefinedMessages.map((template, index) => (
            <TouchableOpacity
              key={index}
              style={styles.templateButton}
              onPress={() => {
                setSubject(template.subject);
                setMessage(template.message);
              }}
            >
              <Bell size={16} color="#1E3A8A" />
              <View style={styles.templateContent}>
                <KurdishText variant="body" color="#1F2937">
                  {template.subject}
                </KurdishText>
                <KurdishText variant="caption" color="#6B7280" numberOfLines={2}>
                  {template.message}
                </KurdishText>
              </View>
            </TouchableOpacity>
          ))}
        </GradientCard>

        <View style={styles.bottomSpacer} />
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
  sendButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerDetails: {
    flex: 1,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageContainer: {
    alignItems: 'flex-start',
    paddingVertical: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    textAlign: 'right',
  },
  messageInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  templateButton: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  templateContent: {
    flex: 1,
    gap: 4,
  },
  noPermissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  noPermissionText: {
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 32,
  },
});