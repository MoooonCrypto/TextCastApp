// src/services/iCloudSyncService.ts
// iCloud Drive統一同期サービス

import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextItem, UserSettings } from '../types';

const { iCloudDriveStorage } = NativeModules;

// iCloud Driveに保存するファイル名
const ICLOUD_FILES = {
  SETTINGS: 'settings.json',
  ITEMS: 'items.json',
  METADATA: 'sync_metadata.json',
} as const;

// ローカルストレージキー
const LOCAL_SYNC_ENABLED_KEY = '@textcast_icloud_sync_enabled';

interface SyncMetadata {
  lastSyncTime: string; // ISO形式
  version: string;
  deviceId: string;
}

export class iCloudSyncService {
  private static isEnabled: boolean = false;
  private static lastSyncTime: Date | null = null;

  /**
   * iCloud Driveが利用可能かチェック
   */
  static async isAvailable(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      console.log('[iCloud] Not available on non-iOS platform');
      return false;
    }

    if (!iCloudDriveStorage) {
      console.log('[iCloud] Native module not available');
      return false;
    }

    try {
      const available = await iCloudDriveStorage.isAvailable();
      console.log('[iCloud] Availability check:', available);
      return available;
    } catch (error) {
      console.error('[iCloud] Availability check failed:', error);
      return false;
    }
  }

  /**
   * iCloud同期を初期化
   * @param isPremium プレミアム会員かどうか
   */
  static async initialize(isPremium: boolean): Promise<void> {
    try {
      const available = await this.isAvailable();

      if (!available) {
        console.log('[iCloud] iCloud Drive is not available, sync disabled');
        this.isEnabled = false;
        return;
      }

      if (!isPremium) {
        console.log('[iCloud] Premium required for iCloud sync');
        this.isEnabled = false;
        return;
      }

      // ローカルに保存された有効/無効設定を読み込み
      const savedEnabled = await AsyncStorage.getItem(LOCAL_SYNC_ENABLED_KEY);
      this.isEnabled = savedEnabled === 'true';

      console.log(`[iCloud] ✅ Sync initialized (enabled: ${this.isEnabled})`);

      // 有効な場合、初回同期を実行
      if (this.isEnabled) {
        await this.syncFromiCloud(); // ダウンロード優先
      }
    } catch (error) {
      console.error('[iCloud] Initialization failed:', error);
      this.isEnabled = false;
    }
  }

  /**
   * iCloud同期を有効化
   */
  static async enable(): Promise<void> {
    this.isEnabled = true;
    await AsyncStorage.setItem(LOCAL_SYNC_ENABLED_KEY, 'true');
    console.log('[iCloud] ✅ Sync enabled');

    // 有効化時に即座に同期
    await this.syncToiCloud();
  }

  /**
   * iCloud同期を無効化
   */
  static async disable(): Promise<void> {
    this.isEnabled = false;
    await AsyncStorage.setItem(LOCAL_SYNC_ENABLED_KEY, 'false');
    console.log('[iCloud] Sync disabled');
  }

  /**
   * ローカルデータをiCloud Driveにアップロード
   */
  static async syncToiCloud(): Promise<boolean> {
    if (!this.isEnabled) {
      console.log('[iCloud] Sync is disabled, skipping upload');
      return false;
    }

    try {
      console.log('[iCloud] Starting upload to iCloud...');

      // ローカルデータを取得
      const settingsData = await AsyncStorage.getItem('@textcast_settings');
      const itemsData = await AsyncStorage.getItem('@textcast_items');

      if (!settingsData || !itemsData) {
        console.log('[iCloud] No local data found');
        return false;
      }

      // iCloud Driveに保存
      await iCloudDriveStorage.saveFile(ICLOUD_FILES.SETTINGS, settingsData);
      await iCloudDriveStorage.saveFile(ICLOUD_FILES.ITEMS, itemsData);

      // メタデータを保存
      const metadata: SyncMetadata = {
        lastSyncTime: new Date().toISOString(),
        version: '1.0.0',
        deviceId: 'device-1', // TODO: 実際のデバイスIDを取得
      };
      await iCloudDriveStorage.saveFile(
        ICLOUD_FILES.METADATA,
        JSON.stringify(metadata)
      );

      this.lastSyncTime = new Date();
      console.log('[iCloud] ✅ Upload completed');
      return true;
    } catch (error) {
      console.error('[iCloud] Upload failed:', error);
      return false;
    }
  }

  /**
   * iCloud Driveからローカルにダウンロード
   */
  static async syncFromiCloud(): Promise<boolean> {
    if (!this.isEnabled) {
      console.log('[iCloud] Sync is disabled, skipping download');
      return false;
    }

    try {
      console.log('[iCloud] Starting download from iCloud...');

      // iCloud Driveからデータを取得
      const settingsData = await iCloudDriveStorage.loadFile(ICLOUD_FILES.SETTINGS);
      const itemsData = await iCloudDriveStorage.loadFile(ICLOUD_FILES.ITEMS);

      // データが存在しない場合
      if (!settingsData || !itemsData) {
        console.log('[iCloud] No data found in iCloud, uploading local data');
        await this.syncToiCloud();
        return true;
      }

      // 競合チェック: ローカルとiCloudどちらが新しいか
      const shouldOverwrite = await this.shouldOverwriteLocal(settingsData);

      if (shouldOverwrite) {
        // iCloudのデータでローカルを上書き
        await AsyncStorage.setItem('@textcast_settings', settingsData);
        await AsyncStorage.setItem('@textcast_items', itemsData);
        console.log('[iCloud] ✅ Downloaded and overwrote local data');
      } else {
        console.log('[iCloud] Local data is newer, keeping local');
        await this.syncToiCloud(); // ローカルをアップロード
      }

      this.lastSyncTime = new Date();
      return true;
    } catch (error) {
      console.error('[iCloud] Download failed:', error);
      return false;
    }
  }

  /**
   * ローカルデータを上書きすべきかチェック
   */
  private static async shouldOverwriteLocal(cloudSettingsData: string): Promise<boolean> {
    try {
      const localSettingsData = await AsyncStorage.getItem('@textcast_settings');

      if (!localSettingsData) {
        // ローカルにデータがない場合は上書き
        return true;
      }

      const cloudSettings = JSON.parse(cloudSettingsData) as UserSettings;
      const localSettings = JSON.parse(localSettingsData) as UserSettings;

      // premiumPurchaseDateで比較（より新しいデータを優先）
      const cloudDate = cloudSettings.premiumPurchaseDate
        ? new Date(cloudSettings.premiumPurchaseDate)
        : new Date(0);
      const localDate = localSettings.premiumPurchaseDate
        ? new Date(localSettings.premiumPurchaseDate)
        : new Date(0);

      // iCloudが新しい場合はtrue
      return cloudDate > localDate;
    } catch (error) {
      console.error('[iCloud] Failed to compare data:', error);
      return false; // エラー時はローカルを保持
    }
  }

  /**
   * 双方向同期（自動判定）
   */
  static async sync(): Promise<boolean> {
    if (!this.isEnabled) {
      return false;
    }

    try {
      console.log('[iCloud] Starting bidirectional sync...');

      // まずiCloudからダウンロードして競合解決
      await this.syncFromiCloud();

      console.log('[iCloud] ✅ Sync completed');
      return true;
    } catch (error) {
      console.error('[iCloud] Sync failed:', error);
      return false;
    }
  }

  /**
   * 自動同期を開始（定期実行）
   * @param intervalMinutes 同期間隔（分）
   */
  static startAutoSync(intervalMinutes: number = 10): void {
    if (!this.isEnabled) {
      console.log('[iCloud] Auto-sync not started (sync disabled)');
      return;
    }

    const intervalMs = intervalMinutes * 60 * 1000;

    setInterval(async () => {
      console.log('[iCloud] Auto-sync triggered');
      await this.sync();
    }, intervalMs);

    console.log(`[iCloud] ✅ Auto-sync started (every ${intervalMinutes} minutes)`);
  }

  /**
   * 最終同期時刻を取得
   */
  static async getLastSyncTime(): Promise<Date | null> {
    if (this.lastSyncTime) {
      return this.lastSyncTime;
    }

    try {
      const metadataData = await iCloudDriveStorage.loadFile(ICLOUD_FILES.METADATA);
      if (metadataData) {
        const metadata = JSON.parse(metadataData) as SyncMetadata;
        this.lastSyncTime = new Date(metadata.lastSyncTime);
        return this.lastSyncTime;
      }
    } catch (error) {
      console.error('[iCloud] Failed to get last sync time:', error);
    }

    return null;
  }

  /**
   * iCloud同期の状態を取得
   */
  static getStatus(): { enabled: boolean; lastSync: Date | null } {
    return {
      enabled: this.isEnabled,
      lastSync: this.lastSyncTime,
    };
  }

  /**
   * iCloudのストレージ使用量を取得
   */
  static async getStorageInfo(): Promise<{ settingsSize: number; itemsSize: number } | null> {
    try {
      const settingsMeta = await iCloudDriveStorage.getFileMetadata(ICLOUD_FILES.SETTINGS);
      const itemsMeta = await iCloudDriveStorage.getFileMetadata(ICLOUD_FILES.ITEMS);

      return {
        settingsSize: settingsMeta.size || 0,
        itemsSize: itemsMeta.size || 0,
      };
    } catch (error) {
      console.error('[iCloud] Failed to get storage info:', error);
      return null;
    }
  }
}
