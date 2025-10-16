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
    identifier: 'com.apple.ttsbundle.siri_oren_ja-JP_compact',
    name: 'O-ren',
    displayName: 'O-ren（女性）',
  },
  {
    identifier: 'com.apple.ttsbundle.siri_hattori_ja-JP_compact',
    name: 'Hattori',
    displayName: 'Hattori（男性）',
  },
];

const VOICE_STORAGE_KEY = '@textcast_selected_voice';

interface VoiceStore {
  selectedVoice: VoiceOption | null; // nullの場合はシステムデフォルトを使用
  setVoice: (voice: VoiceOption) => Promise<void>;
  loadVoiceFromStorage: () => Promise<void>;
  getVoiceIdentifier: () => string | undefined; // undefinedの場合はシステムデフォルト
}

export const useVoiceStore = create<VoiceStore>((set, get) => ({
  selectedVoice: null, // デフォルトはnull（システムデフォルト音声を使用）

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
      } else {
        // 初回起動時：利用可能な音声をチェックして自動設定
        console.log('[VoiceStore] First launch, checking available voices...');

        try {
          const Speech = require('expo-speech');
          const availableVoices = await Speech.getAvailableVoicesAsync();

          // Siri O-ren（女性）が利用可能かチェック
          const orenVoice = availableVoices.find(
            (v: any) => v.identifier === DEFAULT_VOICES[0].identifier
          );

          if (orenVoice) {
            // Siri音声が利用可能なら自動設定
            await get().setVoice(DEFAULT_VOICES[0]);
            console.log('[VoiceStore] Auto-set to Siri O-ren (available)');
          } else {
            // シミュレータなど、Siri音声が使えない環境ではnullのまま
            console.log('[VoiceStore] Siri voices not available, using system default');
          }
        } catch (error) {
          console.log('[VoiceStore] Could not check voices, using system default');
        }
      }
    } catch (error) {
      console.error('[VoiceStore] Failed to load voice:', error);
    }
  },

  getVoiceIdentifier: () => {
    const voice = get().selectedVoice;
    return voice?.identifier; // nullの場合はundefinedを返す（システムデフォルト）
  },
}));
