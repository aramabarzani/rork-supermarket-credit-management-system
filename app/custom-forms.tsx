import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, FileText, Edit2, Trash2, Download, Share2, BarChart3, Eye } from 'lucide-react-native';
import { KurdishText } from '@/components/KurdishText';
import { useCustomForms } from '@/hooks/custom-forms-context';
import type { CustomForm, FormType } from '@/types/custom-forms';

const FORM_TYPE_LABELS: Record<FormType, string> = {
  debt: 'قەرز',
  payment: 'پارەدان',
  customer: 'کڕیار',
  employee: 'کارمەند',
  custom: 'تایبەتی',
};

export default function CustomFormsScreen() {
  const router = useRouter();
  const { forms, deleteForm, exportForm, isLoading, isDeleting, isExporting } = useCustomForms();
  const [selectedType, setSelectedType] = useState<FormType | 'all'>('all');
  const [showError, setShowError] = useState<boolean>(false);

  const filteredForms = selectedType === 'all' 
    ? forms 
    : forms.filter((form) => form.type === selectedType);

  const handleCreateForm = () => {
    router.push('/form-builder');
  };

  const handleDeleteForm = (form: CustomForm) => {
    Alert.alert(
      'سڕینەوەی فۆرم',
      `دڵنیایت لە سڕینەوەی فۆرمی "${form.name}"؟`,
      [
        { text: 'نەخێر', style: 'cancel' },
        {
          text: 'بەڵێ',
          style: 'destructive',
          onPress: () => deleteForm(form.id),
        },
      ]
    );
  };

  const handleExportForm = (form: CustomForm) => {
    Alert.alert(
      'هەناردەکردنی داتا',
      'فۆرماتی هەناردەکردن هەڵبژێرە',
      [
        { text: 'پاشگەزبوونەوە', style: 'cancel' },
        { text: 'Excel', onPress: () => exportForm(form.id, 'excel') },
        { text: 'PDF', onPress: () => exportForm(form.id, 'pdf') },
        { text: 'JSON', onPress: () => exportForm(form.id, 'json') },
        { text: 'CSV', onPress: () => exportForm(form.id, 'csv') },
      ]
    );
  };

  const handleViewSubmissions = (form: CustomForm) => {
    Alert.alert('زانیاری', `${form.name} - پیشاندانی داتاکان`);
  };

  const handleViewAnalytics = (form: CustomForm) => {
    Alert.alert('زانیاری', `${form.name} - شیکاری داتاکان`);
  };

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setShowError(true);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [isLoading]);

  if (isLoading && !showError) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Stack.Screen
          options={{
            title: 'فۆرمە تایبەتییەکان',
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <KurdishText style={styles.loadingText}>چاوەڕێ بە...</KurdishText>
        </View>
      </SafeAreaView>
    );
  }

  if (showError && forms.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Stack.Screen
          options={{
            title: 'فۆرمە تایبەتییەکان',
          }}
        />
        <View style={styles.errorContainer}>
          <FileText size={64} color="#EF4444" />
          <KurdishText style={styles.errorTitle}>کێشە لە پەیوەندی</KurdishText>
          <KurdishText style={styles.errorText}>
            ناتوانرێت پەیوەندی بە سێرڤەر بکرێت. تکایە دڵنیابە لە پەیوەندی ئینتەرنێت و دووبارە هەوڵ بدەرەوە.
          </KurdishText>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => {
              setShowError(false);
              window.location.reload();
            }}
          >
            <KurdishText style={styles.retryButtonText}>دووبارە هەوڵ بدەرەوە</KurdishText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'فۆرمە تایبەتییەکان',
          headerRight: () => (
            <TouchableOpacity onPress={handleCreateForm}>
              <Plus size={24} color="#3B82F6" />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterChip, selectedType === 'all' && styles.filterChipActive]}
            onPress={() => setSelectedType('all')}
          >
            <KurdishText
              style={[
                styles.filterChipText,
                selectedType === 'all' && styles.filterChipTextActive,
              ]}
            >
              هەموو ({forms.length})
            </KurdishText>
          </TouchableOpacity>

          {Object.entries(FORM_TYPE_LABELS).map(([type, label]) => {
            const count = forms.filter((f) => f.type === type).length;
            return (
              <TouchableOpacity
                key={type}
                style={[
                  styles.filterChip,
                  selectedType === type && styles.filterChipActive,
                ]}
                onPress={() => setSelectedType(type as FormType)}
              >
                <KurdishText
                  style={[
                    styles.filterChipText,
                    selectedType === type && styles.filterChipTextActive,
                  ]}
                >
                  {label} ({count})
                </KurdishText>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView style={styles.content}>
        {filteredForms.length === 0 ? (
          <View style={styles.emptyState}>
            <FileText size={64} color="#D1D5DB" />
            <KurdishText style={styles.emptyStateTitle}>
              هیچ فۆرمێک نییە
            </KurdishText>
            <KurdishText style={styles.emptyStateText}>
              دەستپێبکە بە دروستکردنی فۆرمی تایبەتی
            </KurdishText>
            <TouchableOpacity style={styles.createButton} onPress={handleCreateForm}>
              <Plus size={20} color="#FFFFFF" />
              <KurdishText style={styles.createButtonText}>دروستکردنی فۆرم</KurdishText>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.formsList}>
            {filteredForms.map((form) => (
              <View key={form.id} style={styles.formCard}>
                <View style={styles.formHeader}>
                  <View style={styles.formInfo}>
                    <KurdishText style={styles.formName}>{form.name}</KurdishText>
                    {form.description && (
                      <KurdishText style={styles.formDescription}>
                        {form.description}
                      </KurdishText>
                    )}
                    <View style={styles.formMeta}>
                      <View
                        style={[
                          styles.typeBadge,
                          { backgroundColor: form.isActive ? '#10B981' : '#9CA3AF' },
                        ]}
                      >
                        <KurdishText style={styles.typeBadgeText}>
                          {form.isActive ? 'چالاک' : 'ناچالاک'}
                        </KurdishText>
                      </View>
                      <View style={styles.typeBadge}>
                        <KurdishText style={styles.typeBadgeText}>
                          {FORM_TYPE_LABELS[form.type]}
                        </KurdishText>
                      </View>
                      <KurdishText style={styles.fieldCount}>
                        {form.fields.length} خانە
                      </KurdishText>
                    </View>
                  </View>
                </View>

                <View style={styles.formActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleViewSubmissions(form)}
                  >
                    <Eye size={20} color="#6B7280" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleViewAnalytics(form)}
                  >
                    <BarChart3 size={20} color="#6B7280" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleExportForm(form)}
                    disabled={isExporting}
                  >
                    {isExporting ? (
                      <ActivityIndicator size="small" color="#6B7280" />
                    ) : (
                      <Download size={20} color="#6B7280" />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Share2 size={20} color="#6B7280" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Edit2 size={20} color="#3B82F6" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteForm(form)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <ActivityIndicator size="small" color="#EF4444" />
                    ) : (
                      <Trash2 size={20} color="#EF4444" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
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
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#3B82F6',
  },
  filterChipText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500' as const,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1F2937',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    marginTop: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  formsList: {
    padding: 16,
    gap: 16,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formHeader: {
    marginBottom: 12,
  },
  formInfo: {
    gap: 8,
  },
  formName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1F2937',
  },
  formDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  formMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  typeBadge: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  typeBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  fieldCount: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    padding: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#EF4444',
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
