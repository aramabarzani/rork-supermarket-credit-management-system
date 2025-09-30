import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertCircle, CheckCircle, Clock, XCircle, Plus, Filter } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/hooks/auth-context';
import type { IssueStatus, IssuePriority, IssueCategory } from '@/types/support';

export default function SupportIssuesScreen() {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<IssueStatus[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<IssuePriority[]>([]);

  const [newIssue, setNewIssue] = useState({
    title: '',
    description: '',
    category: 'other' as IssueCategory,
    priority: 'medium' as IssuePriority,
  });

  const issuesQuery = trpc.support.issues.getAll.useQuery({
    status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
    priority: selectedPriorities.length > 0 ? selectedPriorities : undefined,
  });

  const createIssueMutation = trpc.support.issues.create.useMutation({
    onSuccess: () => {
      setShowCreateModal(false);
      setNewIssue({
        title: '',
        description: '',
        category: 'other',
        priority: 'medium',
      });
      issuesQuery.refetch();
      Alert.alert('سەرکەوتوو', 'کێشەکە بە سەرکەوتوویی تۆمار کرا');
    },
    onError: (error) => {
      Alert.alert('هەڵە', error.message);
    },
  });

  const handleCreateIssue = () => {
    if (!newIssue.title.trim()) {
      Alert.alert('هەڵە', 'تکایە ناونیشانی کێشەکە بنووسە');
      return;
    }
    if (!newIssue.description.trim()) {
      Alert.alert('هەڵە', 'تکایە وردەکاری کێشەکە بنووسە');
      return;
    }

    createIssueMutation.mutate(newIssue);
  };

  const getStatusIcon = (status: IssueStatus) => {
    switch (status) {
      case 'open':
        return <AlertCircle size={20} color="#f59e0b" />;
      case 'in_progress':
        return <Clock size={20} color="#3b82f6" />;
      case 'resolved':
        return <CheckCircle size={20} color="#10b981" />;
      case 'closed':
        return <XCircle size={20} color="#6b7280" />;
    }
  };

  const getStatusText = (status: IssueStatus) => {
    switch (status) {
      case 'open':
        return 'کراوە';
      case 'in_progress':
        return 'لە بەردەستدایە';
      case 'resolved':
        return 'چارەسەر کراوە';
      case 'closed':
        return 'داخراوە';
    }
  };

  const getPriorityColor = (priority: IssuePriority) => {
    switch (priority) {
      case 'low':
        return '#10b981';
      case 'medium':
        return '#f59e0b';
      case 'high':
        return '#ef4444';
      case 'urgent':
        return '#dc2626';
    }
  };

  const getPriorityText = (priority: IssuePriority) => {
    switch (priority) {
      case 'low':
        return 'نزم';
      case 'medium':
        return 'مامناوەند';
      case 'high':
        return 'بەرز';
      case 'urgent':
        return 'فریاگوزار';
    }
  };

  const getCategoryText = (category: IssueCategory) => {
    switch (category) {
      case 'payment':
        return 'پارەدان';
      case 'debt':
        return 'قەرز';
      case 'account':
        return 'هەژمار';
      case 'technical':
        return 'تەکنیکی';
      case 'other':
        return 'هیتر';
    }
  };

  const toggleStatus = (status: IssueStatus) => {
    setSelectedStatuses(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const togglePriority = (priority: IssuePriority) => {
    setSelectedPriorities(prev =>
      prev.includes(priority) ? prev.filter(p => p !== priority) : [...prev, priority]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'کێشەکان',
          headerStyle: { backgroundColor: '#1f2937' },
          headerTintColor: '#fff',
        }}
      />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Filter size={20} color="#fff" />
          <Text style={styles.filterButtonText}>پاڵاوتن</Text>
          {(selectedStatuses.length > 0 || selectedPriorities.length > 0) && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>
                {selectedStatuses.length + selectedPriorities.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Plus size={20} color="#fff" />
          <Text style={styles.createButtonText}>کێشەی نوێ</Text>
        </TouchableOpacity>
      </View>

      {issuesQuery.isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : issuesQuery.error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>هەڵەیەک ڕوویدا</Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {issuesQuery.data && issuesQuery.data.length === 0 ? (
            <View style={styles.emptyContainer}>
              <AlertCircle size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>هیچ کێشەیەک نییە</Text>
            </View>
          ) : (
            issuesQuery.data?.map((issue) => (
              <TouchableOpacity
                key={issue.id}
                style={styles.issueCard}
                onPress={() => router.push({ pathname: '/support-issue-detail', params: { id: issue.id } })}
              >
                <View style={styles.issueHeader}>
                  <View style={styles.issueStatus}>
                    {getStatusIcon(issue.status)}
                    <Text style={styles.issueStatusText}>{getStatusText(issue.status)}</Text>
                  </View>
                  <View
                    style={[
                      styles.priorityBadge,
                      { backgroundColor: getPriorityColor(issue.priority) },
                    ]}
                  >
                    <Text style={styles.priorityText}>{getPriorityText(issue.priority)}</Text>
                  </View>
                </View>

                <Text style={styles.issueTitle}>{issue.title}</Text>
                <Text style={styles.issueDescription} numberOfLines={2}>
                  {issue.description}
                </Text>

                <View style={styles.issueFooter}>
                  <Text style={styles.issueCategory}>{getCategoryText(issue.category)}</Text>
                  <Text style={styles.issueDate}>
                    {new Date(issue.createdAt).toLocaleDateString('ku')}
                  </Text>
                </View>

                {issue.rating && (
                  <View style={styles.ratingContainer}>
                    <Text style={styles.ratingText}>هەڵسەنگاندن: {issue.rating}/5</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>کێشەی نوێ</Text>

            <Text style={styles.label}>ناونیشان</Text>
            <TextInput
              style={styles.input}
              value={newIssue.title}
              onChangeText={(text) => setNewIssue({ ...newIssue, title: text })}
              placeholder="ناونیشانی کێشەکە"
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.label}>وردەکاری</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={newIssue.description}
              onChangeText={(text) => setNewIssue({ ...newIssue, description: text })}
              placeholder="وردەکاری کێشەکە"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>جۆر</Text>
            <View style={styles.categoryButtons}>
              {(['payment', 'debt', 'account', 'technical', 'other'] as IssueCategory[]).map(
                (cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryButton,
                      newIssue.category === cat && styles.categoryButtonActive,
                    ]}
                    onPress={() => setNewIssue({ ...newIssue, category: cat })}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        newIssue.category === cat && styles.categoryButtonTextActive,
                      ]}
                    >
                      {getCategoryText(cat)}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>

            <Text style={styles.label}>گرنگی</Text>
            <View style={styles.priorityButtons}>
              {(['low', 'medium', 'high', 'urgent'] as IssuePriority[]).map((pri) => (
                <TouchableOpacity
                  key={pri}
                  style={[
                    styles.priorityButton,
                    newIssue.priority === pri && {
                      backgroundColor: getPriorityColor(pri),
                    },
                  ]}
                  onPress={() => setNewIssue({ ...newIssue, priority: pri })}
                >
                  <Text
                    style={[
                      styles.priorityButtonText,
                      newIssue.priority === pri && styles.priorityButtonTextActive,
                    ]}
                  >
                    {getPriorityText(pri)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelButtonText}>پاشگەزبوونەوە</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleCreateIssue}
                disabled={createIssueMutation.isPending}
              >
                {createIssueMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>تۆمارکردن</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>پاڵاوتن</Text>

            <Text style={styles.label}>دۆخ</Text>
            <View style={styles.filterOptions}>
              {(['open', 'in_progress', 'resolved', 'closed'] as IssueStatus[]).map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterOption,
                    selectedStatuses.includes(status) && styles.filterOptionActive,
                  ]}
                  onPress={() => toggleStatus(status)}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedStatuses.includes(status) && styles.filterOptionTextActive,
                    ]}
                  >
                    {getStatusText(status)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>گرنگی</Text>
            <View style={styles.filterOptions}>
              {(['low', 'medium', 'high', 'urgent'] as IssuePriority[]).map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.filterOption,
                    selectedPriorities.includes(priority) && styles.filterOptionActive,
                  ]}
                  onPress={() => togglePriority(priority)}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedPriorities.includes(priority) && styles.filterOptionTextActive,
                    ]}
                  >
                    {getPriorityText(priority)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setSelectedStatuses([]);
                  setSelectedPriorities([]);
                }}
              >
                <Text style={styles.cancelButtonText}>سڕینەوە</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={() => {
                  setShowFilterModal(false);
                  issuesQuery.refetch();
                }}
              >
                <Text style={styles.submitButtonText}>جێبەجێکردن</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#374151',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  filterBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700' as const,
  },
  createButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 16,
    marginTop: 16,
  },
  issueCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  issueStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  issueStatusText: {
    color: '#d1d5db',
    fontSize: 14,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  issueTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  issueDescription: {
    color: '#9ca3af',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  issueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  issueCategory: {
    color: '#60a5fa',
    fontSize: 14,
  },
  issueDate: {
    color: '#6b7280',
    fontSize: 12,
  },
  ratingContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  ratingText: {
    color: '#fbbf24',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 500,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    color: '#d1d5db',
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryButton: {
    backgroundColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#3b82f6',
  },
  categoryButtonText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  categoryButtonTextActive: {
    color: '#fff',
    fontWeight: '600' as const,
  },
  priorityButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  priorityButton: {
    backgroundColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  priorityButtonText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  priorityButtonTextActive: {
    color: '#fff',
    fontWeight: '600' as const,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#374151',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  submitButton: {
    backgroundColor: '#3b82f6',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  filterOption: {
    backgroundColor: '#374151',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  filterOptionActive: {
    backgroundColor: '#3b82f6',
  },
  filterOptionText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  filterOptionTextActive: {
    color: '#fff',
    fontWeight: '600' as const,
  },
});
