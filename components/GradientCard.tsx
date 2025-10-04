import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, BORDER_RADIUS } from '@/constants/design-system';

interface GradientCardProps extends ViewProps {
  colors?: string[];
  intensity?: 'light' | 'medium' | 'strong';
  variant?: 'elevated' | 'flat' | 'outlined';
}

export const GradientCard: React.FC<GradientCardProps> = ({ 
  children, 
  colors = [COLORS.primary[500], COLORS.primary[600]],
  intensity = 'medium',
  variant = 'elevated',
  style,
  ...props 
}) => {
  const opacities = {
    light: 0.08,
    medium: 0.12,
    strong: 0.2,
  };

  const safeColors = (Array.isArray(colors) && colors.length > 0 && colors.every(c => typeof c === 'string' && c.length > 0)
    ? colors
    : [COLORS.primary[500], COLORS.primary[600]]) as [string, string, ...string[]];

  const containerStyle = [
    styles.container,
    variant === 'elevated' && styles.elevated,
    variant === 'outlined' && styles.outlined,
    style,
  ];

  return (
    <View style={containerStyle} {...props}>
      <LinearGradient
        colors={safeColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, { opacity: opacities[intensity] }]}
      />
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.neutral.white,
    overflow: 'hidden',
  },
  elevated: {
    ...SHADOWS.md,
  },
  outlined: {
    borderWidth: 1,
    borderColor: COLORS.border.medium,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    padding: 16,
  },
});
