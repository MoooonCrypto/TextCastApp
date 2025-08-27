// app/(tabs)/settings.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// テンポラリ型定義（後で共通types/index.tsに統合）
interface UserSettings {
  isPremium: boolean;
  ttsSpeed: number;
  ttsVoice: string;
  autoBackup: boolean;
  backupProvider: 'icloud' | 'gdrive' | 'both';
  theme: 'light' | 'dark' | 'auto';
  globalPlayerVisible: boolean;
  maxFreeItems: number;
  maxFreeFiles: number;
  referralCode: string;
  referralCount: number;
}

export default function SettingsScreen() {
  // テンポラリ設定データ
  const [settings, setSettings] = useState<UserSettings>({
    isPremium: false,
    ttsSpeed: 1.0,
    ttsVoice: 'default',
    autoBackup: true,
    backupProvider: 'icloud',
    theme: 'dark',
    globalPlayerVisible: true,
    maxFreeItems: 50,
    maxFreeFiles: 5,
    referralCode: 'USER123',
    referralCount: 2,
  });

  // テーマ色（ダークテーマベース）
  const theme = {
    colors: {
      background: '#121212',
      surface: '#1E1E1E',
      primary: '#BB86FC',
      secondary: '#03DAC6',
      text: '#FFFFFF',
      textSecondary: '#B3B3B3',
      textTertiary: '#666666',
      border: '#333333',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      premium: '#FFD700',
    }
  };

  // 設定項目の更新
  const updateSetting = <K extends keyof UserSettings>(
    key: K, 
    value: UserSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    // TODO: AsyncStorageに保存
  };

  // プレミアム機能の案内
  const handlePremiumFeature = (featureName: string) => {
    if (settings.isPremium) {
      return;
    }
    
    Alert.alert(
      'プレミアム機能',
      `${featureName} はプレミアム機能です。アップグレードしますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        { text: 'アップグレード', onPress: () => handleUpgradeToPremium() }
      ]
    );
  };

  // プレミアムアップグレード
  const handleUpgradeToPremium = () => {
    Alert.alert('プレミアムアップグレード', 'プレミアム課金機能は今後実装予定です。');
  };

  // リファラル共有
  const handleShareReferral = () => {
    Alert.alert('紹介コード', `あなたの紹介コード: ${settings.referralCode}\n\n紹介機能は今後実装予定です。`);
  };

  // バックアップ・復元
  const handleBackup = () => {
    Alert.alert('バックアップ', 'バックアップ機能は今後実装予定です。');
  };

  const handleRestore = () => {
    Alert.alert('復元', '復元機能は今後実装予定です。');
  };

  // データ削除
  const handleClearData = () => {
    Alert.alert(
      '全データ削除',
      'すべてのテキストとプレイリストが削除されます。この操作は取り消せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: '削除する', 
          style: 'destructive',
          onPress: () => Alert.alert('削除完了', 'すべてのデータを削除しました。')
        }
      ]
    );
  };

  // 設定セクション
  const SettingsSection: React.FC<{
    title: string;
    children: React.ReactNode;
  }> = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  // 設定項目（スイッチ付き）
  const SettingsSwitchItem: React.FC<{
    title: string;
    subtitle?: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    premium?: boolean;
    icon?: string;
  }> = ({ title, subtitle, value, onValueChange, premium, icon }) => (
    <TouchableOpacity
      style={styles.settingsItem}
      onPress={() => {
        if (premium && !settings.isPremium) {
          handlePremiumFeature(title);
          return;
        }
        onValueChange(!value);
      }}
      activeOpacity={0.7}
    >
      <View style={styles.settingsItemLeft}>
        {icon && (
          <Ionicons
            name={icon as any}
            size={20}
            color={theme.colors.textSecondary}
            style={styles.settingsIcon}
          />
        )}
        <View style={styles.settingsTextContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.settingsTitle}>{title}</Text>
            {premium && !settings.isPremium && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumText}>PRO</Text>
              </View>
            )}
          </View>
          {subtitle && (
            <Text style={styles.settingsSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={(newValue) => {
          if (premium && !settings.isPremium) {
            handlePremiumFeature(title);
            return;
          }
          onValueChange(newValue);
        }}
        trackColor={{
          false: theme.colors.border,
          true: theme.colors.primary + '40'
        }}
        thumbColor={value ? theme.colors.primary : theme.colors.textTertiary}
      />
    </TouchableOpacity>
  );

  // 設定項目（一般）
  const SettingsItem: React.FC<{
    title: string;
    subtitle?: string;
    value?: string;
    onPress: () => void;
    premium?: boolean;
    icon?: string;
    showArrow?: boolean;
  }> = ({ title, subtitle, value, onPress, premium, icon, showArrow = true }) => (
    <TouchableOpacity
      style={styles.settingsItem}
      onPress={() => {
        if (premium && !settings.isPremium) {
          handlePremiumFeature(title);
          return;
        }
        onPress();
      }}
      activeOpacity={0.7}
    >
      <View style={styles.settingsItemLeft}>
        {icon && (
          <Ionicons
            name={icon as any}
            size={20}
            color={theme.colors.textSecondary}
            style={styles.settingsIcon}
          />
        )}
        <View style={styles.settingsTextContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.settingsTitle}>{title}</Text>
            {premium && !settings.isPremium && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumText}>PRO</Text>
              </View>
            )}
          </View>
          {subtitle && (
            <Text style={styles.settingsSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      <View style={styles.settingsItemRight}>
        {value && (
          <Text style={styles.settingsValue}>{value}</Text>
        )}
        {showArrow && (
          <Ionicons
            name="chevron-forward"
            size={16}
            color={theme.colors.textTertiary}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    safeArea: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    content: {
      flex: 1,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 12,
      paddingHorizontal: 16,
    },
    sectionContent: {
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: theme.colors.border,
    },
    settingsItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    settingsItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    settingsIcon: {
      marginRight: 12,
    },
    settingsTextContainer: {
      flex: 1,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    settingsTitle: {
      fontSize: 16,
      color: theme.colors.text,
      marginRight: 8,
    },
    settingsSubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    settingsItemRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    settingsValue: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginRight: 8,
    },
    premiumBadge: {
      backgroundColor: theme.colors.premium,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
    },
    premiumText: {
      fontSize: 10,
      fontWeight: 'bold',
      color: theme.colors.background,
    },
    premiumSection: {
      backgroundColor: theme.colors.premium + '10',
      borderColor: theme.colors.premium + '40',
      borderWidth: 1,
      borderRadius: 12,
      marginHorizontal: 16,
      marginBottom: 24,
      padding: 16,
    },
    premiumHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    premiumTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.premium,
      marginLeft: 8,
    },
    premiumFeatures: {
      marginBottom: 16,
    },
    premiumFeature: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    premiumFeatureText: {
      fontSize: 14,
      color: theme.colors.text,
      marginLeft: 8,
    },
    upgradeButton: {
      backgroundColor: theme.colors.premium,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: 'center',
    },
    upgradeButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.background,
    },
    referralSection: {
      backgroundColor: theme.colors.secondary + '10',
      borderColor: theme.colors.secondary + '40',
      borderWidth: 1,
      borderRadius: 12,
      marginHorizontal: 16,
      marginBottom: 24,
      padding: 16,
    },
    referralHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    referralTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.secondary,
      marginLeft: 8,
    },
    referralStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    referralStat: {
      alignItems: 'center',
    },
    referralStatNumber: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    referralStatLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    shareButton: {
      backgroundColor: theme.colors.secondary,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: 'center',
    },
    shareButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.background,
    },
  });

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
        
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>設定</Text>
        </View>

        <ScrollView style={styles.content}>
          {/* プレミアム機能（無料版の場合） */}
          {!settings.isPremium && (
            <View style={styles.premiumSection}>
              <View style={styles.premiumHeader}>
                <Ionicons name="star" size={24} color={theme.colors.premium} />
                <Text style={styles.premiumTitle}>TextCast Premium</Text>
              </View>
              
              <View style={styles.premiumFeatures}>
                <View style={styles.premiumFeature}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                  <Text style={styles.premiumFeatureText}>プレイリスト無制限</Text>
                </View>
                <View style={styles.premiumFeature}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                  <Text style={styles.premiumFeatureText}>広告完全非表示</Text>
                </View>
                <View style={styles.premiumFeature}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                  <Text style={styles.premiumFeatureText}>ファイル処理無制限</Text>
                </View>
                <View style={styles.premiumFeature}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                  <Text style={styles.premiumFeatureText}>クラウド無制限バックアップ</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={handleUpgradeToPremium}
              >
                <Text style={styles.upgradeButtonText}>月額￥480でアップグレード</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* リファラルセクション */}
          <View style={styles.referralSection}>
            <View style={styles.referralHeader}>
              <Ionicons name="people" size={24} color={theme.colors.secondary} />
              <Text style={styles.referralTitle}>友達紹介</Text>
            </View>
            
            <View style={styles.referralStats}>
              <View style={styles.referralStat}>
                <Text style={styles.referralStatNumber}>{settings.referralCount}</Text>
                <Text style={styles.referralStatLabel}>紹介成功数</Text>
              </View>
              <View style={styles.referralStat}>
                <Text style={styles.referralStatNumber}>{50 + settings.referralCount}</Text>
                <Text style={styles.referralStatLabel}>プレイリスト上限</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleShareReferral}
            >
              <Text style={styles.shareButtonText}>紹介コードを共有</Text>
            </TouchableOpacity>
          </View>

          {/* 再生設定 */}
          <SettingsSection title="再生設定">
            <SettingsItem
              title="再生速度"
              value={`${settings.ttsSpeed}x`}
              onPress={() => Alert.alert('再生速度', '再生速度設定は今後実装予定です。')}
              icon="speedometer-outline"
            />
            <SettingsItem
              title="音声選択"
              value="デフォルト"
              onPress={() => Alert.alert('音声選択', '音声選択機能は今後実装予定です。')}
              icon="volume-high-outline"
            />
            <SettingsSwitchItem
              title="グローバルプレイヤー表示"
              subtitle="画面下部に常時プレイヤーを表示"
              value={settings.globalPlayerVisible}
              onValueChange={(value) => updateSetting('globalPlayerVisible', value)}
              icon="musical-notes-outline"
            />
          </SettingsSection>

          {/* データ・バックアップ */}
          <SettingsSection title="データ・バックアップ">
            <SettingsSwitchItem
              title="自動バックアップ"
              subtitle="iCloudに自動でバックアップ"
              value={settings.autoBackup}
              onValueChange={(value) => updateSetting('autoBackup', value)}
              icon="cloud-outline"
              premium
            />
            <SettingsItem
              title="バックアップを作成"
              subtitle="手動でバックアップを作成"
              onPress={handleBackup}
              icon="cloud-upload-outline"
            />
            <SettingsItem
              title="バックアップから復元"
              subtitle="バックアップからデータを復元"
              onPress={handleRestore}
              icon="cloud-download-outline"
            />
          </SettingsSection>

          {/* アプリ設定 */}
          <SettingsSection title="アプリ設定">
            <SettingsItem
              title="テーマ"
              value="ダーク"
              onPress={() => Alert.alert('テーマ設定', 'テーマ設定は今後実装予定です。')}
              icon="color-palette-outline"
            />
            <SettingsItem
              title="通知設定"
              subtitle="プッシュ通知の設定"
              onPress={() => Alert.alert('通知設定', '通知設定は今後実装予定です。')}
              icon="notifications-outline"
            />
          </SettingsSection>

          {/* その他 */}
          <SettingsSection title="その他">
            <SettingsItem
              title="利用規約"
              onPress={() => Alert.alert('利用規約', '利用規約画面は今後実装予定です。')}
              icon="document-text-outline"
            />
            <SettingsItem
              title="プライバシーポリシー"
              onPress={() => Alert.alert('プライバシーポリシー', 'プライバシーポリシー画面は今後実装予定です。')}
              icon="shield-outline"
            />
            <SettingsItem
              title="サポート・お問い合わせ"
              onPress={() => Alert.alert('サポート', 'サポート機能は今後実装予定です。')}
              icon="help-circle-outline"
            />
            <SettingsItem
              title="アプリについて"
              value="v1.0.0"
              onPress={() => Alert.alert('TextCast', 'TextCast v1.0.0\n\n開発中のベータ版です。')}
              icon="information-circle-outline"
            />
          </SettingsSection>

          {/* 危険な操作 */}
          <SettingsSection title="危険な操作">
            <SettingsItem
              title="全データ削除"
              subtitle="すべてのテキストとプレイリストを削除"
              onPress={handleClearData}
              icon="trash-outline"
              showArrow={false}
            />
          </SettingsSection>

          {/* 下部の余白 */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}