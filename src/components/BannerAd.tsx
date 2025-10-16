// src/components/BannerAd.tsx
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

export const BannerAd: React.FC = () => {
  // Webでは広告を表示しない
  if (Platform.OS === 'web') {
    return null;
  }

  // Expo Goでは表示しない
  try {
    // require.resolveで存在確認
    require.resolve('react-native-google-mobile-ads');
  } catch {
    // Expo Goではnullを返す
    return null;
  }

  // Dev Client / 実機ビルド環境でのみ実行
  try {
    const { BannerAd, BannerAdSize, TestIds } = require('react-native-google-mobile-ads');

    const adUnitId = __DEV__
      ? TestIds.BANNER // テスト広告ID
      : Platform.select({
          ios: 'ca-app-pub-xxxxx/xxxxx', // iOS本番ID
          android: 'ca-app-pub-xxxxx/xxxxx', // Android本番ID
        }) || TestIds.BANNER;

    return (
      <View style={styles.container}>
        <BannerAd
          unitId={adUnitId}
          size={BannerAdSize.BANNER} // 320x50
          requestOptions={{
            requestNonPersonalizedAdsOnly: false,
          }}
          onAdLoaded={() => {
            console.log('✅ バナー広告読み込み完了');
          }}
          onAdFailedToLoad={(error) => {
            console.log('ℹ️ バナー広告読み込み失敗:', error);
          }}
        />
      </View>
    );
  } catch (error) {
    console.log('ℹ️ バナー広告はExpo Goでは利用できません');
    return null;
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
});
