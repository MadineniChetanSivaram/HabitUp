// HabitUp Vector Lottie Animation Assets
import streakFlameData from './streak_flame.json';
import celebrationBurstData from './celebration_burst.json';
import plantGrowingData from './plant_growing.json';
import mascotWavingData from './mascot_waving.json';
import trophyAchievementData from './trophy_achievement.json';
import zenMeditationData from './zen_meditation.json';

export const LOTTIE_ANIMATIONS = {
  streakFlame: streakFlameData,
  celebrationBurst: celebrationBurstData,
  plantGrowing: plantGrowingData,
  mascotWaving: mascotWavingData,
  trophyAchievement: trophyAchievementData,
  zenMeditation: zenMeditationData,
} as const;

export type LottieAnimationKey = keyof typeof LOTTIE_ANIMATIONS;
