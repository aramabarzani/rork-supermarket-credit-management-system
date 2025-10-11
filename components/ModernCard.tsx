import React from 'react';
import { View, StyleSheet, ViewProps, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, BORDER_RADIUS, SPACING } from '@/constants/design-system';

interface ModernCardProps extends ViewProps {
  variant?: 'default' | 'gradient' | 'outlined' | 'glass' | 'elevated';
  gradientColors?: [string, string, ...string[]];
  onPress?: () => void;
  elevation?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const ModernCard: React.FC<ModernCardProps> = ({
  children,
  variant = 'default',
  gradientColors,
  onPress,
  elevation = 'md',
  style,
  ...props
}) => {
  const containerStyle = [
    styles.container,
    variant === 'outlined' && styles.outlined,
    variant === 'glass' && styles.glass,
    variant === 'elevated' && styles.elevated,
    SHADOWS[elevation],
    style,
  ];

  const defaultGradient: [string, string] = [COLORS.primary[500], COLORS.primary[600]];
  const safeGradientColors = gradientColors || defaultGradient;

  if (variant === 'gradient') {
    const Wrapper = onPress ? TouchableOpacity : View;
    return (
      <Wrapper style={containerStyle} onPress={onPress} activeOpacity={0.7} {...props}>
        <LinearGradient
          colors={safeGradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBackground}
        />
        <View style={styles.content}>
          {children}
        </View>
      </Wrapper>
    );
  }

  if (onPress) {
    return (
      <TouchableOpacity style={containerStyle} onPress={onPress} activeOpacity={0.7} {...props}>
        <View style={styles.content}>
          {children}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={containerStyle} {...props}>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.neutral.white,
    overflow: 'hidden',
  },
  outlined: {
    borderWidth: 2,
    borderColor: COLORS.primary[200],
    backgroundColor: COLORS.neutral.white,
  },
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  elevated: {
    backgroundColor: COLORS.neutral.white,
    borderWidth: 0,
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    padding: SPACING.xl,
  },
});
