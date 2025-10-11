// src/types/voice.ts - 音声関連の型定義

export interface DeviceVoice {
  identifier: string;  // システムの音声識別子
  name: string;        // 表示名（例: "Kyoko", "Otoya"）
  language: string;    // 言語コード（例: "ja-JP"）
  quality: string;     // 品質（"Default", "Enhanced", "Premium"）
}

export interface VoiceSettings {
  voiceIdentifier: string;  // 選択中の音声識別子
  pitch: number;            // ピッチ（0.5 - 2.0）
  rate: number;             // 速度（0.5 - 3.0）
  volume: number;           // 音量（0.0 - 1.0）
}
