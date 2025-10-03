import React, { useRef } from 'react';
import { 
  Animated, 
  Pressable, 
  PressableProps, 
  ViewStyle 
} from 'react-native';

interface PressableScaleProps extends PressableProps {
  children: React.ReactNode;
  scaleValue?: number;
  style?: ViewStyle;
}

export function PressableScale({ 
  children, 
  scaleValue = 0.95,
  style,
  onPressIn,
  onPressOut,
  ...props 
}: PressableScaleProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = (event: any) => {
    Animated.spring(scaleAnim, {
      toValue: scaleValue,
      useNativeDriver: true,
    }).start();
    onPressIn?.(event);
  };

  const handlePressOut = (event: any) => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
    onPressOut?.(event);
  };

  return (
    <Pressable
      {...props}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          style,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}
