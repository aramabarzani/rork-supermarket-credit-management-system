import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Issue, IssueComment, IssueStats, IssueFilter, IssuePriority, IssueCategory, LiveChatSession, LiveChatMessage, ChatStats } from '@/types/support';

const ISSUES_KEY = 'support_issues';
const COMMENTS_KEY = 'support_comments';
const CHAT_SESSIONS_KEY = 'chat_sessions';
const CHAT_MESSAGES_KEY = 'chat_messages';

export const [SupportProvider, useSupport] = createContextHook(() => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [comments, setComments] = useState<IssueComment[]>([]);
  const [chatSessions, setChatSessions] = useState<LiveChatSession[]>([]);
  const [chatMessages, setChatMessages] = useState<LiveChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadIssues();
    loadComments();
    loadChatSessions();
    loadChatMessages();
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

  const loadChatSessions = async () => {
    try {
      const stored = await AsyncStorage.getItem(CHAT_SESSIONS_KEY);
      if (stored) {
        setChatSessions(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load chat sessions:', error);
    }
  };

  const loadChatMessages = async () => {
    try {
      const stored = await AsyncStorage.getItem(CHAT_MESSAGES_KEY);
      if (stored) {
        setChatMessages(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load chat messages:', error);
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

  const saveChatSessions = async (sessions: LiveChatSession[]) => {
    try {
      await AsyncStorage.setItem(CHAT_SESSIONS_KEY, JSON.stringify(sessions));
      setChatSessions(sessions);
    } catch (error) {
      console.error('Failed to save chat sessions:', error);
      throw error;
    }
  };

  const saveChatMessages = async (messages: LiveChatMessage[]) => {
    try {
      await AsyncStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(messages));
      setChatMessages(messages);
    } catch (error) {
      console.error('Failed to save chat messages:', error);
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

  const startChatSession = useCallback(async (customerId: string, customerName: string) => {
    const newSession: LiveChatSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      customerId,
      customerName,
      status: 'waiting',
      startedAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
    };

    await saveChatSessions([...chatSessions, newSession]);
    return newSession;
  }, [chatSessions]);

  const assignChatSession = useCallback(async (sessionId: string, agentId: string, agentName: string) => {
    const updated = chatSessions.map(s =>
      s.id === sessionId
        ? { ...s, assignedTo: agentId, assignedToName: agentName, status: 'active' as const }
        : s
    );
    await saveChatSessions(updated);
  }, [chatSessions]);

  const closeChatSession = useCallback(async (sessionId: string) => {
    const updated = chatSessions.map(s =>
      s.id === sessionId
        ? { ...s, status: 'closed' as const, endedAt: new Date().toISOString() }
        : s
    );
    await saveChatSessions(updated);
  }, [chatSessions]);

  const rateChatSession = useCallback(async (sessionId: string, rating: number, comment?: string) => {
    const updated = chatSessions.map(s =>
      s.id === sessionId
        ? { ...s, rating, ratingComment: comment }
        : s
    );
    await saveChatSessions(updated);
  }, [chatSessions]);

  const sendChatMessage = useCallback(async (
    sessionId: string,
    senderId: string,
    senderName: string,
    senderRole: 'customer' | 'employee' | 'admin' | 'system',
    message: string
  ) => {
    const newMessage: LiveChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      senderId,
      senderName,
      senderRole,
      message,
      timestamp: new Date().toISOString(),
      read: false,
    };

    await saveChatMessages([...chatMessages, newMessage]);

    const updatedSessions = chatSessions.map(s =>
      s.id === sessionId
        ? { ...s, lastMessageAt: new Date().toISOString(), unreadCount: s.unreadCount + 1 }
        : s
    );
    await saveChatSessions(updatedSessions);

    return newMessage;
  }, [chatMessages, chatSessions]);

  const markChatMessagesAsRead = useCallback(async (sessionId: string, userId: string) => {
    const updated = chatMessages.map(m =>
      m.sessionId === sessionId && m.senderId !== userId
        ? { ...m, read: true }
        : m
    );
    await saveChatMessages(updated);

    const updatedSessions = chatSessions.map(s =>
      s.id === sessionId
        ? { ...s, unreadCount: 0 }
        : s
    );
    await saveChatSessions(updatedSessions);
  }, [chatMessages, chatSessions]);

  const getChatSessionMessages = useCallback((sessionId: string) => {
    return chatMessages.filter(m => m.sessionId === sessionId);
  }, [chatMessages]);

  const getActiveChatSessions = useCallback(() => {
    return chatSessions.filter(s => s.status === 'active');
  }, [chatSessions]);

  const getWaitingChatSessions = useCallback(() => {
    return chatSessions.filter(s => s.status === 'waiting');
  }, [chatSessions]);

  const getAgentChatSessions = useCallback((agentId: string) => {
    return chatSessions.filter(s => s.assignedTo === agentId && s.status === 'active');
  }, [chatSessions]);

  const getChatStats = useCallback((): ChatStats => {
    const activeSessions = chatSessions.filter(s => s.status === 'active').length;
    const waitingSessions = chatSessions.filter(s => s.status === 'waiting').length;
    const closedSessions = chatSessions.filter(s => s.status === 'closed').length;

    const sessionsWithDuration = chatSessions.filter(s => s.endedAt);
    const totalDuration = sessionsWithDuration.reduce((sum, s) => {
      const start = new Date(s.startedAt).getTime();
      const end = new Date(s.endedAt!).getTime();
      return sum + (end - start);
    }, 0);
    const averageSessionDuration = sessionsWithDuration.length > 0
      ? totalDuration / sessionsWithDuration.length / (1000 * 60)
      : 0;

    const ratedSessions = chatSessions.filter(s => s.rating !== undefined);
    const averageRating = ratedSessions.length > 0
      ? ratedSessions.reduce((sum, s) => sum + (s.rating || 0), 0) / ratedSessions.length
      : 0;

    const agentMap = new Map<string, { agentId: string; agentName: string; count: number }>();
    chatSessions.forEach(s => {
      if (s.assignedTo && s.assignedToName) {
        const existing = agentMap.get(s.assignedTo);
        if (existing) {
          existing.count++;
        } else {
          agentMap.set(s.assignedTo, { agentId: s.assignedTo, agentName: s.assignedToName, count: 1 });
        }
      }
    });

    return {
      totalSessions: chatSessions.length,
      activeSessions,
      waitingSessions,
      closedSessions,
      averageResponseTime: 0,
      averageSessionDuration,
      averageRating,
      sessionsByAgent: Array.from(agentMap.values()),
    };
  }, [chatSessions]);

  return useMemo(() => ({
    issues,
    comments,
    chatSessions,
    chatMessages,
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
    startChatSession,
    assignChatSession,
    closeChatSession,
    rateChatSession,
    sendChatMessage,
    markChatMessagesAsRead,
    getChatSessionMessages,
    getActiveChatSessions,
    getWaitingChatSessions,
    getAgentChatSessions,
    getChatStats,
  }), [
    issues,
    comments,
    chatSessions,
    chatMessages,
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
    startChatSession,
    assignChatSession,
    closeChatSession,
    rateChatSession,
    sendChatMessage,
    markChatMessagesAsRead,
    getChatSessionMessages,
    getActiveChatSessions,
    getWaitingChatSessions,
    getAgentChatSessions,
    getChatStats,
  ]);
});
