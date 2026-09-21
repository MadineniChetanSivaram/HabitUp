import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { useHabit } from '../../context/HabitContext';
import {
  MASCOT_ACCESSORIES,
  MascotAccessoryItem,
  AccessoryCategory,
  RARITY_LABELS,
} from '../../constants/mascotAccessories';
import { HabitlyMascot } from '../mobile/HabitlyMascot';
import {
  X,
  Sparkles,
  ShoppingBag,
  Check,
  Gift,
  HelpCircle,
} from 'lucide-react-native';

export const SparkyShopModal: React.FC = () => {
  const {
    isShopModalOpen,
    setIsShopModalOpen,
    bambooCoins,
    ownedAccessories,
    equippedHat,
    equippedGlasses,
    buyAccessory,
    equipAccessory,
    earnBambooCoins,
    theme,
    showToast,
  } = useHabit();

  const isDark = theme === 'dark';
  const [selectedCategory, setSelectedCategory] = useState<AccessoryCategory | 'all'>('all');
  const [previewItem, setPreviewItem] = useState<MascotAccessoryItem | null>(null);
  const [hasClaimedDailyGift, setHasClaimedDailyGift] = useState(false);

  if (!isShopModalOpen) return null;

  // Filter items by category
  const filteredItems = selectedCategory === 'all'
    ? MASCOT_ACCESSORIES
    : MASCOT_ACCESSORIES.filter((item) => item.category === selectedCategory);

  // Determine what Sparky is wearing in the fitting room preview
  const displayHat = previewItem?.category === 'hat' ? previewItem.id : equippedHat;
  const displayGlasses = previewItem?.category === 'glasses' ? previewItem.id : equippedGlasses;

  const isEquipped = (item: MascotAccessoryItem) => {
    if (item.category === 'hat') return equippedHat === item.id;
    if (item.category === 'glasses') return equippedGlasses === item.id;
    return false;
  };

  const isOwned = (item: MascotAccessoryItem) => {
    return ownedAccessories.includes(item.id);
  };

  const handleAction = (item: MascotAccessoryItem) => {
    if (isOwned(item)) {
      if (isEquipped(item)) {
        equipAccessory(item.category, null);
        showToast(`Unequipped ${item.name}`, undefined, 'info');
      } else {
        equipAccessory(item.category, item.id);
        showToast(`Equipped ${item.name}! ✨`, undefined, 'success');
      }
    } else {
      const bought = buyAccessory(item.id, item.price);
      if (bought) {
        equipAccessory(item.category, item.id);
      }
    }
  };

  const handleClaimDailyGift = () => {
    if (hasClaimedDailyGift) return;
    setHasClaimedDailyGift(true);
    earnBambooCoins(35, 'Daily Sparky Boutique Gift 🎁');
  };

  return (
    <Modal
      visible={isShopModalOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsShopModalOpen(false)}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContent,
            { backgroundColor: isDark ? '#0F172A' : '#FFFFFF' },
          ]}
        >
          {/* Header Row: Title, Coin Balance & Close */}
          <View style={styles.header}>
            <View style={styles.titleGroup}>
              <View style={styles.shopBadge}>
                <ShoppingBag size={18} color="#F59E0B" />
              </View>
              <View>
                <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                  Sparky's Boutique
                </Text>
                <Text style={[styles.subtitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                  Customize Sparky with earned rewards! 🎋
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setIsShopModalOpen(false)}
              style={[
                styles.closeButton,
                { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
              ]}
            >
              <X size={20} color={isDark ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>
          </View>

          {/* Fitting Room Preview Card */}
          <View
            style={[
              styles.fittingRoomCard,
              {
                backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
              },
            ]}
          >
            <View style={styles.fittingRoomMascot}>
              <HabitlyMascot
                size={110}
                forcedMood="hopeful"
                equippedHat={displayHat}
                equippedGlasses={displayGlasses}
              />
            </View>

            <View style={styles.fittingRoomInfo}>
              <View style={styles.coinsPill}>
                <Text style={styles.coinsEmoji}>🎋</Text>
                <Text style={styles.coinsText}>{bambooCoins}</Text>
                <Text style={styles.coinsLabel}>Bamboo Coins</Text>
              </View>

              <Text style={[styles.fittingRoomHelp, { color: isDark ? '#CBD5E1' : '#475569' }]}>
                {previewItem
                  ? `Trying on: ${previewItem.name}`
                  : 'Tap a hat or pair of glasses to try on or equip!'}
              </Text>

              {/* Free Daily Coins Bonus */}
              {!hasClaimedDailyGift && (
                <TouchableOpacity
                  onPress={handleClaimDailyGift}
                  style={styles.dailyGiftBtn}
                  activeOpacity={0.85}
                >
                  <Gift size={14} color="#FFFFFF" />
                  <Text style={styles.dailyGiftText}>Claim Daily 35 🎋 Gift</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Category Tabs */}
          <View style={styles.categoryContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
              {[
                { key: 'all', label: 'All Items', icon: '✨' },
                { key: 'hat', label: 'Hats', icon: '🎩' },
                { key: 'glasses', label: 'Glasses', icon: '🕶️' },
              ].map((cat) => {
                const isActive = selectedCategory === cat.key;
                return (
                  <TouchableOpacity
                    key={cat.key}
                    onPress={() => setSelectedCategory(cat.key as any)}
                    style={[
                      styles.categoryTab,
                      isActive
                        ? { backgroundColor: '#7C5CFF', borderColor: '#7C5CFF' }
                        : {
                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9',
                            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                          },
                    ]}
                  >
                    <Text style={styles.catTabIcon}>{cat.icon}</Text>
                    <Text
                      style={[
                        styles.catTabLabel,
                        { color: isActive ? '#FFFFFF' : isDark ? '#94A3B8' : '#64748B' },
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Items Grid */}
          <ScrollView
            style={styles.itemsScroll}
            contentContainerStyle={styles.itemsGrid}
            showsVerticalScrollIndicator={false}
          >
            {filteredItems.map((item) => {
              const owned = isOwned(item);
              const equipped = isEquipped(item);
              const isPreviewing = previewItem?.id === item.id;
              const rarityInfo = RARITY_LABELS[item.rarity];

              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setPreviewItem(isPreviewing ? null : item)}
                  activeOpacity={0.85}
                  style={[
                    styles.itemCard,
                    {
                      backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                      borderColor: equipped
                        ? '#10B981'
                        : isPreviewing
                        ? '#7C5CFF'
                        : isDark
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(0, 0, 0, 0.08)',
                    },
                  ]}
                >
                  {/* Top Row: Rarity Tag & Status Indicator */}
                  <View style={styles.itemCardTop}>
                    <View style={[styles.rarityBadge, { backgroundColor: rarityInfo.bg }]}>
                      <Text style={[styles.rarityText, { color: rarityInfo.color }]}>
                        {rarityInfo.label}
                      </Text>
                    </View>
                    {equipped && (
                      <View style={styles.equippedBadge}>
                        <Check size={11} color="#FFFFFF" strokeWidth={3} />
                        <Text style={styles.equippedBadgeText}>Equipped</Text>
                      </View>
                    )}
                  </View>

                  {/* Icon & Name */}
                  <View style={styles.itemIconContainer}>
                    <Text style={styles.itemEmoji}>{item.icon}</Text>
                  </View>

                  <Text
                    style={[styles.itemName, { color: isDark ? '#F8FAFC' : '#0F172A' }]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={[styles.itemDesc, { color: isDark ? '#94A3B8' : '#64748B' }]}
                    numberOfLines={2}
                  >
                    {item.description}
                  </Text>

                  {/* Buy / Equip Button */}
                  <TouchableOpacity
                    onPress={() => handleAction(item)}
                    style={[
                      styles.actionBtn,
                      equipped
                        ? { backgroundColor: isDark ? '#334155' : '#E2E8F0' }
                        : owned
                        ? { backgroundColor: '#10B981' }
                        : bambooCoins >= item.price
                        ? { backgroundColor: '#7C5CFF' }
                        : { backgroundColor: isDark ? '#334155' : '#CBD5E1', opacity: 0.65 },
                    ]}
                  >
                    {equipped ? (
                      <Text style={[styles.actionBtnText, { color: isDark ? '#CBD5E1' : '#475569' }]}>
                        Unequip
                      </Text>
                    ) : owned ? (
                      <Text style={styles.actionBtnText}>Equip</Text>
                    ) : (
                      <View style={styles.priceRow}>
                        <Text style={styles.priceEmoji}>🎋</Text>
                        <Text style={styles.priceText}>{item.price}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Footer Guide */}
          <View style={[styles.footer, { borderTopColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)' }]}>
            <HelpCircle size={14} color={isDark ? '#94A3B8' : '#64748B'} />
            <Text style={[styles.footerText, { color: isDark ? '#94A3B8' : '#64748B' }]}>
              Earn <Text style={{ fontWeight: '700', color: '#10B981' }}>+10 🎋</Text> per habit completion and <Text style={{ fontWeight: '700', color: '#F59E0B' }}>+30 🎋</Text> on 100% daily streaks!
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shopBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fittingRoomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    marginBottom: 16,
    gap: 14,
  },
  fittingRoomMascot: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fittingRoomInfo: {
    flex: 1,
    gap: 6,
  },
  coinsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 5,
  },
  coinsEmoji: {
    fontSize: 14,
  },
  coinsText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#10B981',
  },
  coinsLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  fittingRoomHelp: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  dailyGiftBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 5,
    alignSelf: 'flex-start',
  },
  dailyGiftText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  categoryContainer: {
    marginBottom: 14,
  },
  categoryScroll: {
    gap: 8,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  catTabIcon: {
    fontSize: 14,
  },
  catTabLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  itemsScroll: {
    maxHeight: 380,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    paddingBottom: 16,
  },
  itemCard: {
    width: '48%',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  itemCardTop: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    minHeight: 18,
  },
  rarityBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  rarityText: {
    fontSize: 9.5,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  equippedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  equippedBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '700',
  },
  itemIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(124, 92, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  itemEmoji: {
    fontSize: 28,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 2,
  },
  itemDesc: {
    fontSize: 10.5,
    textAlign: 'center',
    lineHeight: 14,
    marginBottom: 10,
    minHeight: 28,
  },
  actionBtn: {
    width: '100%',
    paddingVertical: 7,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceEmoji: {
    fontSize: 12,
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 8,
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
