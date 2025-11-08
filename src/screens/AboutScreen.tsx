// src/screens/AboutScreen.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { Theme } from '../constants/themes';

const AboutScreen: React.FC = () => {
  const router = useRouter();
  const { theme, themeMode } = useTheme();
  const styles = createStyles(theme);

  const handleClose = () => {
    router.back();
  };

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
        <Text style={styles.headerTitle}>アプリについて</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* アプリアイコン＆タイトル */}
        <View style={styles.appInfoContainer}>
          <View style={styles.appIconContainer}>
            <Ionicons name="book" size={64} color={theme.colors.primary} />
          </View>
          <Text style={styles.appName}>TextCast</Text>
          <Text style={styles.appVersion}>バージョン 1.0.0</Text>
          <Text style={styles.appDescription}>
            テキストを音声で楽しむポッドキャスト風アプリ
          </Text>
        </View>

        {/* アプリの特徴 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TextCastとは</Text>
          <Text style={styles.sectionText}>
            TextCastは、さまざまなフォーマットのテキストコンテンツを音声で楽しめるアプリです。
            記事、PDF、Word文書などを音声で読み上げ、通勤・散歩中や家事をしながらでも
            効率的に情報をインプットできます。
          </Text>
        </View>

        {/* 主な機能 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>主な機能</Text>
          <View style={styles.featureList}>
            {[
              'マルチフォーマット対応（PDF、Word、URL、画像など）',
              'プレイリスト機能で整理して管理',
              '再生速度調整（0.5x〜3.0x）',
              '音声選択（複数の読み上げ音声から選択可能）',
              'バックグラウンド再生対応',
              'オフライン再生対応',
            ].map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 開発者情報 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>開発者</Text>
          <Text style={styles.sectionText}>
            © 2024 TextCast Team{'\n'}
            All rights reserved.
          </Text>
        </View>

        {/* リンク */}
        <View style={styles.linksContainer}>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.push('/privacy')}
          >
            <Text style={styles.linkButtonText}>プライバシーポリシー</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.push('/terms')}
          >
            <Text style={styles.linkButtonText}>利用規約</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
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

    appInfoContainer: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xxl,
    },

    appIconContainer: {
      width: 100,
      height: 100,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.m,
    },

    appName: {
      fontSize: theme.fontSize.xxl,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },

    appVersion: {
      fontSize: theme.fontSize.m,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.m,
    },

    appDescription: {
      fontSize: theme.fontSize.m,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      paddingHorizontal: theme.spacing.xl,
    },

    section: {
      marginHorizontal: theme.spacing.m,
      marginBottom: theme.spacing.xl,
    },

    sectionTitle: {
      fontSize: theme.fontSize.l,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.m,
    },

    sectionText: {
      fontSize: theme.fontSize.m,
      color: theme.colors.textSecondary,
      lineHeight: 24,
    },

    featureList: {
      gap: theme.spacing.s,
    },

    featureItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.s,
    },

    featureText: {
      flex: 1,
      fontSize: theme.fontSize.m,
      color: theme.colors.textSecondary,
      marginLeft: theme.spacing.s,
      lineHeight: 22,
    },

    linksContainer: {
      marginHorizontal: theme.spacing.m,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.l,
      overflow: 'hidden',
    },

    linkButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.m,
      paddingHorizontal: theme.spacing.m,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
    },

    linkButtonText: {
      fontSize: theme.fontSize.m,
      color: theme.colors.text,
      fontWeight: theme.fontWeight.medium,
    },
  });

export default AboutScreen;
