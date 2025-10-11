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
  QrCode,
  Camera,
  Tag,

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

  const isOwnerOrAdmin = user?.role === 'owner' || user?.role === 'admin';
  
  const menuSections = [
    ...(isOwnerOrAdmin ? [{
      title: 'بەڕێوەبردنی کارمەندان',
      items: [
        {
          icon: Users,
          title: 'کارمەندەکان',
          subtitle: `${employees.length} کارمەند`,
          onPress: () => router.push('/employees'),
          color: '#3B82F6',
        },
        {
          icon: Shield,
          title: 'دەسەڵاتەکان',
          subtitle: 'بەڕێوەبردنی دەسەڵاتی کارمەندەکان',
          onPress: () => router.push('/permissions'),
          color: '#10B981',
        },
      ],
    }] : []),
    ...(isOwnerOrAdmin ? [{
      title: 'بەڕێوەبردنی قەرز',
      items: [
        {
          icon: Shield,
          title: 'بەڕێوەبردنی پێشکەوتووی قەرز',
          subtitle: 'دەستکاری، سڕینەوە، پشکنین و گواستنەوەی قەرزەکان',
          onPress: () => router.push('/advanced-debt-management'),
          color: '#7C3AED',
        },
        {
          icon: Tag,
          title: 'مۆرەکانی قەرز',
          subtitle: 'زیادکردن، دەستکاری و سڕینەوەی مۆرەکانی قەرز',
          onPress: () => router.push('/debt-categories-management'),
          color: '#F59E0B',
        },
      ],
    }] : []),
    ...(isOwnerOrAdmin ? [{
      title: 'بەڕێوەبردنی کۆگا و خەرجی',
      items: [
        {
          icon: Settings,
          title: 'بەڕێوەبردنی کۆگا',
          subtitle: 'بەڕێوەبردنی کاڵاکان، بڕ و نرخەکان',
          onPress: () => router.push('/inventory-management'),
          color: '#10B981',
        },
        {
          icon: Settings,
          title: 'بەڕێوەبردنی خەرجی',
          subtitle: 'تۆمارکردن و بەڕێوەبردنی خەرجیەکان',
          onPress: () => router.push('/expense-management'),
          color: '#EF4444',
        },
        {
          icon: Settings,
          title: 'بەڕێوەبردنی کۆمیسیۆن',
          subtitle: 'حیسابکردن و بەڕێوەبردنی کۆمیسیۆنی کارمەندان',
          onPress: () => router.push('/commission-management'),
          color: '#F59E0B',
        },
      ],
    }] : []),
    {
      title: 'QR Code',
      items: [
        {
          icon: Camera,
          title: 'سکان کردنی QR',
          subtitle: 'سکان کردنی QR Code کڕیارەکان',
          onPress: () => router.push('/scan-customer-qr'),
          color: '#06B6D4',
        },
      ],
    },
    {
      title: 'ڕێکخستنەکان',
      items: [
        {
          icon: Zap,
          title: 'ڕێکخستنی بەکارهێنان',
          subtitle: 'زمان، ڕووکار، پاراستن، کارایی و ئاپتیمایزکردن',
          onPress: () => router.push('/usability-settings'),
          color: '#06B6D4',
        },
      ],
    },
    {
      title: 'تایبەتی',
      items: [
        {
          icon: Key,
          title: 'پرۆفایلی بەکارهێنەر',
          subtitle: 'نوێکردنەوەی زانیاری و گۆڕینی وشەی نهێنی',
          onPress: () => router.push('/profile'),
          color: '#F59E0B',
        },
        {
          icon: MessageCircle,
          title: 'کێشەکان و پشتگیری',
          subtitle: 'بەڕێوەبردنی کێشەکان و چارەسەرکردن',
          onPress: () => router.push('/support-issues'),
          color: '#EC4899',
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* License Info - Only for Owner/Admin */}
        {isOwnerOrAdmin && license && (
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

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
              {section.title}
            </KurdishText>
            
            {section.items.map((item) => (
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
        ))}

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