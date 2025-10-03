import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useSettings } from '@/hooks/settings-context';

interface KurdishTextProps extends TextProps {
  variant?: 'title' | 'subtitle' | 'body' | 'caption';
  color?: string;
}

export const KurdishText: React.FC<KurdishTextProps> = ({ 
  children, 
  variant = 'body', 
  color,
  style,
  ...props 
}) => {
  const settingsContext = useSettings();
  const settings = settingsContext?.settings;
  
  const isRTL = settings?.language === 'kurdish' || settings?.language === 'arabic';
  
  const fontSizeMultiplier = settings?.theme?.fontSize ? {
    'small': 0.875,
    'medium': 1,
    'large': 1.125,
    'extra-large': 1.25,
  }[settings.theme.fontSize] : 1;

  const variantStyle = styles[variant];
  const baseFontSize = typeof variantStyle.fontSize === 'number' ? variantStyle.fontSize : 16;

  return (
    <Text 
      {...props}
      style={[
        styles.base,
        isRTL ? styles.rtl : styles.ltr,
        variantStyle,
        { fontSize: baseFontSize * fontSizeMultiplier },
        color ? { color } : {},
        style,
      ]}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: 'System',
  },
  rtl: {
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  ltr: {
    writingDirection: 'ltr',
    textAlign: 'left',
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    opacity: 0.7,
  },
});
