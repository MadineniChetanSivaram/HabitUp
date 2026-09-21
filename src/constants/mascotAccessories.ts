export type AccessoryCategory = 'hat' | 'glasses';
export type AccessoryRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface MascotAccessoryItem {
  id: string;
  name: string;
  category: AccessoryCategory;
  price: number;
  icon: string;
  description: string;
  rarity: AccessoryRarity;
  badgeColor: string;
}

export const MASCOT_ACCESSORIES: MascotAccessoryItem[] = [
  // 🎩 HATS & HEADGEAR
  {
    id: 'detective',
    name: 'Detective Cap',
    category: 'hat',
    price: 60,
    icon: '🕵️',
    description: 'Investigating missing habits! Classic tweed cap with magnifying badge.',
    rarity: 'rare',
    badgeColor: '#3B82F6',
  },
  {
    id: 'wizard',
    name: 'Wizard Star Hat',
    category: 'hat',
    price: 120,
    icon: '🧙',
    description: 'Cast consistency spells! Indigo pointed hat studded with golden stars.',
    rarity: 'epic',
    badgeColor: '#8B5CF6',
  },
  {
    id: 'chef',
    name: 'Chef Toque',
    category: 'hat',
    price: 50,
    icon: '👨‍🍳',
    description: 'Cooking up healthy routines! Tall fluffy culinary master hat.',
    rarity: 'common',
    badgeColor: '#10B981',
  },
  {
    id: 'crown',
    name: 'Royal Diamond Crown',
    category: 'hat',
    price: 250,
    icon: '👑',
    description: 'Fit for a habit monarch! Polished gold coronet with ruby jewels.',
    rarity: 'legendary',
    badgeColor: '#F59E0B',
  },
  {
    id: 'santa',
    name: 'Holiday Santa Cap',
    category: 'hat',
    price: 80,
    icon: '🎅',
    description: 'Spreading festive motivation! Red velvet with fluffy white puff.',
    rarity: 'rare',
    badgeColor: '#EF4444',
  },
  {
    id: 'ninja_band',
    name: 'Focus Ninja Headband',
    category: 'hat',
    price: 70,
    icon: '🥋',
    description: 'Unbreakable warrior discipline! Crimson red martial arts headband.',
    rarity: 'rare',
    badgeColor: '#DC2626',
  },
  {
    id: 'flower_crown',
    name: 'Sakura Flower Crown',
    category: 'hat',
    price: 90,
    icon: '🌸',
    description: 'Fresh blossoming habit energy! Delicate pink cherry blossoms & vines.',
    rarity: 'rare',
    badgeColor: '#EC4899',
  },
  {
    id: 'party_hat',
    name: 'Party Cone',
    category: 'hat',
    price: 40,
    icon: '🥳',
    description: 'Every completed habit is a celebration! Rainbow striped party cone.',
    rarity: 'common',
    badgeColor: '#06B6D4',
  },
  {
    id: 'beanie',
    name: 'Cozy Teal Beanie',
    category: 'hat',
    price: 45,
    icon: '🧢',
    description: 'Warm and comfortable for cool morning check-ins.',
    rarity: 'common',
    badgeColor: '#0D9488',
  },

  // 🕶️ GLASSES & EYEWEAR
  {
    id: 'aviators',
    name: 'Cool Aviator Shades',
    category: 'glasses',
    price: 75,
    icon: '😎',
    description: 'Too cool for broken streaks! Sleek dark gold-rim sunglasses with shine.',
    rarity: 'rare',
    badgeColor: '#F59E0B',
  },
  {
    id: 'round_specs',
    name: 'Scholar Round Specs',
    category: 'glasses',
    price: 55,
    icon: '👓',
    description: 'For studious deep work & learning routines! Intellectual circular frames.',
    rarity: 'common',
    badgeColor: '#6366F1',
  },
  {
    id: 'monocle',
    name: 'Golden Monocle',
    category: 'glasses',
    price: 110,
    icon: '🧐',
    description: 'Exquisite gentleman taste! Gold rim monocle with hanging chain.',
    rarity: 'epic',
    badgeColor: '#D97706',
  },
  {
    id: 'star_glasses',
    name: 'Star Rocker Glasses',
    category: 'glasses',
    price: 85,
    icon: '🤩',
    description: 'Rockstar momentum! Golden star-shaped festival shades.',
    rarity: 'rare',
    badgeColor: '#EAB308',
  },
  {
    id: 'pixel_shades',
    name: '8-Bit Pixel Shades',
    category: 'glasses',
    price: 130,
    icon: '🕶️',
    description: 'Deal with it! Stepped retro arcade pixel sunglasses.',
    rarity: 'epic',
    badgeColor: '#14B8A6',
  },
];

export const RARITY_LABELS: Record<AccessoryRarity, { label: string; color: string; bg: string }> = {
  common: { label: 'Common', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' },
  rare: { label: 'Rare', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.15)' },
  epic: { label: 'Epic', color: '#A855F7', bg: 'rgba(168, 85, 247, 0.15)' },
  legendary: { label: 'Legendary', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' },
};
