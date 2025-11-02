// src/stores/usePurchaseStore.ts
import { create } from 'zustand';
import Purchases, { PurchasesPackage, CustomerInfo } from 'react-native-purchases';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// RevenueCat API Keys
// iOS用: RevenueCat Dashboard → API keys → Public app-specific API keys から取得
const REVENUE_CAT_API_KEY_IOS = 'appl_GexynWNQNSwdWGcXnoeXjsiCSIS';
const REVENUE_CAT_API_KEY_ANDROID = 'YOUR_ANDROID_API_KEY_HERE'; // Android対応時に設定

const PREMIUM_STATUS_KEY = '@textcast_premium_status';

interface PurchaseStore {
  // 状態
  isPremium: boolean;
  isLoading: boolean;
  packages: PurchasesPackage[];
  customerInfo: CustomerInfo | null;

  // アクション
  initialize: () => Promise<void>;
  loadOfferings: () => Promise<void>;
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  checkPremiumStatus: () => Promise<void>;

  // デバッグ用（開発中のみ）
  setMockPremium: (value: boolean) => Promise<void>;
}

export const usePurchaseStore = create<PurchaseStore>((set, get) => ({
  // 初期状態
  isPremium: false,
  isLoading: false,
  packages: [],
  customerInfo: null,

  // RevenueCat初期化
  initialize: async () => {
    try {
      console.log('[Purchase] Initializing RevenueCat...');

      // APIキーが設定されていない場合はスキップ
      const apiKey = Platform.OS === 'ios'
        ? REVENUE_CAT_API_KEY_IOS
        : REVENUE_CAT_API_KEY_ANDROID;

      if (apiKey === 'YOUR_IOS_API_KEY_HERE' || apiKey === 'YOUR_ANDROID_API_KEY_HERE') {
        console.warn('[Purchase] ⚠️ RevenueCat API keys not configured. Using mock mode.');
        // モックモードでローカル状態を読み込み
        const mockPremium = await AsyncStorage.getItem(PREMIUM_STATUS_KEY);
        set({ isPremium: mockPremium === 'true' });
        return;
      }

      // RevenueCat設定
      await Purchases.configure({ apiKey });
      console.log('[Purchase] ✅ RevenueCat initialized successfully');

      // 初回起動時にプレミアム状態をチェック
      await get().checkPremiumStatus();
    } catch (error) {
      console.error('[Purchase] ❌ Initialize error:', error);
    }
  },

  // プレミアム状態チェック
  checkPremiumStatus: async () => {
    try {
      console.log('[Purchase] Checking premium status...');

      // APIキーが未設定の場合はモックモード
      const apiKey = Platform.OS === 'ios'
        ? REVENUE_CAT_API_KEY_IOS
        : REVENUE_CAT_API_KEY_ANDROID;

      if (apiKey === 'YOUR_IOS_API_KEY_HERE' || apiKey === 'YOUR_ANDROID_API_KEY_HERE') {
        const mockPremium = await AsyncStorage.getItem(PREMIUM_STATUS_KEY);
        set({ isPremium: mockPremium === 'true' });
        console.log('[Purchase] 📱 Mock mode - isPremium:', mockPremium === 'true');
        return;
      }

      // RevenueCatから取得
      const customerInfo = await Purchases.getCustomerInfo();
      const isPremium = customerInfo.entitlements.active['premium'] !== undefined;

      set({ isPremium, customerInfo });
      console.log('[Purchase] ✅ Premium status:', isPremium);
    } catch (error) {
      console.error('[Purchase] ❌ Check status error:', error);
      set({ isPremium: false });
    }
  },

  // 商品情報取得
  loadOfferings: async () => {
    try {
      console.log('[Purchase] Loading offerings...');
      set({ isLoading: true });

      // APIキーが未設定の場合はモックデータを返す
      const apiKey = Platform.OS === 'ios'
        ? REVENUE_CAT_API_KEY_IOS
        : REVENUE_CAT_API_KEY_ANDROID;

      if (apiKey === 'YOUR_IOS_API_KEY_HERE' || apiKey === 'YOUR_ANDROID_API_KEY_HERE') {
        console.log('[Purchase] 📱 Mock mode - Using mock packages');
        // モックパッケージ（実際のパッケージ構造に合わせる）
        set({ packages: [], isLoading: false });
        return;
      }

      const offerings = await Purchases.getOfferings();

      if (offerings.current && offerings.current.availablePackages.length > 0) {
        set({ packages: offerings.current.availablePackages });
        console.log('[Purchase] ✅ Loaded packages:', offerings.current.availablePackages.length);
      } else {
        console.warn('[Purchase] ⚠️ No packages available');
        set({ packages: [] });
      }
    } catch (error) {
      console.error('[Purchase] ❌ Load offerings error:', error);
      set({ packages: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  // 購入処理
  purchasePackage: async (pkg: PurchasesPackage) => {
    try {
      console.log('[Purchase] Starting purchase...');
      set({ isLoading: true });

      const { customerInfo } = await Purchases.purchasePackage(pkg);

      const isPremium = customerInfo.entitlements.active['premium'] !== undefined;
      set({ isPremium, customerInfo });

      console.log('[Purchase] ✅ Purchase successful, isPremium:', isPremium);
      return isPremium;
    } catch (error: any) {
      if (error.userCancelled) {
        console.log('[Purchase] ℹ️ User cancelled purchase');
      } else {
        console.error('[Purchase] ❌ Purchase error:', error);
      }
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // 購入復元
  restorePurchases: async () => {
    try {
      console.log('[Purchase] Restoring purchases...');
      set({ isLoading: true });

      const customerInfo = await Purchases.restorePurchases();

      const isPremium = customerInfo.entitlements.active['premium'] !== undefined;
      set({ isPremium, customerInfo });

      console.log('[Purchase] ✅ Restored, isPremium:', isPremium);
      return isPremium;
    } catch (error) {
      console.error('[Purchase] ❌ Restore error:', error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // デバッグ用: モックプレミアム状態を設定
  setMockPremium: async (value: boolean) => {
    try {
      await AsyncStorage.setItem(PREMIUM_STATUS_KEY, value.toString());
      set({ isPremium: value });
      console.log('[Purchase] 🧪 Mock premium set to:', value);
    } catch (error) {
      console.error('[Purchase] ❌ Failed to set mock premium:', error);
    }
  },
}));
