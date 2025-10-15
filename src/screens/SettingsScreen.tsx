// src/screens/SettingsScreen.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { Theme } from '../constants/themes';
import { useVoiceStore } from '../stores/useVoiceStore';

const SettingsScreen: React.FC = () => {
  const router = useRouter();
  const { theme, themeMode } = useTheme();
  const styles = createStyles(theme);
  const { selectedVoice } = useVoiceStore();

  // 仮の状態管理
  const [autoPlayNext, setAutoPlayNext] = React.useState(true);
  const [showLyrics, setShowLyrics] = React.useState(false);

  const handleClose = () => {
    router.back();
  };

  // セクションヘッダー
  const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  // メニュー項目（右矢印あり）
  const MenuItem: React.FC<{
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    onPress: () => void;
    showChevron?: boolean;
    value?: string;
  }> = ({ icon, title, onPress, showChevron = true, value }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuItemLeft}>
        <Ionicons name={icon} size={22} color={theme.colors.text} />
        <Text style={styles.menuItemText}>{title}</Text>
      </View>
      <View style={styles.menuItemRight}>
        {value && <Text style={styles.menuItemValue}>{value}</Text>}
        {showChevron && (
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        )}
      </View>
    </TouchableOpacity>
  );

  // トグルメニュー項目
  const ToggleMenuItem: React.FC<{
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
  }> = ({ icon, title, value, onValueChange }) => (
    <View style={styles.menuItem}>
      <View style={styles.menuItemLeft}>
        <Ionicons name={icon} size={22} color={theme.colors.text} />
        <Text style={styles.menuItemText}>{title}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
        thumbColor={theme.colors.background}
      />
    </View>
  );

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
        <Text style={styles.headerTitle}>設定</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* 基本設定 */}
        <SectionHeader title="基本設定" />
        <View style={styles.section}>
          <MenuItem
            icon="speedometer-outline"
            title="再生速度"
            onPress={() => console.log('再生速度設定')}
          />
          <View style={styles.divider} />
          <ToggleMenuItem
            icon="play-skip-forward-outline"
            title="自動で次を再生"
            value={autoPlayNext}
            onValueChange={setAutoPlayNext}
          />
          <View style={styles.divider} />
          <ToggleMenuItem
            icon="text-outline"
            title="テキスト表示"
            value={showLyrics}
            onValueChange={setShowLyrics}
          />
        </View>

        {/* 音声設定 */}
        <SectionHeader title="音声設定" />
        <View style={styles.section}>
          <MenuItem
            icon="person-outline"
            title="音声選択"
            value={selectedVoice.displayName}
            onPress={() => router.push('/voice-selection')}
          />
        </View>

        {/* ボーナス・有料プラン */}
        <SectionHeader title="ボーナス・有料プラン" />
        <View style={styles.section}>
          <MenuItem
            icon="tv-outline"
            title="広告を見てボーナスゲット"
            onPress={() => router.push('/ad-reward')}
          />
          <View style={styles.divider} />
          <MenuItem
            icon="diamond-outline"
            title="プレミアムプランに登録"
            onPress={() => console.log('プレミアムプラン')}
          />
        </View>

        {/* その他 */}
        <SectionHeader title="その他" />
        <View style={styles.section}>
          <MenuItem
            icon="information-circle-outline"
            title="アプリについて"
            onPress={() => console.log('アプリについて')}
          />
          <View style={styles.divider} />
          <MenuItem
            icon="help-circle-outline"
            title="ヘルプ・サポート"
            onPress={() => console.log('ヘルプ')}
          />
          <View style={styles.divider} />
          <MenuItem
            icon="shield-checkmark-outline"
            title="プライバシーポリシー"
            onPress={() => console.log('プライバシーポリシー')}
          />
          <View style={styles.divider} />
          <MenuItem
            icon="document-text-outline"
            title="利用規約"
            onPress={() => console.log('利用規約')}
          />
        </View>

        {/* バージョン情報 */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>TextCast v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
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
    paddingBottom: theme.spacing.xl,
  },

  sectionHeader: {
    paddingHorizontal: theme.spacing.m,
    paddingTop: theme.spacing.l,
    paddingBottom: theme.spacing.s,
  },

  sectionTitle: {
    fontSize: theme.fontSize.s,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  section: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.m,
    borderRadius: theme.borderRadius.l,
    overflow: 'hidden',
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.m,
    minHeight: 56,
  },

  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  menuItemText: {
    fontSize: theme.fontSize.m,
    color: theme.colors.text,
    marginLeft: theme.spacing.m,
    fontWeight: theme.fontWeight.medium,
  },

  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  menuItemValue: {
    fontSize: theme.fontSize.s,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.s,
  },

  divider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginLeft: 54, // アイコン幅 + 左padding
  },

  versionContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },

  versionText: {
    fontSize: theme.fontSize.s,
    color: theme.colors.textTertiary,
  },
});

export default SettingsScreen;
