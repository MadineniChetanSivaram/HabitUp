/**
 * HabitUp Notification Service (Expo Notifications & Web Fallback)
 * Provides native push notifications, local reminder scheduling,
 * and background alerts that fire across Mobile and Desktop/Web.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PushTokenRegistration {
  token: string;
  type: 'fcm' | 'expo' | 'web';
  platform: string;
  timezone: string;
  registeredAt: string;
}

export interface InAppNotification {
  id: string;
  habitId?: string;
  title: string;
  body: string;
  icon?: string;
  color?: string;
  timestamp: string;
  reminderTime?: string;
  type: 'reminder' | 'streak' | 'daily_briefing' | 'system';
  mascotMood?: 'sleeping' | 'sad' | 'hopeful' | 'hyped' | 'celebrating' | 'rest' | 'awake';
  mascotExpression?: 'neutral' | 'wink' | 'starry' | 'love' | 'playful' | 'happy' | 'sad' | 'determined';
}

// 1. Configure foreground presentation on native
if (Platform.OS !== 'web') {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch (err) {
    console.warn('Could not set notification handler:', err);
  }
}

// 2. Configure Android Notification Channel
if (Platform.OS === 'android') {
  try {
    Notifications.setNotificationChannelAsync('habit-reminders', {
      name: 'Habit Reminders',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#7C5CFF',
      sound: 'default',
      enableVibrate: true,
      showBadge: true,
    }).catch((err) => console.warn('Could not set Android notification channel:', err));
  } catch (err) {
    console.warn('Error configuring Android notification channel:', err);
  }
}

export function playWebAudioChime() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5

        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.6);
      }
    } catch {}
  }
}

let inAppListeners: Array<(notif: InAppNotification) => void> = [];

export function addInAppNotificationListener(
  listener: (notif: InAppNotification) => void
): () => void {
  inAppListeners.push(listener);
  return () => {
    inAppListeners = inAppListeners.filter((l) => l !== listener);
  };
}

export function notifyInAppListeners(notif: InAppNotification) {
  inAppListeners.forEach((l) => {
    try {
      l(notif);
    } catch (err) {
      console.warn('Notification listener error:', err);
    }
  });
}

export async function checkNotificationPermission(): Promise<boolean> {
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission === 'granted';
    }
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      return perm === 'granted';
    }
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      finalStatus = status;
    }
    return finalStatus === 'granted';
  } catch (err) {
    console.warn('Failed to request notification permissions:', err);
    return false;
  }
}

export async function scheduleHabitReminder(habit: {
  id: string;
  name: string;
  reminder_time?: string;
  icon?: string;
  color?: string;
}): Promise<string | null> {
  const time = habit.reminder_time;
  if (!time) return null;

  try {
    const [hourStr, minStr] = time.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minStr, 10);

    if (isNaN(hour) || isNaN(minute)) return null;

    if (Platform.OS !== 'web') {
      const notifId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `Sparky is Reminding You: ${habit.name}`,
          body: `Sparky is waiting for your check-in on "${habit.name}". Let's keep our streak going!`,
          data: { habitId: habit.id },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          channelId: 'habit-reminders',
        },
      });
      return notifId;
    }

    return `web-rem-${habit.id}`;
  } catch (err) {
    console.warn('Failed to schedule habit reminder:', err);
    return null;
  }
}

export async function cancelHabitReminder(notificationId: string) {
  try {
    if (Platform.OS !== 'web') {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    }
  } catch (err) {
    console.warn('Failed to cancel reminder:', err);
  }
}

export async function cancelAllReminders() {
  try {
    if (Platform.OS !== 'web') {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  } catch (err) {
    console.warn('Failed to cancel all reminders:', err);
  }
}

export type NotificationTone = 'witty' | 'sweet' | 'strict';
export type MascotNotificationScenario =
  | 'morning'
  | 'midday'
  | 'evening_danger'
  | 'night_alert'
  | 'celebration'
  | 'freeze_shield';

export interface MascotNotificationMessage {
  title: string;
  body: string;
  icon: string;
  color: string;
  soundType: string;
  mascotMood: 'sleeping' | 'sad' | 'hopeful' | 'hyped' | 'celebrating' | 'rest' | 'awake';
  mascotExpression: 'neutral' | 'wink' | 'starry' | 'love' | 'playful' | 'happy' | 'sad' | 'determined';
}

export function getMascotNotificationContent(
  scenario: MascotNotificationScenario,
  tone: NotificationTone = 'witty',
  params?: { streakCount?: number; habitName?: string; remainingCount?: number }
): MascotNotificationMessage {
  const streak = params?.streakCount ?? 7;
  const habit = params?.habitName ?? 'Daily Routine';
  const remaining = params?.remainingCount ?? 2;

  const NOTIFICATIONS_MAP: Record<NotificationTone, Record<MascotNotificationScenario, MascotNotificationMessage>> = {
    witty: {
      morning: {
        title: 'Sparky is Waking Up',
        body: 'Sparky just woke up and is excited to start today with you! Check off your first habit to give him morning bamboo.',
        icon: 'Sunrise',
        color: '#F59E0B',
        soundType: 'sleepy_yawn',
        mascotMood: 'awake',
        mascotExpression: 'happy',
      },
      midday: {
        title: 'Sparky is Cheering You On',
        body: remaining === 1
          ? `Sparky noticed only 1 habit is left today! Let's get it done together.`
          : `Sparky is rooting for you! You have ${remaining} habits waiting today. Let's keep the momentum going.`,
        icon: 'Clock',
        color: '#3B82F6',
        soundType: 'half_done_chirp',
        mascotMood: 'hopeful',
        mascotExpression: 'wink',
      },
      evening_danger: {
        title: 'Sparky is Feeling Sad',
        body: `Sparky is crying because our ${streak}-day streak is about to reset tonight! Complete "${habit}" now to cheer him up.`,
        icon: 'Flame',
        color: '#EF4444',
        soundType: 'sad_whimper',
        mascotMood: 'sad',
        mascotExpression: 'sad',
      },
      night_alert: {
        title: 'Sparky is Heartbroken',
        body: `Only minutes left before midnight! Sparky is worried about our streak. Check off your habits quickly before time runs out!`,
        icon: 'AlertTriangle',
        color: '#DC2626',
        soundType: 'sad_whimper',
        mascotMood: 'sad',
        mascotExpression: 'sad',
      },
      celebration: {
        title: 'Sparky is Super Happy!',
        body: 'All habits completed today! Sparky is full of joy and munching his royal bamboo feast.',
        icon: 'Crown',
        color: '#10B981',
        soundType: 'bamboo_crunch',
        mascotMood: 'celebrating',
        mascotExpression: 'happy',
      },
      freeze_shield: {
        title: 'Sparky is Relieved',
        body: `Sparky is glad your streak freeze protected our ${streak}-day streak yesterday. Ready for a great day today!`,
        icon: 'Shield',
        color: '#06B6D4',
        soundType: 'excited_twitter',
        mascotMood: 'rest',
        mascotExpression: 'wink',
      },
    },
    sweet: {
      morning: {
        title: 'Sparky is Bright and Joyful',
        body: 'Sparky is sending you warm hugs and morning smiles. Small daily steps create big wonderful journeys.',
        icon: 'Sun',
        color: '#FBBF24',
        soundType: 'sleepy_yawn',
        mascotMood: 'awake',
        mascotExpression: 'happy',
      },
      midday: {
        title: 'Sparky is Smiling with Love',
        body: `Take a gentle breath and hydrate. Sparky believes in you for "${habit}"!`,
        icon: 'Heart',
        color: '#EC4899',
        soundType: 'half_done_chirp',
        mascotMood: 'hopeful',
        mascotExpression: 'love',
      },
      evening_danger: {
        title: 'Sparky is Feeling Anxious',
        body: `Sparky is worried about our ${streak}-day streak tonight. Take a quiet moment to finish "${habit}" strong.`,
        icon: 'Sparkles',
        color: '#8B5CF6',
        soundType: 'sad_whimper',
        mascotMood: 'sad',
        mascotExpression: 'sad',
      },
      night_alert: {
        title: 'Sparky is Sad and Waiting',
        body: 'Sparky is hoping you will check in before midnight so our streak stays safe and warm.',
        icon: 'Moon',
        color: '#6366F1',
        soundType: 'excited_twitter',
        mascotMood: 'sad',
        mascotExpression: 'sad',
      },
      celebration: {
        title: 'Sparky is Overjoyed!',
        body: 'Every single habit completed with care! Sparky is super proud and happy for you. Rest well tonight and recharge.',
        icon: 'Smile',
        color: '#10B981',
        soundType: 'bamboo_crunch',
        mascotMood: 'celebrating',
        mascotExpression: 'happy',
      },
      freeze_shield: {
        title: 'Sparky is Relieved and Grateful',
        body: 'Sparky is relieved that your streak freeze protected your streak while you rested. Today is a fresh day to shine!',
        icon: 'Shield',
        color: '#38BDF8',
        soundType: 'happy_bleat',
        mascotMood: 'rest',
        mascotExpression: 'wink',
      },
    },
    strict: {
      morning: {
        title: 'Sparky is Fired Up',
        body: 'Sparky is determined and ready for action. Zero excuses, let us attack habit number one right now!',
        icon: 'Zap',
        color: '#E11D48',
        soundType: 'excited_twitter',
        mascotMood: 'hyped',
        mascotExpression: 'determined',
      },
      midday: {
        title: 'Sparky Demands Focus',
        body: `50% of the day gone. Sparky is waiting on "${habit}". Lock in and finish what you started!`,
        icon: 'Clock',
        color: '#EA580C',
        soundType: 'half_done_chirp',
        mascotMood: 'hyped',
        mascotExpression: 'determined',
      },
      evening_danger: {
        title: 'Sparky is Upset About the Streak',
        body: `Sparky refuses to let our ${streak}-day streak reset tonight. Defend your progress now!`,
        icon: 'Flame',
        color: '#DC2626',
        soundType: 'sad_whimper',
        mascotMood: 'sad',
        mascotExpression: 'determined',
      },
      night_alert: {
        title: 'Sparky is Stressed Out',
        body: 'Final countdown to midnight! Sparky cannot bear to lose this streak. Execute your remaining habits now!',
        icon: 'AlertOctagon',
        color: '#991B1B',
        soundType: 'sad_whimper',
        mascotMood: 'sad',
        mascotExpression: 'sad',
      },
      celebration: {
        title: 'Sparky is Victorious!',
        body: '100% execution score today! Sparky is standing tall and celebrating your discipline.',
        icon: 'Award',
        color: '#16A34A',
        soundType: 'bamboo_crunch',
        mascotMood: 'celebrating',
        mascotExpression: 'happy',
      },
      freeze_shield: {
        title: 'Sparky is Back in Action',
        body: 'The streak freeze bought us time. Sparky is ready to conquer today without hesitation!',
        icon: 'ShieldAlert',
        color: '#0284C7',
        soundType: 'excited_twitter',
        mascotMood: 'hyped',
        mascotExpression: 'determined',
      },
    },
  };

  return NOTIFICATIONS_MAP[tone]?.[scenario] || NOTIFICATIONS_MAP.witty[scenario];
}

export async function triggerMascotNotification(
  scenario: MascotNotificationScenario,
  tone: NotificationTone = 'witty',
  params?: { streakCount?: number; habitName?: string; remainingCount?: number }
) {
  const notif = getMascotNotificationContent(scenario, tone, params);
  const currentTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date());

  // 1. Web Audio Chime or Mascot Sound
  playWebAudioChime();

  // 2. Web browser notification
  if (Platform.OS === 'web' && typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      try {
        new Notification(notif.title, {
          body: notif.body,
          icon: 'https://cdn-icons-png.flaticon.com/512/3233/3233497.png',
        });
      } catch (e) {
        console.log('Browser notification fallback error:', e);
      }
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((p) => {
        if (p === 'granted') {
          try {
            new Notification(notif.title, {
              body: notif.body,
              icon: 'https://cdn-icons-png.flaticon.com/512/3233/3233497.png',
            });
          } catch {}
        }
      });
    }
  }

  // 3. Native Expo OS notification on mobile
  if (Platform.OS !== 'web') {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notif.title,
          body: notif.body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: null,
      });
    } catch (err) {
      console.warn('Native notification trigger error:', err);
    }
  }

  // 4. In-App Animated Floating Banner Card
  notifyInAppListeners({
    id: `mascot-notif-${Date.now()}`,
    title: notif.title,
    body: notif.body,
    icon: notif.icon,
    color: notif.color,
    reminderTime: currentTime,
    timestamp: new Date().toISOString(),
    type: scenario === 'evening_danger' || scenario === 'night_alert' ? 'streak' : 'reminder',
    mascotMood: notif.mascotMood,
    mascotExpression: notif.mascotExpression,
  });
}

export async function triggerTestNotification(
  title = 'Sparky is Happy and Ready',
  body = 'Sparky is excited to send you daily reminders and streak alerts.'
) {
  const currentTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date());

  // 1. Play Audio Chime
  playWebAudioChime();

  // 2. Web desktop notification fallback
  if (Platform.OS === 'web' && typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: 'https://cdn-icons-png.flaticon.com/512/3233/3233497.png',
        });
      } catch (e) {
        console.log('Browser notification fallback error:', e);
      }
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((p) => {
        if (p === 'granted') {
          try {
            new Notification(title, {
              body,
              icon: 'https://cdn-icons-png.flaticon.com/512/3233/3233497.png',
            });
          } catch {}
        }
      });
    }
  }

  // 3. Native Expo OS notification on mobile
  if (Platform.OS !== 'web') {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: null, // deliver immediately
      });
    } catch (err) {
      console.warn('Native notification trigger error:', err);
    }
  }

  // 4. In-App Animated Floating Banner Card (Visible on ALL devices)
  notifyInAppListeners({
    id: Date.now().toString(),
    title,
    body,
    icon: 'Sparkles',
    color: '#7C5CFF',
    reminderTime: currentTime,
    timestamp: new Date().toISOString(),
    type: 'system',
    mascotMood: 'awake',
    mascotExpression: 'happy',
  });
}

export async function triggerNudgeNotification(params: {
  senderName: string;
  habitName: string;
  habitId?: string;
  senderAvatar?: string;
  icon?: string;
  color?: string;
}) {
  const title = `${params.senderName} sent you a nudge`;
  const body = `Sparky and ${params.senderName} are cheering for you to complete "${params.habitName}" today!`;

  const currentTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date());

  // 1. Play Audio Chime
  playWebAudioChime();

  // 2. Web browser notification
  if (Platform.OS === 'web' && typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: 'https://cdn-icons-png.flaticon.com/512/3233/3233497.png',
        });
      } catch (e) {
        console.log('Browser notification fallback error:', e);
      }
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((p) => {
        if (p === 'granted') {
          try {
            new Notification(title, {
              body,
              icon: 'https://cdn-icons-png.flaticon.com/512/3233/3233497.png',
            });
          } catch {}
        }
      });
    }
  }

  // 3. Native Expo OS notification on mobile
  if (Platform.OS !== 'web') {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          data: params.habitId ? { habitId: params.habitId } : undefined,
        },
        trigger: null, // deliver immediately
      });
    } catch (err) {
      console.warn('Native notification trigger error:', err);
    }
  }

  // 4. In-App Animated Floating Banner Card (Visible on ALL devices)
  notifyInAppListeners({
    id: `nudge-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    habitId: params.habitId,
    title,
    body,
    icon: params.icon || 'Bell',
    color: params.color || '#F59E0B',
    reminderTime: currentTime,
    timestamp: new Date().toISOString(),
    type: 'reminder',
    mascotMood: 'hopeful',
    mascotExpression: 'wink',
  });
}

/**
 * Retrieves the native FCM device push token (or Expo token fallback)
 * and formats the registration payload for backend integration.
 */
export async function registerForPushNotificationsAsync(): Promise<PushTokenRegistration | null> {
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.warn('[FCM] Notification permission not granted by user.');
      return null;
    }

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    let tokenStr = '';
    let tokenType: 'fcm' | 'expo' | 'web' = 'fcm';

    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      try {
        // 1. Fetch native FCM token using getDevicePushTokenAsync()
        const deviceTokenRes = await Notifications.getDevicePushTokenAsync();
        tokenStr = typeof deviceTokenRes?.data === 'string' ? deviceTokenRes.data : JSON.stringify(deviceTokenRes?.data || '');
        tokenType = 'fcm';
        console.log('[FCM] Native Device Push Token retrieved successfully:', {
          type: deviceTokenRes.type,
          tokenLength: tokenStr ? tokenStr.length : 0,
        });
      } catch (nativeErr) {
        console.warn('[FCM] getDevicePushTokenAsync error, trying getExpoPushTokenAsync fallback:', nativeErr);
        try {
          const expoTokenRes = await Notifications.getExpoPushTokenAsync();
          tokenStr = expoTokenRes.data;
          tokenType = 'expo';
          console.log('[FCM] Expo Push Token fallback retrieved:', {
            tokenLength: tokenStr ? tokenStr.length : 0,
          });
        } catch (expoErr) {
          console.error('[FCM] Failed to retrieve any push token:', expoErr);
        }
      }
    } else {
      tokenType = 'web';
      tokenStr = 'web_push_local_token';
    }

    if (!tokenStr) {
      return null;
    }

    const registration: PushTokenRegistration = {
      token: tokenStr,
      type: tokenType,
      platform: Platform.OS,
      timezone,
      registeredAt: new Date().toISOString(),
    };

    // Store token locally
    await AsyncStorage.setItem('habitup_fcm_token_registration', JSON.stringify(registration));
    await AsyncStorage.setItem('habitup_fcm_token', tokenStr);

    console.log('====================================================');
    console.log('[FCM PUSH REGISTRATION READY FOR BACKEND]');
    console.log('FCM Token Length:', tokenStr.length);
    console.log('Platform:', Platform.OS);
    console.log('Timezone:', timezone);
    console.log('Type:', tokenType);
    console.log('====================================================');

    return registration;
  } catch (error) {
    console.error('[FCM] Error in registerForPushNotificationsAsync:', error);
    return null;
  }
}

/**
 * Returns cached FCM token if previously saved.
 */
export async function getCachedPushToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem('habitup_fcm_token');
  } catch {
    return null;
  }
}

/**
 * Sets up background and foreground push notification listeners.
 */
export function setupNotificationListeners(onNotificationClick?: (data: any) => void): () => void {
  if (Platform.OS === 'web') return () => {};

  // 1. Foreground notification listener
  const receivedSub = Notifications.addNotificationReceivedListener((notification) => {
    const { title, body, data } = notification.request.content;
    console.log('[FCM] Notification received in foreground:', { title, body, data });
    
    notifyInAppListeners({
      id: `remote-${Date.now()}`,
      habitId: (data as any)?.habitId,
      title: title || 'HabitUp Notification 🔔',
      body: body || '',
      icon: (data as any)?.icon || 'Bell',
      color: (data as any)?.color || '#7C5CFF',
      reminderTime: new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date()),
      timestamp: new Date().toISOString(),
      type: (data as any)?.type || 'reminder',
    });
  });

  // 2. Response listener (when user clicks/taps notification from background/closed state)
  const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data;
    console.log('[FCM] User tapped notification from background/closed app:', data);
    if (onNotificationClick) {
      onNotificationClick(data);
    }
  });

  return () => {
    receivedSub.remove();
    responseSub.remove();
  };
}

export const notificationService = {
  checkPermission: checkNotificationPermission,
  requestPermission: requestNotificationPermission,
  registerForPushNotifications: registerForPushNotificationsAsync,
  getCachedPushToken,
  setupListeners: setupNotificationListeners,
  scheduleReminder: scheduleHabitReminder,
  cancelReminder: cancelHabitReminder,
  cancelAll: cancelAllReminders,
  triggerTest: triggerTestNotification,
  triggerNudge: triggerNudgeNotification,
  triggerMascot: triggerMascotNotification,
  getMascotContent: getMascotNotificationContent,
  playChime: playWebAudioChime,
  addListener: addInAppNotificationListener,
};

// Expose on window for easy developer testing in browser console
if (typeof window !== 'undefined') {
  (window as any).notificationService = notificationService;
  (window as any).triggerSparkyAlert = (scenario: MascotNotificationScenario = 'evening_danger') => {
    return triggerMascotNotification(scenario);
  };
}

