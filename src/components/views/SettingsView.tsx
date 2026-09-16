import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  StyleSheet,
  Alert,
  Platform,
  Image,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { LinearGradient } from 'expo-linear-gradient';
import { useHabit } from '../../context/HabitContext';
import { soundService } from '../../services/soundService';
import { requestNotificationPermission } from '../../services/notificationService';
import { HabitUpLogo } from '../common/HabitUpLogo';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../../i18n/translations';
import {
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Bell,
  Volume2,
  Smartphone,
  FileSpreadsheet,
  LogOut,
  Camera,
  Trash2,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  X,
  Globe,
  Check,
} from 'lucide-react-native';

export const SettingsView: React.FC = () => {
  const {
    user,
    updateUser,
    theme,
    toggleTheme,
    hapticsEnabled,
    setHapticsEnabled,
    soundEnabled,
    setSoundEnabled,
    notificationsEnabled,
    setNotificationsEnabled,
    habits,
    completions,
    getHabitStats,
    setActiveTab,
    setIsAuthSessionModalOpen,
    logout,
    deleteAccount,
    showToast,
    language,
    setLanguage,
    t,
  } = useHabit();

  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [deletePassword, setDeletePassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string>('');

  const currentLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const isDark = theme === 'dark';

  const handleToggleNotifications = async (val: boolean) => {
    setNotificationsEnabled(val);
    if (val) {
      try {
        const granted = await requestNotificationPermission();
        if (granted) {
          showToast('Habit reminders enabled! 🔔', undefined, 'success');
        } else {
          showToast('Please allow notifications in your device settings.', undefined, 'warning');
        }
      } catch {
        showToast('Habit reminders enabled! 🔔', undefined, 'success');
      }
    } else {
      showToast('Habit reminders turned off.', undefined, 'info');
    }
  };

  const handleExportCSV = async () => {
    try {
      // 1. Build Tabular CSV Spreadsheet Headers and Rows
      const headers = [
        'Habit Name',
        'Frequency',
        'Status',
        'Reminder Time',
        'Current Streak',
        'Completion Rate',
        'Check-in Date',
        'Status On Date',
        'Completed Timestamp',
      ];

      const rows: string[][] = [];

      habits.forEach((h) => {
        const stats = getHabitStats(h.id);
        const habitCompletions = completions.filter((c) => c.habit_id === h.id);
        const status = h.deleted_at
          ? 'Deleted'
          : h.archived_at
          ? 'Archived'
          : h.paused_at
          ? 'Paused'
          : 'Active';
        const freq = h.frequency_type === 'daily' ? 'Daily' : 'Custom Days';

        if (habitCompletions.length === 0) {
          rows.push([
            h.name,
            freq,
            status,
            h.reminder_time || 'None',
            `${stats.currentStreak} days`,
            `${stats.completionRate}%`,
            'N/A',
            'No Check-ins Yet',
            'N/A',
          ]);
        } else {
          // Sort newest check-ins first
          const sortedCompletions = [...habitCompletions].sort((a, b) =>
            (b.completion_date || '').localeCompare(a.completion_date || '')
          );
          sortedCompletions.forEach((c) => {
            rows.push([
              h.name,
              freq,
              status,
              h.reminder_time || 'None',
              `${stats.currentStreak} days`,
              `${stats.completionRate}%`,
              c.completion_date || 'N/A',
              'Completed',
              c.completed_at ? new Date(c.completed_at).toLocaleString() : 'N/A',
            ]);
          });
        }
      });

      // Escape quotes and format as CSV table
      const csvString = [
        headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','),
        ...rows.map((r) =>
          r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ),
      ].join('\r\n');

      const fileName = `HabitUp_Data_Export_${new Date().toISOString().split('T')[0]}.csv`;

      // 2. Platform-specific export (Downloads on Web, File Attachment Share on Android/iOS)
      if (Platform.OS === 'web') {
        const blob = new Blob(['\uFEFF' + csvString], {
          type: 'text/csv;charset=utf-8;',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast('CSV tabular file downloaded!', undefined, 'success');
      } else {
        const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
        await FileSystem.writeAsStringAsync(fileUri, '\uFEFF' + csvString, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'text/csv',
            dialogTitle: 'Export HabitUp Data (CSV Table)',
            UTI: 'public.comma-separated-values-text',
          });
          showToast('CSV file created in tabular format!', undefined, 'success');
        } else {
          showToast('File sharing is not supported on this device.', undefined, 'warning');
        }
      }
    } catch (e: any) {
      console.warn('Export error:', e);
      showToast('Export cancelled or failed.', undefined, 'info');
    }
  };

  const handleConfirmDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      setDeleteError('Please enter your password to confirm.');
      return;
    }

    setIsDeleting(true);
    setDeleteError('');

    try {
      const result = await deleteAccount(deletePassword);
      if (result.success) {
        setIsDeleteModalOpen(false);
        setDeletePassword('');
      } else {
        setDeleteError(result.error || 'Failed to delete account.');
      }
    } catch (err: any) {
      setDeleteError(err?.message || 'Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#0B1120' : '#F8FAFC' }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Top Header: Settings / Preferences & Data / < Back */}
      <View style={styles.topHeader}>
        <View>
          <Text style={[styles.pageTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
            {t('settings.title', 'Settings')}
          </Text>
          <Text style={[styles.pageSubtitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>
            {t('settings.preferences_data', 'Preferences & Data')}
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.backPill,
            {
              backgroundColor: isDark ? '#141D2E' : '#FFFFFF',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
            },
          ]}
          onPress={() => setActiveTab('home')}
          activeOpacity={0.7}
        >
          <ChevronLeft size={16} color={isDark ? '#E2E8F0' : '#0F172A'} />
          <Text style={[styles.backPillText, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
            {t('common.back', 'Back')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* User Profile Card */}
      <View
        style={[
          styles.profileCard,
          {
            backgroundColor: isDark ? '#141D2E' : '#FFFFFF',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
          },
        ]}
      >
        <View style={styles.profileLeft}>
          {/* Avatar with Camera Badge */}
          <View style={styles.avatarWrapper}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
            ) : (
              <LinearGradient
                colors={['#C084FC', '#F43F5E']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarGradient}
              >
                <Text style={styles.avatarInitial}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'G'}
                </Text>
              </LinearGradient>
            )}
            <TouchableOpacity
              style={styles.cameraBadge}
              onPress={() => setIsAuthSessionModalOpen(true)}
            >
              <Camera size={11} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* User Info */}
          <View style={styles.profileInfo}>
            <Text style={[styles.userName, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
              {user?.name || 'Google User'}
            </Text>
            <Text style={[styles.userHandleText, { color: '#818CF8' }]}>
              {user?.username ? (user.username.startsWith('@') ? user.username : `@${user.username}`) : `@${(user?.email || 'user').split('@')[0]}`}
            </Text>
            <Text style={[styles.userEmail, { color: isDark ? '#94A3B8' : '#64748B' }]}>
              {user?.email || 'user@gmail.com'}
            </Text>
          </View>
        </View>

        {/* Edit DP Link */}
        <TouchableOpacity
          style={styles.editDpBtn}
          onPress={() => setIsAuthSessionModalOpen(true)}
        >
          <Text style={styles.editDpText}>{t('settings.edit_dp', 'Edit DP')}</Text>
          <ChevronRight size={14} color="#818CF8" />
        </TouchableOpacity>
      </View>

      {/* APP PREFERENCES Card */}
      <View
        style={[
          styles.sectionCard,
          {
            backgroundColor: isDark ? '#141D2E' : '#FFFFFF',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>
          {t('settings.app_preferences', 'APP PREFERENCES')}
        </Text>

        {/* 1. Language Selector Row */}
        <TouchableOpacity
          style={styles.preferenceRow}
          onPress={() => setIsLanguageModalOpen(true)}
          activeOpacity={0.7}
        >
          <View style={styles.prefLeft}>
            <View style={[styles.prefIconBadge, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
              <Globe size={16} color="#38BDF8" />
            </View>
            <View>
              <Text style={[styles.prefName, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                {t('settings.language', 'Language')}
              </Text>
              <Text style={[styles.prefDesc, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                {t('settings.language_desc', '8 Indian Languages + English')}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.langSelectPill,
              {
                backgroundColor: isDark ? '#0C1322' : '#F1F5F9',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#CBD5E1',
              },
            ]}
          >
            <Text style={[styles.langSelectPillText, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
              {currentLangObj.flag} {currentLangObj.nativeName}
            </Text>
            <ChevronRight size={14} color={isDark ? '#94A3B8' : '#64748B'} />
          </View>
        </TouchableOpacity>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F1F5F9' }]} />

        {/* 2. Habit Reminders */}
        <View style={styles.preferenceRow}>
          <View style={styles.prefLeft}>
            <View style={[styles.prefIconBadge, { backgroundColor: 'rgba(124, 92, 255, 0.15)' }]}>
              <Bell size={16} color="#7C5CFF" />
            </View>
            <View>
              <Text style={[styles.prefName, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                {t('settings.habit_reminders', 'Habit Reminders')}
              </Text>
              <Text style={[styles.prefDesc, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                {t('settings.habit_reminders_desc', 'Send alerts at scheduled times')}
              </Text>
            </View>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleToggleNotifications}
            trackColor={{ false: isDark ? '#334155' : '#CBD5E1', true: '#7C5CFF' }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F1F5F9' }]} />

        {/* 3. Notification Sound */}
        <View style={styles.preferenceRow}>
          <View style={styles.prefLeft}>
            <View style={[styles.prefIconBadge, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Volume2 size={16} color="#10B981" />
            </View>
            <View>
              <Text style={[styles.prefName, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                {t('settings.notification_sound', 'Notification Sound')}
              </Text>
              <Text style={[styles.prefDesc, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                {t('settings.notification_sound_desc', 'Play chime on reminders & check-ins')}
              </Text>
            </View>
          </View>
          <Switch
            value={soundEnabled}
            onValueChange={(val) => {
              setSoundEnabled(val);
              if (val) {
                try {
                  soundService.playCompletionChime();
                } catch {
                  // ignore
                }
              }
            }}
            trackColor={{ false: isDark ? '#334155' : '#CBD5E1', true: '#10B981' }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F1F5F9' }]} />

        {/* 4. Theme Mode */}
        <View style={styles.preferenceRow}>
          <View style={styles.prefLeft}>
            <View style={[styles.prefIconBadge, { backgroundColor: isDark ? 'rgba(129, 140, 248, 0.15)' : 'rgba(245, 158, 11, 0.15)' }]}>
              {isDark ? <Moon size={16} color="#818CF8" /> : <Sun size={16} color="#F59E0B" />}
            </View>
            <View>
              <Text style={[styles.prefName, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                {t('settings.theme_mode', 'Theme Mode')}
              </Text>
              <Text style={[styles.prefDesc, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                {isDark ? t('settings.dark_mode', 'Dark Mode') : t('settings.light_mode', 'Light Mode')}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.themeTogglePill,
              {
                backgroundColor: isDark ? '#0C1322' : '#F1F5F9',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#CBD5E1',
              },
            ]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <Text style={[styles.themeToggleText, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
              {isDark ? t('settings.dark', 'Dark') : t('settings.light', 'Light')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : '#F1F5F9' }]} />

        {/* 5. Vibration Feedback */}
        <View style={styles.preferenceRow}>
          <View style={styles.prefLeft}>
            <View style={[styles.prefIconBadge, { backgroundColor: 'rgba(244, 63, 94, 0.15)' }]}>
              <Smartphone size={16} color="#F43F5E" />
            </View>
            <View>
              <Text style={[styles.prefName, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                {t('settings.vibration', 'Vibration Feedback')}
              </Text>
              <Text style={[styles.prefDesc, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                {t('settings.vibration_desc', 'Vibrate gently on button tap')}
              </Text>
            </View>
          </View>
          <Switch
            value={hapticsEnabled}
            onValueChange={setHapticsEnabled}
            trackColor={{ false: isDark ? '#334155' : '#CBD5E1', true: '#FF4D6D' }}
            thumbColor="#FFFFFF"
          />
        </View>

      </View>

      {/* Standalone Export CSV Button */}
      <TouchableOpacity
        style={[
          styles.exportCsvBtn,
          {
            backgroundColor: isDark ? '#141D2E' : '#FFFFFF',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
          },
        ]}
        onPress={handleExportCSV}
        activeOpacity={0.75}
      >
        <FileSpreadsheet size={18} color="#10B981" />
        <Text style={[styles.exportCsvBtnText, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
          {t('settings.export_csv', 'Export CSV File')}
        </Text>
      </TouchableOpacity>

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.signOutBtn} onPress={logout}>
        <LogOut size={18} color="#FF4D6D" />
        <Text style={styles.signOutBtnText}>{t('settings.sign_out', 'Sign Out')}</Text>
      </TouchableOpacity>

      {/* Delete Account Button */}
      <TouchableOpacity
        style={[
          styles.deleteAccountBtn,
          {
            backgroundColor: isDark ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.06)',
            borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.25)',
          },
        ]}
        onPress={() => {
          setDeletePassword('');
          setDeleteError('');
          setIsDeleteModalOpen(true);
        }}
      >
        <Trash2 size={18} color="#EF4444" />
        <Text style={styles.deleteAccountBtnText}>{t('settings.delete_account', 'Delete Account')}</Text>
      </TouchableOpacity>

      {/* Footer User Email */}
      <Text style={[styles.footerEmail, { color: isDark ? '#64748B' : '#94A3B8' }]}>
        {t('settings.signed_in_as', 'Signed in as')}{' '}
        <Text style={{ fontWeight: '700' }}>{user?.email || 'user@gmail.com'}</Text>
      </Text>

      {/* Logo branding */}
      <View style={styles.brandingBox}>
        <HabitUpLogo size="md" showSubtitle={true} />
        <Text style={[styles.versionText, { color: isDark ? '#475569' : '#94A3B8' }]}>
          Version 1.0 • Build 2026.8
        </Text>
      </View>

      {/* Language Selection Modal */}
      <Modal
        visible={isLanguageModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsLanguageModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.langModalContainer,
              {
                backgroundColor: isDark ? '#131C2E' : '#FFFFFF',
                borderColor: isDark ? '#1E293B' : '#E2E8F0',
              },
            ]}
          >
            {/* Modal Header */}
            <View style={styles.deleteModalHeader}>
              <View
                style={[
                  styles.prefIconBadge,
                  {
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: 'rgba(56, 189, 248, 0.15)',
                  },
                ]}
              >
                <Globe size={20} color="#38BDF8" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.deleteModalTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                  {t('settings.select_language', 'Select Language')}
                </Text>
                <Text style={[styles.deleteModalSubtitle, { color: isDark ? '#94A3B8' : '#64748B' }]}>
                  {t('settings.select_language_desc', '8 Indian Languages + English')}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setIsLanguageModalOpen(false)}
              >
                <X size={18} color={isDark ? '#94A3B8' : '#64748B'} />
              </TouchableOpacity>
            </View>

            {/* Language Options List */}
            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              {SUPPORTED_LANGUAGES.map((langOption) => {
                const isSelected = language === langOption.code;
                return (
                  <TouchableOpacity
                    key={langOption.code}
                    style={[
                      styles.langOptionItem,
                      {
                        backgroundColor: isSelected
                          ? isDark
                            ? 'rgba(124, 92, 255, 0.18)'
                            : 'rgba(124, 92, 255, 0.1)'
                          : isDark
                          ? 'rgba(255, 255, 255, 0.03)'
                          : '#F8FAFC',
                        borderColor: isSelected
                          ? '#7C5CFF'
                          : isDark
                          ? 'rgba(255, 255, 255, 0.06)'
                          : '#E2E8F0',
                      },
                    ]}
                    onPress={async () => {
                      await setLanguage(langOption.code);
                      if (soundEnabled) soundService.playClickSound();
                      showToast(
                        `${langOption.flag} ${langOption.nativeName} (${langOption.name})`,
                        undefined,
                        'success'
                      );
                      setIsLanguageModalOpen(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.langItemLeft}>
                      <Text style={styles.langFlag}>{langOption.flag}</Text>
                      <View>
                        <Text
                          style={[
                            styles.langNativeName,
                            {
                              color: isSelected
                                ? '#7C5CFF'
                                : isDark
                                ? '#FFFFFF'
                                : '#0F172A',
                            },
                          ]}
                        >
                          {langOption.nativeName}
                        </Text>
                        <Text
                          style={[
                            styles.langEnglishName,
                            { color: isDark ? '#94A3B8' : '#64748B' },
                          ]}
                        >
                          {langOption.name} • {langOption.region}
                        </Text>
                      </View>
                    </View>

                    {isSelected && (
                      <View style={styles.selectedBadge}>
                        <Check size={16} color="#FFFFFF" strokeWidth={3} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Delete Account Confirmation Modal */}
      <Modal
        visible={isDeleteModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!isDeleting) setIsDeleteModalOpen(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.deleteModalContainer,
              {
                backgroundColor: isDark ? '#131C2E' : '#FFFFFF',
                borderColor: isDark ? '#1E293B' : '#E2E8F0',
              },
            ]}
          >
            {/* Modal Header */}
            <View style={styles.deleteModalHeader}>
              <View style={styles.deleteIconBadge}>
                <AlertTriangle size={22} color="#EF4444" strokeWidth={2.5} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.deleteModalTitle, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
                  {t('settings.delete_account', 'Delete Account')}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => {
                  if (!isDeleting) setIsDeleteModalOpen(false);
                }}
                disabled={isDeleting}
              >
                <X size={18} color={isDark ? '#94A3B8' : '#64748B'} />
              </TouchableOpacity>
            </View>

            {/* Warning Box */}
            <View
              style={[
                styles.deleteWarningBox,
                {
                  backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2',
                  borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : '#FCA5A5',
                },
              ]}
            >
              <Text style={[styles.deleteWarningText, { color: isDark ? '#FCA5A5' : '#B91C1C' }]}>
                {t('settings.delete_warning', '⚠️ This will permanently delete your account and all habit data.')}
              </Text>
            </View>

            {/* Password input */}
            <Text style={[styles.passwordLabel, { color: isDark ? '#E2E8F0' : '#334155' }]}>
              {t('settings.confirm_password', 'CONFIRM PASSWORD:')}
            </Text>
            <View
              style={[
                styles.passwordInputContainer,
                {
                  backgroundColor: isDark ? '#080E1A' : '#F8FAFC',
                  borderColor: deleteError ? '#EF4444' : isDark ? '#334155' : '#CBD5E1',
                },
              ]}
            >
              <Lock size={16} color={isDark ? '#64748B' : '#94A3B8'} style={{ marginRight: 8 }} />
              <TextInput
                style={[
                  styles.passwordTextInput,
                  { color: isDark ? '#FFFFFF' : '#0F172A' },
                  Platform.OS === 'web'
                    ? ({
                        outlineWidth: 0,
                        outlineStyle: 'none',
                        outlineColor: 'transparent',
                      } as any)
                    : {},
                ]}
                placeholder={t('settings.enter_password', 'Enter your password...')}
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                secureTextEntry={!showPassword}
                value={deletePassword}
                onChangeText={(text) => {
                  setDeletePassword(text);
                  if (deleteError) setDeleteError('');
                }}
                editable={!isDeleting}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={{ padding: 4 }}
              >
                {showPassword ? (
                  <EyeOff size={16} color={isDark ? '#94A3B8' : '#64748B'} />
                ) : (
                  <Eye size={16} color={isDark ? '#94A3B8' : '#64748B'} />
                )}
              </TouchableOpacity>
            </View>

            {/* Error Message */}
            {!!deleteError && (
              <Text style={styles.errorText}>{deleteError}</Text>
            )}

            {/* Action Buttons */}
            <View style={styles.deleteModalActions}>
              <TouchableOpacity
                style={[
                  styles.cancelBtn,
                  {
                    backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                    borderColor: isDark ? '#334155' : '#CBD5E1',
                  },
                ]}
                onPress={() => {
                  if (!isDeleting) setIsDeleteModalOpen(false);
                }}
                disabled={isDeleting}
              >
                <Text style={[styles.cancelBtnText, { color: isDark ? '#E2E8F0' : '#475569' }]}>
                  {t('common.cancel', 'Cancel')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.confirmDeleteBtn,
                  { opacity: isDeleting || !deletePassword.trim() ? 0.6 : 1 },
                ]}
                onPress={handleConfirmDeleteAccount}
                disabled={isDeleting || !deletePassword.trim()}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Trash2 size={16} color="#FFFFFF" strokeWidth={2.5} />
                    <Text style={styles.confirmDeleteBtnText}>{t('settings.delete_forever', 'Delete Forever')}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  backPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  backPillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  profileCard: {
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarGradient: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  avatarInitial: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#7C5CFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#131C2E',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '900',
  },
  userHandleText: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 1,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  editDpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  editDpText: {
    color: '#818CF8',
    fontSize: 13,
    fontWeight: '800',
  },
  sectionCard: {
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  prefLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  prefIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prefName: {
    fontSize: 14,
    fontWeight: '800',
  },
  prefDesc: {
    fontSize: 11,
    marginTop: 2,
  },
  themeTogglePill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  themeToggleText: {
    fontSize: 12,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    marginVertical: 6,
  },
  exportCsvBtn: {
    marginHorizontal: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  exportCsvBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },
  signOutBtn: {
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 10,
    backgroundColor: 'rgba(255, 77, 109, 0.08)',
    borderColor: 'rgba(255, 77, 109, 0.35)',
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  signOutBtnText: {
    color: '#FF4D6D',
    fontSize: 14,
    fontWeight: '900',
  },
  deleteAccountBtn: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deleteAccountBtnText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '900',
  },
  footerEmail: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 16,
  },
  brandingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    gap: 4,
  },
  versionText: {
    fontSize: 10,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  deleteModalContainer: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  deleteModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  deleteIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  deleteModalSubtitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 6,
  },
  deleteWarningBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  deleteWarningText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },
  passwordLabel: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 8,
  },
  passwordTextInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 12,
  },
  deleteModalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  confirmDeleteBtn: {
    flex: 1.2,
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  confirmDeleteBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  langSelectPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  langSelectPillText: {
    fontSize: 13,
    fontWeight: '800',
  },
  langModalContainer: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  langOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 8,
  },
  langItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  langFlag: {
    fontSize: 22,
  },
  langNativeName: {
    fontSize: 15,
    fontWeight: '800',
  },
  langEnglishName: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  selectedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#7C5CFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
