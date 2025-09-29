import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';

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
  return (
    <Text 
      {...props}
      style={[
        styles.base,
        styles[variant],
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
    writingDirection: 'rtl',
    textAlign: 'right',
    fontFamily: 'System',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    opacity: 0.7,
  },
});