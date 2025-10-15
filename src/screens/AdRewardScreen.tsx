// src/screens/AdRewardScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { Theme } from '../constants/themes';
import { AdRewardService } from '../services/AdRewardService';
import { PlanService } from '../services/PlanService';

const AdRewardScreen: React.FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [loading, setLoading] = useState(false);
  const [totalRewards, setTotalRewards] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [maxItems, setMaxItems] = useState(0);
  const [currentItems, setCurrentItems] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await AdRewardService.getAdRewardData();
      const remainingCount = await AdRewardService.getRemainingWatchCount();
      const storageInfo = await PlanService.getStorageInfo();

      setTotalRewards(data.totalRewards);
      setRemaining(remainingCount);
      setMaxItems(storageInfo.max);
      setCurrentItems(storageInfo.current);
    } catch (error) {
      console.error('データ読み込みエラー:', error);
    }
  };

  const handleWatchAd = async () => {
    if (remaining <= 0) {
      Alert.alert(
        '上限到達',
        '本日の視聴回数上限に達しました。\n明日また試してください。'
      );
      return;
    }

    try {
      setLoading(true);
      const result = await PlanService.watchAd();

      if (result.success) {
        Alert.alert('報酬獲得！', result.message, [
          { text: 'OK', onPress: loadData },
        ]);
      } else {
        Alert.alert('エラー', result.message);
      }
    } catch (error) {
      console.error('広告視聴エラー:', error);
      Alert.alert('エラー', '広告の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>広告視聴でボーナス</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* アイコン */}
        <View style={styles.iconContainer}>
          <Ionicons name="tv-outline" size={80} color={theme.colors.primary} />
        </View>

        {/* タイトル */}
        <Text style={styles.title}>広告を見てボーナスゲット</Text>
        <Text style={styles.subtitle}>
          動画広告を視聴して保存枠を増やそう！
        </Text>

        {/* 統計表示 */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="gift-outline" size={32} color={theme.colors.primary} />
            <Text style={styles.statNumber}>{totalRewards}</Text>
            <Text style={styles.statLabel}>累計獲得</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="play-circle-outline" size={32} color={theme.colors.primary} />
            <Text style={styles.statNumber}>{remaining}</Text>
            <Text style={styles.statLabel}>本日残り</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="folder-outline" size={32} color={theme.colors.primary} />
            <Text style={styles.statNumber}>{maxItems === Infinity ? '∞' : maxItems}</Text>
            <Text style={styles.statLabel}>保存上限</Text>
          </View>
        </View>

        {/* 視聴ボタン */}
        <TouchableOpacity
          style={[styles.watchButton, (loading || remaining <= 0) && styles.watchButtonDisabled]}
          onPress={handleWatchAd}
          disabled={loading || remaining <= 0}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color={theme.colors.background} />
          ) : (
            <>
              <Ionicons name="play-circle" size={28} color={theme.colors.background} />
              <Text style={styles.watchButtonText}>
                {remaining > 0 ? '広告を視聴する' : '本日の上限に達しました'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* 情報カード */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle-outline" size={24} color={theme.colors.primary} />
            <Text style={styles.infoTitle}>ご利用について</Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
            <Text style={styles.infoText}>
              1日最大{AdRewardService.getDailyLimit()}回まで視聴可能
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
            <Text style={styles.infoText}>
              1回の視聴で保存枠+1（永久）
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
            <Text style={styles.infoText}>
              報酬は動画を最後まで視聴すると獲得できます
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
            <Text style={styles.infoText}>
              毎日0時にカウントがリセットされます
            </Text>
          </View>
        </View>

        {/* 現在の保存状況 */}
        <View style={styles.storageCard}>
          <Text style={styles.storageTitle}>現在の保存状況</Text>
          <View style={styles.storageBar}>
            <View
              style={[
                styles.storageBarFill,
                {
                  width: maxItems === Infinity ? '0%' : `${(currentItems / maxItems) * 100}%`,
                  backgroundColor: theme.colors.primary,
                },
              ]}
            />
          </View>
          <Text style={styles.storageText}>
            {currentItems} / {maxItems === Infinity ? '∞' : maxItems} 件
          </Text>
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
    },

    backButton: {
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

    content: {
      flex: 1,
    },

    contentContainer: {
      padding: theme.spacing.l,
      alignItems: 'center',
    },

    iconContainer: {
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: `${theme.colors.primary}15`,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.l,
    },

    title: {
      fontSize: theme.fontSize.xxl,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.s,
      textAlign: 'center',
    },

    subtitle: {
      fontSize: theme.fontSize.m,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xl,
      textAlign: 'center',
    },

    statsContainer: {
      flexDirection: 'row',
      gap: theme.spacing.m,
      marginBottom: theme.spacing.xl,
      width: '100%',
    },

    statCard: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.l,
      padding: theme.spacing.m,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    statNumber: {
      fontSize: theme.fontSize.xxl,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
      marginTop: theme.spacing.s,
    },

    statLabel: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },

    watchButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.l,
      paddingVertical: theme.spacing.m,
      paddingHorizontal: theme.spacing.xl,
      marginBottom: theme.spacing.xl,
      gap: theme.spacing.s,
      width: '100%',
      minHeight: 56,
    },

    watchButtonDisabled: {
      opacity: 0.5,
    },

    watchButtonText: {
      fontSize: theme.fontSize.l,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.background,
    },

    infoCard: {
      width: '100%',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.l,
      padding: theme.spacing.m,
      marginBottom: theme.spacing.m,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    infoHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.s,
      marginBottom: theme.spacing.m,
    },

    infoTitle: {
      fontSize: theme.fontSize.l,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text,
    },

    infoItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: theme.spacing.s,
      marginBottom: theme.spacing.s,
    },

    infoText: {
      flex: 1,
      fontSize: theme.fontSize.s,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },

    storageCard: {
      width: '100%',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.l,
      padding: theme.spacing.m,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    storageTitle: {
      fontSize: theme.fontSize.m,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text,
      marginBottom: theme.spacing.s,
    },

    storageBar: {
      height: 8,
      backgroundColor: theme.colors.divider,
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: theme.spacing.s,
    },

    storageBarFill: {
      height: '100%',
      borderRadius: 4,
    },

    storageText: {
      fontSize: theme.fontSize.s,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
  });

export default AdRewardScreen;
