// src/stores/usePlayerStore.ts - Text-to-Speech版
import { create } from 'zustand';
import * as Speech from 'expo-speech';
import { TextItem } from '../types';
import { mockTextItems } from '../data/mockData';

interface PlayerStore {
  // 基本状態
  playlist: TextItem[];
  currentItemId: string | null;
  isPlaying: boolean;
  currentPosition: number; // 文字単位での現在位置
  duration: number; // 推定秒数
  isLoading: boolean;
  playbackRate: number; // 再生速度 (0.5, 1.0, 1.5, 2.0)

  // TTS関連
  currentText: string | null;
  estimatedDuration: number; // 推定時間（秒）
  ttsProgressTimer: NodeJS.Timeout | null;

  // アクション
  play: (itemId: string) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  stop: () => Promise<void>;
  seek: (position: number) => Promise<void>;
  skipForward: (seconds?: number) => Promise<void>;
  skipBackward: (seconds?: number) => Promise<void>;
  setPlaylist: (items: TextItem[]) => void;
  setPlaybackRate: (rate: number) => Promise<void>;

  // ヘルパー
  getCurrentItem: () => TextItem | null;
  getProgressPercentage: () => number;
}

export const usePlayerStore = create<PlayerStore>((set, get) => {

  const clearTtsTimer = () => {
    const { ttsProgressTimer } = get();
    if (ttsProgressTimer) {
      clearInterval(ttsProgressTimer);
      set({ ttsProgressTimer: null });
    }
  };

  // テキストから推定再生時間を計算（文字数ベース）
  const estimatePlaybackDuration = (text: string, rate: number = 1.0): number => {
    const baseCharactersPerSecond = 8; // 1秒あたりの文字数（日本語基準）
    const adjustedRate = baseCharactersPerSecond * rate;
    return Math.max(1, Math.ceil(text.length / adjustedRate));
  };

  const startTtsProgressTracking = (text: string, rate: number) => {
    clearTtsTimer();
    const duration = estimatePlaybackDuration(text, rate);
    const charactersPerSecond = text.length / duration;

    set({
      currentPosition: 0,
      duration: duration,
      estimatedDuration: duration
    });

    const timer = setInterval(() => {
      const { isPlaying, currentPosition, duration } = get();
      if (isPlaying && currentPosition < duration) {
        set({ currentPosition: currentPosition + 1 });
      } else if (currentPosition >= duration) {
        // 再生完了
        clearTtsTimer();
        set({
          isPlaying: false,
          currentPosition: duration
        });
      }
    }, 1000);

    set({ ttsProgressTimer: timer });
  };

  return {
    // 初期状態
    playlist: mockTextItems,
    currentItemId: null,
    isPlaying: false,
    currentPosition: 0,
    duration: 0,
    isLoading: false,
    playbackRate: 1.0,
    currentText: null,
    estimatedDuration: 0,
    ttsProgressTimer: null,

    play: async (itemId: string) => {
      console.log(`[PLAYER] TTS Play requested: ${itemId}`);

      try {
        set({ isLoading: true });

        // 既存のTTSを停止
        Speech.stop();
        clearTtsTimer();

        const item = get().playlist.find(i => i.id === itemId);
        if (!item) {
          console.error('[PLAYER] Item not found:', itemId);
          set({ isLoading: false });
          return;
        }

        const { playbackRate } = get();

        // TTS設定
        const ttsOptions: Speech.SpeechOptions = {
          language: 'ja-JP',
          pitch: 1.0,
          rate: playbackRate,
          volume: 1.0,
          onStart: () => {
            console.log('[TTS] Started speaking');
            set({
              currentItemId: itemId,
              isPlaying: true,
              currentText: item.content,
              isLoading: false,
            });
            startTtsProgressTracking(item.content, playbackRate);
          },
          onDone: () => {
            console.log('[TTS] Finished speaking');
            clearTtsTimer();
            set({
              isPlaying: false,
              currentPosition: get().duration,
            });
          },
          onStopped: () => {
            console.log('[TTS] Stopped speaking');
            clearTtsTimer();
            set({ isPlaying: false });
          },
          onError: (error) => {
            console.error('[TTS] Error:', error);
            clearTtsTimer();
            set({
              isPlaying: false,
              isLoading: false,
            });
          },
        };

        // TTS開始
        Speech.speak(item.content, ttsOptions);

        console.log(`[PLAYER] Started TTS for: ${item.title}`);

      } catch (error) {
        console.error('[PLAYER] TTS Play error:', error);
        set({
          isLoading: false,
          isPlaying: false,
        });
      }
    },

    pause: async () => {
      console.log('[PLAYER] TTS Pause requested');
      try {
        Speech.stop();
        clearTtsTimer();
        set({ isPlaying: false });
      } catch (error) {
        console.error('[PLAYER] TTS Pause error:', error);
      }
    },

    resume: async () => {
      console.log('[PLAYER] TTS Resume requested');
      const { currentItemId } = get();

      if (currentItemId) {
        // 現在のアイテムを再度再生
        await get().play(currentItemId);
      }
    },

    stop: async () => {
      console.log('[PLAYER] TTS Stop requested');
      try {
        Speech.stop();
        clearTtsTimer();
      } catch (error) {
        console.error('[PLAYER] TTS Stop error:', error);
      }

      set({
        currentItemId: null,
        isPlaying: false,
        currentPosition: 0,
        duration: 0,
        currentText: null,
        estimatedDuration: 0,
      });
    },

    seek: async (position: number) => {
      console.log(`[PLAYER] TTS Seek requested: ${position}s`);
      // TTSでは正確なシークが困難なため、簡易実装
      // 実際のアプリでは、テキストを分割して特定位置から再生する等の実装が必要
      const { currentItemId, currentText, playbackRate } = get();

      if (currentItemId && currentText) {
        const duration = estimatePlaybackDuration(currentText, playbackRate);
        const clampedPosition = Math.max(0, Math.min(position, duration));

        set({ currentPosition: clampedPosition });

        // 新しい位置から再生を再開（簡易実装）
        if (clampedPosition < duration) {
          await get().play(currentItemId);
        }
      }
    },

    skipForward: async (seconds = 10) => {
      const { currentPosition, duration } = get();
      const newPosition = Math.min(currentPosition + seconds, duration);
      await get().seek(newPosition);
    },

    skipBackward: async (seconds = 10) => {
      const { currentPosition } = get();
      const newPosition = Math.max(currentPosition - seconds, 0);
      await get().seek(newPosition);
    },

    setPlaylist: (items: TextItem[]) => {
      set({ playlist: items });
    },

    setPlaybackRate: async (rate: number) => {
      const { isPlaying, currentItemId } = get();
      set({ playbackRate: rate });

      // 再生中の場合は、新しい速度で再開
      if (isPlaying && currentItemId) {
        await get().play(currentItemId);
      }
    },

    getCurrentItem: () => {
      const { playlist, currentItemId } = get();
      return playlist.find(item => item.id === currentItemId) || null;
    },

    getProgressPercentage: () => {
      const { currentPosition, duration } = get();
      if (duration === 0) return 0;
      return Math.min((currentPosition / duration) * 100, 100);
    },
  };
});