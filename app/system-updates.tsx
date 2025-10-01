import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Download,
  CheckCircle,
  AlertCircle,
  Settings,
  RefreshCw,
} from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';

export default function SystemUpdatesScreen() {
  const insets = useSafeAreaInsets();
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [updates] = useState<any[]>([]);
  const [settings, setSettings] = useState({
    autoCheck: false,
    autoDownload: false,
    autoInstall: false,
    notifyAdmin: false,
  });

  const handleToggleSetting = async (
    key: 'autoCheck' | 'autoDownload' | 'autoInstall' | 'notifyAdmin',
    value: boolean
  ) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleDownload = async (updateId: string) => {
    console.log('Download update:', updateId);
  };

  const handleInstall = async (updateId: string) => {
    console.log('Install update:', updateId);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen
        options={{
          title: 'نوێکردنەوەی سیستەم',
          headerStyle: { backgroundColor: '#007AFF' },
          headerTintColor: '#FFF',
          headerRight: () => (
            <TouchableOpacity onPress={() => setShowSettings(!showSettings)}>
              <Settings size={24} color="#FFF" style={{ marginRight: 16 }} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>


          {showSettings && (
            <View style={styles.settingsCard}>
              <KurdishText style={styles.cardTitle}>
                ڕێکخستنەکانی نوێکردنەوە
              </KurdishText>

              <View style={styles.settingRow}>
                <KurdishText style={styles.settingLabel}>
                  پشکنینی خۆکار
                </KurdishText>
                <Switch
                  value={settings.autoCheck}
                  onValueChange={(value) => handleToggleSetting('autoCheck', value)}
                />
              </View>

              <View style={styles.settingRow}>
                <KurdishText style={styles.settingLabel}>
                  داگرتنی خۆکار
                </KurdishText>
                <Switch
                  value={settings.autoDownload}
                  onValueChange={(value) =>
                    handleToggleSetting('autoDownload', value)
                  }
                />
              </View>

              <View style={styles.settingRow}>
                <KurdishText style={styles.settingLabel}>
                  دامەزراندنی خۆکار
                </KurdishText>
                <Switch
                  value={settings.autoInstall}
                  onValueChange={(value) =>
                    handleToggleSetting('autoInstall', value)
                  }
                />
              </View>

              <View style={styles.settingRow}>
                <KurdishText style={styles.settingLabel}>
                  ئاگاداری بەڕێوەبەر
                </KurdishText>
                <Switch
                  value={settings.notifyAdmin}
                  onValueChange={(value) =>
                    handleToggleSetting('notifyAdmin', value)
                  }
                />
              </View>
            </View>
          )}

          <View style={styles.updatesSection}>
            <KurdishText style={styles.sectionTitle}>
              نوێکردنەوەکان
            </KurdishText>

            {updates.length === 0 ? (
              <View style={styles.loadingContainer}>
                <KurdishText style={styles.emptyText}>هیچ نوێکردنەوەیەک نییە</KurdishText>
              </View>
            ) : (
              updates.map((update: any) => (
                <View key={update.id} style={styles.updateCard}>
                  <View style={styles.updateHeader}>
                    <View style={styles.updateInfo}>
                      <KurdishText style={styles.updateVersion}>
                        وەشانی {update.version}
                      </KurdishText>
                      <KurdishText style={styles.updateDate}>
                        {new Date(update.releaseDate).toLocaleDateString('ar-IQ')}
                      </KurdishText>
                    </View>
                    {getStatusIcon(update.status)}
                  </View>

                  <KurdishText style={styles.updateDescription}>
                    {update.description}
                  </KurdishText>

                  {update.features.length > 0 && (
                    <View style={styles.featuresSection}>
                      <KurdishText style={styles.featuresTitle}>
                        تایبەتمەندیە نوێکان:
                      </KurdishText>
                      {update.features.map((feature: string, index: number) => (
                        <KurdishText key={index} style={styles.featureItem}>
                          • {feature}
                        </KurdishText>
                      ))}
                    </View>
                  )}

                  {update.bugFixes.length > 0 && (
                    <View style={styles.featuresSection}>
                      <KurdishText style={styles.featuresTitle}>
                        چاککردنەوەکان:
                      </KurdishText>
                      {update.bugFixes.map((fix: string, index: number) => (
                        <KurdishText key={index} style={styles.featureItem}>
                          • {fix}
                        </KurdishText>
                      ))}
                    </View>
                  )}

                  {update.status === 'available' && (
                    <TouchableOpacity
                      style={styles.downloadButton}
                      onPress={() => handleDownload(update.id)}
                    >
                      <Download size={20} color="#FFF" />
                      <KurdishText style={styles.buttonText}>
                        داگرتن
                      </KurdishText>
                    </TouchableOpacity>
                  )}

                  {update.status === 'downloading' && (
                    <View style={styles.statusContainer}>
                      <ActivityIndicator size="small" color="#007AFF" />
                      <KurdishText style={styles.statusText}>
                        داگرتن...
                      </KurdishText>
                    </View>
                  )}

                  {update.status === 'installing' && (
                    <View style={styles.statusContainer}>
                      <ActivityIndicator size="small" color="#4CAF50" />
                      <KurdishText style={styles.statusText}>
                        دامەزراندن...
                      </KurdishText>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'installed':
      return <CheckCircle size={24} color="#4CAF50" />;
    case 'downloading':
    case 'installing':
      return <RefreshCw size={24} color="#007AFF" />;
    case 'failed':
      return <AlertCircle size={24} color="#F44336" />;
    default:
      return <Download size={24} color="#999" />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  updateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  bannerContent: {
    flex: 1,
    marginLeft: 12,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#E65100',
    marginBottom: 4,
  },
  bannerText: {
    fontSize: 14,
    color: '#F57C00',
  },
  settingsCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#333',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  updatesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#333',
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  updateCard: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  updateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  updateInfo: {
    flex: 1,
  },
  updateVersion: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#333',
    marginBottom: 4,
  },
  updateDate: {
    fontSize: 12,
    color: '#999',
  },
  updateDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  featuresSection: {
    marginBottom: 12,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#333',
    marginBottom: 8,
  },
  featureItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    paddingLeft: 8,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFF',
    marginLeft: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginTop: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
});
