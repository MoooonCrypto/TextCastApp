// src/services/TTSService.ts
// react-native-ttsを使った音声ファイル生成サービス

import Tts from 'react-native-tts';
import * as FileSystem from 'expo-file-system';
import { TextItem } from '../types';

export interface TTSOptions {
  voiceId?: string;
  rate?: number;
  pitch?: number;
}

export class TTSService {
  // 音声ファイルを保存するディレクトリ
  private static readonly AUDIO_DIR = `${FileSystem.documentDirectory}audio/`;

  /**
   * 初期化（ディレクトリ作成）
   */
  static async initialize() {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.AUDIO_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.AUDIO_DIR, { intermediates: true });
        console.log('[TTSService] Audio directory created');
      }
    } catch (error) {
      console.error('[TTSService] Initialize error:', error);
    }
  }

  /**
   * 音声ファイルのパスを取得
   */
  static getAudioFilePath(itemId: string): string {
    return `${this.AUDIO_DIR}${itemId}.wav`;
  }

  /**
   * 音声ファイルが既に存在するかチェック
   */
  static async audioFileExists(itemId: string): Promise<boolean> {
    try {
      const filePath = this.getAudioFilePath(itemId);
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      return fileInfo.exists;
    } catch (error) {
      return false;
    }
  }

  /**
   * テキストから音声ファイルを生成
   */
  static async generateAudioFile(
    item: TextItem,
    options: TTSOptions = {}
  ): Promise<string> {
    try {
      await this.initialize();

      // 既に存在する場合はスキップ
      const filePath = this.getAudioFilePath(item.id);
      if (await this.audioFileExists(item.id)) {
        console.log(`[TTSService] Audio file already exists: ${item.id}`);
        return filePath;
      }

      console.log(`[TTSService] Generating audio file for: ${item.title}`);

      // TTS設定
      if (options.voiceId) {
        await Tts.setDefaultVoice(options.voiceId);
      }
      if (options.rate) {
        await Tts.setDefaultRate(options.rate);
      }
      if (options.pitch) {
        await Tts.setDefaultPitch(options.pitch);
      }

      // 音声ファイルとして保存
      // Note: react-native-ttsのsynthesizeToFile機能を使用
      // ただし、iOSではこの機能が制限されている可能性があるため、
      // 代替として一時的にWeb Speech APIやネイティブモジュールの使用も検討

      // 暫定実装：テキストを読み上げて録音
      // TODO: 正式な音声ファイル生成APIの実装
      console.warn('[TTSService] Audio file generation not fully implemented yet');

      // 仮のファイル作成（空ファイル）
      await FileSystem.writeAsStringAsync(filePath, '', { encoding: FileSystem.EncodingType.UTF8 });

      return filePath;
    } catch (error) {
      console.error('[TTSService] Generate audio file error:', error);
      throw error;
    }
  }

  /**
   * 音声ファイルを削除
   */
  static async deleteAudioFile(itemId: string): Promise<void> {
    try {
      const filePath = this.getAudioFilePath(itemId);
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(filePath);
        console.log(`[TTSService] Deleted audio file: ${itemId}`);
      }
    } catch (error) {
      console.error('[TTSService] Delete audio file error:', error);
    }
  }

  /**
   * すべての音声ファイルを削除
   */
  static async clearAllAudioFiles(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.AUDIO_DIR);
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(this.AUDIO_DIR, { idempotent: true });
        await FileSystem.makeDirectoryAsync(this.AUDIO_DIR, { intermediates: true });
        console.log('[TTSService] All audio files cleared');
      }
    } catch (error) {
      console.error('[TTSService] Clear all audio files error:', error);
    }
  }

  /**
   * 使用可能な音声のリストを取得
   */
  static async getAvailableVoices(): Promise<any[]> {
    try {
      const voices = await Tts.voices();
      console.log(`[TTSService] Available voices:`, voices);
      return voices;
    } catch (error) {
      console.error('[TTSService] Get available voices error:', error);
      return [];
    }
  }
}
