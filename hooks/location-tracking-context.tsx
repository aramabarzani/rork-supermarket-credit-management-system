import { useState, useEffect, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import createContextHook from '@nkzw/create-context-hook';
import { trpcClient } from '@/lib/trpc';
import type { LocationData, LocationSettings } from '@/types/location-tracking';

export const [LocationTrackingProvider, useLocationTracking] = createContextHook(() => {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [settings, setSettings] = useState<LocationSettings>({
    enableLocationTracking: true,
    trackEmployeeLocation: true,
    trackCustomerLocation: false,
    requireLocationForLogin: false,
    locationUpdateInterval: 300,
    restrictLoginByLocation: false,
  });

  const updateCurrentLocation = useCallback((location: LocationData) => {
    setCurrentLocation(location);
  }, []);

  const requestLocationPermission = useCallback(async () => {
    try {
      if (Platform.OS === 'web') {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setLocationPermission(true);
              updateCurrentLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy ?? 0,
                timestamp: new Date().toISOString(),
              });
            },
            (error) => {
              console.log('Location permission denied:', error);
              setLocationPermission(false);
            }
          );
        }
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocationPermission(status === 'granted');
        
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          updateCurrentLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy ?? 0,
            timestamp: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setLocationPermission(false);
    }
  }, [updateCurrentLocation]);

  const loadSettings = useCallback(async () => {
    try {
      const result = await trpcClient.location.tracking.getSettings.query();
      if (result) {
        setSettings(result);
      }
    } catch (error) {
      console.error('Error loading location settings:', error);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        await requestLocationPermission();
        await loadSettings();
      } catch (error) {
        console.error('Error initializing location tracking:', error);
      }
    };
    init();
  }, [requestLocationPermission, loadSettings]);

  const getCurrentLocation = useCallback(async (): Promise<LocationData | null> => {
    try {
      if (!locationPermission) {
        await requestLocationPermission();
      }

      if (Platform.OS === 'web') {
        return new Promise((resolve) => {
          if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const location: LocationData = {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  accuracy: position.coords.accuracy ?? 0,
                  timestamp: new Date().toISOString(),
                };
                setCurrentLocation(location);
                resolve(location);
              },
              (error) => {
                console.error('Error getting location:', error);
                resolve(null);
              }
            );
          } else {
            resolve(null);
          }
        });
      } else {
        const location = await Location.getCurrentPositionAsync({});
        const locationData: LocationData = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy ?? 0,
          timestamp: new Date().toISOString(),
        };
        setCurrentLocation(locationData);
        return locationData;
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }, [locationPermission, requestLocationPermission]);

  const recordLoginActivity = useCallback(async (
    userId: string,
    userName: string,
    userRole: 'owner' | 'admin' | 'employee' | 'customer'
  ) => {
    try {
      const location = await getCurrentLocation();
      if (!location) {
        console.log('Location not available for login tracking');
        return null;
      }

      const deviceInfo = {
        platform: Platform.OS,
        deviceType: Platform.OS === 'web' ? 'desktop' as const : 'mobile' as const,
      };

      const result = await trpcClient.location.tracking.recordLogin.mutate({
        userId,
        userName,
        userRole,
        location,
        ipAddress: '0.0.0.0',
        deviceInfo,
      });

      console.log('Login activity recorded:', result);
      return result.activity;
    } catch (error) {
      console.error('Error recording login activity:', error);
      return null;
    }
  }, [getCurrentLocation]);

  const recordLogoutActivity = useCallback(async (activityId: string) => {
    try {
      const location = await getCurrentLocation();
      await trpcClient.location.tracking.recordLogout.mutate({
        activityId,
        location: location || undefined,
      });
      console.log('Logout activity recorded');
    } catch (error) {
      console.error('Error recording logout activity:', error);
    }
  }, [getCurrentLocation]);

  const startTracking = useCallback(() => {
    setIsTracking(true);
    console.log('Location tracking started');
  }, []);

  const stopTracking = useCallback(() => {
    setIsTracking(false);
    console.log('Location tracking stopped');
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<LocationSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      await trpcClient.location.tracking.updateSettings.mutate(updatedSettings);
      setSettings(updatedSettings);
      console.log('Location settings updated');
    } catch (error) {
      console.error('Error updating location settings:', error);
    }
  }, [settings]);

  return useMemo(() => ({
    currentLocation,
    locationPermission,
    isTracking,
    settings,
    requestLocationPermission,
    getCurrentLocation,
    recordLoginActivity,
    recordLogoutActivity,
    startTracking,
    stopTracking,
    updateSettings,
  }), [
    currentLocation,
    locationPermission,
    isTracking,
    settings,
    requestLocationPermission,
    getCurrentLocation,
    recordLoginActivity,
    recordLogoutActivity,
    startTracking,
    stopTracking,
    updateSettings,
  ]);
});
