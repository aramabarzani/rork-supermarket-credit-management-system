import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { FileText, Download, Mail, Calendar } from 'lucide-react-native';
import { useAuth } from '@/hooks/auth-context';
import { KurdishText } from '@/components/KurdishText';


export default function SecurityReportsScreen() {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<'monthly' | 'annual' | 'custom'>('monthly');
  const [startDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
  const [endDate] = useState(new Date().toISOString());

  const generateReportMutation = { isPending: false };

  const handleGenerateReport = async () => {
    if (!user) return;
    Alert.alert('سەرکەوتوو', 'ڕاپۆرت دروست کرا');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'ڕاپۆرتی ئاسایش',
          headerStyle: { backgroundColor: '#1e40af' },
          headerTintColor: '#fff',
        }}
      />

      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <FileText size={48} color="#1e40af" />
          <KurdishText style={styles.headerTitle}>
            دروستکردنی ڕاپۆرتی ئاسایش
          </KurdishText>
          <KurdishText style={styles.headerSubtitle}>
            ڕاپۆرتی تەواو لەسەر چالاکیەکانی ئاسایش
          </KurdishText>
        </View>

        <View style={styles.section}>
          <KurdishText style={styles.sectionTitle}>جۆری ڕاپۆرت</KurdishText>

          <TouchableOpacity
            style={[
              styles.typeCard,
              selectedType === 'monthly' && styles.typeCardSelected,
            ]}
            onPress={() => setSelectedType('monthly')}
          >
            <Calendar size={24} color={selectedType === 'monthly' ? '#1e40af' : '#6b7280'} />
            <View style={styles.typeContent}>
              <KurdishText style={[
                styles.typeTitle,
                selectedType === 'monthly' && styles.typeTitleSelected,
              ]}>
                ڕاپۆرتی مانگانە
              </KurdishText>
              <KurdishText style={styles.typeSubtitle}>
                ڕاپۆرت بۆ مانگی ڕابردوو
              </KurdishText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeCard,
              selectedType === 'annual' && styles.typeCardSelected,
            ]}
            onPress={() => setSelectedType('annual')}
          >
            <Calendar size={24} color={selectedType === 'annual' ? '#1e40af' : '#6b7280'} />
            <View style={styles.typeContent}>
              <KurdishText style={[
                styles.typeTitle,
                selectedType === 'annual' && styles.typeTitleSelected,
              ]}>
                ڕاپۆرتی ساڵانە
              </KurdishText>
              <KurdishText style={styles.typeSubtitle}>
                ڕاپۆرت بۆ ساڵی ڕابردوو
              </KurdishText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeCard,
              selectedType === 'custom' && styles.typeCardSelected,
            ]}
            onPress={() => setSelectedType('custom')}
          >
            <Calendar size={24} color={selectedType === 'custom' ? '#1e40af' : '#6b7280'} />
            <View style={styles.typeContent}>
              <KurdishText style={[
                styles.typeTitle,
                selectedType === 'custom' && styles.typeTitleSelected,
              ]}>
                ڕاپۆرتی تایبەتی
              </KurdishText>
              <KurdishText style={styles.typeSubtitle}>
                ڕاپۆرت بە ماوەی دیاریکراو
              </KurdishText>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <KurdishText style={styles.sectionTitle}>زانیاری ڕاپۆرت</KurdishText>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <KurdishText style={styles.infoLabel}>جۆر:</KurdishText>
              <KurdishText style={styles.infoValue}>
                {selectedType === 'monthly' ? 'مانگانە' : selectedType === 'annual' ? 'ساڵانە' : 'تایبەتی'}
              </KurdishText>
            </View>
            <View style={styles.infoRow}>
              <KurdishText style={styles.infoLabel}>لە:</KurdishText>
              <Text style={styles.infoValue}>
                {new Date(startDate).toLocaleDateString('en-US')}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <KurdishText style={styles.infoLabel}>بۆ:</KurdishText>
              <Text style={styles.infoValue}>
                {new Date(endDate).toLocaleDateString('en-US')}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.generateButton}
            onPress={handleGenerateReport}
            disabled={generateReportMutation.isPending}
          >
            <FileText size={20} color="#fff" />
            <KurdishText style={styles.generateButtonText}>
              {generateReportMutation.isPending ? 'دروستکردن...' : 'دروستکردنی ڕاپۆرت'}
            </KurdishText>
          </TouchableOpacity>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => Alert.alert('داگرتن', 'ڕاپۆرت بە PDF دابگیرێت')}
            >
              <Download size={20} color="#1e40af" />
              <KurdishText style={styles.actionButtonText}>
                داگرتن بە PDF
              </KurdishText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => Alert.alert('ناردن', 'ڕاپۆرت بە ئیمەیڵ بنێررێت')}
            >
              <Mail size={20} color="#1e40af" />
              <KurdishText style={styles.actionButtonText}>
                ناردن بە ئیمەیڵ
              </KurdishText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <KurdishText style={styles.sectionTitle}>ناوەڕۆکی ڕاپۆرت</KurdishText>

          <View style={styles.contentCard}>
            <View style={styles.contentItem}>
              <Text style={styles.contentBullet}>•</Text>
              <KurdishText style={styles.contentText}>
                کۆی چوونەژوورەوەکان
              </KurdishText>
            </View>
            <View style={styles.contentItem}>
              <Text style={styles.contentBullet}>•</Text>
              <KurdishText style={styles.contentText}>
                چوونەژوورەوەی شکستخواردوو
              </KurdishText>
            </View>
            <View style={styles.contentItem}>
              <Text style={styles.contentBullet}>•</Text>
              <KurdishText style={styles.contentText}>
                چالاکیە مشکووکەکان
              </KurdishText>
            </View>
            <View style={styles.contentItem}>
              <Text style={styles.contentBullet}>•</Text>
              <KurdishText style={styles.contentText}>
                ئاگاداریەکانی ئاسایش
              </KurdishText>
            </View>
            <View style={styles.contentItem}>
              <Text style={styles.contentBullet}>•</Text>
              <KurdishText style={styles.contentText}>
                بەکارهێنەرە چالاکەکان
              </KurdishText>
            </View>
            <View style={styles.contentItem}>
              <Text style={styles.contentBullet}>•</Text>
              <KurdishText style={styles.contentText}>
                تۆماری IP
              </KurdishText>
            </View>
          </View>
        </View>
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
  typeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  typeCardSelected: {
    borderColor: '#1e40af',
    backgroundColor: '#eff6ff',
  },
  typeContent: {
    marginLeft: 12,
    flex: 1,
  },
  typeTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#6b7280',
    marginBottom: 4,
  },
  typeTitleSelected: {
    color: '#1e40af',
  },
  typeSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#111827',
  },
  generateButton: {
    backgroundColor: '#1e40af',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  actionButtonText: {
    color: '#1e40af',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  contentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  contentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  contentBullet: {
    fontSize: 20,
    color: '#1e40af',
    marginRight: 12,
  },
  contentText: {
    fontSize: 14,
    color: '#6b7280',
  },
});
