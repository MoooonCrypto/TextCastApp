// src/services/AdRewardService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

// 型定義のみインポート（実行時エラーを防ぐ）
type RewardedAd = any;
type RewardedAdEventType = any;
type TestIds = any;

interface AdRewardData {
  totalRewards: number; // 累計獲得報酬
  lastRewardDate: string; // 最後に報酬を獲得した日時
  dailyWatchCount: number; // 本日の視聴回数
  dailyResetDate: string; // 日次リセット日
}

export class AdRewardService {
  private static readonly AD_REWARD_KEY = 'textcast_ad_rewards';
  private static readonly DAILY_LIMIT = 5; // 1日の視聴上限
  private static readonly REWARD_PER_AD = 1; // 1広告あたりの報酬（プレイリスト上限+1）

  // テスト用の広告ユニットID（本番時は実際のIDに変更）
  private static readonly REWARDED_AD_UNIT_ID = __DEV__
    ? 'ca-app-pub-3940256099942544/5224354917' // テスト広告ID
    : 'ca-app-pub-xxxxx/xxxxx'; // ← 本番時にAdMobで取得したIDに置き換える

  // 広告報酬データの取得
  static async getAdRewardData(): Promise<AdRewardData> {
    try {
      const data = await AsyncStorage.getItem(this.AD_REWARD_KEY);
      if (data) {
        const parsed = JSON.parse(data);

        // 日付が変わっていたらリセット
        const today = new Date().toDateString();
        if (parsed.dailyResetDate !== today) {
          parsed.dailyWatchCount = 0;
          parsed.dailyResetDate = today;
          await this.saveAdRewardData(parsed);
        }

        return parsed;
      }

      // 初回の場合
      const newData: AdRewardData = {
        totalRewards: 0,
        lastRewardDate: new Date().toISOString(),
        dailyWatchCount: 0,
        dailyResetDate: new Date().toDateString(),
      };

      await this.saveAdRewardData(newData);
      return newData;
    } catch (error) {
      console.error('❌ 広告報酬データ取得エラー:', error);
      throw error;
    }
  }

  // 広告報酬データの保存
  static async saveAdRewardData(data: AdRewardData): Promise<void> {
    await AsyncStorage.setItem(this.AD_REWARD_KEY, JSON.stringify(data));
  }

  // 本日の残り視聴可能回数
  static async getRemainingWatchCount(): Promise<number> {
    const data = await this.getAdRewardData();
    return Math.max(0, this.DAILY_LIMIT - data.dailyWatchCount);
  }

  // 報酬の追加
  static async addReward(): Promise<void> {
    const data = await this.getAdRewardData();
    data.totalRewards += this.REWARD_PER_AD;
    data.dailyWatchCount += 1;
    data.lastRewardDate = new Date().toISOString();
    await this.saveAdRewardData(data);
    console.log('✅ 広告報酬を追加しました:', data);
  }

  // プレイリスト上限の計算（広告報酬込み）
  static async getAdRewardBonus(): Promise<number> {
    const data = await this.getAdRewardData();
    return data.totalRewards * this.REWARD_PER_AD;
  }

  // リワード広告が利用可能かチェック
  private static isAdMobAvailable(): boolean {
    try {
      // モジュールの存在確認（実際に読み込まない）
      return require.resolve('react-native-google-mobile-ads') !== undefined;
    } catch {
      return false;
    }
  }

  // リワード広告の読み込みと表示
  static async showRewardedAd(): Promise<{ success: boolean; error?: string }> {
    // Expo Goでは利用不可（早期リターン）
    if (!this.isAdMobAvailable()) {
      console.log('ℹ️ 広告機能はExpo Goでは利用できません');
      return {
        success: false,
        error: '広告機能はExpo Goでは利用できません。\n\nDev Clientまたは実機ビルドで使用してください。',
      };
    }

    try {
      const { RewardedAd, RewardedAdEventType } = require('react-native-google-mobile-ads');

      return new Promise((resolve) => {
        const rewarded = RewardedAd.createForAdRequest(this.REWARDED_AD_UNIT_ID, {
          requestNonPersonalizedAdsOnly: false,
        });

      let didReward = false;

      // 広告の読み込み完了
      const loadedListener = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
        console.log('✅ リワード広告読み込み完了');
        rewarded.show();
      });

      // 報酬獲得
      const rewardListener = rewarded.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        async (reward) => {
          console.log('🎁 報酬獲得:', reward);
          didReward = true;
          await this.addReward();
        }
      );

      // 広告が閉じられた（Androidではこのイベントが発火する）
      let hasResolved = false;

      const closeHandler = () => {
        if (!hasResolved) {
          console.log('📺 広告が閉じられました');
          hasResolved = true;
          loadedListener();
          rewardListener();
          resolve({ success: didReward });
        }
      };

      // 広告読み込みエラー
      const errorListener = rewarded.addAdEventListener(
        RewardedAdEventType.ERROR,
        (error: any) => {
          if (!hasResolved) {
            console.error('❌ 広告エラー:', error);
            hasResolved = true;
            loadedListener();
            rewardListener();
            errorListener();
            resolve({ success: false, error: error.message || '広告の読み込みに失敗しました' });
          }
        }
      );

      // 広告が正常に表示され、ユーザーが操作を完了した後に閉じられる
      // Androidのみで発火する可能性があるため、タイムアウトも設定
      setTimeout(() => {
        closeHandler();
      }, 60000); // 60秒のタイムアウト

        // 読み込み開始
        console.log('📺 リワード広告を読み込み中...');
        rewarded.load();
      });
    } catch (error: any) {
      // 広告読み込み中のエラー
      console.error('❌ 広告読み込みエラー:', error);
      return {
        success: false,
        error: error?.message || '広告の読み込みに失敗しました',
      };
    }
  }

  // デイリーリミットを取得（設定画面などで表示用）
  static getDailyLimit(): number {
    return this.DAILY_LIMIT;
  }
}
