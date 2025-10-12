// src/services/PlanService.ts

import { UserSettings, PLAN_LIMITS } from '../types';
import { StorageService } from './StorageService';

/**
 * PlanService - プラン制限・広告・リファラル管理
 */
export class PlanService {
  /**
   * 保存可能な最大アイテム数を計算
   */
  static async getMaxItemsLimit(): Promise<number> {
    const settings = await StorageService.getSettings();
    if (!settings) return PLAN_LIMITS.FREE_BASE_ITEMS;

    // プレミアムは無制限
    if (settings.isPremium) {
      return Infinity;
    }

    // 無料プラン: 基本 + 広告ボーナス + リファラルボーナス
    return (
      settings.maxFreeItems +
      settings.bonusItemsFromAds +
      settings.bonusItemsFromReferral
    );
  }

  /**
   * 現在のアイテム数を取得
   */
  static async getCurrentItemsCount(): Promise<number> {
    const items = await StorageService.getItems();
    return items.length;
  }

  /**
   * 新規アイテムを追加可能かチェック
   */
  static async canAddNewItem(): Promise<{ canAdd: boolean; reason?: string }> {
    const maxLimit = await this.getMaxItemsLimit();
    const currentCount = await this.getCurrentItemsCount();

    if (currentCount >= maxLimit) {
      return {
        canAdd: false,
        reason: `保存上限（${maxLimit}件）に達しています`,
      };
    }

    return { canAdd: true };
  }

  /**
   * 広告視聴処理
   */
  static async watchAd(): Promise<{ success: boolean; message: string }> {
    const settings = await StorageService.getSettings();
    if (!settings) {
      return { success: false, message: '設定の取得に失敗しました' };
    }

    // プレミアムは広告不要
    if (settings.isPremium) {
      return { success: false, message: 'プレミアム会員は広告視聴不要です' };
    }

    // 日付リセットチェック
    const today = new Date().toDateString();
    const lastResetDate = settings.lastAdResetDate
      ? new Date(settings.lastAdResetDate).toDateString()
      : null;

    let adsWatchedToday = settings.adsWatchedToday;

    if (lastResetDate !== today) {
      // 日付が変わったのでカウントリセット
      adsWatchedToday = 0;
    }

    // 1日の視聴上限チェック
    if (adsWatchedToday >= PLAN_LIMITS.MAX_ADS_PER_DAY) {
      return {
        success: false,
        message: `本日の広告視聴上限（${PLAN_LIMITS.MAX_ADS_PER_DAY}回）に達しています`,
      };
    }

    // 広告視聴成功
    await StorageService.updateSettings({
      bonusItemsFromAds: settings.bonusItemsFromAds + PLAN_LIMITS.BONUS_PER_AD,
      totalAdsWatched: settings.totalAdsWatched + 1,
      adsWatchedToday: adsWatchedToday + 1,
      lastAdWatchedAt: new Date(),
      lastAdResetDate: new Date(),
    });

    return {
      success: true,
      message: `+${PLAN_LIMITS.BONUS_PER_AD}件 保存枠が増えました！`,
    };
  }

  /**
   * リファラルコード入力処理
   */
  static async applyReferralCode(code: string): Promise<{ success: boolean; message: string }> {
    const settings = await StorageService.getSettings();
    if (!settings) {
      return { success: false, message: '設定の取得に失敗しました' };
    }

    // 既に紹介コード入力済み
    if (settings.referredBy) {
      return { success: false, message: '既にリファラルコードを使用済みです' };
    }

    // 自分のコードは使えない
    if (code === settings.referralCode) {
      return { success: false, message: '自分のコードは使用できません' };
    }

    // コードのバリデーション（実際はサーバー検証が必要）
    if (!/^[a-z0-9]{8}$/i.test(code)) {
      return { success: false, message: '無効なリファラルコードです' };
    }

    // リファラルコード適用
    await StorageService.updateSettings({
      referredBy: code,
      bonusItemsFromReferral: PLAN_LIMITS.BONUS_PER_REFERRAL,
    });

    return {
      success: true,
      message: `+${PLAN_LIMITS.BONUS_PER_REFERRAL}件 保存枠が増えました！`,
    };
  }

  /**
   * プレミアムプラン購入処理
   */
  static async purchasePremium(): Promise<{ success: boolean; message: string }> {
    // 実際はアプリ内課金処理が必要
    // ここではダミー実装

    await StorageService.updateSettings({
      isPremium: true,
      premiumPurchaseDate: new Date(),
    });

    return {
      success: true,
      message: 'プレミアムプランに登録しました！',
    };
  }

  /**
   * 保存容量情報を取得
   */
  static async getStorageInfo(): Promise<{
    current: number;
    max: number;
    percentage: number;
    isPremium: boolean;
  }> {
    const settings = await StorageService.getSettings();
    const current = await this.getCurrentItemsCount();
    const max = await this.getMaxItemsLimit();

    return {
      current,
      max,
      percentage: max === Infinity ? 0 : Math.floor((current / max) * 100),
      isPremium: settings?.isPremium || false,
    };
  }
}
