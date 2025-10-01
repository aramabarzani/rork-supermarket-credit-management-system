import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertCircle } from 'lucide-react-native';

interface DisabledFeatureProps {
  title?: string;
  message?: string;
}

export function DisabledFeature({ 
  title = 'ئەم تایبەتمەندییە لە ئێستادا بەردەست نییە',
  message = 'ئەم بەشە پێویستی بە backend هەیە کە لە ئێستادا لابراوە بۆ کارکردنی سیستەم بە شێوەی لۆکاڵ.'
}: DisabledFeatureProps) {
  return (
    <View style={styles.container}>
      <AlertCircle size={64} color="#f59e0b" />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f3f4f6',
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1f2937',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});
