import AsyncStorage from '@react-native-async-storage/async-storage';
import { SupportedLanguage, localizeHabitName, localizeHabitDescription } from '../i18n/translations';
import { apiService } from './apiService';

const STORAGE_KEY = '@habitup_dynamic_translations_v2';

const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  hi: 'Hindi',
  te: 'Telugu',
  ta: 'Tamil',
  kn: 'Kannada',
  ml: 'Malayalam',
  bn: 'Bengali',
  mr: 'Marathi',
  gu: 'Gujarati',
};

// Script detection to skip translating if the text is already in the target script
const SCRIPT_RANGES: Partial<Record<SupportedLanguage, RegExp>> = {
  hi: /[\u0900-\u097F]/,
  mr: /[\u0900-\u097F]/,
  bn: /[\u0980-\u09FF]/,
  gu: /[\u0A80-\u0AFF]/,
  ta: /[\u0B80-\u0BFF]/,
  te: /[\u0C00-\u0C7F]/,
  kn: /[\u0C80-\u0CFF]/,
  ml: /[\u0D00-\u0D7F]/,
};

// Built-in instant translations for common everyday habit phrases
const BUILTIN_COMMON_HABITS: Record<string, Partial<Record<SupportedLanguage, string>>> = {
  'walk the dog': {
    hi: 'कुत्ते को घुमाना', te: 'కుక్కను నడపడం', ta: 'நாயை நடைபயிற்சி செய்தல்',
    kn: 'ನಾಯಿಯನ್ನು ವಾಕಿಂಗ್ ಕರೆದೊಯ್ಯಿರಿ', ml: 'നായയെ നടത്തുക', bn: 'কুকুরকে হাঁটানো',
    mr: 'कुत्र्याला फिरवणे', gu: 'કૂતરાને ફેરવવો'
  },
  'drink green tea': {
    hi: 'ग्रीन टी पिएं', te: 'గ్రీన్ టీ తాగండి', ta: 'கிரீன் டீ குடிக்கவும்',
    kn: 'ಗ್ರೀನ್ ಟೀ ಕುಡಿಯಿರಿ', ml: 'ഗ്രീൻ ടീ കുടിക്കുക', bn: 'গ্রিন টি পান করুন',
    mr: 'ग्रीन टी प्या', gu: 'ગ્રીન ટી પીવો'
  },
  'no sugar': {
    hi: 'चीनी का त्याग', te: 'చక్కెర వద్దు', ta: 'சர்க்கரை தவிர்த்தல்',
    kn: 'ಸಕ್ಕರೆ ಬೇಡ', ml: 'പഞ്ചസാര ഒഴിവാക്കുക', bn: 'চিনি বর্জন',
    mr: 'साखर टाळा', gu: 'ખાંડ વગર'
  },
  'morning yoga': {
    hi: 'सुबह का योग', te: 'ఉదయపు యోగా', ta: 'காலை யோகா',
    kn: 'ಬೆಳಗಿನ ಯೋಗ', ml: 'രാവിലെയുള്ള യോഗ', bn: 'সকালের যোগব্যায়াম',
    mr: 'सकाळचा योग', gu: 'સવારનો યોગ'
  },
  'cold shower': {
    hi: 'ठंडे पानी से स्नान', te: 'చల్లని నీటి స్నానం', ta: 'குளிர்ந்த நீர் குளியல்',
    kn: 'ತಣ್ಣೀರು ಸ್ನಾನ', ml: 'തണുത്ത വെള്ളത്തിൽ കുളി', bn: 'ঠান্ডা পানিতে গোসল',
    mr: 'थंड पाण्याने आंघोळ', gu: 'ઠંડા પાણીથી સ્નાન'
  },
  'guitar practice': {
    hi: 'गिटार अभ्यास', te: 'గిటార్ సాధన', ta: 'கிட்டார் பயிற்சி',
    kn: 'ಗಿಟಾರ್ ಅಭ್ಯಾಸ', ml: 'ഗിറ്റാർ പരിശീലനം', bn: 'গিটার অনুশীলন',
    mr: 'गिटार सराव', gu: 'ગિટાર અભ્યાસ'
  },
  'clean desk': {
    hi: 'मेज़ साफ़ करें', te: 'డెస్క్ శుభ్రం చేయండి', ta: 'மேசையை சுத்தம் செய்யவும்',
    kn: 'ಮೇಜನ್ನು ಸ್ವಚ್ಛಗೊಳಿಸಿ', ml: 'മേശ വൃത്തിയാക്കുക', bn: 'ডেস্ক পরিষ্কার করুন',
    mr: 'डेस्क स्वच्छ करा', gu: 'ડેસ્ક સાફ કરો'
  },
  'clean room': {
    hi: 'कमरा साफ करें', te: 'గదిని శుభ్రం చేయండి', ta: 'அறையை சுத்தம் செய்யவும்',
    kn: 'ಕೋಣೆಯನ್ನು ಸ್ವಚ್ಛಗೊಳಿಸಿ', ml: 'മുറി വൃത്തിയാക്കുക', bn: 'ঘর পরিষ্কার করুন',
    mr: 'खोली स्वच्छ करा', gu: 'રૂમ સાફ કરો'
  },
  'pray': {
    hi: 'प्रार्थना करें', te: 'ప్రార్థన చేయండి', ta: 'பிரார்த்தனை செய்யுங்கள்',
    kn: 'ಪ್ರಾರ್ಥನೆ ಮಾಡಿ', ml: 'പ്രാർത്ഥിക്കുക', bn: 'প্রার্থনা করুন',
    mr: 'प्रार्थना करा', gu: 'પ્રાર્થના કરો'
  },
  'pray every morning': {
    hi: 'हर सुबह प्रार्थना करें', te: 'ప్రతి ఉదయం ప్రార్థన చేయండి', ta: 'தினமும் காலையில் பிரார்த்தனை செய்யுங்கள்',
    kn: 'ಪ್ರತಿದಿನ ಬೆಳಿಗ್ಗೆ ಪ್ರಾರ್ಥನೆ ಮಾಡಿ', ml: 'എല്ലാ ദിവസവും രാവിലെ പ്രാർത്ഥിക്കുക', bn: 'প্রতি সকালে প্রার্থনা করুন',
    mr: 'दररोज सकाळी प्रार्थना करा', gu: 'દરરોજ સવારે પ્રાર્થના કરો'
  },
  'walk 10000 steps': {
    hi: '10,000 कदम चलें', te: '10,000 అడుగులు నడవండి', ta: '10,000 படிகள் நடக்கவும்',
    kn: '10,000 ಹೆಜ್ಜೆಗಳನ್ನು ನಡೆಯಿರಿ', ml: '10,000 ചുവടുകൾ നടക്കുക', bn: '১০,০০০ কদম হাঁটুন',
    mr: '१०,००० पावले चाला', gu: '10,000 ડગલાં ચાલો'
  },
  'read 20 pages': {
    hi: '20 पृष्ठ पढ़ें', te: '20 పేజీలు చదవండి', ta: '20 பக்கங்கள் படிக்கவும்',
    kn: '20 ಪುಟಗಳನ್ನು ಓದಿ', ml: '20 പേജുകൾ വായിക്കുക', bn: '২০ পৃষ্ঠা পড়ুন',
    mr: '२० पाने वाचा', gu: '20 પાના વાંચો'
  },
  'sleep by 10 pm': {
    hi: 'रात 10 बजे तक सोएं', te: 'రాత్రి 10 గంటలకు నిద్రపోండి', ta: 'இரவு 10 மணிக்கு தூங்குங்கள்',
    kn: 'ರಾತ್ರಿ 10 ಗಂಟೆಗೆ ಮಲಗಿ', ml: 'രാത്രി 10 മണിക്ക് ഉറങ്ങുക', bn: 'রাত ১০টায় ঘুমান',
    mr: 'रात्री १० वाजता झोपा', gu: 'રાત્રે 10 વાગ્યે સૂઈ જાઓ'
  },
  'cycling': {
    hi: 'साइकिल चलाना', te: 'సైక్లింగ్', ta: 'சைக்கிள் ஓட்டுதல்',
    kn: 'ಸೈಕ್ಲಿಂಗ್', ml: 'സൈക്ലിംഗ്', bn: 'সাইকেল চালানো',
    mr: 'सायकल चालवणे', gu: 'સાયકલ ચલાવવી'
  },
  'morning walk': {
    hi: 'सुबह की सैर', te: 'ఉదయపు నడక', ta: 'காலை நடைப்பயிற்சி',
    kn: 'ಬೆಳಗಿನ ವಾಯುವಿಹಾರ', ml: 'രാവിലെയുള്ള നടത്തം', bn: 'সকালের হাঁটা',
    mr: 'सकाळची फेरी', gu: 'સવારની મોર્નિંગ વૉક'
  },
  'movie': {
    hi: 'फिल्म', te: 'సినిమా', ta: 'திரைப்படம்',
    kn: 'ಚಲನಚಿತ್ರ', ml: 'സിനിമ', bn: 'চলচ্চিত্র',
    mr: 'चित्रपट', gu: 'ચલચિત્ર'
  },
  'moovi': {
    hi: 'मूवी', te: 'సినిమా', ta: 'திரைப்படம்',
    kn: 'ಚಲನಚಿತ್ರ', ml: 'സിനിമ', bn: 'মুভি',
    mr: 'चित्रपट', gu: 'મૂવી'
  },
  'watch movie': {
    hi: 'फिल्म देखना', te: 'సినిమా చూడటం', ta: 'திரைப்படம் பார்க்கவும்',
    kn: 'ಚಲನಚಿತ್ರ ವೀಕ್ಷಿಸಿ', ml: 'സിനിമ കാണുക', bn: 'সিনেমা দেখা',
    mr: 'चित्रपट पाहणे', gu: 'ફિલ્મ જોવી'
  },
  'watch movies': {
    hi: 'फिल्में देखना', te: 'సినిమాలు చూడటం', ta: 'திரைப்படங்கள் பார்க்கவும்',
    kn: 'ಚಲನಚಿತ್ರಗಳನ್ನು ವೀಕ್ಷಿಸಿ', ml: 'സിനിമകൾ കാണുക', bn: 'সিনেমা দেখা',
    mr: 'चित्रपट पाहणे', gu: 'ફિલ્મો જોવી'
  }
};

type TranslationListener = () => void;

class TranslationService {
  private cache: Record<string, Record<string, string>> = {};
  private listeners: Set<TranslationListener> = new Set();
  private pendingRequests: Map<string, Promise<string>> = new Map();
  private isLoaded = false;

  constructor() {
    this.init();
  }

  public async init(): Promise<void> {
    if (this.isLoaded) return;
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.cache = { ...this.cache, ...parsed };
      }
      this.isLoaded = true;
    } catch (e) {
      console.warn('[TranslationService] Failed to load translation cache:', e);
      this.isLoaded = true;
    }
  }

  public subscribe(listener: TranslationListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (e) {
        console.warn('[TranslationService] Error in listener:', e);
      }
    }
  }

  private async persistCache(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.cache));
    } catch (e) {
      console.warn('[TranslationService] Failed to save translation cache:', e);
    }
  }

  private cleanKey(text: string): string {
    return (text || '').trim().toLowerCase();
  }

  /**
   * Synchronous check: returns translated text if already available in cache or dictionary.
   */
  public getCached(text?: string | null, targetLang: SupportedLanguage = 'en'): string | null {
    if (!text) return '';
    if (targetLang === 'en') return text;

    const trimmed = text.trim();
    const key = this.cleanKey(trimmed);

    // 1. Check if the text is already written in the target language's native script
    const scriptRegex = SCRIPT_RANGES[targetLang];
    if (scriptRegex && scriptRegex.test(trimmed)) {
      return trimmed;
    }

    // 2. Check dynamic in-memory cache
    if (this.cache[key]?.[targetLang]) {
      return this.cache[key][targetLang];
    }

    // 3. Check built-in common habit phrases
    if (BUILTIN_COMMON_HABITS[key]?.[targetLang]) {
      const match = BUILTIN_COMMON_HABITS[key]![targetLang]!;
      if (!this.cache[key]) this.cache[key] = {};
      this.cache[key][targetLang] = match;
      return match;
    }

    // 4. Check built-in dictionary / template aliases
    const dictTranslation = localizeHabitName(trimmed, targetLang);
    if (dictTranslation && dictTranslation.toLowerCase() !== key) {
      // Store in memory cache for faster future hits
      if (!this.cache[key]) this.cache[key] = {};
      this.cache[key][targetLang] = dictTranslation;
      return dictTranslation;
    }

    return null;
  }

  /**
   * Synchronous lookup with automatic background translation if not yet cached.
   * Guarantees non-blocking UI rendering.
   */
  public getOrTranslate(text?: string | null, targetLang: SupportedLanguage = 'en'): string {
    if (!text) return '';
    if (targetLang === 'en') return text;

    const cached = this.getCached(text, targetLang);
    if (cached) return cached;

    // Trigger background translation without blocking UI
    this.translateText(text, targetLang).catch(() => {});

    // Return original text or partial dictionary match until translation resolves
    return localizeHabitName(text, targetLang) || text;
  }

  /**
   * Translates text into targetLang using multi-tier strategy:
   * Tier 1: In-memory & AsyncStorage cache
   * Tier 2: Free high-speed MyMemory Machine Translation API
   * Tier 3: Context-aware Gemini / Railway Backend AI
   * Tier 4: Fallback to built-in dictionary / original text
   */
  public async translateText(text: string, targetLang: SupportedLanguage): Promise<string> {
    if (!text || !text.trim() || targetLang === 'en') {
      return text || '';
    }

    const trimmed = text.trim();
    const key = this.cleanKey(trimmed);

    // Check cache
    const existing = this.getCached(trimmed, targetLang);
    if (existing) return existing;

    // De-duplicate in-flight requests for the same text + language
    const requestKey = `${key}__${targetLang}`;
    if (this.pendingRequests.has(requestKey)) {
      return this.pendingRequests.get(requestKey)!;
    }

    const translationPromise = (async () => {
      let result: string | null = null;

      // 1. Try MyMemory Translation API
      try {
        result = await this.fetchFromMyMemory(trimmed, targetLang);
      } catch (err) {
        console.warn('[TranslationService] MyMemory failed:', err);
      }

      // 2. If MyMemory failed or returned unusable data, fallback to Backend AI
      if (!result && apiService.hasAuthToken()) {
        try {
          result = await this.fetchFromBackendAi(trimmed, targetLang);
        } catch (err) {
          console.warn('[TranslationService] Backend AI failed:', err);
        }
      }

      // 3. Fallback to dictionary or original
      if (!result) {
        const dictFallback = localizeHabitName(trimmed, targetLang);
        result = dictFallback && dictFallback.toLowerCase() !== key ? dictFallback : trimmed;
      }

      // Save to cache
      if (!this.cache[key]) this.cache[key] = {};
      this.cache[key][targetLang] = result;
      this.persistCache();
      this.notify();

      return result;
    })().finally(() => {
      this.pendingRequests.delete(requestKey);
    });

    this.pendingRequests.set(requestKey, translationPromise);
    return translationPromise;
  }

  /**
   * Pre-translates a batch of habits in the background when language changes or on load.
   */
  public async pretranslateHabits(
    habits: Array<{ name: string; description?: string }>,
    targetLang: SupportedLanguage
  ): Promise<void> {
    if (targetLang === 'en' || !habits || habits.length === 0) return;

    for (const h of habits) {
      if (h.name && !this.getCached(h.name, targetLang)) {
        await this.translateText(h.name, targetLang);
      }
    }
  }

  private async fetchFromMyMemory(text: string, targetLang: SupportedLanguage): Promise<string | null> {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`;
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeout = setTimeout(() => controller?.abort(), 3500);

    try {
      const res = await fetch(url, {
        method: 'GET',
        signal: controller?.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) return null;
      const data = await res.json();
      let trans: string | undefined = data?.responseData?.translatedText;

      if (!trans || typeof trans !== 'string') return null;

      // Filter out MyMemory warning banners
      if (trans.includes('MYMEMORY WARNING') || trans.includes('QUERY LENGTH LIMIT') || trans.toLowerCase() === targetLang) {
        return null;
      }

      // Unescape HTML entities
      trans = trans
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');

      const cleaned = trans.trim();

      // Reject responses that do not contain the target language's native script (e.g. untranslated English words like "moovi")
      const scriptRegex = SCRIPT_RANGES[targetLang];
      if (scriptRegex && !scriptRegex.test(cleaned)) {
        return null;
      }

      return cleaned.length > 0 ? cleaned : null;
    } catch {
      clearTimeout(timeout);
      return null;
    }
  }

  private async fetchFromBackendAi(text: string, targetLang: SupportedLanguage): Promise<string | null> {
    const langName = LANGUAGE_NAMES[targetLang] || targetLang;
    const prompt = `Translate or transliterate the habit "${text}" into natural ${langName} using ${langName} script. Even if it is slang, typo, or a single English word, output ONLY the translated/transliterated word in ${langName} script, nothing else, no quotes, no explanations, no English letters:`;

    const res = await apiService.sendAiChat({
      message: prompt,
    });

    if (res.ok && res.data?.reply) {
      let reply = res.data.reply.trim().replace(/^["']|["']$/g, '');
      if (reply.includes(':')) {
        reply = reply.split(':').pop()?.trim() || reply;
      }
      reply = reply.split('\n')[0].trim().replace(/^["'(]+|[)"']+$/g, '');
      const scriptRegex = SCRIPT_RANGES[targetLang];
      if (scriptRegex && !scriptRegex.test(reply)) {
        return null;
      }
      return reply.length > 0 ? reply : null;
    }

    return null;
  }
}

export const translationService = new TranslationService();
