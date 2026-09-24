import React from 'react';
import { View, StyleSheet, Platform, ViewStyle } from 'react-native';
import { IconRenderer } from './IconRenderer';

interface DuotoneIconProps {
  name: string;
  color?: string;
  size?: number;
  containerSize?: number;
  borderRadius?: number;
  isCompleted?: boolean;
  style?: ViewStyle;
}

/**
 * Duotone Glass Icon Badge
 * Renders a frosted translucent tinted glass background matching the habit's color,
 * with a subtle luminous border, inner soft glow, and a high-vibrancy icon.
 */
export const DuotoneIconBadge: React.FC<DuotoneIconProps> = ({
  name,
  color = '#7C5CFF',
  size = 20,
  containerSize = 44,
  borderRadius = 16,
  isCompleted = false,
  style,
}) => {
  // Convert hex color to rgba for smooth glass layers
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2) || '7C', 16);
  const g = parseInt(hex.substring(2, 4) || '5C', 16);
  const b = parseInt(hex.substring(4, 6) || 'FF', 16);

  const bgAlpha = isCompleted ? 0.12 : 0.18;
  const borderAlpha = isCompleted ? 0.22 : 0.38;
  const glowAlpha = isCompleted ? 0.08 : 0.25;

  const bgGlass = `rgba(${r}, ${g}, ${b}, ${bgAlpha})`;
  const borderGlass = `rgba(${r}, ${g}, ${b}, ${borderAlpha})`;
  const shadowGlass = `rgba(${r}, ${g}, ${b}, ${glowAlpha})`;

  return (
    <View
      style={[
        styles.glassContainer,
        {
          width: containerSize,
          height: containerSize,
          borderRadius,
          backgroundColor: bgGlass,
          borderColor: borderGlass,
          shadowColor: shadowGlass,
        },
        Platform.OS === 'web' &&
          ({
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            boxShadow: `0 4px 14px ${shadowGlass}, inset 0 1px 1px rgba(255, 255, 255, 0.25)`,
          } as any),
        style,
      ]}
    >
      <IconRenderer
        name={name}
        size={size}
        color={color}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  glassContainer: {
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
});
