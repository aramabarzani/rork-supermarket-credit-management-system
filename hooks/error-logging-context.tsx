import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { 
  ErrorLog, 
  ErrorSeverity, 
  ErrorCategory, 
  ErrorStats, 
  ErrorFilter,
  AutoResolveRule 
} from '@/types/error-logging';

const ERROR_LOGS_KEY = 'error_logs';
const AUTO_RESOLVE_RULES_KEY = 'auto_resolve_rules';
const MAX_STORED_ERRORS = 1000;

export const [ErrorLoggingContext, useErrorLogging] = createContextHook(() => {
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [autoResolveRules, setAutoResolveRules] = useState<AutoResolveRule[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadErrorLogs();
    loadAutoResolveRules();
  }, []);

  const loadErrorLogs = async () => {
    try {
      const stored = await AsyncStorage.getItem(ERROR_LOGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const logs = parsed.map((log: ErrorLog) => ({
          ...log,
          timestamp: new Date(log.timestamp),
          lastOccurrence: new Date(log.lastOccurrence),
          resolvedAt: log.resolvedAt ? new Date(log.resolvedAt) : undefined,
        }));
        setErrorLogs(logs);
      }
    } catch (error) {
      console.error('Failed to load error logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAutoResolveRules = async () => {
    try {
      const stored = await AsyncStorage.getItem(AUTO_RESOLVE_RULES_KEY);
      if (stored) {
        setAutoResolveRules(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load auto resolve rules:', error);
    }
  };

  const saveErrorLogs = async (logs: ErrorLog[]) => {
    try {
      const limited = logs.slice(0, MAX_STORED_ERRORS);
      await AsyncStorage.setItem(ERROR_LOGS_KEY, JSON.stringify(limited));
      setErrorLogs(limited);
    } catch (error) {
      console.error('Failed to save error logs:', error);
    }
  };

  const saveAutoResolveRules = async (rules: AutoResolveRule[]) => {
    try {
      await AsyncStorage.setItem(AUTO_RESOLVE_RULES_KEY, JSON.stringify(rules));
      setAutoResolveRules(rules);
    } catch (error) {
      console.error('Failed to save auto resolve rules:', error);
    }
  };

  const getDeviceInfo = () => {
    return {
      platform: Platform.OS,
      version: Platform.Version.toString(),
      model: undefined,
    };
  };



  const checkAutoResolveCallback = useCallback((error: ErrorLog): boolean => {
    const matchingRule = autoResolveRules.find(
      rule => 
        rule.enabled &&
        rule.category === error.category &&
        rule.severity === error.severity &&
        error.message.includes(rule.pattern)
    );

    if (matchingRule) {
      console.log(`Auto-resolving error with rule: ${matchingRule.id}`);
      return matchingRule.action === 'ignore';
    }

    return false;
  }, [autoResolveRules]);

  const logError = useCallback(async (
    severity: ErrorSeverity,
    category: ErrorCategory,
    message: string,
    details?: string,
    stackTrace?: string,
    userId?: string,
    userName?: string,
    userRole?: string
  ) => {
    const existingError = errorLogs.find(
      log => 
        log.message === message && 
        log.category === category &&
        !log.resolved
    );

    const newError: ErrorLog = existingError ? {
      ...existingError,
      occurrenceCount: existingError.occurrenceCount + 1,
      lastOccurrence: new Date(),
      details: details || existingError.details,
      stackTrace: stackTrace || existingError.stackTrace,
    } : {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      severity,
      category,
      message,
      details,
      stackTrace,
      userId,
      userName,
      userRole,
      deviceInfo: getDeviceInfo(),
      resolved: false,
      occurrenceCount: 1,
      lastOccurrence: new Date(),
    };

    if (checkAutoResolveCallback(newError)) {
      console.log('Error auto-resolved, not logging');
      return;
    }

    const updatedLogs = existingError
      ? errorLogs.map(log => log.id === existingError.id ? newError : log)
      : [newError, ...errorLogs];

    await saveErrorLogs(updatedLogs);

    if (severity === 'critical') {
      console.error('CRITICAL ERROR:', message, details);
    }
  }, [errorLogs, checkAutoResolveCallback]);

  const resolveError = useCallback(async (
    errorId: string,
    resolvedBy: string,
    notes?: string
  ) => {
    const updatedLogs = errorLogs.map(log =>
      log.id === errorId
        ? {
            ...log,
            resolved: true,
            resolvedAt: new Date(),
            resolvedBy,
            notes,
          }
        : log
    );
    await saveErrorLogs(updatedLogs);
  }, [errorLogs]);

  const deleteError = useCallback(async (errorId: string) => {
    const updatedLogs = errorLogs.filter(log => log.id !== errorId);
    await saveErrorLogs(updatedLogs);
  }, [errorLogs]);

  const clearAllErrors = useCallback(async () => {
    await saveErrorLogs([]);
  }, []);

  const getFilteredErrors = useCallback((filter: ErrorFilter): ErrorLog[] => {
    return errorLogs.filter(log => {
      if (filter.startDate && log.timestamp < filter.startDate) return false;
      if (filter.endDate && log.timestamp > filter.endDate) return false;
      if (filter.severity && !filter.severity.includes(log.severity)) return false;
      if (filter.category && !filter.category.includes(log.category)) return false;
      if (filter.resolved !== undefined && log.resolved !== filter.resolved) return false;
      if (filter.userId && log.userId !== filter.userId) return false;
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        const matchesMessage = log.message.toLowerCase().includes(query);
        const matchesDetails = log.details?.toLowerCase().includes(query);
        const matchesUser = log.userName?.toLowerCase().includes(query);
        if (!matchesMessage && !matchesDetails && !matchesUser) return false;
      }
      return true;
    });
  }, [errorLogs]);

  const getErrorStats = useCallback((filter?: ErrorFilter): ErrorStats => {
    const filtered = filter ? getFilteredErrors(filter) : errorLogs;

    const byCategory = {} as Record<ErrorCategory, number>;
    const bySeverity = {} as Record<ErrorSeverity, number>;

    filtered.forEach(log => {
      byCategory[log.category] = (byCategory[log.category] || 0) + 1;
      bySeverity[log.severity] = (bySeverity[log.severity] || 0) + 1;
    });

    const resolved = filtered.filter(log => log.resolved).length;
    const unresolved = filtered.length - resolved;

    const mostFrequent = [...filtered]
      .sort((a, b) => b.occurrenceCount - a.occurrenceCount)
      .slice(0, 10);

    const recentErrors = [...filtered]
      .sort((a, b) => b.lastOccurrence.getTime() - a.lastOccurrence.getTime())
      .slice(0, 20);

    return {
      total: filtered.length,
      byCategory,
      bySeverity,
      resolved,
      unresolved,
      mostFrequent,
      recentErrors,
    };
  }, [errorLogs, getFilteredErrors]);

  const addAutoResolveRule = useCallback(async (rule: Omit<AutoResolveRule, 'id'>) => {
    const newRule: AutoResolveRule = {
      ...rule,
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    await saveAutoResolveRules([...autoResolveRules, newRule]);
  }, [autoResolveRules]);

  const updateAutoResolveRule = useCallback(async (ruleId: string, updates: Partial<AutoResolveRule>) => {
    const updatedRules = autoResolveRules.map(rule =>
      rule.id === ruleId ? { ...rule, ...updates } : rule
    );
    await saveAutoResolveRules(updatedRules);
  }, [autoResolveRules]);

  const deleteAutoResolveRule = useCallback(async (ruleId: string) => {
    const updatedRules = autoResolveRules.filter(rule => rule.id !== ruleId);
    await saveAutoResolveRules(updatedRules);
  }, [autoResolveRules]);

  return {
    errorLogs,
    autoResolveRules,
    isLoading,
    logError,
    resolveError,
    deleteError,
    clearAllErrors,
    getFilteredErrors,
    getErrorStats,
    addAutoResolveRule,
    updateAutoResolveRule,
    deleteAutoResolveRule,
  };
});
