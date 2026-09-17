import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PlantStageInfo } from '../../types';
import { getActiveRealmProgress } from '../../utils/realmStreakData';
import { StreakRealmIllustration } from './StreakRealmIllustration';
import { Sparkles, Droplets } from 'lucide-react-native';

interface PlantVisualizerProps {
  stage?: PlantStageInfo;
  streak?: number;
  hydrationPercent?: number;
  isWateredToday?: boolean;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

export const PlantVisualizer: React.FC<PlantVisualizerProps> = ({
  stage,
  streak = 0,
  hydrationPercent = 0,
  isWateredToday = false,
  size = 'md',
}) => {
  const { activeRealm, stage: realmStage } = getActiveRealmProgress(streak);
  const currentLevel = stage?.level || realmStage.level || 1;

  return (
    <View style={styles.container}>
      <StreakRealmIllustration
        realmId={activeRealm.id}
        level={currentLevel}
        hydrationPercent={hydrationPercent}
        isWateredToday={isWateredToday}
        size={size}
        isAnimated={true}
      />

      {isWateredToday && size !== 'sm' && (
        <View style={styles.sparkleBadge}>
          <Sparkles size={14} color="#FDE047" />
        </View>
      )}

      {hydrationPercent > 0 && !isWateredToday && size !== 'sm' && (
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
    backgroundColor: 'rgba(253, 224, 71, 0.25)',
    borderRadius: 10,
    padding: 2,
  },
  dropletBadge: {
    position: 'absolute',
    top: -4,
    left: -4,
    backgroundColor: 'rgba(56, 189, 248, 0.25)',
    borderRadius: 10,
    padding: 2,
  },
});

