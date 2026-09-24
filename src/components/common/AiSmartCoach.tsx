import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, TextInput,
  ScrollView, KeyboardAvoidingView, Platform, Animated, ActivityIndicator, Keyboard,
} from 'react-native';
import { useHabit } from '../../context/HabitContext';
import { apiService } from '../../services/apiService';

interface ChatMessage { id: string; role: 'user' | 'assistant'; content: string; timestamp: Date; }

const WELCOME: ChatMessage = { id: 'welcome', role: 'assistant', content: 'Hi! I\'m your AI Smart Coach \uD83E\uDD16\u2728\n\nI know your habits and streaks. Ask me anything!\n\u2022 How am I doing this week?\n\u2022 Tips to build consistency\n\u2022 What habit to focus on today?', timestamp: new Date() };

export const AiSmartCoach: React.FC = () => {
  const { habits, overallStats, user } = useHabit();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const p = Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.12, duration: 900, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
    ])); p.start(); return () => p.stop();
  }, [pulseAnim]);

  useEffect(() => {
    if (isOpen) { slideAnim.setValue(400); Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 60, useNativeDriver: true }).start(); }
  }, [isOpen, slideAnim]);

  const scrollToBottom = useCallback(() => { setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100); }, []);

  const buildContext = useCallback((): string => {
    const active = habits.filter(h => !h.archived_at && !h.deleted_at && !h.paused_at);
    const summary = active.slice(0, 8).map(h => '- ' + h.name + ' (streak: ' + String((h as any).streak ?? (h as any).currentStreak ?? 0) + 'd)').join('\n') || 'None';
    return 'User: ' + user.name + ', Overall streak: ' + String(overallStats.currentBestStreak ?? 0) + 'd\nHabits:\n' + summary;
  }, [habits, user, overallStats]);

  const sendMessage = useCallback(async () => {
    const text = input.trim(); if (!text || isLoading) return;
    const userMsg: ChatMessage = { id: 'u' + Date.now(), role: 'user', content: text, timestamp: new Date() };
    setMessages(p => [...p, userMsg]); setInput(''); setIsLoading(true); Keyboard.dismiss(); scrollToBottom();
    try {
      const res: any = await (apiService as any).request('/ai/coach', {
        method: 'POST',
        body: JSON.stringify({ message: text, context: buildContext(), history: messages.slice(-6).map(m => ({ role: m.role, content: m.content })) }),
      });
      const reply = res.ok && res.data?.reply ? res.data.reply : 'Unable to connect. Try again!';
      setMessages(p => [...p, { id: 'a' + Date.now(), role: 'assistant', content: reply, timestamp: new Date() }]);
    } catch { setMessages(p => [...p, { id: 'e' + Date.now(), role: 'assistant', content: 'Connection error. Please retry!', timestamp: new Date() }]); }
    finally { setIsLoading(false); scrollToBottom(); }
  }, [input, isLoading, messages, buildContext, scrollToBottom]);

  return (
    <>
      {!isOpen && (
        <Animated.View style={[s.fab, { transform: [{ scale: pulseAnim }] }]}>
          <TouchableOpacity style={s.fabBtn} onPress={() => setIsOpen(true)} activeOpacity={0.85}>
            <Text style={s.fabEmoji}>\uD83E\uDD16</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
      <Modal visible={isOpen} transparent animationType='none' onRequestClose={() => setIsOpen(false)}>
        <View style={s.overlay}>
          <TouchableOpacity style={s.backdrop} onPress={() => setIsOpen(false)} activeOpacity={1} />
          <Animated.View style={[s.sheet, { transform: [{ translateY: slideAnim }] }]}>
            <View style={s.header}>
              <View style={s.headerLeft}>
                <View style={s.avatar}><Text style={s.avatarTxt}>\uD83E\uDD16</Text></View>
                <View><Text style={s.htitle}>AI Smart Coach</Text><Text style={s.hsub}>Powered by Gemini \u2728</Text></View>
              </View>
              <TouchableOpacity onPress={() => setIsOpen(false)} style={s.closeBtn}><Text style={s.closeTxt}>\u2715</Text></TouchableOpacity>
            </View>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={s.msgContent} onContentSizeChange={scrollToBottom} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps='handled'>
                {messages.map(m => (
                  <View key={m.id} style={[s.bubble, m.role === 'user' ? s.bubbleU : s.bubbleA]}>
                    {m.role === 'assistant' && <Text style={s.coach}>Coach</Text>}
                    <Text style={[s.bubbleTxt, m.role === 'user' ? s.txtU : s.txtA]}>{m.content}</Text>
                  </View>
                ))}
                {isLoading && <View style={[s.bubble, s.bubbleA, { flexDirection: 'row', alignItems: 'center' }]}><ActivityIndicator size='small' color='#7C5CFF'/><Text style={[s.bubbleTxt, s.txtA, { marginLeft: 8 }]}>Thinking...</Text></View>}
              </ScrollView>
              {messages.length <= 1 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chips} contentContainerStyle={s.chipsContent} keyboardShouldPersistTaps='handled'>
                  {['How am I doing this week?','Tips to build consistency','What to focus on today?','Help me stay motivated'].map(c => (
                    <TouchableOpacity key={c} style={s.chip} onPress={() => setInput(c)}><Text style={s.chipTxt}>{c}</Text></TouchableOpacity>
                  ))}
                </ScrollView>
              )}
              <View style={s.inputRow}>
                <TextInput style={s.input} value={input} onChangeText={setInput} placeholder='Ask your coach...' placeholderTextColor='#6B7280' multiline maxLength={500} blurOnSubmit={false} />
                <TouchableOpacity style={[s.send, (!input.trim() || isLoading) && s.sendOff]} onPress={sendMessage} disabled={!input.trim() || isLoading}>
                  <Text style={s.sendTxt}>\u27a4</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

const s = StyleSheet.create({
  fab: { position: 'absolute', bottom: 90, right: 16, zIndex: 999 },
  fabBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#7C5CFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#7C5CFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.45, shadowRadius: 10, elevation: 10 },
  fabEmoji: { fontSize: 26 },
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { backgroundColor: '#111827', borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '82%', overflow: 'hidden', borderTopWidth: 1, borderColor: '#1F2937' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1F2937', backgroundColor: '#0D1117' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#7C5CFF22', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#7C5CFF66' },
  avatarTxt: { fontSize: 20 },
  htitle: { color: '#F9FAFB', fontSize: 15, fontWeight: '700' },
  hsub: { color: '#6B7280', fontSize: 11, marginTop: 1 },
  closeBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1F2937', borderRadius: 16 },
  closeTxt: { color: '#9CA3AF', fontSize: 14, fontWeight: '600' },
  msgContent: { padding: 16, gap: 10, flexGrow: 1 },
  bubble: { maxWidth: '85%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 16, marginVertical: 3 },
  bubbleA: { alignSelf: 'flex-start', backgroundColor: '#1F2937', borderBottomLeftRadius: 4 },
  bubbleU: { alignSelf: 'flex-end', backgroundColor: '#7C5CFF', borderBottomRightRadius: 4 },
  coach: { color: '#7C5CFF', fontSize: 10, fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
  bubbleTxt: { fontSize: 14, lineHeight: 21 },
  txtA: { color: '#E5E7EB' },
  txtU: { color: '#FFFFFF' },
  chips: { maxHeight: 44, borderTopWidth: 1, borderTopColor: '#1F2937' },
  chipsContent: { paddingHorizontal: 12, paddingVertical: 6, gap: 8, alignItems: 'center' },
  chip: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#1F2937', borderRadius: 20, borderWidth: 1, borderColor: '#374151' },
  chipTxt: { color: '#D1D5DB', fontSize: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, gap: 10, borderTopWidth: 1, borderTopColor: '#1F2937', backgroundColor: '#0D1117' },
  input: { flex: 1, backgroundColor: '#1F2937', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, color: '#F9FAFB', fontSize: 14, maxHeight: 100, borderWidth: 1, borderColor: '#374151' },
  send: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#7C5CFF', alignItems: 'center', justifyContent: 'center' },
  sendOff: { backgroundColor: '#374151' },
  sendTxt: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
