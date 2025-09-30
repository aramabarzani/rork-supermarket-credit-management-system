import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  X, 
  Filter,
  Download,
  Trash2,
  Search,
} from 'lucide-react-native';
import { useErrorLogging } from '@/hooks/error-logging-context';
import { ErrorLog, ErrorSeverity, ErrorCategory } from '@/types/error-logging';
import { KurdishText } from '@/components/KurdishText';

const SEVERITY_COLORS = {
  minor: '#10B981',
  medium: '#F59E0B',
  critical: '#EF4444',
} as const;

const SEVERITY_ICONS = {
  minor: Info,
  medium: AlertTriangle,
  critical: AlertCircle,
} as const;

const CATEGORY_LABELS: Record<ErrorCategory, string> = {
  authentication: 'چوونەژوورەوە',
  payment: 'پارەدان',
  debt: 'قەرز',
  customer: 'کڕیار',
  employee: 'کارمەند',
  report: 'ڕاپۆرت',
  notification: 'ئاگاداری',
  system: 'سیستەم',
  network: 'تۆڕ',
  validation: 'پشکنین',
  permission: 'دەسەلات',
  database: 'بنکەی داتا',
};

export default function ErrorMonitoringScreen() {
  const router = useRouter();
  const { 
    errorLogs, 
    isLoading, 
    resolveError, 
    deleteError, 
    clearAllErrors,
    getFilteredErrors,
  } = useErrorLogging();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSeverity, setSelectedSeverity] = useState<ErrorSeverity[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ErrorCategory[]>([]);
  const [showResolved, setShowResolved] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const filteredErrors = useMemo(() => {
    return getFilteredErrors({
      searchQuery: searchQuery || undefined,
      severity: selectedSeverity.length > 0 ? selectedSeverity : undefined,
      category: selectedCategory.length > 0 ? selectedCategory : undefined,
      resolved: showResolved ? undefined : false,
    });
  }, [searchQuery, selectedSeverity, selectedCategory, showResolved, getFilteredErrors]);

  const handleResolveError = async (errorId: string) => {
    Alert.alert(
      'چارەسەری هەڵە',
      'دڵنیای لە چارەسەرکردنی ئەم هەڵەیە؟',
      [
        { text: 'پاشگەزبوونەوە', style: 'cancel' },
        {
          text: 'چارەسەر',
          onPress: async () => {
            await resolveError(errorId, 'admin', 'چارەسەرکرا لە لایەن بەڕێوەبەر');
            Alert.alert('سەرکەوتوو', 'هەڵە چارەسەرکرا');
          },
        },
      ]
    );
  };

  const handleDeleteError = async (errorId: string) => {
    Alert.alert(
      'سڕینەوەی هەڵە',
      'دڵنیای لە سڕینەوەی ئەم هەڵەیە؟',
      [
        { text: 'پاشگەزبوونەوە', style: 'cancel' },
        {
          text: 'سڕینەوە',
          style: 'destructive',
          onPress: async () => {
            await deleteError(errorId);
            Alert.alert('سەرکەوتوو', 'هەڵە سڕایەوە');
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'سڕینەوەی هەموو هەڵەکان',
      'دڵنیای لە سڕینەوەی هەموو هەڵەکان؟',
      [
        { text: 'پاشگەزبوونەوە', style: 'cancel' },
        {
          text: 'سڕینەوە',
          style: 'destructive',
          onPress: async () => {
            await clearAllErrors();
            Alert.alert('سەرکەوتوو', 'هەموو هەڵەکان سڕانەوە');
          },
        },
      ]
    );
  };

  const toggleSeverity = (severity: ErrorSeverity) => {
    setSelectedSeverity(prev =>
      prev.includes(severity)
        ? prev.filter(s => s !== severity)
        : [...prev, severity]
    );
  };



  const renderErrorCard = (error: ErrorLog) => {
    const SeverityIcon = SEVERITY_ICONS[error.severity];
    const severityColor = SEVERITY_COLORS[error.severity];

    return (
      <View key={error.id} style={[styles.errorCard, error.resolved && styles.resolvedCard]}>
        <View style={styles.errorHeader}>
          <View style={styles.errorHeaderLeft}>
            <SeverityIcon size={20} color={severityColor} />
            <KurdishText style={[styles.categoryText, { color: severityColor }]}>
              {CATEGORY_LABELS[error.category]}
            </KurdishText>
          </View>
          <View style={styles.errorHeaderRight}>
            {error.resolved ? (
              <View style={styles.resolvedBadge}>
                <CheckCircle size={16} color="#10B981" />
                <KurdishText style={styles.resolvedText}>{'چارەسەرکراو'}</KurdishText>
              </View>
            ) : (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  onPress={() => handleResolveError(error.id)}
                  style={styles.iconButton}
                >
                  <CheckCircle size={20} color="#10B981" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteError(error.id)}
                  style={styles.iconButton}
                >
                  <Trash2 size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <KurdishText style={styles.errorMessage}>{error.message}</KurdishText>

        {error.details && (
          <KurdishText style={styles.errorDetails}>{error.details}</KurdishText>
        )}

        <View style={styles.errorFooter}>
          <KurdishText style={styles.errorMeta}>
            {new Date(error.timestamp).toLocaleString('ku')}
          </KurdishText>
          {error.occurrenceCount > 1 && (
            <View style={styles.occurrenceBadge}>
              <KurdishText style={styles.occurrenceText}>
                {error.occurrenceCount}{'× دووبارەبوونەوە'}
              </KurdishText>
            </View>
          )}
        </View>

        {error.userName && (
          <KurdishText style={styles.userInfo}>
            {'بەکارهێنەر: '}{error.userName}
          </KurdishText>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Stack.Screen
          options={{
            title: 'چاودێری هەڵەکان',
            headerStyle: { backgroundColor: '#1F2937' },
            headerTintColor: '#fff',
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <KurdishText style={styles.loadingText}>{'بارکردنی هەڵەکان...'}</KurdishText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'چاودێری هەڵەکان',
          headerStyle: { backgroundColor: '#1F2937' },
          headerTintColor: '#fff',
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity
                onPress={() => Alert.alert('ڕاپۆرت', 'دابەزاندنی ڕاپۆرتی هەڵەکان')}
                style={styles.headerButton}
              >
                <Download size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowFilters(!showFilters)}
                style={styles.headerButton}
              >
                <Filter size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="گەڕان لە هەڵەکان..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterSection}>
            <KurdishText style={styles.filterLabel}>{'پلەی هەڵە:'}</KurdishText>
            <View style={styles.filterChips}>
              {(['minor', 'medium', 'critical'] as ErrorSeverity[]).map(severity => (
                <TouchableOpacity
                  key={severity}
                  onPress={() => toggleSeverity(severity)}
                  style={[
                    styles.filterChip,
                    selectedSeverity.includes(severity) && styles.filterChipActive,
                    { borderColor: SEVERITY_COLORS[severity] },
                  ]}
                >
                  <KurdishText
                    style={[
                      styles.filterChipText,
                      selectedSeverity.includes(severity) && {
                        color: SEVERITY_COLORS[severity],
                      },
                    ]}
                  >
                    {severity === 'minor' ? 'ورد' : severity === 'medium' ? 'ناوەند' : 'گەورە'}
                  </KurdishText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            onPress={() => setShowResolved(!showResolved)}
            style={styles.resolvedToggle}
          >
            <View
              style={[
                styles.checkbox,
                showResolved && styles.checkboxActive,
              ]}
            >
              {showResolved && <CheckCircle size={16} color="#fff" />}
            </View>
            <KurdishText style={styles.resolvedToggleText}>
              {'پیشاندانی هەڵە چارەسەرکراوەکان'}
            </KurdishText>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.statsBar}>
        <KurdishText style={styles.statsText}>
          {'کۆی گشتی: '}{filteredErrors.length}
        </KurdishText>
        {errorLogs.filter(e => !e.resolved).length > 0 && (
          <TouchableOpacity onPress={handleClearAll}>
            <KurdishText style={styles.clearAllText}>{'سڕینەوەی هەموو'}</KurdishText>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredErrors.length === 0 ? (
          <View style={styles.emptyContainer}>
            <CheckCircle size={64} color="#10B981" />
            <KurdishText style={styles.emptyText}>{'هیچ هەڵەیەک نییە'}</KurdishText>
            <KurdishText style={styles.emptySubtext}>
              {'سیستەم بە باشی کاردەکات'}
            </KurdishText>
          </View>
        ) : (
          filteredErrors.map(renderErrorCard)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9CA3AF',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 8,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#1F2937',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  filtersContainer: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  filterChipActive: {
    backgroundColor: '#374151',
  },
  filterChipText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  resolvedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#4B5563',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  resolvedToggleText: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1F2937',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  statsText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  clearAllText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600' as const,
  },
  scrollView: {
    flex: 1,
  },
  errorCard: {
    backgroundColor: '#1F2937',
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  resolvedCard: {
    opacity: 0.6,
    borderLeftColor: '#10B981',
  },
  errorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  errorHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  resolvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#10B98120',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  resolvedText: {
    fontSize: 12,
    color: '#10B981',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  errorMessage: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
    lineHeight: 24,
  },
  errorDetails: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 12,
    lineHeight: 20,
  },
  errorFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  errorMeta: {
    fontSize: 12,
    color: '#6B7280',
  },
  occurrenceBadge: {
    backgroundColor: '#EF444420',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  occurrenceText: {
    fontSize: 12,
    color: '#EF4444',
  },
  userInfo: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#fff',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
});
