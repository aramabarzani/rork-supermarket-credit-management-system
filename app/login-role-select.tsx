import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, Users, ShoppingCart, Crown } from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import type { UserRole } from '@/types/auth-enhanced';

const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth > 768;

interface RoleOption {
  role: UserRole;
  title: string;
  subtitle: string;
  icon: typeof Crown;
  color: string;
  bgColor: string;
}

const roleOptions: RoleOption[] = [
  {
    role: 'owner',
    title: 'خاوەندار',
    subtitle: 'دەسەڵاتی تەواو + بەڕێوەبردنی لایسێنس',
    icon: Crown,
    color: '#7C3AED',
    bgColor: '#F3E8FF',
  },
  {
    role: 'admin',
    title: 'بەڕێوەبەر',
    subtitle: 'بەڕێوەبردنی قەرز و کڕیار و کارمەند',
    icon: Shield,
    color: '#1E3A8A',
    bgColor: '#DBEAFE',
  },
  {
    role: 'employee',
    title: 'کارمەند',
    subtitle: 'تۆمارکردن و بینینی قەرز و پارەدان',
    icon: Users,
    color: '#059669',
    bgColor: '#D1FAE5',
  },
  {
    role: 'customer',
    title: 'کڕیار',
    subtitle: 'بینینی قەرز و پارەدانەکانی خۆت',
    icon: ShoppingCart,
    color: '#DC2626',
    bgColor: '#FEE2E2',
  },
];

export default function LoginRoleSelectScreen() {
  const router = useRouter();

  const handleRoleSelect = (role: UserRole) => {
    router.push(`/login?role=${role}` as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, isTablet && styles.tabletContent]}>
          <View style={styles.header}>
            <View style={[styles.logoContainer, isTablet && styles.tabletLogo]}>
              <Shield size={isTablet ? 80 : 60} color="white" />
            </View>
            <KurdishText style={[styles.title, isTablet && styles.tabletTitle]}>
              سیستەمی بەڕێوەبردنی قەرز
            </KurdishText>
            <KurdishText style={[styles.subtitle, isTablet && styles.tabletSubtitle]}>
              تکایە ڕۆڵی خۆت هەڵبژێرە
            </KurdishText>
          </View>

          <View style={styles.rolesContainer}>
            {roleOptions.map((option) => {
              const Icon = option.icon;
              return (
                <TouchableOpacity
                  key={option.role}
                  style={[
                    styles.roleCard,
                    { borderColor: option.color },
                    isTablet && styles.tabletRoleCard,
                  ]}
                  onPress={() => handleRoleSelect(option.role)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: option.bgColor },
                    ]}
                  >
                    <Icon size={isTablet ? 36 : 28} color={option.color} />
                  </View>
                  <View style={styles.roleInfo}>
                    <KurdishText
                      style={[styles.roleTitle, { color: option.color }]}
                    >
                      {option.title}
                    </KurdishText>
                    <KurdishText style={styles.roleSubtitle}>
                      {option.subtitle}
                    </KurdishText>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.footer}>
            <KurdishText style={styles.footerText}>
              سیستەمی پارێزراو بە 2FA و IP Whitelist
            </KurdishText>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E3A8A',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    minHeight: Dimensions.get('window').height,
  },
  tabletContent: {
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  tabletLogo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  tabletTitle: {
    fontSize: 32,
  },
  subtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
  },
  tabletSubtitle: {
    fontSize: 18,
  },
  rolesContainer: {
    gap: 16,
  },
  roleCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tabletRoleCard: {
    padding: 24,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    marginBottom: 4,
  },
  roleSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: 'white',
    opacity: 0.8,
    textAlign: 'center',
  },
});
