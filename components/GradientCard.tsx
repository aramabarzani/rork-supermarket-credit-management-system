import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientCardProps extends ViewProps {
  colors?: string[];
  intensity?: 'light' | 'medium' | 'strong';
}

export const GradientCard: React.FC<GradientCardProps> = ({ 
  children, 
  colors = ['#1E3A8A', '#3B82F6'],
  intensity = 'medium',
  style,
  ...props 
}) => {
  const opacities = {
    light: 0.1,
    medium: 0.15,
    strong: 0.25,
  };

  return (
    <View style={[styles.container, style]} {...props}>
      <LinearGradient
        colors={colors}
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
    borderRadius: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
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