import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Issue, IssueComment, IssueStats, IssueFilter, IssuePriority, IssueCategory } from '@/types/support';

const ISSUES_KEY = 'support_issues';
const COMMENTS_KEY = 'support_comments';

export const [SupportProvider, useSupport] = createContextHook(() => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [comments, setComments] = useState<IssueComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadIssues();
    loadComments();
  }, []);

  const loadIssues = async () => {
    try {
      const stored = await AsyncStorage.getItem(ISSUES_KEY);
      if (stored) {
        setIssues(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load issues:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const stored = await AsyncStorage.getItem(COMMENTS_KEY);
      if (stored) {
        setComments(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const saveIssues = async (updatedIssues: Issue[]) => {
    try {
      await AsyncStorage.setItem(ISSUES_KEY, JSON.stringify(updatedIssues));
      setIssues(updatedIssues);
    } catch (error) {
      console.error('Failed to save issues:', error);
      throw error;
    }
  };

  const saveComments = async (updatedComments: IssueComment[]) => {
    try {
      await AsyncStorage.setItem(COMMENTS_KEY, JSON.stringify(updatedComments));
      setComments(updatedComments);
    } catch (error) {
      console.error('Failed to save comments:', error);
      throw error;
    }
  };

  const createIssue = useCallback(async (
    title: string,
    description: string,
    category: IssueCategory,
    priority: IssuePriority,
    reportedBy: string,
    reportedByName: string,
    reportedByRole: 'customer' | 'employee' | 'admin'
  ) => {
    const newIssue: Issue = {
      id: `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      description,
      category,
      priority,
      status: 'open',
      reportedBy,
      reportedByName,
      reportedByRole,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveIssues([...issues, newIssue]);
    return newIssue;
  }, [issues]);

  const updateIssue = useCallback(async (id: string, updates: Partial<Issue>) => {
    const updated = issues.map(issue =>
      issue.id === id
        ? { ...issue, ...updates, updatedAt: new Date().toISOString() }
        : issue
    );
    await saveIssues(updated);
  }, [issues]);

  const assignIssue = useCallback(async (id: string, assignedTo: string, assignedToName: string) => {
    await updateIssue(id, { assignedTo, assignedToName, status: 'in_progress' });
  }, [updateIssue]);

  const resolveIssue = useCallback(async (
    id: string,
    resolvedBy: string,
    resolvedByName: string,
    resolutionNotes: string
  ) => {
    await updateIssue(id, {
      status: 'resolved',
      resolvedAt: new Date().toISOString(),
      resolvedBy,
      resolvedByName,
      resolutionNotes,
    });
  }, [updateIssue]);

  const closeIssue = useCallback(async (id: string) => {
    await updateIssue(id, { status: 'closed' });
  }, [updateIssue]);

  const reopenIssue = useCallback(async (id: string) => {
    await updateIssue(id, { status: 'open' });
  }, [updateIssue]);

  const rateIssue = useCallback(async (id: string, rating: number, ratingComment?: string) => {
    await updateIssue(id, { rating, ratingComment });
  }, [updateIssue]);

  const addComment = useCallback(async (
    issueId: string,
    userId: string,
    userName: string,
    userRole: 'customer' | 'employee' | 'admin',
    comment: string,
    isInternal: boolean = false
  ) => {
    const newComment: IssueComment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      issueId,
      userId,
      userName,
      userRole,
      comment,
      createdAt: new Date().toISOString(),
      isInternal,
    };

    await saveComments([...comments, newComment]);
    await updateIssue(issueId, { updatedAt: new Date().toISOString() });
    return newComment;
  }, [comments, updateIssue]);

  const getIssueById = useCallback((id: string) => {
    return issues.find(issue => issue.id === id);
  }, [issues]);

  const getIssueComments = useCallback((issueId: string) => {
    return comments.filter(comment => comment.issueId === issueId);
  }, [comments]);

  const getFilteredIssues = useCallback((filter: IssueFilter) => {
    return issues.filter(issue => {
      if (filter.status && filter.status.length > 0 && !filter.status.includes(issue.status)) {
        return false;
      }
      if (filter.priority && filter.priority.length > 0 && !filter.priority.includes(issue.priority)) {
        return false;
      }
      if (filter.category && filter.category.length > 0 && !filter.category.includes(issue.category)) {
        return false;
      }
      if (filter.reportedBy && issue.reportedBy !== filter.reportedBy) {
        return false;
      }
      if (filter.assignedTo && issue.assignedTo !== filter.assignedTo) {
        return false;
      }
      if (filter.dateFrom && new Date(issue.createdAt) < new Date(filter.dateFrom)) {
        return false;
      }
      if (filter.dateTo && new Date(issue.createdAt) > new Date(filter.dateTo)) {
        return false;
      }
      return true;
    });
  }, [issues]);

  const getIssueStats = useCallback((): IssueStats => {
    const openIssues = issues.filter(i => i.status === 'open').length;
    const inProgressIssues = issues.filter(i => i.status === 'in_progress').length;
    const resolvedIssues = issues.filter(i => i.status === 'resolved').length;
    const closedIssues = issues.filter(i => i.status === 'closed').length;

    const resolvedWithTime = issues.filter(i => i.status === 'resolved' && i.resolvedAt);
    const totalResolutionTime = resolvedWithTime.reduce((sum, issue) => {
      const created = new Date(issue.createdAt).getTime();
      const resolved = new Date(issue.resolvedAt!).getTime();
      return sum + (resolved - created);
    }, 0);
    const averageResolutionTime = resolvedWithTime.length > 0
      ? totalResolutionTime / resolvedWithTime.length / (1000 * 60 * 60)
      : 0;

    const ratedIssues = issues.filter(i => i.rating !== undefined);
    const averageRating = ratedIssues.length > 0
      ? ratedIssues.reduce((sum, i) => sum + (i.rating || 0), 0) / ratedIssues.length
      : 0;

    const issuesByCategory = (['payment', 'debt', 'account', 'technical', 'other'] as IssueCategory[]).map(category => ({
      category,
      count: issues.filter(i => i.category === category).length,
    }));

    const issuesByPriority = (['low', 'medium', 'high', 'urgent'] as IssuePriority[]).map(priority => ({
      priority,
      count: issues.filter(i => i.priority === priority).length,
    }));

    return {
      totalIssues: issues.length,
      openIssues,
      inProgressIssues,
      resolvedIssues,
      closedIssues,
      averageResolutionTime,
      averageRating,
      issuesByCategory,
      issuesByPriority,
    };
  }, [issues]);

  const getMyIssues = useCallback((userId: string) => {
    return issues.filter(issue => issue.reportedBy === userId);
  }, [issues]);

  const getAssignedIssues = useCallback((userId: string) => {
    return issues.filter(issue => issue.assignedTo === userId);
  }, [issues]);

  const getUnassignedIssues = useCallback(() => {
    return issues.filter(issue => !issue.assignedTo && issue.status === 'open');
  }, [issues]);

  const deleteIssue = useCallback(async (id: string) => {
    const updated = issues.filter(issue => issue.id !== id);
    await saveIssues(updated);
    
    const updatedComments = comments.filter(comment => comment.issueId !== id);
    await saveComments(updatedComments);
  }, [issues, comments]);

  return useMemo(() => ({
    issues,
    comments,
    isLoading,
    createIssue,
    updateIssue,
    assignIssue,
    resolveIssue,
    closeIssue,
    reopenIssue,
    rateIssue,
    addComment,
    getIssueById,
    getIssueComments,
    getFilteredIssues,
    getIssueStats,
    getMyIssues,
    getAssignedIssues,
    getUnassignedIssues,
    deleteIssue,
  }), [
    issues,
    comments,
    isLoading,
    createIssue,
    updateIssue,
    assignIssue,
    resolveIssue,
    closeIssue,
    reopenIssue,
    rateIssue,
    addComment,
    getIssueById,
    getIssueComments,
    getFilteredIssues,
    getIssueStats,
    getMyIssues,
    getAssignedIssues,
    getUnassignedIssues,
    deleteIssue,
  ]);
});
