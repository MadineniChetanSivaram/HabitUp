import React from 'react';
import { View, Text, Image, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export interface UserAvatarProps {
  avatar?: string | null;
  name?: string | null;
  size?: number;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  showBorder?: boolean;
  borderColor?: string;
  borderWidth?: number;
}

const GRADIENT_PALETTES: [string, string][] = [
  ['#8B5CF6', '#6366F1'], // Purple / Indigo
  ['#EC4899', '#F43F5E'], // Pink / Rose
  ['#06B6D4', '#3B82F6'], // Cyan / Blue
  ['#10B981', '#059669'], // Emerald / Teal
  ['#F59E0B', '#EA580C'], // Amber / Orange
  ['#7C3AED', '#C026D3'], // Violet / Fuchsia
  ['#38BDF8', '#6366F1'], // Sky / Indigo
  ['#FB7185', '#E11D48'], // Coral / Ruby
];

export const isImageUri = (str?: string | null): boolean => {
  if (!str || typeof str !== 'string') return false;
  const s = str.trim();
  return (
    s.startsWith('http://') ||
    s.startsWith('https://') ||
    s.startsWith('data:image/') ||
    s.startsWith('blob:') ||
    s.startsWith('file://') ||
    s.startsWith('/') ||
    s.includes('.png') ||
    s.includes('.jpg') ||
    s.includes('.jpeg') ||
    s.includes('.webp')
  );
};

export const isPlaceholderAvatar = (str?: string | null): boolean => {
  if (!str || typeof str !== 'string') return true;
  const s = str.trim();
  return s === '' || s === '🤝' || s === '🌟' || s === '👤';
};

export const getDeterministicGradient = (str?: string | null): [string, string] => {
  const seed = (str || 'HabitUp').trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENT_PALETTES.length;
  return GRADIENT_PALETTES[index];
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatar,
  name,
  size = 42,
  style,
  textStyle,
  showBorder = false,
  borderColor = 'rgba(255, 255, 255, 0.2)',
  borderWidth = 1.5,
}) => {
  const borderRadius = size / 2;
  const cleanName = (name || '').replace(/^@/, '').trim();
  const initial = cleanName ? cleanName.charAt(0).toUpperCase() : '?';

  // 1. If it's a real photo / image URI
  if (isImageUri(avatar)) {
    return (
      <View
        style={[
          styles.container,
          {
            width: size,
            height: size,
            borderRadius,
            borderColor: showBorder ? borderColor : 'transparent',
            borderWidth: showBorder ? borderWidth : 0,
          },
          style,
        ]}
      >
        <Image
          source={{ uri: avatar! }}
          style={{ width: size, height: size, borderRadius }}
          resizeMode="cover"
        />
      </View>
    );
  }

  // 2. If it's a non-placeholder custom emoji (e.g. 🤖, 🦁, 🚀, 🥑, etc.)
  if (avatar && !isPlaceholderAvatar(avatar)) {
    return (
      <View
        style={[
          styles.container,
          styles.emojiBox,
          {
            width: size,
            height: size,
            borderRadius,
            borderColor: showBorder ? borderColor : 'transparent',
            borderWidth: showBorder ? borderWidth : 0,
          },
          style,
        ]}
      >
        <Text style={[{ fontSize: Math.round(size * 0.52) }, textStyle]}>
          {avatar}
        </Text>
      </View>
    );
  }

  // 3. Fallback: Crisp modern gradient circle with the User's Initial
  const gradientColors = getDeterministicGradient(cleanName || avatar || 'User');

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius,
          borderColor: showBorder ? borderColor : 'transparent',
          borderWidth: showBorder ? borderWidth : 0,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradient,
          {
            width: size,
            height: size,
            borderRadius,
          },
        ]}
      >
        <Text
          style={[
            styles.initialText,
            {
              fontSize: Math.round(size * 0.44),
              lineHeight: Math.round(size * 0.52),
            },
            textStyle,
          ]}
        >
          {initial}
        </Text>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiBox: {
    backgroundColor: 'rgba(124, 92, 255, 0.12)',
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialText: {
    color: '#FFFFFF',
    fontWeight: '900',
    textAlign: 'center',
    includeFontPadding: false,
  },
});
