import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { 
  Share2, 
  Download, 
  Mail, 
  MessageCircle, 
  Send, 
  Phone,
  FileText,
  Users,
  DollarSign,
  Calendar,
  Clock,
  Settings,
  TrendingUp,
  Database,
  CheckCircle,
  XCircle,
} from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import { KurdishText } from '@/components/KurdishText';

type SharePlatform = 'email' | 'whatsapp' | 'telegram' | 'viber';
type ContentType = 'report' | 'backup' | 'debt' | 'payment' | 'customer' | 'employee';
type DownloadFormat = 'pdf' | 'excel';

export default function SharingManagementScreen() {
  const insets = useSafeAreaInsets();
  const [selectedTab, setSelectedTab] = useState<'share' | 'download' | 'scheduled' | 'history'>('share');
  const [selectedPlatform, setSelectedPlatform] = useState<SharePlatform>('email');
  const [selectedContent, setSelectedContent] = useState<ContentType>('report');
  const [selectedFormat, setSelectedFormat] = useState<DownloadFormat>('pdf');
  const [recipients, setRecipients] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const shareStatsQuery = trpc.sharing.stats.useQuery();
  const shareHistoryQuery = trpc.sharing.history.useQuery({ limit: 20 });
  const scheduledSharesQuery = trpc.sharing.scheduled.getAll.useQuery();

  const shareReportViaEmailMutation = trpc.sharing.reports.shareViaEmail.useMutation();
  const shareReportViaWhatsAppMutation = trpc.sharing.reports.shareViaWhatsApp.useMutation();
  const shareReportViaTelegramMutation = trpc.sharing.reports.shareViaTelegram.useMutation();
  const shareReportViaViberMutation = trpc.sharing.reports.shareViaViber.useMutation();

  const downloadReportPDFMutation = trpc.sharing.downloads.reportPDF.useMutation();
  const downloadReportExcelMutation = trpc.sharing.downloads.reportExcel.useMutation();

  const handleShare = async () => {
    if (!recipients.trim()) {
      Alert.alert('هەڵە', 'تکایە وەرگر زیاد بکە');
      return;
    }

    const recipientList = recipients.split(',').map(r => r.trim());

    try {
      if (selectedPlatform === 'email') {
        await shareReportViaEmailMutation.mutateAsync({
          reportType: selectedContent,
          recipients: recipientList,
          subject: subject || 'ڕاپۆرتی سیستەم',
          format: selectedFormat,
          data: {},
        });
      } else if (selectedPlatform === 'whatsapp') {
        await shareReportViaWhatsAppMutation.mutateAsync({
          reportType: selectedContent,
          recipients: recipientList,
          message: message || 'ڕاپۆرتی سیستەم',
          format: selectedFormat,
          data: {},
        });
      } else if (selectedPlatform === 'telegram') {
        await shareReportViaTelegramMutation.mutateAsync({
          reportType: selectedContent,
          chatId: recipientList[0],
          message: message || 'ڕاپۆرتی سیستەم',
          format: selectedFormat,
          data: {},
        });
      } else if (selectedPlatform === 'viber') {
        await shareReportViaViberMutation.mutateAsync({
          reportType: selectedContent,
          recipients: recipientList,
          message: message || 'ڕاپۆرتی سیستەم',
          format: selectedFormat,
          data: {},
        });
      }

      Alert.alert('سەرکەوتوو', 'هاوبەشکردن سەرکەوتوو بوو');
      setRecipients('');
      setSubject('');
      setMessage('');
      shareHistoryQuery.refetch();
    } catch {
      Alert.alert('هەڵە', 'کێشەیەک ڕوویدا لە هاوبەشکردن');
    }
  };

  const handleDownload = async () => {
    try {
      if (selectedFormat === 'pdf') {
        const result = await downloadReportPDFMutation.mutateAsync({
          reportType: selectedContent,
          data: {},
        });
        Alert.alert('سەرکەوتوو', `فایل دابەزێنرا: ${result.url}`);
      } else {
        const result = await downloadReportExcelMutation.mutateAsync({
          reportType: selectedContent,
          data: {},
        });
        Alert.alert('سەرکەوتوو', `فایل دابەزێنرا: ${result.url}`);
      }
    } catch {
      Alert.alert('هەڵە', 'کێشەیەک ڕوویدا لە دابەزاندن');
    }
  };

  const renderPlatformButton = (platform: SharePlatform, icon: React.ReactNode, label: string) => (
    <TouchableOpacity
      key={platform}
      style={[
        styles.platformButton,
        selectedPlatform === platform && styles.platformButtonActive,
      ]}
      onPress={() => setSelectedPlatform(platform)}
    >
      <View style={styles.iconContainer}>{icon}</View>
      <KurdishText style={styles.platformButtonText}>{label}</KurdishText>
    </TouchableOpacity>
  );

  const renderContentButton = (content: ContentType, icon: React.ReactNode, label: string) => (
    <TouchableOpacity
      key={content}
      style={[
        styles.contentButton,
        selectedContent === content && styles.contentButtonActive,
      ]}
      onPress={() => setSelectedContent(content)}
    >
      <View style={styles.iconContainer}>{icon}</View>
      <KurdishText style={styles.contentButtonText}>{label}</KurdishText>
    </TouchableOpacity>
  );

  const renderShareTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <KurdishText style={styles.sectionTitle}>هەڵبژاردنی پلاتفۆرم</KurdishText>
        <View style={styles.platformGrid}>
          {renderPlatformButton('email', <Mail size={24} color="#007AFF" />, 'ئیمەیڵ')}
          {renderPlatformButton('whatsapp', <MessageCircle size={24} color="#25D366" />, 'واتساپ')}
          {renderPlatformButton('telegram', <Send size={24} color="#0088cc" />, 'تلگرام')}
          {renderPlatformButton('viber', <Phone size={24} color="#7360f2" />, 'ڤایبەر')}
        </View>
      </View>

      <View style={styles.section}>
        <KurdishText style={styles.sectionTitle}>جۆری ناوەڕۆک</KurdishText>
        <View style={styles.contentGrid}>
          {renderContentButton('report', <FileText size={20} color="#007AFF" />, 'ڕاپۆرت')}
          {renderContentButton('backup', <Database size={20} color="#34C759" />, 'باکاپ')}
          {renderContentButton('debt', <DollarSign size={20} color="#FF3B30" />, 'قەرز')}
          {renderContentButton('payment', <TrendingUp size={20} color="#34C759" />, 'پارەدان')}
          {renderContentButton('customer', <Users size={20} color="#007AFF" />, 'کڕیار')}
          {renderContentButton('employee', <Users size={20} color="#FF9500" />, 'کارمەند')}
        </View>
      </View>

      <View style={styles.section}>
        <KurdishText style={styles.sectionTitle}>فۆرمات</KurdishText>
        <View style={styles.formatButtons}>
          <TouchableOpacity
            style={[styles.formatButton, selectedFormat === 'pdf' && styles.formatButtonActive]}
            onPress={() => setSelectedFormat('pdf')}
          >
            <KurdishText style={styles.formatButtonText}>PDF</KurdishText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.formatButton, selectedFormat === 'excel' && styles.formatButtonActive]}
            onPress={() => setSelectedFormat('excel')}
          >
            <KurdishText style={styles.formatButtonText}>Excel</KurdishText>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <KurdishText style={styles.sectionTitle}>وەرگرەکان</KurdishText>
        <TextInput
          style={styles.input}
          placeholder={selectedPlatform === 'email' ? 'admin@example.com, user@example.com' : '+9647501234567, +9647509876543'}
          value={recipients}
          onChangeText={setRecipients}
          multiline
        />
      </View>

      {selectedPlatform === 'email' && (
        <View style={styles.section}>
          <KurdishText style={styles.sectionTitle}>بابەت</KurdishText>
          <TextInput
            style={styles.input}
            placeholder="بابەتی ئیمەیڵ"
            value={subject}
            onChangeText={setSubject}
          />
        </View>
      )}

      {selectedPlatform !== 'email' && (
        <View style={styles.section}>
          <KurdishText style={styles.sectionTitle}>پەیام</KurdishText>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="پەیامی هاوبەشکردن"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
          />
        </View>
      )}

      <TouchableOpacity
        style={styles.shareButton}
        onPress={handleShare}
        disabled={shareReportViaEmailMutation.isPending}
      >
        {shareReportViaEmailMutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Share2 size={20} color="#fff" />
            <KurdishText style={styles.shareButtonText}>هاوبەشکردن</KurdishText>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  const renderDownloadTab = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.section}>
        <KurdishText style={styles.sectionTitle}>جۆری ناوەڕۆک</KurdishText>
        <View style={styles.contentGrid}>
          {renderContentButton('report', <FileText size={20} color="#007AFF" />, 'ڕاپۆرت')}
          {renderContentButton('debt', <DollarSign size={20} color="#FF3B30" />, 'قەرز')}
          {renderContentButton('payment', <TrendingUp size={20} color="#34C759" />, 'پارەدان')}
          {renderContentButton('customer', <Users size={20} color="#007AFF" />, 'کڕیار')}
          {renderContentButton('employee', <Users size={20} color="#FF9500" />, 'کارمەند')}
        </View>
      </View>

      <View style={styles.section}>
        <KurdishText style={styles.sectionTitle}>فۆرمات</KurdishText>
        <View style={styles.formatButtons}>
          <TouchableOpacity
            style={[styles.formatButton, selectedFormat === 'pdf' && styles.formatButtonActive]}
            onPress={() => setSelectedFormat('pdf')}
          >
            <KurdishText style={styles.formatButtonText}>PDF</KurdishText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.formatButton, selectedFormat === 'excel' && styles.formatButtonActive]}
            onPress={() => setSelectedFormat('excel')}
          >
            <KurdishText style={styles.formatButtonText}>Excel</KurdishText>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.downloadButton}
        onPress={handleDownload}
        disabled={downloadReportPDFMutation.isPending || downloadReportExcelMutation.isPending}
      >
        {(downloadReportPDFMutation.isPending || downloadReportExcelMutation.isPending) ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Download size={20} color="#fff" />
            <KurdishText style={styles.downloadButtonText}>دابەزاندن</KurdishText>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.quickDownloads}>
        <KurdishText style={styles.sectionTitle}>دابەزاندنی خێرا</KurdishText>
        <TouchableOpacity style={styles.quickDownloadItem}>
          <FileText size={20} color="#007AFF" />
          <KurdishText style={styles.quickDownloadText}>ڕاپۆرتی مانگانە (PDF)</KurdishText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickDownloadItem}>
          <FileText size={20} color="#34C759" />
          <KurdishText style={styles.quickDownloadText}>ڕاپۆرتی ساڵانە (Excel)</KurdishText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickDownloadItem}>
          <DollarSign size={20} color="#FF3B30" />
          <KurdishText style={styles.quickDownloadText}>تۆماری قەرزەکان (PDF)</KurdishText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickDownloadItem}>
          <TrendingUp size={20} color="#34C759" />
          <KurdishText style={styles.quickDownloadText}>تۆماری پارەدانەکان (Excel)</KurdishText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderScheduledTab = () => (
    <ScrollView style={styles.tabContent}>
      {scheduledSharesQuery.isLoading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <>
          <TouchableOpacity
            style={styles.addScheduleButton}
            onPress={() => Alert.alert('زیادکردن', 'تایبەتمەندی زیادکردنی هاوبەشکردنی خۆکار')}
          >
            <Calendar size={20} color="#fff" />
            <KurdishText style={styles.addScheduleButtonText}>زیادکردنی هاوبەشکردنی خۆکار</KurdishText>
          </TouchableOpacity>

          {scheduledSharesQuery.data?.scheduled.map((item) => (
            <View key={item.id} style={styles.scheduledItem}>
              <View style={styles.scheduledHeader}>
                <KurdishText style={styles.scheduledTitle}>
                  {item.contentType === 'report' ? 'ڕاپۆرت' : 'باکاپ'}
                </KurdishText>
                <View style={[styles.statusBadge, item.enabled ? styles.statusActive : styles.statusInactive]}>
                  <KurdishText style={styles.statusText}>
                    {item.enabled ? 'چالاک' : 'ناچالاک'}
                  </KurdishText>
                </View>
              </View>
              <View style={styles.scheduledDetails}>
                <View style={styles.scheduledDetail}>
                  <Clock size={16} color="#666" />
                  <KurdishText style={styles.scheduledDetailText}>{item.frequency}</KurdishText>
                </View>
                <View style={styles.scheduledDetail}>
                  <Share2 size={16} color="#666" />
                  <KurdishText style={styles.scheduledDetailText}>{item.platform}</KurdishText>
                </View>
                <View style={styles.scheduledDetail}>
                  <Users size={16} color="#666" />
                  <KurdishText style={styles.scheduledDetailText}>
                    {item.recipients.length} وەرگر
                  </KurdishText>
                </View>
              </View>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );

  const renderHistoryTab = () => (
    <ScrollView style={styles.tabContent}>
      {shareHistoryQuery.isLoading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <KurdishText style={styles.statValue}>{shareStatsQuery.data?.totalShares || 0}</KurdishText>
              <KurdishText style={styles.statLabel}>کۆی هاوبەشکردن</KurdishText>
            </View>
            <View style={styles.statCard}>
              <KurdishText style={styles.statValue}>{shareStatsQuery.data?.sharesByPlatform.email || 0}</KurdishText>
              <KurdishText style={styles.statLabel}>ئیمەیڵ</KurdishText>
            </View>
            <View style={styles.statCard}>
              <KurdishText style={styles.statValue}>{shareStatsQuery.data?.sharesByPlatform.whatsapp || 0}</KurdishText>
              <KurdishText style={styles.statLabel}>واتساپ</KurdishText>
            </View>
            <View style={styles.statCard}>
              <KurdishText style={styles.statValue}>{shareStatsQuery.data?.sharesByPlatform.telegram || 0}</KurdishText>
              <KurdishText style={styles.statLabel}>تلگرام</KurdishText>
            </View>
          </View>

          <KurdishText style={styles.sectionTitle}>مێژووی هاوبەشکردن</KurdishText>
          {shareHistoryQuery.data?.history.map((item) => (
            <View key={item.id} style={styles.historyItem}>
              <View style={styles.historyHeader}>
                <View style={styles.historyIcon}>
                  {item.platform === 'email' ? <Mail size={20} color="#007AFF" /> :
                   item.platform === 'whatsapp' ? <MessageCircle size={20} color="#25D366" /> :
                   item.platform === 'telegram' ? <Send size={20} color="#0088cc" /> :
                   item.platform === 'viber' ? <Phone size={20} color="#7360f2" /> :
                   <Share2 size={20} color="#666" />}
                </View>
                <View style={styles.historyInfo}>
                  <KurdishText style={styles.historyTitle}>{item.contentType}</KurdishText>
                  <KurdishText style={styles.historySubtitle}>
                    {item.recipients.join(', ')}
                  </KurdishText>
                </View>
                {item.status === 'sent' ? (
                  <CheckCircle size={20} color="#34C759" />
                ) : (
                  <XCircle size={20} color="#FF3B30" />
                )}
              </View>
              <KurdishText style={styles.historyDate}>
                {new Date(item.sentAt).toLocaleString('ku')}
              </KurdishText>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <Stack.Screen
        options={{
          title: 'بەڕێوەبردنی هاوبەشکردن',
          headerRight: () => (
            <TouchableOpacity onPress={() => Alert.alert('ڕێکخستنەکان', 'تایبەتمەندی ڕێکخستنەکان')}>
              <Settings size={24} color="#007AFF" />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'share' && styles.tabActive]}
          onPress={() => setSelectedTab('share')}
        >
          <Share2 size={20} color={selectedTab === 'share' ? '#007AFF' : '#666'} />
          <KurdishText style={[styles.tabText, selectedTab === 'share' && styles.tabTextActive]}>
            هاوبەشکردن
          </KurdishText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'download' && styles.tabActive]}
          onPress={() => setSelectedTab('download')}
        >
          <Download size={20} color={selectedTab === 'download' ? '#007AFF' : '#666'} />
          <KurdishText style={[styles.tabText, selectedTab === 'download' && styles.tabTextActive]}>
            دابەزاندن
          </KurdishText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'scheduled' && styles.tabActive]}
          onPress={() => setSelectedTab('scheduled')}
        >
          <Calendar size={20} color={selectedTab === 'scheduled' ? '#007AFF' : '#666'} />
          <KurdishText style={[styles.tabText, selectedTab === 'scheduled' && styles.tabTextActive]}>
            خۆکار
          </KurdishText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'history' && styles.tabActive]}
          onPress={() => setSelectedTab('history')}
        >
          <Clock size={20} color={selectedTab === 'history' ? '#007AFF' : '#666'} />
          <KurdishText style={[styles.tabText, selectedTab === 'history' && styles.tabTextActive]}>
            مێژوو
          </KurdishText>
        </TouchableOpacity>
      </View>

      {selectedTab === 'share' && renderShareTab()}
      {selectedTab === 'download' && renderDownloadTab()}
      {selectedTab === 'scheduled' && renderScheduledTab()}
      {selectedTab === 'history' && renderHistoryTab()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  tabTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
  },
  platformGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  platformButton: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  platformButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  platformButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  contentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  contentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  contentButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  contentButtonText: {
    fontSize: 13,
  },
  formatButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  formatButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  formatButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  formatButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 12,
    fontSize: 14,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  quickDownloads: {
    marginTop: 24,
  },
  quickDownloadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
  },
  quickDownloadText: {
    fontSize: 14,
    flex: 1,
  },
  addScheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  addScheduleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scheduledItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  scheduledHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  scheduledTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#E8F5E9',
  },
  statusInactive: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  scheduledDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  scheduledDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scheduledDetailText: {
    fontSize: 13,
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
  },
  historyItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  historySubtitle: {
    fontSize: 13,
    color: '#666',
  },
  historyDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  loader: {
    marginTop: 40,
  },
  iconContainer: {
    flexDirection: 'row',
  },
});
