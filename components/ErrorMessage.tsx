import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertCircle, X } from 'lucide-react-native';
import { KurdishText } from './KurdishText';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
  type?: 'error' | 'warning' | 'info';
}

export function ErrorMessage({ message, onDismiss, type = 'error' }: ErrorMessageProps) {
  const backgroundColor = type === 'error' ? '#FEE2E2' : type === 'warning' ? '#FEF3C7' : '#DBEAFE';
  const borderColor = type === 'error' ? '#EF4444' : type === 'warning' ? '#F59E0B' : '#3B82F6';
  const iconColor = type === 'error' ? '#DC2626' : type === 'warning' ? '#D97706' : '#2563EB';
  const textColor = type === 'error' ? '#991B1B' : type === 'warning' ? '#92400E' : '#1E40AF';

  return (
    <View style={[styles.container, { backgroundColor, borderColor }]}>
      <View style={styles.content}>
        <AlertCircle size={20} color={iconColor} />
        <KurdishText variant="body" color={textColor} style={styles.message}>
          {message}
        </KurdishText>
      </View>
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
          <X size={20} color={iconColor} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  message: {
    flex: 1,
  },
  dismissButton: {
    padding: 4,
    marginLeft: 8,
  },
});
