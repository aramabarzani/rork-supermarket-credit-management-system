import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';

interface PushNotificationContextValue {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  isPermissionGranted: boolean;
  requestPermission: () => Promise<boolean>;
  sendLocalNotification: (title: string, body: string, data?: any) => Promise<void>;
  scheduleNotification: (title: string, body: string, seconds: number, data?: any) => Promise<string>;
  cancelNotification: (notificationId: string) => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
}

const PUSH_TOKEN_KEY = '@push_token';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export const [PushNotificationProvider, usePushNotification] = createContextHook<PushNotificationContextValue>(() => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [isPermissionGranted, setIsPermissionGranted] = useState<boolean>(false);
  
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  const registerForPushNotificationsAsync = useCallback(async (): Promise<string | null> => {
    if (Platform.OS === 'web') {
      console.log('Push notifications are not supported on web');
      return null;
    }

    let token: string | null = null;

    if (Device.isDevice || Platform.OS === 'ios' || Platform.OS === 'android') {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        setIsPermissionGranted(false);
        return null;
      }
      
      setIsPermissionGranted(true);
      
      try {
        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId: process.env.EXPO_PUBLIC_PROJECT_ID || 'default',
        });
        token = tokenData.data;
        
        if (token) {
          await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);
        }
      } catch (error) {
        console.error('Error getting push token:', error);
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return token;
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const token = await registerForPushNotificationsAsync();
    if (token) {
      setExpoPushToken(token);
      return true;
    }
    return false;
  }, [registerForPushNotificationsAsync]);

  const sendLocalNotification = useCallback(async (
    title: string,
    body: string,
    data?: any
  ): Promise<void> => {
    if (Platform.OS === 'web') {
      console.log('Local notifications not supported on web');
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
      },
      trigger: null,
    });
  }, []);

  const scheduleNotification = useCallback(async (
    title: string,
    body: string,
    seconds: number,
    data?: any
  ): Promise<string> => {
    if (Platform.OS === 'web') {
      console.log('Scheduled notifications not supported on web');
      return '';
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
        repeats: false,
      },
    });

    return notificationId;
  }, []);

  const cancelNotification = useCallback(async (notificationId: string): Promise<void> => {
    if (Platform.OS === 'web') {
      return;
    }
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }, []);

  const cancelAllNotifications = useCallback(async (): Promise<void> => {
    if (Platform.OS === 'web') {
      return;
    }
    await Notifications.cancelAllScheduledNotificationsAsync();
  }, []);

  useEffect(() => {
    const loadToken = async () => {
      const stored = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
      if (stored) {
        setExpoPushToken(stored);
      }
    };

    loadToken();
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
      }
    });

    if (Platform.OS !== 'web') {
      notificationListener.current = Notifications.addNotificationReceivedListener((notification: Notifications.Notification) => {
        setNotification(notification);
        console.log('Notification received:', notification);
      });

      responseListener.current = Notifications.addNotificationResponseReceivedListener((response: Notifications.NotificationResponse) => {
        console.log('Notification response:', response);
      });
    }

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [registerForPushNotificationsAsync]);

  return useMemo(() => ({
    expoPushToken,
    notification,
    isPermissionGranted,
    requestPermission,
    sendLocalNotification,
    scheduleNotification,
    cancelNotification,
    cancelAllNotifications,
  }), [
    expoPushToken,
    notification,
    isPermissionGranted,
    requestPermission,
    sendLocalNotification,
    scheduleNotification,
    cancelNotification,
    cancelAllNotifications,
  ]);
});
