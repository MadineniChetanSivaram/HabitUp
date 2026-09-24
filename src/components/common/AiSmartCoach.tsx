import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useHabit } from '../../context/HabitContext';
import { apiService } from '../../services/apiService';
import { generateSmartCoachResponse } from '../../utils/aiCoachEngine';
import { Bot, Sparkles, Send, X, Maximize2, Minimize2 } from 'lucide-react-native';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hi there! I'm your AI Smart Coach 🤖✨\n\nI analyze your habits, completion consistency, and streaks to help you succeed. How can I help you today?",
  timestamp: new Date(),
};

export const AiSmartCoach: React.FC = () => {
  const { habits, overallStats, user, theme } = useHabit();
  const isDark = theme === 'dark';

  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const popAnim = useRef(new Animated.Value(0)).current;

  // Gentle breathing glow animation on the floating button
  useEffect(() => {
    const p = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1200, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: Platform.OS !== 'web' }),
      ])
    );
    p.start();
    return () => p.stop();
  }, [pulseAnim]);

  useEffect(() => {
    if (isOpen) {
      Animated.spring(popAnim, {
        toValue: 1,
        friction: 8,
        tension: 80,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    } else {
      popAnim.setValue(0);
    }
  }, [isOpen, popAnim]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  }, []);

  const buildContext = useCallback((): string => {
    const active = habits.filter((h) => !h.archived_at && !h.deleted_at && !h.paused_at);
    const summary =
      active
        .slice(0, 8)
        .map((h) => `- ${h.name} (streak: ${String((h as any).streak ?? (h as any).currentStreak ?? 0)}d)`)
        .join('\n') || 'None';
    return `User: ${user?.name || 'Friend'}, Overall streak: ${String(overallStats?.currentBestStreak ?? 0)}d\nHabits:\n${summary}`;
  }, [habits, user, overallStats]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = { id: `u_${Date.now()}`, role: 'user', content: text, timestamp: new Date() };
    setMessages((p) => [...p, userMsg]);
    setInput('');
    setIsLoading(true);
    Keyboard.dismiss();
    scrollToBottom();

    try {
      // 1. Attempt to call live Railway backend /ai/chat
      const res: any = await (apiService as any).request('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: text,
          context: buildContext(),
          history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const backendReply =
        res?.ok && (res.data?.reply || res.data?.message || res.data?.response)
          ? res.data?.reply || res.data?.message || res.data?.response
          : null;

      // 2. If backend LLM returned a valid response, use it!
      // Otherwise, use our smart context-aware coach engine tailored to user's question and habit data!
      const reply =
        backendReply ||
        generateSmartCoachResponse(text, {
          habits,
          overallStats,
          user,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        });

      setMessages((p) => [
        ...p,
        { id: `a_${Date.now()}`, role: 'assistant', content: reply, timestamp: new Date() },
      ]);
    } catch {
      // Network or offline fallback: still provide dynamic, personalized coaching
      const fallback = generateSmartCoachResponse(text, {
        habits,
        overallStats,
        user,
        history: messages.map((m) => ({ role: m.role, content: m.content })),
      });
      setMessages((p) => [
        ...p,
        {
          id: `a_${Date.now()}`,
          role: 'assistant',
          content: fallback,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  }, [input, isLoading, messages, buildContext, scrollToBottom, habits, overallStats, user]);

  return (
    <>
      {/* Subtle dismiss backdrop when floating (dismisses on outside click) */}
      {isOpen && !isFullScreen && (
        <TouchableOpacity
          style={s.backdropOverlay}
          onPress={() => setIsOpen(false)}
          activeOpacity={1}
        />
      )}

      {/* Floating Action Button (FAB) anchored bottom-right */}
      {!isOpen && (
        <Animated.View style={[s.fabWrapper, { transform: [{ scale: pulseAnim }] }]}>
          <TouchableOpacity
            style={s.fabBtn}
            onPress={() => setIsOpen(true)}
            activeOpacity={0.85}
          >
            <View style={s.fabGlass}>
              <Bot size={24} color="#FFFFFF" />
              <View style={s.sparkleBadge}>
                <Sparkles size={11} color="#FDE047" fill="#FDE047" />
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Coach Chat Window (Floating Card or Full Screen) */}
      {isOpen && (
        <Animated.View
          style={[
            isFullScreen ? s.cardFullScreen : s.floatingCard,
            {
              backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
              borderColor: isFullScreen
                ? 'transparent'
                : isDark
                ? 'rgba(124, 92, 255, 0.35)'
                : 'rgba(124, 92, 255, 0.25)',
              opacity: popAnim,
              transform: isFullScreen
                ? []
                : [
                    {
                      scale: popAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.88, 1],
                      }),
                    },
                    {
                      translateY: popAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [18, 0],
                      }),
                    },
                  ],
            },
          ]}
        >
          {/* Header */}
          <View
            style={[
              s.header,
              {
                backgroundColor: isDark ? '#0A0F1D' : '#F8FAFC',
                borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
              },
            ]}
          >
            <View style={s.headerLeft}>
              <View style={s.avatar}>
                <Bot size={20} color="#7C5CFF" />
              </View>
              <View>
                <Text style={[s.htitle, { color: isDark ? '#F8FAFC' : '#0F172A' }]}>AI Smart Coach</Text>
                <Text style={s.hsub}>Personal Habit Mentor ✨</Text>
              </View>
            </View>

            <View style={s.headerRight}>
              {/* Expand / Minimize Full Screen Toggle */}
              <TouchableOpacity
                onPress={() => setIsFullScreen((prev) => !prev)}
                style={[
                  s.headerBtn,
                  { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
                ]}
                activeOpacity={0.7}
                accessibilityLabel={isFullScreen ? 'Minimize window' : 'Full screen'}
              >
                {isFullScreen ? (
                  <Minimize2 size={16} color={isDark ? '#CBD5E1' : '#475569'} />
                ) : (
                  <Maximize2 size={16} color={isDark ? '#CBD5E1' : '#475569'} />
                )}
              </TouchableOpacity>

              {/* Close Button */}
              <TouchableOpacity
                onPress={() => {
                  setIsOpen(false);
                  setIsFullScreen(false);
                }}
                style={[
                  s.headerBtn,
                  { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
                ]}
                activeOpacity={0.7}
                accessibilityLabel="Close coach"
              >
                <X size={17} color={isDark ? '#CBD5E1' : '#475569'} />
              </TouchableOpacity>
            </View>
          </View>

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            {/* Messages ScrollView */}
            <ScrollView
              ref={scrollRef}
              style={{ flex: 1 }}
              contentContainerStyle={s.msgContent}
              onContentSizeChange={scrollToBottom}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {messages.map((m) => (
                <View
                  key={m.id}
                  style={[
                    s.bubble,
                    m.role === 'user' ? s.bubbleU : isDark ? s.bubbleADark : s.bubbleALight,
                  ]}
                >
                  {m.role === 'assistant' && (
                    <View style={s.coachBadgeRow}>
                      <Sparkles size={11} color="#7C5CFF" />
                      <Text style={s.coach}>Smart Coach</Text>
                    </View>
                  )}
                  <Text style={[s.bubbleTxt, m.role === 'user' ? s.txtU : isDark ? s.txtADark : s.txtALight]}>
                    {m.content}
                  </Text>
                </View>
              ))}

              {isLoading && (
                <View
                  style={[
                    s.bubble,
                    isDark ? s.bubbleADark : s.bubbleALight,
                    { flexDirection: 'row', alignItems: 'center', gap: 8 },
                  ]}
                >
                  <ActivityIndicator size="small" color="#7C5CFF" />
                  <Text style={[s.bubbleTxt, isDark ? s.txtADark : s.txtALight]}>Analyzing your habits...</Text>
                </View>
              )}
            </ScrollView>

            {/* Quick Prompt Chips */}
            {messages.length <= 1 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={[s.chips, { borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0' }]}
                contentContainerStyle={s.chipsContent}
                keyboardShouldPersistTaps="handled"
              >
                {[
                  'How am I doing this week?',
                  'Tips to build consistency',
                  'What habit should I focus on?',
                  'Help me stay motivated 🔥',
                ].map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      s.chip,
                      {
                        backgroundColor: isDark ? 'rgba(124, 92, 255, 0.12)' : 'rgba(124, 92, 255, 0.08)',
                        borderColor: isDark ? 'rgba(124, 92, 255, 0.25)' : 'rgba(124, 92, 255, 0.2)',
                      },
                    ]}
                    onPress={() => setInput(c)}
                  >
                    <Text style={[s.chipTxt, { color: isDark ? '#C7D2FE' : '#6366F1' }]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Input Row */}
            <View
              style={[
                s.inputRow,
                {
                  backgroundColor: isDark ? '#0A0F1D' : '#F8FAFC',
                  borderTopColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0',
                },
              ]}
            >
              <TextInput
                style={[
                  s.input,
                  {
                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                    color: isDark ? '#F8FAFC' : '#0F172A',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#E2E8F0',
                  },
                ]}
                value={input}
                onChangeText={setInput}
                placeholder="Ask your coach anything..."
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                textAlign="left"
                maxLength={500}
                onSubmitEditing={sendMessage}
                returnKeyType="send"
              />
              <TouchableOpacity
                style={[s.send, (!input.trim() || isLoading) && s.sendOff]}
                onPress={sendMessage}
                disabled={!input.trim() || isLoading}
                activeOpacity={0.8}
              >
                <Send size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      )}
    </>
  );
};

const s = StyleSheet.create({
  backdropOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
    zIndex: 998,
  },
  fabWrapper: {
    position: 'absolute',
    bottom: 18,
    right: 16,
    zIndex: 999,
  },
  fabBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#7C5CFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C5CFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  fabGlass: {
    width: '100%',
    height: '100%',
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  sparkleBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#4C1D95',
    borderRadius: 8,
    padding: 2,
  },
  floatingCard: {
    position: 'absolute',
    bottom: 18,
    right: 14,
    width: 360,
    maxWidth: '92%',
    height: 480,
    maxHeight: '70%',
    borderRadius: 22,
    borderWidth: 1.5,
    overflow: 'hidden',
    zIndex: 1000,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(124, 92, 255, 0.25)',
        } as any)
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 10,
        }),
  },
  cardFullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    maxWidth: '100%',
    height: '100%',
    maxHeight: '100%',
    borderRadius: 0,
    borderWidth: 0,
    overflow: 'hidden',
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(124, 92, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(124, 92, 255, 0.35)',
  },
  htitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  hsub: {
    color: '#7C5CFF',
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 1,
  },
  msgContent: {
    padding: 12,
    gap: 10,
    flexGrow: 1,
  },
  bubble: {
    maxWidth: '88%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  bubbleU: {
    alignSelf: 'flex-end',
    backgroundColor: '#7C5CFF',
    borderBottomRightRadius: 4,
  },
  bubbleADark: {
    alignSelf: 'flex-start',
    backgroundColor: '#1E293B',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  bubbleALight: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1F5F9',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  coachBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  coach: {
    color: '#7C5CFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  bubbleTxt: {
    fontSize: 13,
    lineHeight: 18,
  },
  txtU: {
    color: '#FFFFFF',
  },
  txtADark: {
    color: '#F1F5F9',
  },
  txtALight: {
    color: '#0F172A',
  },
  chips: {
    maxHeight: 42,
    borderTopWidth: 1,
  },
  chipsContent: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipTxt: {
    fontSize: 11,
    fontWeight: '700',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 10,
    gap: 8,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 21,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 0,
    fontSize: 13.5,
    height: 42,
    minHeight: 42,
    maxHeight: 42,
    borderWidth: 1,
    textAlign: 'left',
    textAlignVertical: 'center',
    ...(Platform.OS === 'web'
      ? ({
          outline: 'none',
          outlineStyle: 'none',
          outlineWidth: 0,
          boxShadow: 'none',
        } as any)
      : {}),
  },
  send: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#7C5CFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C5CFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  sendOff: {
    backgroundColor: '#64748B',
    opacity: 0.5,
  },
});
