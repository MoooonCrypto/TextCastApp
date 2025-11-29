// src/services/StorageService.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextItem, UserSettings, PLAN_LIMITS } from '../types';
import { generateItemId, generateReferralCode } from '../utils/idGenerator';
import { iCloudSyncService } from './iCloudSyncService';

// AsyncStorageキー定義
const STORAGE_KEYS = {
  ITEMS: '@textcast:items',
  SETTINGS: '@textcast:settings',
  VERSION: '@textcast:version',
} as const;

const STORAGE_VERSION = 1;

/**
 * StorageService - AsyncStorage操作を管理
 */
export class StorageService {
  /**
   * 初期化処理（アプリ起動時に1回だけ呼ぶ）
   */
  static async initialize(): Promise<void> {
    try {
      console.log('[StorageService] Initializing...');

      // バージョンチェック
      const version = await AsyncStorage.getItem(STORAGE_KEYS.VERSION);
      if (!version) {
        await this.initializeFirstTime();
      }

      // 設定の初期化チェック
      const settings = await this.getSettings();
      if (!settings) {
        await this.createDefaultSettings();
      }

      // ゴミ箱の自動クリーンアップ
      await this.cleanupTrash();

      console.log('[StorageService] Initialized successfully');
    } catch (error) {
      console.error('[StorageService] Initialization error:', error);
      throw error;
    }
  }

  /**
   * 初回起動時の初期化
   */
  private static async initializeFirstTime(): Promise<void> {
    console.log('[StorageService] First time initialization');

    // バージョン保存
    await AsyncStorage.setItem(STORAGE_KEYS.VERSION, STORAGE_VERSION.toString());

    // デフォルト設定作成
    await this.createDefaultSettings();

    // 空のアイテムリスト作成
    await AsyncStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify([]));
  }

  /**
   * デフォルト設定の作成
   */
  private static async createDefaultSettings(): Promise<UserSettings> {
    const defaultSettings: UserSettings = {
      // プレミアム
      isPremium: false,
      premiumPurchaseDate: undefined,

      // 無料プラン制限
      maxFreeItems: PLAN_LIMITS.FREE_BASE_ITEMS,
      bonusItemsFromAds: 0,
      bonusItemsFromReferral: 0,

      // 広告管理
      lastAdWatchedAt: undefined,
      totalAdsWatched: 0,
      adsWatchedToday: 0,
      lastAdResetDate: undefined,

      // リファラル
      referralCode: generateReferralCode(),
      referredBy: undefined,
      referralCount: 0,

      // TTS設定
      ttsSpeed: 1.0,
      ttsVoice: '',

      // UI設定
      theme: 'auto',
      fontSize: 'medium',
    };

    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
    console.log('[StorageService] Default settings created');
    return defaultSettings;
  }

  // ==================== アイテム操作 ====================

  /**
   * 全アイテム取得（削除済みを除く）
   */
  static async getItems(): Promise<TextItem[]> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.ITEMS);
      if (!json) return [];

      const items: TextItem[] = JSON.parse(json);

      // Date型の復元 & 削除済みを除外
      return items
        .filter(item => !item.isDeleted)
        .map(item => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
          deletedAt: item.deletedAt ? new Date(item.deletedAt) : undefined,
        }));
    } catch (error) {
      console.error('[StorageService] getItems error:', error);
      return [];
    }
  }

  /**
   * 全アイテム取得（削除済みを含む）
   */
  static async getAllItems(): Promise<TextItem[]> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.ITEMS);
      if (!json) return [];

      const items: TextItem[] = JSON.parse(json);

      // Date型の復元
      return items.map(item => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
        deletedAt: item.deletedAt ? new Date(item.deletedAt) : undefined,
      }));
    } catch (error) {
      console.error('[StorageService] getAllItems error:', error);
      return [];
    }
  }

  /**
   * ゴミ箱アイテム取得
   */
  static async getTrashItems(): Promise<TextItem[]> {
    try {
      const allItems = await this.getAllItems();
      return allItems.filter(item => item.isDeleted);
    } catch (error) {
      console.error('[StorageService] getTrashItems error:', error);
      return [];
    }
  }

  /**
   * アイテム追加
   */
  static async addItem(item: Omit<TextItem, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>): Promise<TextItem> {
    try {
      const items = await this.getAllItems();

      const newItem: TextItem = {
        ...item,
        id: generateItemId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        deletedAt: undefined,
      };

      items.push(newItem);
      await AsyncStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));

      console.log('[StorageService] Item added:', newItem.id);
      this.triggerBackgroundSync(); // iCloud同期
      return newItem;
    } catch (error) {
      console.error('[StorageService] addItem error:', error);
      throw error;
    }
  }

  /**
   * アイテム更新
   */
  static async updateItem(id: string, updates: Partial<TextItem>): Promise<TextItem | null> {
    try {
      const items = await this.getAllItems();
      const index = items.findIndex(item => item.id === id);

      if (index === -1) {
        console.warn('[StorageService] Item not found:', id);
        return null;
      }

      const updatedItem: TextItem = {
        ...items[index],
        ...updates,
        id: items[index].id, // IDは変更不可
        updatedAt: new Date(),
      };

      items[index] = updatedItem;
      await AsyncStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));

      console.log('[StorageService] Item updated:', id);
      this.triggerBackgroundSync(); // iCloud同期
      return updatedItem;
    } catch (error) {
      console.error('[StorageService] updateItem error:', error);
      throw error;
    }
  }

  /**
   * ゴミ箱に移動（論理削除）
   */
  static async moveToTrash(id: string): Promise<boolean> {
    try {
      const result = await this.updateItem(id, {
        isDeleted: true,
        deletedAt: new Date(),
      });

      if (result) {
        console.log('[StorageService] Item moved to trash:', id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('[StorageService] moveToTrash error:', error);
      return false;
    }
  }

  /**
   * ゴミ箱から復元
   */
  static async restoreFromTrash(id: string): Promise<boolean> {
    try {
      const result = await this.updateItem(id, {
        isDeleted: false,
        deletedAt: undefined,
      });

      if (result) {
        console.log('[StorageService] Item restored:', id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('[StorageService] restoreFromTrash error:', error);
      return false;
    }
  }

  /**
   * 完全削除（物理削除）
   */
  static async permanentDelete(id: string): Promise<boolean> {
    try {
      const items = await this.getAllItems();
      const filteredItems = items.filter(item => item.id !== id);

      if (items.length === filteredItems.length) {
        console.warn('[StorageService] Item not found for deletion:', id);
        return false;
      }

      await AsyncStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(filteredItems));
      console.log('[StorageService] Item permanently deleted:', id);
      this.triggerBackgroundSync(); // iCloud同期
      return true;
    } catch (error) {
      console.error('[StorageService] permanentDelete error:', error);
      return false;
    }
  }

  /**
   * ゴミ箱の自動クリーンアップ（30日以上経過したアイテムを削除）
   */
  static async cleanupTrash(): Promise<number> {
    try {
      const trashItems = await this.getTrashItems();
      const now = Date.now();
      let deletedCount = 0;

      for (const item of trashItems) {
        if (item.deletedAt) {
          const daysSinceDeleted = (now - item.deletedAt.getTime()) / (1000 * 60 * 60 * 24);

          if (daysSinceDeleted > PLAN_LIMITS.TRASH_RETENTION_DAYS) {
            await this.permanentDelete(item.id);
            deletedCount++;
          }
        }
      }

      if (deletedCount > 0) {
        console.log(`[StorageService] Cleaned up ${deletedCount} old trash items`);
      }

      return deletedCount;
    } catch (error) {
      console.error('[StorageService] cleanupTrash error:', error);
      return 0;
    }
  }

  // ==================== 設定操作 ====================

  /**
   * 設定取得
   */
  static async getSettings(): Promise<UserSettings | null> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!json) return null;

      const settings: UserSettings = JSON.parse(json);

      // Date型の復元
      return {
        ...settings,
        premiumPurchaseDate: settings.premiumPurchaseDate
          ? new Date(settings.premiumPurchaseDate)
          : undefined,
        lastAdWatchedAt: settings.lastAdWatchedAt
          ? new Date(settings.lastAdWatchedAt)
          : undefined,
        lastAdResetDate: settings.lastAdResetDate
          ? new Date(settings.lastAdResetDate)
          : undefined,
      };
    } catch (error) {
      console.error('[StorageService] getSettings error:', error);
      return null;
    }
  }

  /**
   * 設定更新
   */
  static async updateSettings(updates: Partial<UserSettings>): Promise<UserSettings | null> {
    try {
      const currentSettings = await this.getSettings();
      if (!currentSettings) {
        console.error('[StorageService] Settings not found');
        return null;
      }

      const updatedSettings: UserSettings = {
        ...currentSettings,
        ...updates,
      };

      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
      console.log('[StorageService] Settings updated');
      this.triggerBackgroundSync(); // iCloud同期
      return updatedSettings;
    } catch (error) {
      console.error('[StorageService] updateSettings error:', error);
      return null;
    }
  }

  // ==================== ユーティリティ ====================

  /**
   * 全データクリア（開発用）
   */
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ITEMS,
        STORAGE_KEYS.SETTINGS,
        STORAGE_KEYS.VERSION,
      ]);
      console.log('[StorageService] All data cleared');
    } catch (error) {
      console.error('[StorageService] clearAll error:', error);
      throw error;
    }
  }

  /**
   * データサイズ取得（デバッグ用）
   */
  static async getDataSize(): Promise<{ items: number; settings: number }> {
    try {
      const itemsJson = await AsyncStorage.getItem(STORAGE_KEYS.ITEMS);
      const settingsJson = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);

      return {
        items: itemsJson?.length || 0,
        settings: settingsJson?.length || 0,
      };
    } catch (error) {
      console.error('[StorageService] getDataSize error:', error);
      return { items: 0, settings: 0 };
    }
  }

  /**
   * iCloud同期をトリガー（バックグラウンドで実行）
   */
  private static triggerBackgroundSync(): void {
    const status = iCloudSyncService.getStatus();
    if (status.enabled) {
      // 非同期でバックグラウンド実行（100ms後）
      setTimeout(async () => {
        try {
          await iCloudSyncService.syncToiCloud();
        } catch (error) {
          console.error('[StorageService] Background sync failed:', error);
        }
      }, 100);
    }
  }
}
