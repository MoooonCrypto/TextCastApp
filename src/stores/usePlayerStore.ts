// src/stores/usePlayerStore.ts - Text-to-Speech版 + DB連携
import { create } from 'zustand';
import * as Speech from 'expo-speech';
import { TextItem } from '../types';
import { StorageService } from '../services/StorageService';
import { useVoiceStore } from './useVoiceStore';

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
  pitch: number; // ピッチ (0.5 - 2.0)

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
  setPitch: (pitch: number) => void;

  // DB連携
  loadItemsFromDB: () => Promise<void>;
  refreshPlaylist: () => Promise<void>;

  // ヘルパー
  getCurrentItem: () => TextItem | null;
  getProgressPercentage: () => number;
}

export const usePlayerStore = create<PlayerStore>((set, get) => {
  let isSeeking = false; // シーク中フラグ

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
    playlist: [], // DBから読み込む
    currentItemId: null,
    isPlaying: false,
    currentPosition: 0,
    duration: 0,
    isLoading: false,
    playbackRate: 1.0,
    currentText: null,
    estimatedDuration: 0,
    ttsProgressTimer: null,
    pitch: 1.0,

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

        // 再生完了しているアイテムを再度再生する場合は位置をリセット
        const { currentItemId, currentPosition, duration, playbackRate, pitch } = get();
        if (currentItemId === itemId && currentPosition >= duration) {
          console.log('[PLAYER] Resetting position for completed item');
          set({ currentPosition: 0 });
        }

        // VoiceStoreから選択中の音声を取得
        const selectedVoice = useVoiceStore.getState().getVoiceIdentifier();

        // TTS設定
        const ttsOptions: Speech.SpeechOptions = {
          language: 'ja-JP',
          pitch: pitch,
          rate: playbackRate,
          volume: 1.0,
          voice: selectedVoice, // VoiceStoreから取得した音声を使用
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
            console.log('[TTS] Finished speaking (isSeeking:', isSeeking, ')');
            clearTtsTimer();
            // シーク中でない場合のみ位置を更新
            if (!isSeeking) {
              set({
                isPlaying: false,
                currentPosition: get().duration,
              });
            } else {
              set({ isPlaying: false });
            }
          },
          onStopped: () => {
            console.log('[TTS] Stopped speaking (isSeeking:', isSeeking, ')');
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
        Speech.pause();
        clearTtsTimer();
        set({ isPlaying: false });
      } catch (error) {
        console.error('[PLAYER] TTS Pause error:', error);
      }
    },

    resume: async () => {
      console.log('[PLAYER] TTS Resume requested');
      const { currentItemId, currentText, playbackRate, currentPosition, duration } = get();

      if (currentItemId && currentText) {
        // 再生完了している場合は最初から再生
        if (currentPosition >= duration) {
          console.log('[PLAYER] Already finished, restarting from beginning');
          await get().play(currentItemId);
          return;
        }

        try {
          // resumeを試みる
          Speech.resume();
          set({ isPlaying: true });

          // タイマーを再開
          const timer = setInterval(() => {
            const { isPlaying, currentPosition, duration } = get();
            if (isPlaying && currentPosition < duration) {
              set({ currentPosition: currentPosition + 1 });
            } else if (currentPosition >= duration) {
              clearTtsTimer();
              set({
                isPlaying: false,
                currentPosition: duration
              });
            }
          }, 1000);

          set({ ttsProgressTimer: timer });
        } catch (error) {
          console.error('[PLAYER] Resume failed, restarting:', error);
          // resumeが失敗した場合は最初から再生
          await get().play(currentItemId);
        }
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
      const { currentItemId, currentText, playbackRate, isPlaying, duration } = get();

      if (!currentItemId || !currentText) {
        console.log('[PLAYER] Seek aborted: no current item');
        return;
      }

      const clampedPosition = Math.max(0, Math.min(position, duration));
      console.log(`[PLAYER] Seek from ${get().currentPosition}s to ${clampedPosition}s (duration: ${duration}s, wasPlaying: ${isPlaying})`);

      const wasPlaying = isPlaying;

      // シーク中フラグを立てる（古いコールバックを無視するため）
      isSeeking = true;

      // 既存のタイマーを完全にクリア
      clearTtsTimer();

      // 新しい位置を即座に設定（UIのチラつき防止）
      set({ currentPosition: clampedPosition, isPlaying: false });
      console.log(`[PLAYER] Position set to ${clampedPosition}s`);

      // 再生中の場合は停止
      if (wasPlaying) {
        Speech.stop();
        // Speech.stopのコールバック処理を待つ
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // 再生中だった場合のみ再開
      if (wasPlaying && clampedPosition < duration) {
        console.log('[PLAYER] Restarting playback from new position');

        clearTtsTimer();

        // シーク位置に対応するテキスト部分を計算
        const baseCharactersPerSecond = 8;
        const adjustedRate = baseCharactersPerSecond * playbackRate;
        const startCharIndex = Math.floor(clampedPosition * adjustedRate);
        const textToSpeak = currentText.substring(startCharIndex);

        console.log(`[PLAYER] Speaking from char ${startCharIndex}/${currentText.length} (${textToSpeak.substring(0, 20)}...)`);

        const { pitch } = get();
        const selectedVoice = useVoiceStore.getState().getVoiceIdentifier();

        Speech.speak(textToSpeak, {
          language: 'ja-JP',
          pitch: pitch,
          rate: playbackRate,
          volume: 1.0,
          voice: selectedVoice,
          onStart: () => {
            console.log(`[TTS] Playback started from ${clampedPosition}s`);
            set({ isPlaying: true, currentPosition: clampedPosition });

            // 新しいタイマーを作成（シーク位置から開始）
            const timer = setInterval(() => {
              const state = get();
              if (state.isPlaying && state.currentPosition < state.duration) {
                const newPos = state.currentPosition + 1;
                console.log(`[TIMER] Progress: ${newPos}/${state.duration}s`);
                set({ currentPosition: newPos });
              } else if (state.currentPosition >= state.duration) {
                console.log('[TIMER] Reached end');
                clearTtsTimer();
                set({ isPlaying: false, currentPosition: state.duration });
              }
            }, 1000);
            set({ ttsProgressTimer: timer });

            // ここでシーク完了フラグをクリア（onStartが実行された後）
            setTimeout(() => {
              isSeeking = false;
              console.log('[PLAYER] Seek completed, isSeeking set to false');
            }, 200);
          },
          onDone: () => {
            console.log('[TTS] Done after seek');
            clearTtsTimer();
            if (!isSeeking) {
              set({ isPlaying: false, currentPosition: duration });
            }
          },
          onStopped: () => {
            console.log('[TTS] Stopped after seek');
            clearTtsTimer();
            if (!isSeeking) {
              set({ isPlaying: false });
            }
          },
        });
      } else {
        console.log('[PLAYER] Not restarting playback (wasPlaying:', wasPlaying, ')');
        isSeeking = false;
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
      const { isPlaying, currentItemId, currentPosition } = get();
      console.log(`[PLAYER] Playback rate changed from ${get().playbackRate} to ${rate}, currentPosition: ${currentPosition}`);

      set({ playbackRate: rate });

      // 再生中の場合は、現在の位置から新しい速度で再開
      if (isPlaying && currentItemId) {
        console.log(`[PLAYER] Seeking to current position ${currentPosition}s with new rate`);
        await get().seek(currentPosition);
      }
    },

    setPitch: (pitch: number) => {
      const clampedPitch = Math.max(0.5, Math.min(2.0, pitch));
      console.log(`[PLAYER] Pitch changed to: ${clampedPitch}`);
      set({ pitch: clampedPitch });
    },

    // DBからアイテムを読み込む
    loadItemsFromDB: async () => {
      try {
        const items = await StorageService.getItems();
        set({ playlist: items });
        console.log(`[PLAYER] Loaded ${items.length} items from DB`);
      } catch (error) {
        console.error('[PLAYER] Failed to load items from DB:', error);
      }
    },

    // プレイリストを更新（保存後などに呼ぶ）
    refreshPlaylist: async () => {
      await get().loadItemsFromDB();
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