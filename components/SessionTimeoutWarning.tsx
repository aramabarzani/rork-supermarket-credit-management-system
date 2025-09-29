import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { AlertTriangle, Clock } from 'lucide-react-native';
import { useSecurity } from '@/hooks/security-context';
import { useAuth } from '@/hooks/auth-context';

export const SessionTimeoutWarning: React.FC = () => {
  const { sessionWarningShown, updateSessionActivity } = useSecurity();
  const { logout } = useAuth();
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(120); // 2 minutes warning
  const fadeAnim = new Animated.Value(0);

  const handleLogout = async () => {
    setVisible(false);
    await logout();
  };

  const handleContinue = () => {
    updateSessionActivity();
    setVisible(false);
  };

  useEffect(() => {
    if (sessionWarningShown) {
      setVisible(true);
      setCountdown(120);
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setVisible(false);
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [sessionWarningShown, fadeAnim]);



  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={handleContinue}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
          <View style={styles.header}>
            <AlertTriangle size={32} color="#EF4444" />
            <Text style={styles.title}>ئاگاداری کاتی کۆتایی</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.message}>
              سێشنەکەت بەزووی کۆتایی دێت بەهۆی نەبوونی چالاکی
            </Text>
            
            <View style={styles.countdownContainer}>
              <Clock size={24} color="#F59E0B" />
              <Text style={styles.countdown}>
                {formatTime(countdown)}
              </Text>
            </View>

            <Text style={styles.subMessage}>
              ئەگەر چالاکیت نەبێت، خۆکارانە دەرچیت
            </Text>
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
            >
              <Text style={styles.continueButtonText}>
                بەردەوامبوون
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>
                دەرچوون
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

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
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 12,
    textAlign: 'center',
  },
  content: {
    alignItems: 'center',
    marginBottom: 24,
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  countdown: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D97706',
    marginLeft: 8,
  },
  subMessage: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  continueButton: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});