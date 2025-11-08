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
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { Theme, ThemeMode } from '../constants/themes';
import { useVoiceStore } from '../stores/useVoiceStore';
import { usePurchaseStore } from '../stores/usePurchaseStore';
import { showComingSoonAlert } from '../utils/alerts';

const SettingsScreen: React.FC = () => {
  const router = useRouter();
  const { theme, themeMode, setThemeMode } = useTheme();
  const styles = createStyles(theme);
  const { selectedVoice } = useVoiceStore();
  const { setMockPremium } = usePurchaseStore();

  // 仮の状態管理
  const [autoPlayNext, setAutoPlayNext] = React.useState(true);
  const [showLyrics, setShowLyrics] = React.useState(false);

  // テーマ設定の表示名取得
  const getThemeDisplayName = (mode: ThemeMode): string => {
    switch (mode) {
      case 'light':
        return 'ライト';
      case 'dark':
        return 'ダーク';
      case 'system':
        return 'システム設定に従う';
    }
  };

  // テーマ選択アラート
  const handleThemeSelection = () => {
    Alert.alert(
      'テーマ設定',
      'テーマを選択してください',
      [
        {
          text: 'ライト',
          onPress: () => setThemeMode('light'),
        },
        {
          text: 'ダーク',
          onPress: () => setThemeMode('dark'),
        },
        {
          text: 'システム設定に従う',
          onPress: () => setThemeMode('system'),
        },
        {
          text: 'キャンセル',
          style: 'cancel',
        },
      ],
      { cancelable: true } // アラート外タップでキャンセル可能
    );
  };

  const handleClose = () => {
    router.back();
  };

  // SNS・外部リンクを開く
  const handleOpenLink = async (url: string, name: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('エラー', `${name}を開くことができませんでした。`);
      }
    } catch (error) {
      console.error('[Settings] Failed to open link:', error);
      Alert.alert('エラー', 'リンクを開く際にエラーが発生しました。');
    }
  };

  // デバッグ用: プレミアム状態をリセット
  const handleResetPremium = async () => {
    Alert.alert(
      'プレミアム状態をリセット',
      'デバッグ用のプレミアム状態をリセットしますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'リセット',
          style: 'destructive',
          onPress: async () => {
            await setMockPremium(false);
            Alert.alert('完了', 'プレミアム状態をリセットしました');
          },
        },
      ]
    );
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
        trackColor={{
          false: '#E5E5EA', // オフ時の余白色（灰色）
          true: '#34C759'   // オン時の余白色（iPhoneの緑）
        }}
        thumbColor="#FFFFFF" // ボタン自体は常に白色
        ios_backgroundColor="#E5E5EA" // iOS用のオフ時背景色
        style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
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
        {/* 音声設定 */}
        <SectionHeader title="音声設定" />
        <View style={styles.section}>
          <MenuItem
            icon="person-outline"
            title="音声選択"
            value={selectedVoice?.displayName || 'システムデフォルト'}
            onPress={() => router.push('/voice-selection')}
          />
        </View>

        {/* 再生設定 */}
        <SectionHeader title="再生設定" />
        <View style={styles.section}>
          <MenuItem
            icon="speedometer-outline"
            title="再生速度"
            onPress={() => router.push('/playback-speed')}
          />
          <View style={styles.divider} />
          <ToggleMenuItem
            icon="play-skip-forward-outline"
            title="自動で次を再生"
            value={autoPlayNext}
            onValueChange={setAutoPlayNext}
          />
        </View>

        {/* 表示設定 */}
        <SectionHeader title="表示設定" />
        <View style={styles.section}>
          <MenuItem
            icon="color-palette-outline"
            title="テーマ"
            value={getThemeDisplayName(themeMode)}
            onPress={handleThemeSelection}
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
            onPress={() => router.push('/premium-plan')}
          />
        </View>

        {/* ヘルプ・サポート */}
        <SectionHeader title="ヘルプ・サポート" />
        <View style={styles.section}>
          <MenuItem
            icon="help-circle-outline"
            title="よくある質問（FAQ）"
            onPress={() => router.push('/faq')}
          />
          <View style={styles.divider} />
          <MenuItem
            icon="mail-outline"
            title="お問い合わせ"
            onPress={() => router.push('/contact')}
          />
        </View>

        {/* メディア */}
        <SectionHeader title="メディア" />
        <View style={styles.section}>
          <MenuItem
            icon="logo-twitter"
            title="X"
            onPress={() => handleOpenLink('https://x.com/textcast_app', 'X')}
          />
          <View style={styles.divider} />
          <MenuItem
            icon="logo-youtube"
            title="YouTube"
            onPress={() => handleOpenLink('https://youtube.com/@textcast', 'YouTube')}
          />
          <View style={styles.divider} />
          <MenuItem
            icon="person-outline"
            title="開発者について"
            onPress={() => handleOpenLink('https://github.com/textcast', '開発者について')}
          />
        </View>

        {/* アプリ情報 */}
        <SectionHeader title="アプリ情報" />
        <View style={styles.section}>
          <MenuItem
            icon="information-circle-outline"
            title="アプリについて"
            onPress={() => router.push('/about')}
          />
          <View style={styles.divider} />
          <MenuItem
            icon="shield-checkmark-outline"
            title="プライバシーポリシー"
            onPress={() => router.push('/privacy')}
          />
          <View style={styles.divider} />
          <MenuItem
            icon="document-text-outline"
            title="利用規約"
            onPress={() => router.push('/terms')}
          />
        </View>

        {/* デバッグ（開発中のみ） */}
        <SectionHeader title="デバッグ" />
        <View style={styles.section}>
          <MenuItem
            icon="bug-outline"
            title="プレミアム状態をリセット"
            onPress={handleResetPremium}
            showChevron={false}
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
