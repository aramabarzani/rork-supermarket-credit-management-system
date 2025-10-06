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
import { Stack, useRouter } from 'expo-router';
import {
  Search,
  Grid,
  List,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';

type FeatureStatus = 'working' | 'partial' | 'missing';

type Feature = {
  id: string;
  title: string;
  route: string;
  status: FeatureStatus;
  description: string;
  category: string;
};

const features: Feature[] = [
  // پەڕەکانی کارکردوو
  { id: '1', title: 'داشبۆرد', route: '/(tabs)/dashboard', status: 'working', description: 'پەڕەی سەرەکی', category: 'سەرەکی' },
  { id: '2', title: 'کڕیارەکان', route: '/(tabs)/customers', status: 'working', description: 'لیستی کڕیارەکان', category: 'سەرەکی' },
  { id: '3', title: 'ڕاپۆرتەکان', route: '/(tabs)/reports', status: 'working', description: 'ڕاپۆرتە داراییەکان', category: 'سەرەکی' },
  { id: '4', title: 'گەڕان', route: '/(tabs)/search', status: 'working', description: 'گەڕان لە سیستەم', category: 'سەرەکی' },
  { id: '5', title: 'ڕێکخستنەکان', route: '/(tabs)/settings', status: 'working', description: 'ڕێکخستنەکانی سیستەم', category: 'سەرەکی' },
  
  // بەڕێوەبردنی قەرز
  { id: '6', title: 'زیادکردنی قەرز', route: '/add-debt', status: 'working', description: 'زیادکردنی قەرزی نوێ', category: 'قەرز' },
  { id: '7', title: 'بەڕێوەبردنی قەرز', route: '/debt-management', status: 'working', description: 'بەڕێوەبردنی هەموو قەرزەکان', category: 'قەرز' },
  { id: '8', title: 'دەستکاریکردنی قەرز', route: '/edit-debt/1', status: 'working', description: 'دەستکاری قەرزەکان', category: 'قەرز' },
  { id: '9', title: 'بەڕێوەبردنی پێشکەوتووی قەرز', route: '/advanced-debt-management', status: 'working', description: 'تایبەتمەندیە پێشکەوتووەکان', category: 'قەرز' },
  { id: '10', title: 'مۆرەکانی قەرز', route: '/debt-categories-management', status: 'working', description: 'بەڕێوەبردنی مۆرەکان', category: 'قەرز' },
  
  // پارەدان
  { id: '11', title: 'زیادکردنی پارەدان', route: '/add-payment', status: 'working', description: 'تۆمارکردنی پارەدان', category: 'پارەدان' },
  { id: '12', title: 'ڕاپۆرتی پارەدان', route: '/payment-reports', status: 'working', description: 'ڕاپۆرتەکانی پارەدان', category: 'پارەدان' },
  { id: '13', title: 'پارەدانەکان', route: '/payments', status: 'working', description: 'لیستی پارەدانەکان', category: 'پارەدان' },
  
  // کڕیارەکان
  { id: '14', title: 'زیادکردنی کڕیار', route: '/add-user', status: 'working', description: 'زیادکردنی کڕیاری نوێ', category: 'کڕیار' },
  { id: '15', title: 'دەستکاریکردنی کڕیار', route: '/edit-customer', status: 'working', description: 'دەستکاری زانیاری کڕیار', category: 'کڕیار' },
  { id: '16', title: 'وردەکاریەکانی کڕیار', route: '/customer-detail/1', status: 'working', description: 'زانیاری تەواوی کڕیار', category: 'کڕیار' },
  { id: '17', title: 'ڕاپۆرتی کڕیاران', route: '/customer-reports', status: 'working', description: 'ڕاپۆرتەکانی کڕیاران', category: 'کڕیار' },
  { id: '18', title: 'شیکاری کڕیاران', route: '/customer-analytics', status: 'working', description: 'شیکاری وردی کڕیاران', category: 'کڕیار' },
  { id: '19', title: 'داشبۆردی کڕیار', route: '/customer-dashboard', status: 'working', description: 'داشبۆردی تایبەت بە کڕیار', category: 'کڕیار' },
  { id: '20', title: 'مێژووی کڕیار', route: '/customer-history', status: 'working', description: 'مێژووی تەواوی کڕیار', category: 'کڕیار' },
  { id: '21', title: 'ڕێکخستنەکانی کڕیار', route: '/customer-settings', status: 'working', description: 'ڕێکخستنەکانی تایبەت', category: 'کڕیار' },
  
  // QR Code
  { id: '22', title: 'بەڕێوەبردنی QR', route: '/customer-qr-management', status: 'working', description: 'دروستکردنی QR بۆ کڕیاران', category: 'QR Code' },
  { id: '23', title: 'سکان کردنی QR', route: '/scan-customer-qr', status: 'working', description: 'سکان کردنی QR کڕیاران', category: 'QR Code' },
  

  
  // ڕاپۆرتەکان
  { id: '28', title: 'ڕاپۆرتی مانگانە', route: '/monthly-reports', status: 'working', description: 'ڕاپۆرتەکانی مانگانە', category: 'ڕاپۆرت' },
  { id: '29', title: 'ڕاپۆرتی باڵانس', route: '/balance-report', status: 'working', description: 'ڕاپۆرتی باڵانسی گشتی', category: 'ڕاپۆرت' },
  { id: '30', title: 'ڕاپۆرتە پێشکەوتووەکان', route: '/advanced-reports', status: 'working', description: 'ڕاپۆرتە تایبەتەکان', category: 'ڕاپۆرت' },
  { id: '31', title: 'ڕاپۆرتی وردی کڕیاران', route: '/detailed-customer-reports', status: 'working', description: 'ڕاپۆرتی وردی کڕیاران', category: 'ڕاپۆرت' },
  { id: '32', title: 'ڕاپۆرتی VIP', route: '/vip-customers-report', status: 'working', description: 'ڕاپۆرتی کڕیارانی VIP', category: 'ڕاپۆرت' },
  { id: '33', title: 'ڕاپۆرتی شار', route: '/location-reports', status: 'partial', description: 'ڕاپۆرت بە پێی شار', category: 'ڕاپۆرت' },
  { id: '34', title: 'ڕاپۆرتی بێچالاکان', route: '/inactive-users-report', status: 'partial', description: 'کڕیارانی بێچالاک', category: 'ڕاپۆرت' },
  { id: '35', title: 'ڕاپۆرتی دارایی', route: '/detailed-financial-reports', status: 'partial', description: 'ڕاپۆرتی داراییی وردەکار', category: 'ڕاپۆرت' },
  { id: '36', title: 'داشبۆردی ئەنالیتیکس', route: '/analytics-dashboard', status: 'working', description: 'ئەنالیتیکسی پێشکەوتوو', category: 'ڕاپۆرت' },
  { id: '37', title: 'ڕاپۆرتی دەسەڵاتەکان', route: '/permissions-report', status: 'working', description: 'ڕاپۆرتی دەسەڵاتەکان', category: 'ڕاپۆرت' },
  
  // پاراستن
  { id: '38', title: 'بەڕێوەبردنی پاراستن', route: '/security-management', status: 'working', description: 'ڕێکخستنەکانی پاراستن', category: 'پاراستن' },
  { id: '39', title: 'پاراستنی پێشکەوتوو', route: '/enhanced-security', status: 'working', description: 'تایبەتمەندیە پێشکەوتووەکان', category: 'پاراستن' },
  { id: '40', title: 'ئاگاداریەکانی پاراستن', route: '/security-alerts', status: 'working', description: 'ئاگاداریەکانی پاراستن', category: 'پاراستن' },
  { id: '41', title: 'ڕاپۆرتی پاراستن', route: '/security-reports', status: 'working', description: 'ڕاپۆرتەکانی پاراستن', category: 'پاراستن' },
  { id: '42', title: 'دوو فاکتەر', route: '/two-factor-setup', status: 'working', description: 'ڕێکخستنی دوو فاکتەر', category: 'پاراستن' },
  
  // ئاگاداریەکان
  { id: '43', title: 'ئاگاداریەکان', route: '/notifications', status: 'working', description: 'بینینی ئاگاداریەکان', category: 'ئاگاداری' },
  { id: '44', title: 'بەڕێوەبردنی ئاگاداری', route: '/notification-management', status: 'working', description: 'بەڕێوەبردنی ئاگاداریەکان', category: 'ئاگاداری' },
  { id: '45', title: 'ناردنی ئاگاداری', route: '/send-notification', status: 'working', description: 'ناردنی ئاگاداری', category: 'ئاگاداری' },
  
  // وەسڵەکان
  { id: '46', title: 'وەسڵەکان', route: '/receipts', status: 'working', description: 'بەڕێوەبردنی وەسڵەکان', category: 'وەسڵ' },
  { id: '47', title: 'بینینی وەسڵ', route: '/receipt/1', status: 'working', description: 'بینینی وەسڵی تایبەت', category: 'وەسڵ' },
  
  // دەسەڵاتەکان
  { id: '48', title: 'دەسەڵاتەکان', route: '/permissions', status: 'working', description: 'بەڕێوەبردنی دەسەڵاتەکان', category: 'دەسەڵات' },
  { id: '49', title: 'بەڕێوەبردنی ڕۆڵەکان', route: '/role-management', status: 'working', description: 'بەڕێوەبردنی ڕۆڵەکان', category: 'دەسەڵات' },
  { id: '50', title: 'بەڕێوەبردنی ئەدمین', route: '/admin-management', status: 'working', description: 'بەڕێوەبردنی ئەدمینەکان', category: 'دەسەڵات' },
  
  // ڕێکخستنەکان
  { id: '51', title: 'ڕێکخستنی سیستەم', route: '/system-settings', status: 'working', description: 'ڕێکخستنەکانی گشتی', category: 'ڕێکخستن' },
  { id: '52', title: 'ڕێکخستنی بەکارهێنان', route: '/usability-settings', status: 'working', description: 'ڕێکخستنی بەکارهێنان', category: 'ڕێکخستن' },
  { id: '53', title: 'دەستکاریکردنی ڕووکار', route: '/ui-customization', status: 'working', description: 'دەستکاری ڕووکار', category: 'ڕێکخستن' },
  { id: '54', title: 'ڕێکخستنی سیستەم', route: '/system-config', status: 'working', description: 'ڕێکخستنی پێشکەوتوو', category: 'ڕێکخستن' },
  { id: '55', title: 'نوێکردنەوەی سیستەم', route: '/system-updates', status: 'working', description: 'نوێکردنەوەکان', category: 'ڕێکخستن' },
  
  // پشتگیری
  { id: '56', title: 'کێشەکان', route: '/support-issues', status: 'working', description: 'بەڕێوەبردنی کێشەکان', category: 'پشتگیری' },
  { id: '57', title: 'وردەکاریەکانی کێشە', route: '/support-issue-detail', status: 'working', description: 'وردەکاریەکانی کێشە', category: 'پشتگیری' },
  
  // یەکخستنەکان
  { id: '58', title: 'ڕێکخستنی یەکخستن', route: '/integration-settings', status: 'working', description: 'یەکخستن لەگەڵ سیستەمەکانی تر', category: 'یەکخستن' },
  { id: '59', title: 'WhatsApp و SMS', route: '/whatsapp-sms-integration', status: 'working', description: 'یەکخستنی WhatsApp', category: 'یەکخستن' },
  
  // فۆرمەکان
  { id: '60', title: 'دروستکردنی فۆرم', route: '/form-builder', status: 'working', description: 'دروستکردنی فۆرمی تایبەت', category: 'فۆرم' },
  { id: '61', title: 'فۆرمە تایبەتەکان', route: '/custom-forms', status: 'working', description: 'بەڕێوەبردنی فۆرمەکان', category: 'فۆرم' },
  
  // چاودێری
  { id: '62', title: 'چاودێری هەڵەکان', route: '/error-monitoring', status: 'working', description: 'چاودێری هەڵەکان', category: 'چاودێری' },
  { id: '63', title: 'چاودێری ڕاستەوخۆ', route: '/realtime-monitoring', status: 'working', description: 'چاودێری ڕاستەوخۆ', category: 'چاودێری' },
  { id: '64', title: 'چاودێری کارایی', route: '/performance-monitoring', status: 'working', description: 'چاودێری کارایی', category: 'چاودێری' },
  { id: '65', title: 'ئاماری بەکارهێنان', route: '/usage-statistics', status: 'working', description: 'ئاماری بەکارهێنان', category: 'چاودێری' },
  
  // باکئەپ
  { id: '66', title: 'بەڕێوەبردنی باکئەپ', route: '/backup-management', status: 'working', description: 'باکئەپ و گەڕاندنەوە', category: 'باکئەپ' },
  
  // تایبەتمەندیە تایبەتەکان
  { id: '67', title: 'داشبۆردی خێرا', route: '/quick-dashboard', status: 'working', description: 'داشبۆردی خێرا', category: 'تایبەت' },
  { id: '68', title: 'گەڕانی گشتی', route: '/global-search', status: 'working', description: 'گەڕان لە هەموو شتێک', category: 'تایبەت' },
  { id: '69', title: 'فلتەرە پێشکەوتووەکان', route: '/advanced-filters', status: 'working', description: 'فلتەری پێشکەوتوو', category: 'تایبەت' },
  { id: '70', title: 'نەخشەی کڕیاران', route: '/customer-map', status: 'working', description: 'نەخشەی شوێنی کڕیاران', category: 'تایبەت' },
  { id: '71', title: 'شیکاری پێشبینی', route: '/predictive-analytics', status: 'working', description: 'پێشبینی بەهاکان', category: 'تایبەت' },
  { id: '72', title: 'خاڵی کرێدیت', route: '/credit-scoring', status: 'working', description: 'خاڵدانی کڕیاران', category: 'تایبەت' },
  { id: '73', title: 'لیستی ڕەش', route: '/blacklist-management', status: 'working', description: 'بەڕێوەبردنی لیستی ڕەش', category: 'تایبەت' },
  
  // تێبینیەکان
  { id: '74', title: 'بەڕێوەبردنی تێبینیەکان', route: '/notes-management', status: 'working', description: 'تێبینیەکان', category: 'تێبینی' },
  
  // شیکاری
  { id: '75', title: 'شیکاری کاریگەری', route: '/impact-analysis', status: 'working', description: 'شیکاری کاریگەری', category: 'شیکاری' },
  { id: '76', title: 'پەیامی ناوخۆیی', route: '/internal-messaging', status: 'working', description: 'پەیامی ناوخۆیی', category: 'پەیام' },
  
  // هاوبەشکردن
  { id: '77', title: 'بەڕێوەبردنی هاوبەشکردن', route: '/sharing-management', status: 'working', description: 'هاوبەشکردنی داتا', category: 'هاوبەش' },
  
  // ڕێنمایی
  { id: '78', title: 'بەڕێوەبردنی ڕێنمایی', route: '/guidance-management', status: 'working', description: 'ڕێنماییەکان', category: 'ڕێنمایی' },
  { id: '79', title: 'نیوزلێتەر', route: '/newsletter-management', status: 'partial', description: 'بەڕێوەبردنی نیوزلێتەر (پشت بە backend دەبەستێت)', category: 'ڕێنمایی' },
  { id: '80', title: 'دەستپێکردن', route: '/onboarding', status: 'working', description: 'دەستپێکردن بۆ بەکارهێنەرانی نوێ', category: 'ڕێنمایی' },
  
  // خاو��ن
  { id: '81', title: 'داشبۆردی خاوەن', route: '/owner-dashboard', status: 'working', description: 'داشبۆردی خاوەن', category: 'خاوەن' },
  { id: '82', title: 'وردەکاریەکانی بەشداری', route: '/subscription-details', status: 'working', description: 'وردەکاریەکانی بەشداری', category: 'خاوەن' },
  { id: '83', title: 'تایبەتمەندیەکانی تێنانت', route: '/tenant-features', status: 'working', description: 'تایبەتمەندیەکان', category: 'خاوەن' },
  { id: '84', title: 'داواکاریەکانی فرۆشگا', route: '/store-requests', status: 'working', description: 'داواکاریەکان', category: 'خاوەن' },
  { id: '85', title: 'بەڕێوەبردنی فرۆشگاکان', route: '/admin-stores', status: 'working', description: 'بەڕێوەبردنی فرۆشگاکان', category: 'خاوەن' },
  
  // تۆمارکردن
  { id: '86', title: 'تۆمارکردنی فرۆشگا', route: '/store-registration', status: 'working', description: 'تۆمارکردنی فرۆشگای نوێ', category: 'تۆمار' },
  { id: '87', title: 'چوونەژوورەوە', route: '/login', status: 'working', description: 'چوونەژوورەوە', category: 'تۆمار' },
  
  // پرۆفایل
  { id: '88', title: 'پرۆفایل', route: '/profile', status: 'working', description: 'پرۆفایلی بەکارهێنەر', category: 'پرۆفایل' },
  
  // پشکنینی سیستەم
  { id: '89', title: 'پشکنینی سیستەم', route: '/system-validation', status: 'working', description: 'پشکنینی سیستەم', category: 'پشکنین' },
  { id: '90', title: 'داشبۆردی دارایی', route: '/financial-dashboard', status: 'working', description: 'داشبۆردی دارایی', category: 'دارایی' },
];

export default function AllFeaturesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('هەموو');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const categories = ['هەموو', ...Array.from(new Set(features.map(f => f.category)))];

  const filteredFeatures = features.filter(feature => {
    const matchesSearch = feature.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feature.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'هەموو' || feature.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusIcon = (status: FeatureStatus) => {
    switch (status) {
      case 'working':
        return <CheckCircle size={20} color="#10B981" />;
      case 'partial':
        return <AlertCircle size={20} color="#F59E0B" />;
      case 'missing':
        return <XCircle size={20} color="#EF4444" />;
    }
  };

  const getStatusText = (status: FeatureStatus) => {
    switch (status) {
      case 'working':
        return 'کاردەکات';
      case 'partial':
        return 'بەشێک کاردەکات';
      case 'missing':
        return 'نییە';
    }
  };

  const getStatusColor = (status: FeatureStatus) => {
    switch (status) {
      case 'working':
        return '#10B981';
      case 'partial':
        return '#F59E0B';
      case 'missing':
        return '#EF4444';
    }
  };

  const handleFeaturePress = (feature: Feature) => {
    if (feature.status === 'missing') {
      Alert.alert(
        'تایبەتمەندی نییە',
        `پەڕەی "${feature.title}" هێشتا دروست نەکراوە.`,
        [{ text: 'باشە', style: 'cancel' }]
      );
      return;
    }

    if (feature.status === 'partial') {
      Alert.alert(
        'ئاگاداری',
        `پەڕەی "${feature.title}" بەشێک لە تایبەتمەندیەکانی کار ناکات (پشت بە backend دەبەستێت).`,
        [
          { text: 'پاشگەزبوونەوە', style: 'cancel' },
          { text: 'کردنەوە', onPress: () => router.push(feature.route as any) }
        ]
      );
      return;
    }

    router.push(feature.route as any);
  };

  const stats = {
    total: features.length,
    working: features.filter(f => f.status === 'working').length,
    partial: features.filter(f => f.status === 'partial').length,
    missing: features.filter(f => f.status === 'missing').length,
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'هەموو تایبەتمەندیەکان',
          headerStyle: { backgroundColor: '#1E3A8A' },
          headerTintColor: 'white',
        }}
      />

      <View style={styles.header}>
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <KurdishText variant="caption" color="#6B7280">
              کۆ
            </KurdishText>
            <KurdishText variant="subtitle" color="#1F2937">{stats.total}</KurdishText>
          </View>
          <View style={styles.statItem}>
            <KurdishText variant="caption" color="#10B981">
              کاردەکات
            </KurdishText>
            <KurdishText variant="subtitle" color="#10B981">{stats.working}</KurdishText>
          </View>
          <View style={styles.statItem}>
            <KurdishText variant="caption" color="#F59E0B">
              بەشێک
            </KurdishText>
            <KurdishText variant="subtitle" color="#F59E0B">{stats.partial}</KurdishText>
          </View>
          <View style={styles.statItem}>
            <KurdishText variant="caption" color="#EF4444">
              نییە
            </KurdishText>
            <KurdishText variant="subtitle" color="#EF4444">{stats.missing}</KurdishText>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="گەڕان لە تایبەتمەندیەکان..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign="right"
          />
        </View>

        {/* View Mode Toggle */}
        <View style={styles.viewModeContainer}>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'list' && styles.viewModeButtonActive]}
            onPress={() => setViewMode('list')}
          >
            <List size={20} color={viewMode === 'list' ? 'white' : '#6B7280'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'grid' && styles.viewModeButtonActive]}
            onPress={() => setViewMode('grid')}
          >
            <Grid size={20} color={viewMode === 'grid' ? 'white' : '#6B7280'} />
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <KurdishText
                variant="caption"
                color={selectedCategory === category ? 'white' : '#6B7280'}
              >
                {category}
              </KurdishText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {viewMode === 'list' ? (
          <View style={styles.listContainer}>
            {filteredFeatures.map(feature => (
              <TouchableOpacity
                key={feature.id}
                onPress={() => handleFeaturePress(feature)}
              >
                <GradientCard style={styles.featureCard}>
                  <View style={styles.featureHeader}>
                    <View style={styles.featureInfo}>
                      <KurdishText variant="body" color="#1F2937">
                        {feature.title}
                      </KurdishText>
                      <KurdishText variant="caption" color="#6B7280">
                        {feature.description}
                      </KurdishText>
                    </View>
                    <View style={styles.featureActions}>
                      {getStatusIcon(feature.status)}
                      <ChevronRight size={20} color="#9CA3AF" />
                    </View>
                  </View>
                  <View style={styles.featureFooter}>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(feature.status) + '20' }]}>
                      <KurdishText variant="caption" color={getStatusColor(feature.status)}>
                        {getStatusText(feature.status)}
                      </KurdishText>
                    </View>
                    <KurdishText variant="caption" color="#9CA3AF">
                      {feature.category}
                    </KurdishText>
                  </View>
                </GradientCard>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {filteredFeatures.map(feature => (
              <TouchableOpacity
                key={feature.id}
                style={styles.gridItem}
                onPress={() => handleFeaturePress(feature)}
              >
                <GradientCard style={styles.gridCard}>
                  <View style={styles.gridCardContent}>
                    {getStatusIcon(feature.status)}
                    <KurdishText variant="caption" color="#1F2937" style={{ textAlign: 'center', marginTop: 8 }}>
                      {feature.title}
                    </KurdishText>
                  </View>
                </GradientCard>
              </TouchableOpacity>
            ))}
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
    padding: 16,
    gap: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  viewModeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  viewModeButton: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewModeButtonActive: {
    backgroundColor: '#1E3A8A',
  },
  categoriesContainer: {
    flexDirection: 'row',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#1E3A8A',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  featureCard: {
    marginBottom: 12,
  },
  featureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureInfo: {
    flex: 1,
    gap: 4,
  },
  featureActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },
  gridItem: {
    width: '48%',
  },
  gridCard: {
    aspectRatio: 1,
  },
  gridCardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});
