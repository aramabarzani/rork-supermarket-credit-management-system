import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  Users,
  Shield,
  Building,
  Calendar,
  ChevronRight,
  Key,
  Settings,
  MessageCircle,
  Zap,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import { useAuth } from '@/hooks/auth-context';
import { useUsers } from '@/hooks/users-context';
import { useSettings } from '@/hooks/settings-context';

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { getEmployees } = useUsers();
  const { settings } = useSettings();
  
  const employees = getEmployees();
  
  // Mock license data for demo
  const license = {
    businessName: settings.businessInfo.name,
    ownerName: settings.businessInfo.ownerName,
    isActive: true,
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    maxUsers: 50,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ckb-IQ');
  };

  const menuItems = [
    {
      icon: Key,
      title: 'بەڕێوەبردنی لایسەنس',
      subtitle: 'دروستکردن و بەڕێوەبردنی لایسەنسی کڕیاران',
      onPress: () => router.push('/license-management'),
      color: '#F59E0B',
    },
    {
      icon: Users,
      title: 'بەڕێوەبردنی کارمەندەکان',
      subtitle: `${employees.length} کارمەند`,
      onPress: () => router.push('/employees'),
      color: '#3B82F6',
    },
    {
      icon: Settings,
      title: 'دەستکاریکردنی ڕووکار',
      subtitle: 'ڕەنگ، فۆنت، مۆد و دیزاین',
      onPress: () => router.push('/ui-customization'),
      color: '#EC4899',
    },
    {
      icon: Shield,
      title: 'دەسەڵاتەکان',
      subtitle: 'بەڕێوەبردنی دەسەڵاتی کارمەندەکان',
      onPress: () => router.push('/permissions'),
      color: '#10B981',
    },
    {
      icon: Shield,
      title: 'بەڕێوەبردنی پاراستن',
      subtitle: 'ڕێکخستنی پاراستن، تۆماری چوونەژوورەوە و چالاکی',
      onPress: () => router.push('/security-management'),
      color: '#EF4444',
    },
    {
      icon: MessageCircle,
      title: 'کێشەکان و پشتگیری',
      subtitle: 'بەڕێوەبردنی کێشەکان و چارەسەرکردن',
      onPress: () => router.push('/support-issues'),
      color: '#EC4899',
    },
    {
      icon: Key,
      title: 'پرۆفایلی بەکارهێنەر',
      subtitle: 'نوێکردنەوەی زانیاری و گۆڕینی وشەی نهێنی',
      onPress: () => router.push('/profile'),
      color: '#F59E0B',
    },
    {
      icon: Settings,
      title: 'ڕێکخستنی سیستەم',
      subtitle: 'زمان، پارە، ئاگاداری و هیتر',
      onPress: () => router.push('/system-settings'),
      color: '#8B5CF6',
    },
    {
      icon: Zap,
      title: 'ڕێکخستنی بەکارهێنان',
      subtitle: 'زمان، ڕووکار، پاراستن، کارایی و ئاپتیمایزکردن',
      onPress: () => router.push('/usability-settings'),
      color: '#06B6D4',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* License Info */}
        {license && (
          <View style={styles.section}>
            <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
              زانیاری مۆڵەت
            </KurdishText>
            
            <GradientCard colors={['#1E3A8A', '#3B82F6']}>
              <View style={styles.licenseHeader}>
                <Building size={32} color="#1E3A8A" />
                <View style={styles.licenseInfo}>
                  <KurdishText variant="subtitle" color="#1F2937">
                    {license.businessName}
                  </KurdishText>
                  <KurdishText variant="caption" color="#6B7280">
                    خاوەن: {license.ownerName}
                  </KurdishText>
                </View>
              </View>
              
              <View style={styles.licenseDetails}>
                <View style={styles.licenseRow}>
                  <KurdishText variant="caption" color="#6B7280">
                    دۆخ
                  </KurdishText>
                  <View style={[styles.badge, license.isActive ? styles.badgeActive : styles.badgeInactive]}>
                    <KurdishText variant="caption" color="white">
                      {license.isActive ? 'چالاک' : 'ناچالاک'}
                    </KurdishText>
                  </View>
                </View>
                <View style={styles.licenseRow}>
                  <KurdishText variant="caption" color="#6B7280">
                    بەرواری بەسەرچوون
                  </KurdishText>
                  <View style={styles.dateRow}>
                    <Calendar size={14} color="#6B7280" />
                    <KurdishText variant="body" color="#1F2937" style={styles.dateText}>
                      {formatDate(license.expiryDate)}
                    </KurdishText>
                  </View>
                </View>
                <View style={styles.licenseRow}>
                  <KurdishText variant="caption" color="#6B7280">
                    زۆرترین بەکارهێنەر
                  </KurdishText>
                  <KurdishText variant="body" color="#1F2937">
                    {license.maxUsers}
                  </KurdishText>
                </View>
              </View>
            </GradientCard>
          </View>
        )}

        {/* Menu Items */}
        <View style={styles.section}>
          <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
            ڕێکخستنەکان
          </KurdishText>
          
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.title}
              onPress={item.onPress}
              style={styles.menuItem}
            >
              <GradientCard colors={[item.color, item.color]} intensity="light">
                <View style={styles.menuContent}>
                  <View style={styles.menuLeft}>
                    <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                      <item.icon size={24} color={item.color} />
                    </View>
                    <View>
                      <KurdishText variant="body" color="#1F2937">
                        {item.title}
                      </KurdishText>
                      <KurdishText variant="caption" color="#6B7280">
                        {item.subtitle}
                      </KurdishText>
                    </View>
                  </View>
                  <ChevronRight size={20} color="#9CA3AF" />
                </View>
              </GradientCard>
            </TouchableOpacity>
          ))}
        </View>

        {/* User Info */}
        <View style={styles.section}>
          <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
            زانیاری هەژمار
          </KurdishText>
          
          <GradientCard>
            <View style={styles.userRow}>
              <KurdishText variant="caption" color="#6B7280">
                ناو
              </KurdishText>
              <KurdishText variant="body" color="#1F2937">
                {user?.name}
              </KurdishText>
            </View>
            <View style={styles.userRow}>
              <KurdishText variant="caption" color="#6B7280">
                ژمارەی مۆبایل
              </KurdishText>
              <KurdishText variant="body" color="#1F2937">
                {user?.phone}
              </KurdishText>
            </View>
            <View style={[styles.userRow, styles.lastUserRow]}>
              <KurdishText variant="caption" color="#6B7280">
                ڕۆڵ
              </KurdishText>
              <KurdishText variant="body" color="#1F2937">
                {user?.role === 'admin' ? 'بەڕێوەبەر' : user?.role === 'employee' ? 'کارمەند' : 'کڕیار'}
              </KurdishText>
            </View>
          </GradientCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  licenseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  licenseInfo: {
    flex: 1,
  },
  licenseDetails: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  licenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeActive: {
    backgroundColor: '#10B981',
  },
  badgeInactive: {
    backgroundColor: '#EF4444',
  },
  menuItem: {
    marginBottom: 12,
  },
  menuContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dateText: {
    marginLeft: 4,
  },
  lastUserRow: {
    borderBottomWidth: 0,
  },
});