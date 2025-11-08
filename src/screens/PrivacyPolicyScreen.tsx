// src/screens/PrivacyPolicyScreen.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { Theme } from '../constants/themes';

const PrivacyPolicyScreen: React.FC = () => {
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
        <Text style={styles.headerTitle}>プライバシーポリシー</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.lastUpdated}>最終更新日: 2024年1月1日</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. はじめに</Text>
            <Text style={styles.sectionText}>
              TextCast（以下「当アプリ」）は、ユーザーの皆様のプライバシーを尊重し、
              個人情報の保護に最大限の注意を払っています。本プライバシーポリシーは、
              当アプリがどのように情報を収集、使用、保護するかを説明するものです。
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. 収集する情報</Text>
            <Text style={styles.sectionText}>
              当アプリは以下の情報を収集する場合があります：{'\n'}
              {'\n'}
              • デバイス情報（OS、バージョン、機種など）{'\n'}
              • アプリの使用状況（機能の利用頻度、クラッシュレポートなど）{'\n'}
              • ユーザーが作成したコンテンツ（テキスト、プレイリストなど）{'\n'}
              {'\n'}
              なお、個人を特定できる情報（氏名、メールアドレス、電話番号など）は、
              ユーザーが明示的に提供しない限り収集しません。
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. 情報の利用目的</Text>
            <Text style={styles.sectionText}>
              収集した情報は以下の目的で利用します：{'\n'}
              {'\n'}
              • アプリの機能提供およびサービス向上{'\n'}
              • ユーザーサポートの提供{'\n'}
              • アプリの不具合の修正{'\n'}
              • 新機能の開発および改善{'\n'}
              • 統計データの作成（個人を特定できない形式）
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. 情報の共有</Text>
            <Text style={styles.sectionText}>
              当アプリは、以下の場合を除き、ユーザーの情報を第三者と共有しません：{'\n'}
              {'\n'}
              • ユーザーの同意がある場合{'\n'}
              • 法令に基づく開示が必要な場合{'\n'}
              • サービス提供に必要な範囲で、信頼できるパートナー企業と共有する場合
              （この場合も、最小限の情報のみを共有し、適切な保護措置を講じます）
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. データの保存</Text>
            <Text style={styles.sectionText}>
              ユーザーが作成したコンテンツは、主にデバイス上にローカル保存されます。
              プレミアム会員の場合、iCloudまたはGoogle Driveを通じてバックアップされる場合があります。
              当アプリのサーバーには、最小限の使用統計データのみが保存されます。
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. セキュリティ</Text>
            <Text style={styles.sectionText}>
              当アプリは、ユーザーの情報を保護するために、業界標準のセキュリティ対策を講じています。
              ただし、インターネット上の通信には完全な安全性を保証することはできません。
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. 子供のプライバシー</Text>
            <Text style={styles.sectionText}>
              当アプリは、13歳未満の子供から意図的に個人情報を収集することはありません。
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. プライバシーポリシーの変更</Text>
            <Text style={styles.sectionText}>
              当アプリは、必要に応じて本プライバシーポリシーを更新する場合があります。
              重要な変更がある場合は、アプリ内で通知します。
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. お問い合わせ</Text>
            <Text style={styles.sectionText}>
              プライバシーに関するご質問やご懸念がある場合は、
              お問い合わせページからご連絡ください。
            </Text>
          </View>
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

    content: {
      paddingHorizontal: theme.spacing.m,
      paddingTop: theme.spacing.l,
    },

    lastUpdated: {
      fontSize: theme.fontSize.s,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.l,
      textAlign: 'center',
    },

    section: {
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
  });

export default PrivacyPolicyScreen;
