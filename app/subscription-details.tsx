import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';

export default function SubscriptionDetailsScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'وردەکاری ئابوونە' }} />
      <View style={styles.content}>
        <Text style={styles.title}>ئەم تایبەتمەندییە لە ئێستادا بەردەست نییە</Text>
        <Text style={styles.message}>
          ئەم بەشە پێویستی بە backend هەیە کە لە ئێستادا لابراوە بۆ کارکردنی سیستەم بە شێوەی لۆکاڵ.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
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
