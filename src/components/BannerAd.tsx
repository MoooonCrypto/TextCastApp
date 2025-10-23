// src/components/BannerAd.tsx
import React from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';

export const BannerAd: React.FC = () => {
  console.log('🔍 [BannerAd] コンポーネントがレンダリングされました');
  console.log('🔍 [BannerAd] Platform:', Platform.OS);

  // Webでは広告を表示しない
  if (Platform.OS === 'web') {
    console.log('ℹ️ [BannerAd] Web環境のため広告を表示しません');
    return null;
  }

  // AdRewardServiceと同じ方式で動的チェック
  try {
    const module = require('react-native-google-mobile-ads');

    // モジュールが正しくロードできているか確認
    if (!module || !module.BannerAd) {
      console.log('ℹ️ [BannerAd] react-native-google-mobile-ads が見つかりません（Expo Go環境）');
      return null;
    }

    console.log('✅ [BannerAd] react-native-google-mobile-ads が見つかりました');

    const { BannerAd: AdMobBanner, BannerAdSize, TestIds } = module;

    const adUnitId = __DEV__
      ? TestIds.BANNER // テスト広告ID
      : Platform.select({
          ios: 'ca-app-pub-xxxxx/xxxxx', // iOS本番ID
          android: 'ca-app-pub-xxxxx/xxxxx', // Android本番ID
        }) || TestIds.BANNER;

    console.log('✅ [BannerAd] 広告ユニットID:', adUnitId);
    console.log('✅ [BannerAd] バナー広告コンポーネントを表示します');

    return (
      <View style={styles.container}>
        <AdMobBanner
          unitId={adUnitId}
          size={BannerAdSize.BANNER} // 320x50
          requestOptions={{
            requestNonPersonalizedAdsOnly: false,
          }}
          onAdLoaded={() => {
            console.log('✅ バナー広告読み込み完了');
          }}
          onAdFailedToLoad={(error) => {
            console.log('❌ バナー広告読み込み失敗:', error);
          }}
        />
      </View>
    );
  } catch (error) {
    console.log('❌ [BannerAd] エラーが発生しました:', error);
    return (
      <View style={[styles.container, styles.debugContainer]}>
        <Text style={styles.debugText}>広告読み込みエラー</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    height: 50, // バナー広告の高さ
  },
  debugContainer: {
    backgroundColor: '#ffcccc',
    borderWidth: 2,
    borderColor: '#ff0000',
  },
  debugText: {
    color: '#ff0000',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
