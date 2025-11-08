// src/screens/PremiumPlanScreen.tsx

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { Theme } from '../constants/themes';
import { usePurchaseStore } from '../stores/usePurchaseStore';

const PremiumPlanScreen: React.FC = () => {
  const router = useRouter();
  const { theme, themeMode } = useTheme();
  const styles = createStyles(theme);

  const {
    isPremium,
    isLoading,
    packages,
    loadOfferings,
    purchasePackage,
    restorePurchases,
    setMockPremium, // デバッグ用
  } = usePurchaseStore();

  // 画面表示時に商品情報を読み込み
  useEffect(() => {
    loadOfferings();
  }, []);

  const handleClose = () => {
    router.back();
  };

  const handleSubscribe = async () => {
    // 開発中（RevenueCat未設定）の場合はモックで動作
    if (packages.length === 0) {
      Alert.alert(
        '開発モード',
        'RevenueCatが未設定です。デバッグ用にプレミアムステータスを有効化しますか？',
        [
          { text: 'キャンセル', style: 'cancel' },
          {
            text: 'OK',
            onPress: async () => {
              await setMockPremium(true);
              Alert.alert('成功', 'プレミアムプランが有効化されました（デバッグモード）');
              router.back();
            },
          },
        ]
      );
      return;
    }

    // 実際の購入処理
    const success = await purchasePackage(packages[0]);
    if (success) {
      Alert.alert('成功', 'プレミアムプランに登録されました！');
      router.back();
    } else {
      Alert.alert('エラー', '購入に失敗しました。もう一度お試しください。');
    }
  };

  const handleRestore = async () => {
    const success = await restorePurchases();
    if (success) {
      Alert.alert('復元成功', '購入履歴を復元しました！');
      router.back();
    } else {
      Alert.alert('復元失敗', '復元可能な購入履歴が見つかりませんでした。');
    }
  };

  // 既にプレミアム会員の場合
  if (isPremium) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
        />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>プレミアムプラン</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.alreadyPremiumContainer}>
          <Ionicons name="checkmark-circle" size={80} color={theme.colors.primary} />
          <Text style={styles.alreadyPremiumTitle}>プレミアム会員です</Text>
          <Text style={styles.alreadyPremiumText}>
            すべての機能を無制限でご利用いただけます
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const features = [
    {
      icon: 'infinite-outline' as const,
      title: 'プレイリスト無制限',
      description: '無料版は20個まで、プレミアムは制限なし',
    },
    {
      icon: 'ban-outline' as const,
      title: '広告完全非表示',
      description: 'すべての広告が非表示になります',
    },
    {
      icon: 'document-text-outline' as const,
      title: 'ファイル処理無制限',
      description: 'PDF、Word、画像など全形式が無制限',
    },
    {
      icon: 'cloud-outline' as const,
      title: 'クラウド無制限バックアップ',
      description: 'iCloud/Google Drive連携で安心',
    },
    {
      icon: 'settings-outline' as const,
      title: '高度な音声設定',
      description: 'ピッチ調整など詳細な設定が可能',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />

      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>プレミアムプラン</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* プラン概要 */}
        <View style={styles.planCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="diamond" size={48} color={theme.colors.primary} />
          </View>
          <Text style={styles.planTitle}>TextCast プレミアム</Text>
          <Text style={styles.planPrice}>￥480 / 月</Text>
          <Text style={styles.planDescription}>
            すべての機能を無制限で利用できます
          </Text>
        </View>

        {/* 登録ボタン */}
        <TouchableOpacity
          style={styles.subscribeButton}
          onPress={handleSubscribe}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.subscribeButtonText}>プレミアムに登録する</Text>
          )}
        </TouchableOpacity>

        {/* 復元ボタン */}
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          <Text style={styles.restoreButtonText}>購入履歴を復元</Text>
        </TouchableOpacity>

        {/* 機能一覧 */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>プレミアム特典</Text>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Ionicons
                  name={feature.icon}
                  size={24}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* 注意事項 */}
        <View style={styles.noteContainer}>
          <Text style={styles.noteTitle}>ご注意</Text>
          <Text style={styles.noteText}>
            • 自動更新課金となります{'\n'}
            • いつでもキャンセル可能です{'\n'}
            • キャンセル後も期間終了まで利用可能
          </Text>
        </View>

        {/* リンク */}
        <View style={styles.linksContainer}>
          <TouchableOpacity onPress={() => router.push('/terms')}>
            <Text style={styles.linkText}>利用規約</Text>
          </TouchableOpacity>
          <Text style={styles.linkSeparator}>・</Text>
          <TouchableOpacity onPress={() => router.push('/privacy')}>
            <Text style={styles.linkText}>プライバシーポリシー</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.m,
      paddingVertical: theme.spacing.s,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
      height: 56,
    },

    closeButton: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },

    headerTitle: {
      fontSize: theme.fontSize.xl,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
    },

    headerSpacer: {
      width: 44,
    },

    scrollView: {
      flex: 1,
    },

    scrollContent: {
      paddingBottom: theme.spacing.xxl,
    },

    planCard: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: theme.spacing.m,
      marginTop: theme.spacing.l,
      padding: theme.spacing.xl,
      borderRadius: theme.borderRadius.l,
      alignItems: 'center',
    },

    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.m,
    },

    planTitle: {
      fontSize: theme.fontSize.xxl,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.s,
    },

    planPrice: {
      fontSize: theme.fontSize.xl,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.primary,
      marginBottom: theme.spacing.s,
    },

    planDescription: {
      fontSize: theme.fontSize.m,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },

    featuresContainer: {
      marginHorizontal: theme.spacing.m,
      marginTop: theme.spacing.xl,
    },

    featuresTitle: {
      fontSize: theme.fontSize.l,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.m,
    },

    featureItem: {
      flexDirection: 'row',
      paddingVertical: theme.spacing.m,
    },

    featureIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.m,
    },

    featureTextContainer: {
      flex: 1,
      justifyContent: 'center',
    },

    featureTitle: {
      fontSize: theme.fontSize.m,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text,
      marginBottom: 4,
    },

    featureDescription: {
      fontSize: theme.fontSize.s,
      color: theme.colors.textSecondary,
      lineHeight: 18,
    },

    noteContainer: {
      marginHorizontal: theme.spacing.m,
      marginTop: theme.spacing.xl,
      padding: theme.spacing.m,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.m,
    },

    noteTitle: {
      fontSize: theme.fontSize.m,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text,
      marginBottom: theme.spacing.s,
    },

    noteText: {
      fontSize: theme.fontSize.s,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },

    subscribeButton: {
      backgroundColor: theme.colors.primary,
      marginHorizontal: theme.spacing.m,
      marginTop: theme.spacing.xl,
      paddingVertical: theme.spacing.m,
      borderRadius: theme.borderRadius.l,
      alignItems: 'center',
    },

    subscribeButtonText: {
      fontSize: theme.fontSize.l,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.background,
    },

    restoreButton: {
      backgroundColor: 'transparent',
      marginHorizontal: theme.spacing.m,
      marginTop: theme.spacing.m,
      paddingVertical: theme.spacing.s,
      alignItems: 'center',
    },

    restoreButtonText: {
      fontSize: theme.fontSize.m,
      fontWeight: theme.fontWeight.medium,
      color: theme.colors.primary,
    },

    linksContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: theme.spacing.l,
    },

    linkText: {
      fontSize: theme.fontSize.s,
      color: theme.colors.textSecondary,
      textDecorationLine: 'underline',
    },

    linkSeparator: {
      fontSize: theme.fontSize.s,
      color: theme.colors.textSecondary,
      marginHorizontal: theme.spacing.s,
    },

    alreadyPremiumContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
    },

    alreadyPremiumTitle: {
      fontSize: theme.fontSize.xxl,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
      marginTop: theme.spacing.l,
      marginBottom: theme.spacing.m,
    },

    alreadyPremiumText: {
      fontSize: theme.fontSize.m,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
  });

export default PremiumPlanScreen;
