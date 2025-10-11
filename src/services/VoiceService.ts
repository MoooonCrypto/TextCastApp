// src/services/VoiceService.ts - 音声管理サービス

import * as Speech from 'expo-speech';
import { DeviceVoice } from '../types/voice';

export class VoiceService {
  private static instance: VoiceService;
  private availableVoices: DeviceVoice[] = [];
  private isInitialized: boolean = false;

  private constructor() {}

  static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  /**
   * 利用可能な音声一覧を取得
   */
  async getAvailableVoices(): Promise<DeviceVoice[]> {
    if (this.isInitialized && this.availableVoices.length > 0) {
      return this.availableVoices;
    }

    try {
      const voices = await Speech.getAvailableVoicesAsync();
      this.availableVoices = voices as DeviceVoice[];
      this.isInitialized = true;

      console.log(`[VoiceService] Found ${voices.length} voices`);
      return this.availableVoices;
    } catch (error) {
      console.error('[VoiceService] Failed to get voices:', error);
      return [];
    }
  }

  /**
   * 日本語音声のみを取得
   */
  async getJapaneseVoices(): Promise<DeviceVoice[]> {
    const allVoices = await this.getAvailableVoices();
    return allVoices.filter(v => v.language.startsWith('ja'));
  }

  /**
   * 英語音声のみを取得
   */
  async getEnglishVoices(): Promise<DeviceVoice[]> {
    const allVoices = await this.getAvailableVoices();
    return allVoices.filter(v => v.language.startsWith('en'));
  }

  /**
   * 言語別に音声をグループ化
   */
  async getVoicesByLanguage(): Promise<Map<string, DeviceVoice[]>> {
    const allVoices = await this.getAvailableVoices();
    const grouped = new Map<string, DeviceVoice[]>();

    allVoices.forEach(voice => {
      const langCode = voice.language.split('-')[0]; // "ja-JP" -> "ja"
      if (!grouped.has(langCode)) {
        grouped.set(langCode, []);
      }
      grouped.get(langCode)!.push(voice);
    });

    return grouped;
  }

  /**
   * 音声をサンプル再生
   */
  async previewVoice(voiceIdentifier: string, sampleText: string = 'こんにちは。これはサンプル音声です。'): Promise<void> {
    try {
      await Speech.speak(sampleText, {
        language: 'ja-JP',
        voice: voiceIdentifier,
        pitch: 1.0,
        rate: 1.0,
      });
    } catch (error) {
      console.error('[VoiceService] Preview failed:', error);
    }
  }

  /**
   * デフォルト音声を取得
   */
  async getDefaultVoice(): Promise<DeviceVoice | null> {
    const japaneseVoices = await this.getJapaneseVoices();

    if (japaneseVoices.length === 0) {
      return null;
    }

    // Enhanced品質があればそれを優先
    const enhanced = japaneseVoices.find(v => v.quality === 'Enhanced');
    if (enhanced) return enhanced;

    // なければ最初の音声
    return japaneseVoices[0];
  }

  /**
   * 音声を検索
   */
  async findVoice(identifier: string): Promise<DeviceVoice | null> {
    const allVoices = await this.getAvailableVoices();
    return allVoices.find(v => v.identifier === identifier) || null;
  }
}

export default VoiceService.getInstance();
