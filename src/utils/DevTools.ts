// src/utils/DevTools.ts

import { StorageService } from '../services/StorageService';
import { PlanService } from '../services/PlanService';
import { TextItem } from '../types';
import { generateItemId } from './idGenerator';

/**
 * 開発用デバッグツール
 * __DEV__ 環境でのみ使用可能
 */
export class DevTools {
  /**
   * 全データクリア
   */
  static async clearAllData(): Promise<void> {
    if (!__DEV__) {
      console.warn('[DevTools] Not available in production');
      return;
    }

    await StorageService.clearAll();
    console.log('✅ All data cleared');
  }

  /**
   * モックデータ投入
   */
  static async seedMockData(): Promise<void> {
    if (!__DEV__) {
      console.warn('[DevTools] Not available in production');
      return;
    }

    const mockItems: Omit<TextItem, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>[] = [
      {
        title: 'React Hooksの基礎',
        content: 'React Hooksは関数コンポーネントで状態管理や副作用を扱うための機能です。useStateやuseEffectなどのフックを使うことで、クラスコンポーネントを使わずに高度な機能を実装できます。'.repeat(3),
        source: 'manual',
        category: 'プログラミング',
        isFavorite: false,
        deletedAt: undefined,
        duration: 60,
        lastPosition: 0,
        playCount: 0,
        isCompleted: false,
        bookmarks: [],
        notes: [],
      },
      {
        title: 'iOSアプリ開発のベストプラクティス',
        content: 'iOSアプリ開発では、Appleのヒューマンインターフェースガイドラインに従い、ユーザーにとって直感的なUIを設計することが重要です。SwiftUIを使えば宣言的な記述でモダンなUIを構築できます。'.repeat(2),
        source: 'manual',
        category: 'モバイル開発',
        isFavorite: true,
        deletedAt: undefined,
        duration: 45,
        lastPosition: 0,
        playCount: 2,
        isCompleted: false,
        bookmarks: [],
        notes: [],
      },
      {
        title: 'デザインシステムの構築方法',
        content: 'デザインシステムは、一貫性のあるUIを実現するためのガイドラインとコンポーネントのセットです。カラーパレット、タイポグラフィ、スペーシングなどの基本要素を定義し、再利用可能なコンポーネントを作成します。',
        source: 'manual',
        category: 'デザイン',
        isFavorite: false,
        deletedAt: undefined,
        duration: 30,
        lastPosition: 30,
        playCount: 1,
        isCompleted: true,
        bookmarks: [],
        notes: [],
      },
    ];

    for (const item of mockItems) {
      await StorageService.addItem(item);
    }

    console.log('✅ Mock data seeded:', mockItems.length, 'items');
  }

  /**
   * 現在のデータ表示
   */
  static async showCurrentData(): Promise<void> {
    if (!__DEV__) {
      console.warn('[DevTools] Not available in production');
      return;
    }

    const items = await StorageService.getAllItems();
    const settings = await StorageService.getSettings();
    const storageInfo = await PlanService.getStorageInfo();
    const dataSize = await StorageService.getDataSize();

    console.log('📊 Current Data:');
    console.log('  Items:', items.length);
    console.log('  Active Items:', items.filter(i => !i.isDeleted).length);
    console.log('  Trash Items:', items.filter(i => i.isDeleted).length);
    console.log('  Storage:', storageInfo);
    console.log('  Data Size:', dataSize);
    console.log('  Settings:', settings);
  }

  /**
   * ゴミ箱アイテム表示
   */
  static async showTrashItems(): Promise<void> {
    if (!__DEV__) {
      console.warn('[DevTools] Not available in production');
      return;
    }

    const trashItems = await StorageService.getTrashItems();
    console.log('🗑️ Trash Items:', trashItems.length);
    trashItems.forEach(item => {
      console.log(`  - ${item.title} (deleted: ${item.deletedAt?.toLocaleString()})`);
    });
  }

  /**
   * プレミアムプランをトグル
   */
  static async togglePremium(): Promise<void> {
    if (!__DEV__) {
      console.warn('[DevTools] Not available in production');
      return;
    }

    const settings = await StorageService.getSettings();
    if (!settings) return;

    await StorageService.updateSettings({
      isPremium: !settings.isPremium,
    });

    console.log('✅ Premium toggled:', !settings.isPremium);
  }

  /**
   * 広告ボーナスを追加
   */
  static async addAdBonus(count: number = 10): Promise<void> {
    if (!__DEV__) {
      console.warn('[DevTools] Not available in production');
      return;
    }

    const settings = await StorageService.getSettings();
    if (!settings) return;

    await StorageService.updateSettings({
      bonusItemsFromAds: settings.bonusItemsFromAds + count,
      totalAdsWatched: settings.totalAdsWatched + count,
    });

    console.log('✅ Ad bonus added:', count);
  }

  /**
   * リファラルボーナスを追加
   */
  static async addReferralBonus(count: number = 1): Promise<void> {
    if (!__DEV__) {
      console.warn('[DevTools] Not available in production');
      return;
    }

    const settings = await StorageService.getSettings();
    if (!settings) return;

    await StorageService.updateSettings({
      bonusItemsFromReferral: settings.bonusItemsFromReferral + (count * 10),
      referralCount: settings.referralCount + count,
    });

    console.log('✅ Referral bonus added:', count);
  }

  /**
   * ゴミ箱クリーンアップを強制実行
   */
  static async forceCleanupTrash(): Promise<void> {
    if (!__DEV__) {
      console.warn('[DevTools] Not available in production');
      return;
    }

    const count = await StorageService.cleanupTrash();
    console.log('✅ Trash cleanup completed:', count, 'items deleted');
  }

  /**
   * 大量データ投入（パフォーマンステスト用）
   */
  static async seedLargeData(count: number = 50): Promise<void> {
    if (!__DEV__) {
      console.warn('[DevTools] Not available in production');
      return;
    }

    console.log(`⏳ Seeding ${count} items...`);

    const categories = ['プログラミング', 'モバイル開発', 'デザイン', 'テクノロジー', '自己啓発', '個人'];

    for (let i = 0; i < count; i++) {
      await StorageService.addItem({
        title: `テストデータ ${i + 1}`,
        content: `これは大量データテスト用のアイテムです。番号: ${i + 1}`.repeat(5),
        source: 'manual',
        category: categories[i % categories.length],
        isFavorite: Math.random() > 0.8,
        deletedAt: undefined,
        duration: Math.floor(Math.random() * 120) + 30,
        lastPosition: 0,
        playCount: 0,
        isCompleted: false,
        bookmarks: [],
        notes: [],
      });

      if ((i + 1) % 10 === 0) {
        console.log(`  ${i + 1}/${count} items created...`);
      }
    }

    console.log('✅ Large data seeded:', count, 'items');
  }
}

// グローバルに公開（開発環境のみ）
if (__DEV__) {
  (global as any).DevTools = DevTools;
  console.log('💡 DevTools available. Try: DevTools.showCurrentData()');
}
