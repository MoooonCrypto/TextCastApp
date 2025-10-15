// src/services/PlanService.ts

import { UserSettings, PLAN_LIMITS } from '../types';
import { StorageService } from './StorageService';
import { AdRewardService } from './AdRewardService';

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

    // AdRewardServiceから広告報酬ボーナスを取得
    const adBonus = await AdRewardService.getAdRewardBonus();

    // 無料プラン: 基本 + 広告ボーナス + リファラルボーナス
    return (
      settings.maxFreeItems +
      adBonus +
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
   * 広告視聴処理（AdRewardServiceに委譲）
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

    // 残り視聴可能回数チェック
    const remaining = await AdRewardService.getRemainingWatchCount();
    if (remaining <= 0) {
      return {
        success: false,
        message: `本日の広告視聴上限（${AdRewardService.getDailyLimit()}回）に達しています`,
      };
    }

    // AdRewardServiceで広告を表示
    const result = await AdRewardService.showRewardedAd();

    if (result.success) {
      return {
        success: true,
        message: `+${PLAN_LIMITS.BONUS_PER_AD}件 保存枠が増えました！`,
      };
    } else {
      return {
        success: false,
        message: result.error || '広告の読み込みに失敗しました',
      };
    }
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
