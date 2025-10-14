// src/stores/useVoiceStore.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface VoiceOption {
  identifier: string;
  name: string;
  displayName: string; // 日本語表示名
}

// デフォルトで全iOSユーザーが使える音声
export const DEFAULT_VOICES: VoiceOption[] = [
  {
    identifier: 'com.apple.voice.compact.ja-JP.Kyoko',
    name: 'Kyoko',
    displayName: 'Kyoko（女性）',
  },
  {
    identifier: 'com.apple.ttsbundle.siri_hattori_ja-JP_compact',
    name: 'Hattori',
    displayName: 'Hattori（男性）',
  },
  {
    identifier: 'com.apple.ttsbundle.siri_oren_ja-JP_compact',
    name: 'O-ren',
    displayName: 'O-ren（女性）',
  },
];

const VOICE_STORAGE_KEY = '@textcast_selected_voice';

interface VoiceStore {
  selectedVoice: VoiceOption;
  setVoice: (voice: VoiceOption) => Promise<void>;
  loadVoiceFromStorage: () => Promise<void>;
  getVoiceIdentifier: () => string;
}

export const useVoiceStore = create<VoiceStore>((set, get) => ({
  selectedVoice: DEFAULT_VOICES[0], // デフォルトはKyoko

  setVoice: async (voice: VoiceOption) => {
    try {
      await AsyncStorage.setItem(VOICE_STORAGE_KEY, JSON.stringify(voice));
      set({ selectedVoice: voice });
      console.log(`[VoiceStore] Voice changed to: ${voice.displayName}`);
    } catch (error) {
      console.error('[VoiceStore] Failed to save voice:', error);
    }
  },

  loadVoiceFromStorage: async () => {
    try {
      const stored = await AsyncStorage.getItem(VOICE_STORAGE_KEY);
      if (stored) {
        const voice = JSON.parse(stored) as VoiceOption;
        set({ selectedVoice: voice });
        console.log(`[VoiceStore] Loaded voice from storage: ${voice.displayName}`);
      }
    } catch (error) {
      console.error('[VoiceStore] Failed to load voice:', error);
    }
  },

  getVoiceIdentifier: () => {
    return get().selectedVoice.identifier;
  },
}));
