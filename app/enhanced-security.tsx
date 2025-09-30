import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Shield, Lock, Key, AlertTriangle, FileCheck, Smartphone } from 'lucide-react-native';
import { useSecurity } from '@/hooks/security-context';
import { useAuth } from '@/hooks/auth-context';
import { KurdishText } from '@/components/KurdishText';

export default function EnhancedSecurityScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { 
    securitySettings, 
    updateSecuritySettings,
    twoFactorAuth,
    securityAlerts,
    passwordPolicy,
    ipWhitelist,
  } = useSecurity();

  const [showPasswordPolicy, setShowPasswordPolicy] = useState(false);
  const [showIpWhitelist, setShowIpWhitelist] = useState(false);

  const handleToggle2FA = () => {
    if (twoFactorAuth?.enabled) {
      Alert.alert(
        'ناچالاککردنی دوو هەنگاو',
        'دڵنیایت لە ناچالاککردنی تایبەتمەندی دوو هەنگاو؟',
        [
          { text: 'پاشگەزبوونەوە', style: 'cancel' },
          {
            text: 'ناچالاک بکە',
            style: 'destructive',
            onPress: () => router.push('/two-factor-setup'),
          },
        ]
      );
    } else {
      router.push('/two-factor-setup');
    }
  };

  const unresolvedAlerts = securityAlerts.filter(a => !a.resolved).length;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'ئاسایشی پەرەپێدراو',
          headerStyle: { backgroundColor: '#1e40af' },
          headerTintColor: '#fff',
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Shield size={48} color="#1e40af" />
          <KurdishText style={styles.headerTitle}>بەڕێوەبردنی ئاسایش</KurdishText>
          <KurdishText style={styles.headerSubtitle}>
            ڕێکخستنەکانی ئاسایشی پێشکەوتوو
          </KurdishText>
        </View>

        <View style={styles.section}>
          <KurdishText style={styles.sectionTitle}>تایبەتمەندیە سەرەکیەکان</KurdishText>

          <TouchableOpacity
            style={styles.card}
            onPress={handleToggle2FA}
          >
            <View style={styles.cardIcon}>
              <Smartphone size={24} color="#1e40af" />
            </View>
            <View style={styles.cardContent}>
              <KurdishText style={styles.cardTitle}>
                چوونەژوورەوە بە دوو هەنگاو (2FA)
              </KurdishText>
              <KurdishText style={styles.cardSubtitle}>
                {twoFactorAuth?.enabled 
                  ? `چالاکە - ${twoFactorAuth.method === 'sms' ? 'SMS' : 'ئیمەیڵ'}`
                  : 'ناچالاکە'}
              </KurdishText>
            </View>
            <View style={[
              styles.statusBadge,
              twoFactorAuth?.enabled ? styles.statusActive : styles.statusInactive
            ]}>
              <KurdishText style={styles.statusText}>
                {twoFactorAuth?.enabled ? 'چالاک' : 'ناچالاک'}
              </KurdishText>
            </View>
          </TouchableOpacity>

          <View style={styles.card}>
            <View style={styles.cardIcon}>
              <Lock size={24} color="#1e40af" />
            </View>
            <View style={styles.cardContent}>
              <KurdishText style={styles.cardTitle}>
                قوفڵکردنی خۆکار لە کاتی بێچالاکی
              </KurdishText>
              <KurdishText style={styles.cardSubtitle}>
                {securitySettings.inactivityLockTimeout} خولەک
              </KurdishText>
            </View>
            <Switch
              value={securitySettings.autoLockOnInactivity}
              onValueChange={(value) => 
                updateSecuritySettings({ autoLockOnInactivity: value })
              }
              trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
              thumbColor={securitySettings.autoLockOnInactivity ? '#1e40af' : '#f3f4f6'}
            />
          </View>

          <View style={styles.card}>
            <View style={styles.cardIcon}>
              <Key size={24} color="#1e40af" />
            </View>
            <View style={styles.cardContent}>
              <KurdishText style={styles.cardTitle}>
                وشەی تێپەڕی بەهێز
              </KurdishText>
              <KurdishText style={styles.cardSubtitle}>
                پێویستی بە پیت، ژمارە و هێما
              </KurdishText>
            </View>
            <Switch
              value={securitySettings.requireStrongPassword}
              onValueChange={(value) => 
                updateSecuritySettings({ requireStrongPassword: value })
              }
              trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
              thumbColor={securitySettings.requireStrongPassword ? '#1e40af' : '#f3f4f6'}
            />
          </View>

          <View style={styles.card}>
            <View style={styles.cardIcon}>
              <FileCheck size={24} color="#1e40af" />
            </View>
            <View style={styles.cardContent}>
              <KurdishText style={styles.cardTitle}>
                ئیمزای دیجیتاڵی
              </KurdishText>
              <KurdishText style={styles.cardSubtitle}>
                پشتڕاستکردنەوەی بەڵگەنامەکان
              </KurdishText>
            </View>
            <Switch
              value={securitySettings.enableDigitalSignature}
              onValueChange={(value) => 
                updateSecuritySettings({ enableDigitalSignature: value })
              }
              trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
              thumbColor={securitySettings.enableDigitalSignature ? '#1e40af' : '#f3f4f6'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <KurdishText style={styles.sectionTitle}>ئاگاداری و ڕاپۆرت</KurdishText>

          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push('/security-alerts')}
          >
            <View style={styles.cardIcon}>
              <AlertTriangle size={24} color={unresolvedAlerts > 0 ? '#dc2626' : '#1e40af'} />
            </View>
            <View style={styles.cardContent}>
              <KurdishText style={styles.cardTitle}>
                ئاگاداریەکانی ئاسایش
              </KurdishText>
              <KurdishText style={styles.cardSubtitle}>
                {unresolvedAlerts} ئاگاداری چارەسەر نەکراو
              </KurdishText>
            </View>
            {unresolvedAlerts > 0 && (
              <View style={styles.alertBadge}>
                <Text style={styles.alertBadgeText}>{unresolvedAlerts}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push('/security-reports')}
          >
            <View style={styles.cardIcon}>
              <FileCheck size={24} color="#1e40af" />
            </View>
            <View style={styles.cardContent}>
              <KurdishText style={styles.cardTitle}>
                ڕاپۆرتی ئاسایش
              </KurdishText>
              <KurdishText style={styles.cardSubtitle}>
                ڕاپۆرتی مانگانە و ساڵانە
              </KurdishText>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => setShowPasswordPolicy(!showPasswordPolicy)}
          >
            <KurdishText style={styles.sectionTitle}>سیاسەتی وشەی تێپەڕ</KurdishText>
            <KurdishText style={styles.expandIcon}>
              {showPasswordPolicy ? '▼' : '▶'}
            </KurdishText>
          </TouchableOpacity>

          {showPasswordPolicy && (
            <View style={styles.policyCard}>
              <View style={styles.policyRow}>
                <KurdishText style={styles.policyLabel}>کەمترین درێژی:</KurdishText>
                <Text style={styles.policyValue}>{passwordPolicy.minLength}</Text>
              </View>
              <View style={styles.policyRow}>
                <KurdishText style={styles.policyLabel}>پیتی گەورە:</KurdishText>
                <Text style={styles.policyValue}>
                  {passwordPolicy.requireUppercase ? '✓' : '✗'}
                </Text>
              </View>
              <View style={styles.policyRow}>
                <KurdishText style={styles.policyLabel}>پیتی بچووک:</KurdishText>
                <Text style={styles.policyValue}>
                  {passwordPolicy.requireLowercase ? '✓' : '✗'}
                </Text>
              </View>
              <View style={styles.policyRow}>
                <KurdishText style={styles.policyLabel}>ژمارە:</KurdishText>
                <Text style={styles.policyValue}>
                  {passwordPolicy.requireNumbers ? '✓' : '✗'}
                </Text>
              </View>
              <View style={styles.policyRow}>
                <KurdishText style={styles.policyLabel}>هێمای تایبەتی:</KurdishText>
                <Text style={styles.policyValue}>
                  {passwordPolicy.requireSpecialChars ? '✓' : '✗'}
                </Text>
              </View>
              <View style={styles.policyRow}>
                <KurdishText style={styles.policyLabel}>بەسەرچوونی ڕۆژ:</KurdishText>
                <Text style={styles.policyValue}>{passwordPolicy.expiryDays}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => setShowIpWhitelist(!showIpWhitelist)}
          >
            <KurdishText style={styles.sectionTitle}>
              لیستی سپی IP ({ipWhitelist.length})
            </KurdishText>
            <KurdishText style={styles.expandIcon}>
              {showIpWhitelist ? '▼' : '▶'}
            </KurdishText>
          </TouchableOpacity>

          {showIpWhitelist && (
            <View style={styles.ipListCard}>
              {ipWhitelist.length === 0 ? (
                <KurdishText style={styles.emptyText}>
                  هیچ IP زیادنەکراوە
                </KurdishText>
              ) : (
                ipWhitelist.map((ip) => (
                  <View key={ip.id} style={styles.ipItem}>
                    <View>
                      <Text style={styles.ipAddress}>{ip.ipAddress}</Text>
                      <KurdishText style={styles.ipDescription}>
                        {ip.description}
                      </KurdishText>
                    </View>
                    <View style={[
                      styles.ipStatus,
                      ip.isActive ? styles.ipActive : styles.ipInactive
                    ]} />
                  </View>
                ))
              )}
            </View>
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
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
  header: {
    backgroundColor: '#fff',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#111827',
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#111827',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#dcfce7',
  },
  statusInactive: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  alertBadge: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  alertBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold' as const,
  },
  expandButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  expandIcon: {
    fontSize: 16,
    color: '#6b7280',
  },
  policyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  policyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  policyLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  policyValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#111827',
  },
  ipListCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  ipItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  ipAddress: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#111827',
    fontFamily: 'monospace',
  },
  ipDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  ipStatus: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  ipActive: {
    backgroundColor: '#22c55e',
  },
  ipInactive: {
    backgroundColor: '#ef4444',
  },
  emptyText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 14,
    paddingVertical: 16,
  },
  bottomPadding: {
    height: 32,
  },
});
