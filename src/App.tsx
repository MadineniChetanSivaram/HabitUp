import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HabitProvider, useHabit } from './context/HabitContext';
import { requestNotificationPermission } from './services/notificationService';
import { HabitUpLogo } from './components/common/HabitUpLogo';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { MobileShell } from './components/mobile/MobileShell';
import { AuthView } from './components/views/AuthView';
import { HomeView } from './components/views/HomeView';
import { FriendsView } from './components/views/FriendsView';
import { CalendarView } from './components/views/CalendarView';
import { StatsView } from './components/views/StatsView';
import { StreaksView } from './components/views/StreaksView';
import { SettingsView } from './components/views/SettingsView';
import { CreateHabitModal } from './components/modals/CreateHabitModal';
import { HabitDetailModal } from './components/modals/HabitDetailModal';
import { OnboardingModal } from './components/modals/OnboardingModal';
import { AuthSessionModal } from './components/modals/AuthSessionModal';
import { BiometricScanModal } from './components/modals/BiometricScanModal';
import { PlantGardenModal } from './components/modals/PlantGardenModal';
import { SparkyShopModal } from './components/modals/SparkyShopModal';
import { WidgetPreviewModal } from './components/modals/WidgetPreviewModal';
import { DayCompletionCelebrationModal } from './components/modals/DayCompletionCelebrationModal';
import { NotificationBanner } from './components/common/NotificationBanner';
import { FullScreenConfetti } from './components/common/FullScreenConfetti';
import { AiSmartCoach } from './components/common/AiSmartCoach';

import { useFonts } from 'expo-font';
import { customFontsToLoad } from './utils/loadFonts';
import { configureDefaultTypography } from './utils/typography';
import { Platform } from 'react-native';
import './index.css';

// Configure default Comfortaa typography across React Native Text & TextInput
configureDefaultTypography();

// Ensure Web loads and forces Comfortaa directly in the DOM
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const styleId = 'habitup-global-comfortaa-font';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Comfortaa:wght@300;400;500;600;700&display=swap');
      *, *::before, *::after, html, body, #root, div, span, p, h1, h2, h3, h4, h5, h6, input, textarea, button, [class*="r-"], [dir="auto"] {
        font-family: 'Comfortaa', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      }
      input, textarea {
        outline: none !important;
      }
      input:focus, textarea:focus, input:focus-visible, textarea:focus-visible {
        outline: none !important;
        box-shadow: none !important;
      }
    `;
    document.head.appendChild(style);
  }
}

// Configure global typography for all Text and TextInput components
configureDefaultTypography();

const AppContent: React.FC = () => {
  const { activeTab, isAuthenticated, isAuthLoading } = useHabit();
  const [safetyTimedOut, setSafetyTimedOut] = useState(false);

  useEffect(() => {
    // Request system notification permission immediately upon app startup
    requestNotificationPermission().catch(() => {});

    // Safety fallback timer: guarantee app resolves loading screen within 2.5 seconds
    const timer = setTimeout(() => {
      setSafetyTimedOut(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  // Prevent flicker while restoring stored session, but never block indefinitely
  if (isAuthLoading && !safetyTimedOut) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0B1120', alignItems: 'center', justifyContent: 'center' }}>
        <HabitUpLogo size="md" themeMode="dark" />
        <ActivityIndicator color="#7C5CFF" style={{ marginTop: 24 }} size="small" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthView />;
  }

  return (
    <MobileShell>
      {/* Real-time In-App Floating Notification Banner */}
      <NotificationBanner />

      {activeTab === 'home' && <HomeView />}
      {(activeTab === 'friends' || activeTab === 'habits') && <FriendsView />}
      {activeTab === 'calendar' && <CalendarView />}
      {activeTab === 'stats' && <StatsView />}
      {activeTab === 'streaks' && <StreaksView />}
      {activeTab === 'settings' && <SettingsView />}

      {/* Global Full-Page Confetti Celebration Burst */}
      <FullScreenConfetti />

      {/* Floating AI Smart Coach FAB & Interactive Chat */}
      <AiSmartCoach />

      {/* Global Modals & Biometrics */}
      <BiometricScanModal />
      <CreateHabitModal />
      <HabitDetailModal />
      <OnboardingModal />
      <AuthSessionModal />
      <PlantGardenModal />
      <SparkyShopModal />
      <WidgetPreviewModal />
      <DayCompletionCelebrationModal />
    </MobileShell>
  );
};

export default function App() {
  // Asynchronously load fonts in background; triggers re-render when assets are ready
  const [fontsLoaded] = useFonts(customFontsToLoad);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <HabitProvider>
          <AppContent />
        </HabitProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
