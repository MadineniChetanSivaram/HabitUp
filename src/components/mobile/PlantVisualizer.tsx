import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PlantStageInfo } from '../../types';
import { LottieAnimation } from '../common/LottieAnimation';
import { Sparkles, Droplets } from 'lucide-react-native';

interface PlantVisualizerProps {
  stage: PlantStageInfo;
  streak: number;
  hydrationPercent: number;
  isWateredToday: boolean;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

export const PlantVisualizer: React.FC<PlantVisualizerProps> = ({
  stage,
  streak,
  hydrationPercent,
  isWateredToday,
  size = 'md',
}) => {
  const pixelSize = size === 'sm' ? 46 : size === 'lg' ? 140 : 76;

  return (
    <View style={styles.container}>
      <LottieAnimation
        source="plantGrowing"
        size={pixelSize}
        speed={isWateredToday ? 1.2 : 0.8}
      />

      {isWateredToday && (
        <View style={styles.sparkleBadge}>
          <Sparkles size={14} color="#FDE047" />
        </View>
      )}

      {hydrationPercent > 0 && !isWateredToday && (
        <View style={styles.dropletBadge}>
          <Droplets size={14} color="#38BDF8" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  sparkleBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'rgba(253, 224, 71, 0.2)',
    borderRadius: 10,
    padding: 2,
  },
  dropletBadge: {
    position: 'absolute',
    top: -4,
    left: -4,
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    borderRadius: 10,
    padding: 2,
  },
});
