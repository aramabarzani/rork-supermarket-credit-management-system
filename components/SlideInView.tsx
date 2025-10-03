import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface SlideInViewProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'top' | 'bottom';
  duration?: number;
  delay?: number;
  distance?: number;
  style?: ViewStyle;
}

export function SlideInView({ 
  children, 
  direction = 'bottom',
  duration = 500, 
  delay = 0,
  distance = 50,
  style 
}: SlideInViewProps) {
  const slideAnim = useRef(new Animated.Value(distance)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, fadeAnim, duration, delay]);

  const getTransform = () => {
    switch (direction) {
      case 'left':
        return { translateX: slideAnim };
      case 'right':
        return { translateX: Animated.multiply(slideAnim, -1) };
      case 'top':
        return { translateY: slideAnim };
      case 'bottom':
      default:
        return { translateY: Animated.multiply(slideAnim, -1) };
    }
  };

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [getTransform()],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
