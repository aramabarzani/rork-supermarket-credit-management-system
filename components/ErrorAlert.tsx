import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Text } from 'react-native';
import { AlertTriangle, X, RefreshCw } from 'lucide-react-native';

interface ErrorAlertProps {
  visible: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  onRetry?: () => void;
}

export function ErrorAlert({ 
  visible, 
  title = 'هەڵە', 
  message, 
  onClose,
  onRetry 
}: ErrorAlertProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onClose}
          >
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
          
          <View style={styles.iconContainer}>
            <AlertTriangle size={48} color="#EF4444" />
          </View>
          
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <View style={styles.buttonContainer}>
            {onRetry && (
              <TouchableOpacity 
                style={[styles.button, styles.retryButton]}
                onPress={() => {
                  onClose();
                  onRetry();
                }}
              >
                <RefreshCw size={20} color="#fff" />
                <Text style={styles.retryButtonText}>دووبارە هەوڵبدەرەوە</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.button, styles.closeButtonStyle]}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>داخستن</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'System',
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
    fontFamily: 'System',
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  closeButtonStyle: {
    backgroundColor: '#F3F4F6',
  },
  closeButtonText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
});
