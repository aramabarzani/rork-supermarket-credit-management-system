import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft,
  FileSpreadsheet,
  Cloud,
  Share2,
  Mail,
  MessageCircle,
  Send,
  Database,
  Settings,
  CheckCircle,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { GradientCard } from '@/components/GradientCard';
import { useIntegration } from '@/hooks/integration-context';

export default function IntegrationSettingsScreen() {
  const router = useRouter();
  const { settings, updateSettings } = useIntegration();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const sections = [
    {
      id: 'excel',
      icon: FileSpreadsheet,
      title: 'هاوبەشی Excel',
      subtitle: 'هاوبەشکردنی داتا بە Excel',
      color: '#10B981',
    },
    {
      id: 'cloud',
      icon: Cloud,
      title: 'هاوبەشی هەور',
      subtitle: 'Google Drive، Dropbox، OneDrive',
      color: '#3B82F6',
    },
    {
      id: 'email',
      icon: Mail,
      title: 'هاوبەشی ئیمەیڵ',
      subtitle: 'ناردنی ڕاپۆرت بە ئیمەیڵ',
      color: '#EF4444',
    },
    {
      id: 'whatsapp',
      icon: MessageCircle,
      title: 'هاوبەشی واتساپ',
      subtitle: 'ناردنی ئاگاداری بە واتساپ',
      color: '#10B981',
    },
    {
      id: 'telegram',
      icon: Send,
      title: 'هاوبەشی تێلێگرام',
      subtitle: 'ناردنی ڕاپۆرت بە تێلێگرام',
      color: '#0088CC',
    },
    {
      id: 'sms',
      icon: MessageCircle,
      title: 'هاوبەشی SMS',
      subtitle: 'ناردنی ئاگاداری بە SMS',
      color: '#F59E0B',
    },
    {
      id: 'sheets',
      icon: Database,
      title: 'Google Sheets',
      subtitle: 'هاوبەشکردنی خۆکار بە Google Sheets',
      color: '#10B981',
    },
  ];

  const renderExcelSettings = () => (
    <GradientCard>
      <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
        ڕێکخستنی Excel
      </KurdishText>
      
      <View style={styles.switchRow}>
        <KurdishText variant="body" color="#1F2937">
          چالاککردنی هاوبەشی Excel
        </KurdishText>
        <Switch
          value={settings.excel.enabled}
          onValueChange={(value) => updateSettings({
            excel: { ...settings.excel, enabled: value }
          })}
        />
      </View>

      <View style={styles.switchRow}>
        <KurdishText variant="body" color="#1F2937">
          هاوبەشی خۆکار
        </KurdishText>
        <Switch
          value={settings.excel.autoExport}
          onValueChange={(value) => updateSettings({
            excel: { ...settings.excel, autoExport: value }
          })}
          disabled={!settings.excel.enabled}
        />
      </View>

      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: '#10B981' }]}
        onPress={() => Alert.alert('Excel', 'هاوبەشکردنی داتا بە Excel')}
      >
        <FileSpreadsheet size={20} color="white" />
        <KurdishText variant="body" color="white">
          هاوبەشی ئێستا
        </KurdishText>
      </TouchableOpacity>
    </GradientCard>
  );

  const renderCloudSettings = () => (
    <View style={{ gap: 12 }}>
      <GradientCard>
        <View style={styles.cloudHeader}>
          <Cloud size={24} color="#3B82F6" />
          <KurdishText variant="subtitle" color="#1F2937">
            Google Drive
          </KurdishText>
        </View>
        
        <View style={styles.switchRow}>
          <KurdishText variant="body" color="#1F2937">
            چالاککردن
          </KurdishText>
          <Switch
            value={settings.googleDrive.enabled}
            onValueChange={(value) => updateSettings({
              googleDrive: { ...settings.googleDrive, enabled: value }
            })}
          />
        </View>

        <View style={styles.switchRow}>
          <KurdishText variant="body" color="#1F2937">
            پارێزگاری خۆکار
          </KurdishText>
          <Switch
            value={settings.googleDrive.autoBackup}
            onValueChange={(value) => updateSettings({
              googleDrive: { ...settings.googleDrive, autoBackup: value }
            })}
            disabled={!settings.googleDrive.enabled}
          />
        </View>

        {settings.googleDrive.enabled && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#3B82F6' }]}
            onPress={() => Alert.alert('Google Drive', 'پەیوەندیکردن بە Google Drive')}
          >
            <Settings size={20} color="white" />
            <KurdishText variant="body" color="white">
              پەیوەندیکردن
            </KurdishText>
          </TouchableOpacity>
        )}
      </GradientCard>

      <GradientCard>
        <View style={styles.cloudHeader}>
          <Cloud size={24} color="#0061FF" />
          <KurdishText variant="subtitle" color="#1F2937">
            Dropbox
          </KurdishText>
        </View>
        
        <View style={styles.switchRow}>
          <KurdishText variant="body" color="#1F2937">
            چالاککردن
          </KurdishText>
          <Switch
            value={settings.dropbox.enabled}
            onValueChange={(value) => updateSettings({
              dropbox: { ...settings.dropbox, enabled: value }
            })}
          />
        </View>

        <View style={styles.switchRow}>
          <KurdishText variant="body" color="#1F2937">
            پارێزگاری خۆکار
          </KurdishText>
          <Switch
            value={settings.dropbox.autoBackup}
            onValueChange={(value) => updateSettings({
              dropbox: { ...settings.dropbox, autoBackup: value }
            })}
            disabled={!settings.dropbox.enabled}
          />
        </View>

        {settings.dropbox.enabled && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#0061FF' }]}
            onPress={() => Alert.alert('Dropbox', 'پەیوەندیکردن بە Dropbox')}
          >
            <Settings size={20} color="white" />
            <KurdishText variant="body" color="white">
              پەیوەندیکردن
            </KurdishText>
          </TouchableOpacity>
        )}
      </GradientCard>

      <GradientCard>
        <View style={styles.cloudHeader}>
          <Cloud size={24} color="#0078D4" />
          <KurdishText variant="subtitle" color="#1F2937">
            OneDrive
          </KurdishText>
        </View>
        
        <View style={styles.switchRow}>
          <KurdishText variant="body" color="#1F2937">
            چالاککردن
          </KurdishText>
          <Switch
            value={settings.onedrive.enabled}
            onValueChange={(value) => updateSettings({
              onedrive: { ...settings.onedrive, enabled: value }
            })}
          />
        </View>

        <View style={styles.switchRow}>
          <KurdishText variant="body" color="#1F2937">
            پارێزگاری خۆکار
          </KurdishText>
          <Switch
            value={settings.onedrive.autoBackup}
            onValueChange={(value) => updateSettings({
              onedrive: { ...settings.onedrive, autoBackup: value }
            })}
            disabled={!settings.onedrive.enabled}
          />
        </View>

        {settings.onedrive.enabled && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#0078D4' }]}
            onPress={() => Alert.alert('OneDrive', 'پەیوەندیکردن بە OneDrive')}
          >
            <Settings size={20} color="white" />
            <KurdishText variant="body" color="white">
              پەیوەندیکردن
            </KurdishText>
          </TouchableOpacity>
        )}
      </GradientCard>
    </View>
  );

  const renderEmailSettings = () => (
    <GradientCard>
      <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
        ڕێکخستنی ئیمەیڵ
      </KurdishText>
      
      <View style={styles.switchRow}>
        <KurdishText variant="body" color="#1F2937">
          چالاککردنی ئیمەیڵ
        </KurdishText>
        <Switch
          value={settings.email.enabled}
          onValueChange={(value) => updateSettings({
            email: { ...settings.email, enabled: value }
          })}
        />
      </View>

      <View style={styles.switchRow}>
        <KurdishText variant="body" color="#1F2937">
          ناردنی خۆکاری ڕاپۆرت
        </KurdishText>
        <Switch
          value={settings.email.autoSendReports}
          onValueChange={(value) => updateSettings({
            email: { ...settings.email, autoSendReports: value }
          })}
          disabled={!settings.email.enabled}
        />
      </View>

      {settings.email.enabled && (
        <>
          <View style={styles.inputGroup}>
            <KurdishText variant="body" color="#374151" style={styles.inputLabel}>
              ئیمەیڵی وەرگر
            </KurdishText>
            <TextInput
              style={styles.textInput}
              placeholder="example@email.com"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <KurdishText variant="body" color="#374151" style={styles.inputLabel}>
              ماوەی ناردن
            </KurdishText>
            {['daily', 'weekly', 'monthly'].map((freq) => (
              <TouchableOpacity
                key={freq}
                style={[
                  styles.optionRow,
                  settings.email.frequency === freq && styles.selectedOption
                ]}
                onPress={() => updateSettings({
                  email: { ...settings.email, frequency: freq as any }
                })}
              >
                <KurdishText variant="body" color="#1F2937">
                  {freq === 'daily' ? 'ڕۆژانە' : freq === 'weekly' ? 'هەفتانە' : 'مانگانە'}
                </KurdishText>
                <View style={[
                  styles.radio,
                  settings.email.frequency === freq && styles.radioSelected
                ]} />
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </GradientCard>
  );

  const renderWhatsAppSettings = () => (
    <GradientCard>
      <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
        ڕێکخستنی واتساپ
      </KurdishText>
      
      <View style={styles.switchRow}>
        <KurdishText variant="body" color="#1F2937">
          چالاککردنی واتساپ
        </KurdishText>
        <Switch
          value={settings.whatsapp.enabled}
          onValueChange={(value) => updateSettings({
            whatsapp: { ...settings.whatsapp, enabled: value }
          })}
        />
      </View>

      <View style={styles.switchRow}>
        <KurdishText variant="body" color="#1F2937">
          ناردنی خۆکاری ئاگاداری
        </KurdishText>
        <Switch
          value={settings.whatsapp.autoSendNotifications}
          onValueChange={(value) => updateSettings({
            whatsapp: { ...settings.whatsapp, autoSendNotifications: value }
          })}
          disabled={!settings.whatsapp.enabled}
        />
      </View>

      {settings.whatsapp.enabled && (
        <View style={styles.inputGroup}>
          <KurdishText variant="body" color="#374151" style={styles.inputLabel}>
            ژمارەی بزنس
          </KurdishText>
          <TextInput
            style={styles.textInput}
            placeholder="07501234567"
            keyboardType="phone-pad"
            value={settings.whatsapp.businessNumber || ''}
            onChangeText={(text) => updateSettings({
              whatsapp: { ...settings.whatsapp, businessNumber: text }
            })}
          />
        </View>
      )}

      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: '#10B981' }]}
        onPress={() => Alert.alert('واتساپ', 'تاقیکردنەوەی پەیوەندی')}
      >
        <CheckCircle size={20} color="white" />
        <KurdishText variant="body" color="white">
          تاقیکردنەوە
        </KurdishText>
      </TouchableOpacity>
    </GradientCard>
  );

  const renderTelegramSettings = () => (
    <GradientCard>
      <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
        ڕێکخستنی تێلێگرام
      </KurdishText>
      
      <View style={styles.switchRow}>
        <KurdishText variant="body" color="#1F2937">
          چالاککردنی تێلێگرام
        </KurdishText>
        <Switch
          value={settings.telegram.enabled}
          onValueChange={(value) => updateSettings({
            telegram: { ...settings.telegram, enabled: value }
          })}
        />
      </View>

      <View style={styles.switchRow}>
        <KurdishText variant="body" color="#1F2937">
          ناردنی خۆکاری ڕاپۆرت
        </KurdishText>
        <Switch
          value={settings.telegram.autoSendReports}
          onValueChange={(value) => updateSettings({
            telegram: { ...settings.telegram, autoSendReports: value }
          })}
          disabled={!settings.telegram.enabled}
        />
      </View>

      {settings.telegram.enabled && (
        <>
          <View style={styles.inputGroup}>
            <KurdishText variant="body" color="#374151" style={styles.inputLabel}>
              Bot Token
            </KurdishText>
            <TextInput
              style={styles.textInput}
              placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
              value={settings.telegram.botToken || ''}
              onChangeText={(text) => updateSettings({
                telegram: { ...settings.telegram, botToken: text }
              })}
            />
          </View>

          <View style={styles.inputGroup}>
            <KurdishText variant="body" color="#374151" style={styles.inputLabel}>
              Chat ID
            </KurdishText>
            <TextInput
              style={styles.textInput}
              placeholder="-1001234567890"
              value={settings.telegram.chatId || ''}
              onChangeText={(text) => updateSettings({
                telegram: { ...settings.telegram, chatId: text }
              })}
            />
          </View>
        </>
      )}

      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: '#0088CC' }]}
        onPress={() => Alert.alert('تێلێگرام', 'تاقیکردنەوەی پەیوەندی')}
      >
        <CheckCircle size={20} color="white" />
        <KurdishText variant="body" color="white">
          تاقیکردنەوە
        </KurdishText>
      </TouchableOpacity>
    </GradientCard>
  );

  const renderSMSSettings = () => (
    <GradientCard>
      <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
        ڕێکخستنی SMS
      </KurdishText>
      
      <View style={styles.switchRow}>
        <KurdishText variant="body" color="#1F2937">
          چالاککردنی SMS
        </KurdishText>
        <Switch
          value={settings.sms.enabled}
          onValueChange={(value) => updateSettings({
            sms: { ...settings.sms, enabled: value }
          })}
        />
      </View>

      <View style={styles.switchRow}>
        <KurdishText variant="body" color="#1F2937">
          ناردنی خۆکاری ئاگاداری
        </KurdishText>
        <Switch
          value={settings.sms.autoSendAlerts}
          onValueChange={(value) => updateSettings({
            sms: { ...settings.sms, autoSendAlerts: value }
          })}
          disabled={!settings.sms.enabled}
        />
      </View>

      {settings.sms.enabled && (
        <>
          <View style={styles.inputGroup}>
            <KurdishText variant="body" color="#374151" style={styles.inputLabel}>
              دابینکەر
            </KurdishText>
            <TextInput
              style={styles.textInput}
              placeholder="Twilio, Nexmo, etc."
              value={settings.sms.provider || ''}
              onChangeText={(text) => updateSettings({
                sms: { ...settings.sms, provider: text }
              })}
            />
          </View>

          <View style={styles.inputGroup}>
            <KurdishText variant="body" color="#374151" style={styles.inputLabel}>
              API Key
            </KurdishText>
            <TextInput
              style={styles.textInput}
              placeholder="API Key"
              secureTextEntry
              value={settings.sms.apiKey || ''}
              onChangeText={(text) => updateSettings({
                sms: { ...settings.sms, apiKey: text }
              })}
            />
          </View>
        </>
      )}
    </GradientCard>
  );

  const renderGoogleSheetsSettings = () => (
    <GradientCard>
      <KurdishText variant="subtitle" color="#1F2937" style={styles.sectionTitle}>
        ڕێکخستنی Google Sheets
      </KurdishText>
      
      <View style={styles.switchRow}>
        <KurdishText variant="body" color="#1F2937">
          چالاککردن
        </KurdishText>
        <Switch
          value={settings.googleSheets.enabled}
          onValueChange={(value) => updateSettings({
            googleSheets: { ...settings.googleSheets, enabled: value }
          })}
        />
      </View>

      <View style={styles.switchRow}>
        <KurdishText variant="body" color="#1F2937">
          هاوبەشی خۆکار
        </KurdishText>
        <Switch
          value={settings.googleSheets.autoSync}
          onValueChange={(value) => updateSettings({
            googleSheets: { ...settings.googleSheets, autoSync: value }
          })}
          disabled={!settings.googleSheets.enabled}
        />
      </View>

      {settings.googleSheets.enabled && (
        <>
          <View style={styles.inputGroup}>
            <KurdishText variant="body" color="#374151" style={styles.inputLabel}>
              Spreadsheet ID
            </KurdishText>
            <TextInput
              style={styles.textInput}
              placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
              value={settings.googleSheets.spreadsheetId || ''}
              onChangeText={(text) => updateSettings({
                googleSheets: { ...settings.googleSheets, spreadsheetId: text }
              })}
            />
          </View>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#10B981' }]}
            onPress={() => Alert.alert('Google Sheets', 'پەیوەندیکردن بە Google Sheets')}
          >
            <Settings size={20} color="white" />
            <KurdishText variant="body" color="white">
              پەیوەندیکردن
            </KurdishText>
          </TouchableOpacity>
        </>
      )}
    </GradientCard>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <KurdishText variant="title" color="#1F2937">
          ڕێکخستنی هەموهانگکردن
        </KurdishText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {activeSection === null ? (
          <>
            {sections.map((section) => (
              <TouchableOpacity
                key={section.id}
                onPress={() => setActiveSection(section.id)}
                style={styles.menuItem}
              >
                <GradientCard colors={[section.color, section.color]} intensity="light">
                  <View style={styles.menuContent}>
                    <View style={styles.menuLeft}>
                      <View style={[styles.iconContainer, { backgroundColor: section.color + '20' }]}>
                        <section.icon size={24} color={section.color} />
                      </View>
                      <View>
                        <KurdishText variant="body" color="#1F2937">
                          {section.title}
                        </KurdishText>
                        <KurdishText variant="caption" color="#6B7280">
                          {section.subtitle}
                        </KurdishText>
                      </View>
                    </View>
                  </View>
                </GradientCard>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <View style={styles.section}>
            <TouchableOpacity 
              onPress={() => setActiveSection(null)}
              style={styles.backToMenu}
            >
              <ArrowLeft size={20} color="#6B7280" />
              <KurdishText variant="body" color="#6B7280">
                گەڕانەوە بۆ لیست
              </KurdishText>
            </TouchableOpacity>

            {activeSection === 'excel' && renderExcelSettings()}
            {activeSection === 'cloud' && renderCloudSettings()}
            {activeSection === 'email' && renderEmailSettings()}
            {activeSection === 'whatsapp' && renderWhatsAppSettings()}
            {activeSection === 'telegram' && renderTelegramSettings()}
            {activeSection === 'sms' && renderSMSSettings()}
            {activeSection === 'sheets' && renderGoogleSheetsSettings()}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 12,
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
  backToMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingVertical: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  inputGroup: {
    marginTop: 16,
  },
  inputLabel: {
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: 'white',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  cloudHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: '#EBF8FF',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  radioSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#3B82F6',
  },
});
