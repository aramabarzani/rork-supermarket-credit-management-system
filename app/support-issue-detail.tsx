import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertCircle, CheckCircle, Clock, XCircle, Send, Star } from 'lucide-react-native';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/hooks/auth-context';
import type { IssueStatus, IssuePriority, IssueCategory } from '@/types/support';

export default function SupportIssueDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');

  const issueQuery = trpc.support.issues.getOne.useQuery({ id: id || '' });
  const commentsQuery = trpc.support.issues.getComments.useQuery({ issueId: id || '' });

  const addCommentMutation = trpc.support.issues.addComment.useMutation({
    onSuccess: () => {
      setComment('');
      commentsQuery.refetch();
      issueQuery.refetch();
      Alert.alert('سەرکەوتوو', 'تێبینیەکە زیاد کرا');
    },
    onError: (error) => {
      Alert.alert('هەڵە', error.message);
    },
  });

  const rateIssueMutation = trpc.support.issues.rate.useMutation({
    onSuccess: () => {
      setShowRating(false);
      setRating(0);
      setRatingComment('');
      issueQuery.refetch();
      Alert.alert('سەرکەوتوو', 'هەڵسەنگاندنەکە تۆمار کرا');
    },
    onError: (error) => {
      Alert.alert('هەڵە', error.message);
    },
  });

  const handleAddComment = () => {
    if (!comment.trim()) {
      Alert.alert('هەڵە', 'تکایە تێبینیەکە بنووسە');
      return;
    }

    addCommentMutation.mutate({
      issueId: id || '',
      comment: comment.trim(),
    });
  };

  const handleRateIssue = () => {
    if (rating === 0) {
      Alert.alert('هەڵە', 'تکایە هەڵسەنگاندن هەڵبژێرە');
      return;
    }

    rateIssueMutation.mutate({
      id: id || '',
      rating,
      comment: ratingComment.trim() || undefined,
    });
  };

  const getStatusIcon = (status: IssueStatus) => {
    switch (status) {
      case 'open':
        return <AlertCircle size={24} color="#f59e0b" />;
      case 'in_progress':
        return <Clock size={24} color="#3b82f6" />;
      case 'resolved':
        return <CheckCircle size={24} color="#10b981" />;
      case 'closed':
        return <XCircle size={24} color="#6b7280" />;
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

  if (issueQuery.isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Stack.Screen
          options={{
            title: 'وردەکاری کێشە',
            headerStyle: { backgroundColor: '#1f2937' },
            headerTintColor: '#fff',
          }}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      </SafeAreaView>
    );
  }

  if (issueQuery.error || !issueQuery.data) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Stack.Screen
          options={{
            title: 'وردەکاری کێشە',
            headerStyle: { backgroundColor: '#1f2937' },
            headerTintColor: '#fff',
          }}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>کێشەکە نەدۆزرایەوە</Text>
        </View>
      </SafeAreaView>
    );
  }

  const issue = issueQuery.data;
  const canRate =
    user?.role === 'customer' &&
    issue.reportedBy === user.id &&
    (issue.status === 'resolved' || issue.status === 'closed') &&
    !issue.rating;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'وردەکاری کێشە',
          headerStyle: { backgroundColor: '#1f2937' },
          headerTintColor: '#fff',
        }}
      />

      <ScrollView style={styles.content}>
        <View style={styles.issueCard}>
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
          <Text style={styles.issueDescription}>{issue.description}</Text>

          <View style={styles.issueInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>جۆر:</Text>
              <Text style={styles.infoValue}>{getCategoryText(issue.category)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ڕاپۆرتکەر:</Text>
              <Text style={styles.infoValue}>{issue.reportedByName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>بەروار:</Text>
              <Text style={styles.infoValue}>
                {new Date(issue.createdAt).toLocaleDateString('ku')}
              </Text>
            </View>
            {issue.assignedToName && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>دیاریکراوە بۆ:</Text>
                <Text style={styles.infoValue}>{issue.assignedToName}</Text>
              </View>
            )}
            {issue.resolvedAt && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>چارەسەر کراوە لە:</Text>
                <Text style={styles.infoValue}>
                  {new Date(issue.resolvedAt).toLocaleDateString('ku')}
                </Text>
              </View>
            )}
          </View>

          {issue.resolutionNotes && (
            <View style={styles.resolutionSection}>
              <Text style={styles.resolutionTitle}>تێبینی چارەسەرکردن:</Text>
              <Text style={styles.resolutionText}>{issue.resolutionNotes}</Text>
            </View>
          )}

          {issue.rating && (
            <View style={styles.ratingSection}>
              <Text style={styles.ratingTitle}>هەڵسەنگاندن:</Text>
              <View style={styles.ratingStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={24}
                    color="#fbbf24"
                    fill={star <= issue.rating! ? '#fbbf24' : 'transparent'}
                  />
                ))}
              </View>
              {issue.ratingComment && (
                <Text style={styles.ratingCommentText}>{issue.ratingComment}</Text>
              )}
            </View>
          )}

          {canRate && (
            <TouchableOpacity
              style={styles.rateButton}
              onPress={() => setShowRating(true)}
            >
              <Star size={20} color="#fff" />
              <Text style={styles.rateButtonText}>هەڵسەنگاندن</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>تێبینیەکان</Text>

          {commentsQuery.isLoading ? (
            <ActivityIndicator size="small" color="#3b82f6" />
          ) : commentsQuery.data && commentsQuery.data.length > 0 ? (
            commentsQuery.data.map((comment) => (
              <View key={comment.id} style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentAuthor}>{comment.userName}</Text>
                  <Text style={styles.commentDate}>
                    {new Date(comment.createdAt).toLocaleDateString('ku')}
                  </Text>
                </View>
                <Text style={styles.commentText}>{comment.comment}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noComments}>هیچ تێبینیەک نییە</Text>
          )}
        </View>

        <View style={styles.addCommentSection}>
          <TextInput
            style={styles.commentInput}
            value={comment}
            onChangeText={setComment}
            placeholder="تێبینیەکەت بنووسە..."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={3}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleAddComment}
            disabled={addCommentMutation.isPending}
          >
            {addCommentMutation.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Send size={20} color="#fff" />
                <Text style={styles.sendButtonText}>ناردن</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {showRating && (
        <View style={styles.ratingModal}>
          <View style={styles.ratingModalContent}>
            <Text style={styles.ratingModalTitle}>هەڵسەنگاندنی چارەسەرکردن</Text>

            <View style={styles.ratingStarsInput}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Star
                    size={40}
                    color="#fbbf24"
                    fill={star <= rating ? '#fbbf24' : 'transparent'}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[styles.commentInput, { marginTop: 16 }]}
              value={ratingComment}
              onChangeText={setRatingComment}
              placeholder="تێبینیەکەت بنووسە (ئیختیاری)"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
            />

            <View style={styles.ratingModalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowRating(false);
                  setRating(0);
                  setRatingComment('');
                }}
              >
                <Text style={styles.cancelButtonText}>پاشگەزبوونەوە</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleRateIssue}
                disabled={rateIssueMutation.isPending}
              >
                {rateIssueMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>تۆمارکردن</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
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
  issueCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  issueStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  issueStatusText: {
    color: '#d1d5db',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priorityText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  issueTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 12,
  },
  issueDescription: {
    color: '#d1d5db',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  issueInfo: {
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingTop: 16,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    color: '#9ca3af',
    fontSize: 14,
  },
  infoValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  resolutionSection: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#374151',
    borderRadius: 8,
  },
  resolutionTitle: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  resolutionText: {
    color: '#d1d5db',
    fontSize: 14,
    lineHeight: 20,
  },
  ratingSection: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#374151',
    borderRadius: 8,
  },
  ratingTitle: {
    color: '#fbbf24',
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  ratingCommentText: {
    color: '#d1d5db',
    fontSize: 14,
    lineHeight: 20,
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fbbf24',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  rateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  commentsSection: {
    marginBottom: 16,
  },
  commentsTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 12,
  },
  commentCard: {
    backgroundColor: '#1f2937',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  commentAuthor: {
    color: '#60a5fa',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  commentDate: {
    color: '#6b7280',
    fontSize: 12,
  },
  commentText: {
    color: '#d1d5db',
    fontSize: 14,
    lineHeight: 20,
  },
  noComments: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 16,
  },
  addCommentSection: {
    marginBottom: 16,
  },
  commentInput: {
    backgroundColor: '#1f2937',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    marginBottom: 12,
    textAlignVertical: 'top',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  ratingModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  ratingModalContent: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  ratingModalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 24,
    textAlign: 'center',
  },
  ratingStarsInput: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  ratingModalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
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
});
