import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SHADOWS, BORDER_RADIUS, SPACING, TYPOGRAPHY } from '@/constants/design-system';

interface ModernButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  gradient?: boolean;
}

export const ModernButton: React.FC<ModernButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  gradient = false,
}) => {
  const getVariantColors = () => {
    switch (variant) {
      case 'primary':
        return {
          bg: COLORS.primary[600],
          text: COLORS.neutral.white,
          gradient: [COLORS.primary[500], COLORS.primary[600], COLORS.primary[700]] as [string, string, string],
        };
      case 'secondary':
        return {
          bg: COLORS.secondary[600],
          text: COLORS.neutral.white,
          gradient: [COLORS.secondary[500], COLORS.secondary[600], COLORS.secondary[700]] as [string, string, string],
        };
      case 'success':
        return {
          bg: COLORS.success[600],
          text: COLORS.neutral.white,
          gradient: [COLORS.success[500], COLORS.success[600], COLORS.success[700]] as [string, string, string],
        };
      case 'danger':
        return {
          bg: COLORS.danger[600],
          text: COLORS.neutral.white,
          gradient: [COLORS.danger[500], COLORS.danger[600], COLORS.danger[700]] as [string, string, string],
        };
      case 'warning':
        return {
          bg: COLORS.warning[600],
          text: COLORS.neutral.white,
          gradient: [COLORS.warning[500], COLORS.warning[600], COLORS.warning[700]] as [string, string, string],
        };
      case 'outline':
        return {
          bg: 'transparent',
          text: COLORS.primary[600],
          gradient: [COLORS.primary[500], COLORS.primary[600]] as [string, string],
        };
      case 'ghost':
        return {
          bg: 'transparent',
          text: COLORS.primary[600],
          gradient: [COLORS.primary[500], COLORS.primary[600]] as [string, string],
        };
      default:
        return {
          bg: COLORS.primary[600],
          text: COLORS.neutral.white,
          gradient: [COLORS.primary[500], COLORS.primary[600], COLORS.primary[700]] as [string, string, string],
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: SPACING.sm,
          paddingHorizontal: SPACING.md,
          fontSize: TYPOGRAPHY.fontSize.sm,
        };
      case 'lg':
        return {
          paddingVertical: SPACING.lg,
          paddingHorizontal: SPACING.xl,
          fontSize: TYPOGRAPHY.fontSize.lg,
        };
      default:
        return {
          paddingVertical: SPACING.md,
          paddingHorizontal: SPACING.lg,
          fontSize: TYPOGRAPHY.fontSize.base,
        };
    }
  };

  const colors = getVariantColors();
  const sizeStyles = getSizeStyles();
  const isDisabled = disabled || loading;

  const buttonStyle = [
    styles.button,
    {
      paddingVertical: sizeStyles.paddingVertical,
      paddingHorizontal: sizeStyles.paddingHorizontal,
    },
    variant === 'outline' && styles.outline,
    variant === 'ghost' && styles.ghost,
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    !gradient && { backgroundColor: colors.bg },
  ];

  const renderContent = () => (
    <View style={[styles.content, fullWidth && styles.fullWidth]}>
      {loading ? (
        <ActivityIndicator color={colors.text} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
          <Text style={[styles.text, { color: colors.text, fontSize: sizeStyles.fontSize }]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </>
      )}
    </View>
  );

  if (gradient && variant !== 'outline' && variant !== 'ghost') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[buttonStyle, SHADOWS.md]}
      >
        <LinearGradient
          colors={colors.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[buttonStyle, variant !== 'ghost' && SHADOWS.sm]}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  text: {
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: SPACING.xs,
  },
  iconRight: {
    marginLeft: SPACING.xs,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: COLORS.primary[600],
    backgroundColor: 'transparent',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
});
