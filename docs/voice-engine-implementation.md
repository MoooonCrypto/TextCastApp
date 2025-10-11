# 音声エンジン実装ガイド

## 設計方針

### アーキテクチャ
```
[TextItem] → [VoiceEngineFactory] → [DeviceTTS | CloudTTS]
                                            ↓
                                    [expo-speech | expo-av]
```

### インターフェース設計

```typescript
// src/types/voice.ts

export type VoiceEngineType = 'device' | 'google' | 'aws' | 'azure' | 'elevenlabs';

export interface VoiceEngine {
  id: VoiceEngineType;
  name: string;
  description: string;
  isPremiumOnly: boolean;
  supportsAccurateSeek: boolean;
  isOnline: boolean;
  voices: VoiceOption[];
}

export interface VoiceOption {
  id: string;
  name: string;
  language: string;
  gender: 'male' | 'female' | 'neutral';
  sampleUrl?: string;
}

export interface AudioGenerationResult {
  type: 'stream' | 'file';
  uri?: string;
  duration: number;
  audioData?: any;
}

export interface VoiceEngineAdapter {
  generateAudio(text: string, voiceId: string): Promise<AudioGenerationResult>;
  estimateCost(characterCount: number): number;
  isAvailable(): Promise<boolean>;
}
```

### 実装例

#### 1. デバイスTTSアダプター（現在の方式）

```typescript
// src/services/voice/DeviceTTSAdapter.ts

import * as Speech from 'expo-speech';
import { VoiceEngineAdapter, AudioGenerationResult } from '../../types/voice';

export class DeviceTTSAdapter implements VoiceEngineAdapter {
  async generateAudio(text: string, voiceId: string): Promise<AudioGenerationResult> {
    const baseCharactersPerSecond = 8;
    const duration = Math.ceil(text.length / baseCharactersPerSecond);

    return {
      type: 'stream',
      duration,
      audioData: { text, voiceId },
    };
  }

  estimateCost(characterCount: number): number {
    return 0; // 完全無料
  }

  async isAvailable(): Promise<boolean> {
    return Speech.isSpeakingAsync().then(() => true).catch(() => false);
  }

  // 再生用ヘルパー
  async speak(
    text: string,
    options: Speech.SpeechOptions,
    startPosition: number = 0
  ): Promise<void> {
    const baseCharactersPerSecond = 8;
    const startCharIndex = Math.floor(startPosition * baseCharactersPerSecond);
    const textToSpeak = text.substring(startCharIndex);

    await Speech.speak(textToSpeak, options);
  }
}
```

#### 2. Google Cloud TTSアダプター

```typescript
// src/services/voice/GoogleTTSAdapter.ts

import { Audio } from 'expo-av';
import { VoiceEngineAdapter, AudioGenerationResult } from '../../types/voice';
import * as FileSystem from 'expo-file-system';

export class GoogleTTSAdapter implements VoiceEngineAdapter {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateAudio(text: string, voiceId: string): Promise<AudioGenerationResult> {
    // Google Cloud TTS API呼び出し
    const response = await fetch(
      'https://texttospeech.googleapis.com/v1/text:synthesize?key=' + this.apiKey,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: 'ja-JP',
            name: voiceId,
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 1.0,
          },
        }),
      }
    );

    const data = await response.json();
    const audioContent = data.audioContent;

    // Base64をファイルに保存
    const fileUri = `${FileSystem.cacheDirectory}audio_${Date.now()}.mp3`;
    await FileSystem.writeAsStringAsync(fileUri, audioContent, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // 音声の長さを取得
    const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
    const status = await sound.getStatusAsync();
    const duration = status.isLoaded ? status.durationMillis! / 1000 : 0;
    await sound.unloadAsync();

    return {
      type: 'file',
      uri: fileUri,
      duration,
    };
  }

  estimateCost(characterCount: number): number {
    // WaveNet: $16/1M chars
    return (characterCount / 1000000) * 16;
  }

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey;
  }
}
```

#### 3. ファクトリーパターン

```typescript
// src/services/voice/VoiceEngineFactory.ts

import { VoiceEngineType, VoiceEngineAdapter } from '../../types/voice';
import { DeviceTTSAdapter } from './DeviceTTSAdapter';
import { GoogleTTSAdapter } from './GoogleTTSAdapter';

export class VoiceEngineFactory {
  static create(type: VoiceEngineType, config?: any): VoiceEngineAdapter {
    switch (type) {
      case 'device':
        return new DeviceTTSAdapter();

      case 'google':
        if (!config?.apiKey) {
          throw new Error('Google TTS requires API key');
        }
        return new GoogleTTSAdapter(config.apiKey);

      // case 'aws':
      //   return new AWSPollyAdapter(config);

      // case 'azure':
      //   return new AzureTTSAdapter(config);

      default:
        throw new Error(`Unsupported voice engine: ${type}`);
    }
  }
}
```

#### 4. プレイヤーストアの統合

```typescript
// src/stores/usePlayerStore.ts (修正版)

import { VoiceEngineFactory } from '../services/voice/VoiceEngineFactory';
import { VoiceEngineType } from '../types/voice';

interface PlayerStore {
  // ... 既存の状態
  voiceEngine: VoiceEngineType;
  voiceId: string;
  audioFileUri: string | null; // クラウドTTSの場合の音声ファイル

  setVoiceEngine: (engine: VoiceEngineType) => void;
  setVoiceId: (id: string) => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  // ... 既存の実装
  voiceEngine: 'device',
  voiceId: 'ja-JP',
  audioFileUri: null,

  play: async (itemId: string) => {
    const item = get().playlist.find(i => i.id === itemId);
    if (!item) return;

    const { voiceEngine, voiceId } = get();
    const adapter = VoiceEngineFactory.create(voiceEngine, {
      apiKey: process.env.GOOGLE_TTS_API_KEY,
    });

    const audioResult = await adapter.generateAudio(item.content, voiceId);

    if (audioResult.type === 'file') {
      // expo-avで再生（正確なシーク可能）
      const { sound } = await Audio.Sound.createAsync({
        uri: audioResult.uri!,
      });

      set({
        audioFileUri: audioResult.uri!,
        duration: audioResult.duration,
        currentItemId: itemId,
      });

      await sound.playAsync();

    } else {
      // expo-speechで再生（現在の方式）
      // ... 既存の実装
    }
  },

  seek: async (position: number) => {
    const { audioFileUri } = get();

    if (audioFileUri) {
      // ファイルベースの場合は正確なシーク
      const { sound } = await Audio.Sound.createAsync({
        uri: audioFileUri,
      });
      await sound.setPositionAsync(position * 1000);
      await sound.playAsync();
    } else {
      // TTSベースの場合は文字位置ベース（既存の実装）
      // ... 既存の実装
    }
  },

  setVoiceEngine: (engine: VoiceEngineType) => {
    set({ voiceEngine: engine });
  },

  setVoiceId: (id: string) => {
    set({ voiceId: id });
  },
}));
```

---

## 利用料金シミュレーション

### ユースケース: 月間100記事、平均3000文字

| エンジン | 月間文字数 | コスト | 無料枠 | 実質コスト |
|---------|-----------|-------|--------|-----------|
| Device TTS | 300,000 | ¥0 | - | **¥0** |
| Google WaveNet | 300,000 | $4.8 (¥720) | 100万文字 | **¥0** |
| AWS Polly Neural | 300,000 | $4.8 (¥720) | 500万文字 | **¥0** |
| Azure Neural | 300,000 | $4.8 (¥720) | 50万文字 | **¥0** |
| ElevenLabs | 300,000 | $50+ (¥7,500) | 1万文字 | **¥7,500** |

**結論**: Google/AWS/Azureなら無料枠内で運用可能

---

## 推奨実装ロードマップ

### Phase 1 (MVP) - 現在
- [x] Device TTS のみ
- [x] 文字位置ベースシーク

### Phase 2 (次期バージョン)
- [ ] Google Cloud TTS 統合
- [ ] 設定画面で音声エンジン選択
- [ ] プレミアム機能として提供

### Phase 3 (将来)
- [ ] AWS Polly 追加
- [ ] 複数音声サンプル試聴
- [ ] 音声ファイルキャッシュ管理

---

## セキュリティ考慮事項

### APIキー管理
```typescript
// .env (Gitにコミットしない)
GOOGLE_TTS_API_KEY=your_key_here

// expo-constants で読み込み
import Constants from 'expo-constants';
const apiKey = Constants.expoConfig?.extra?.googleTtsApiKey;
```

### app.json
```json
{
  "expo": {
    "extra": {
      "googleTtsApiKey": "${GOOGLE_TTS_API_KEY}"
    }
  }
}
```
