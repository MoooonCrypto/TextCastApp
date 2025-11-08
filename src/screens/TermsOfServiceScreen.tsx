// src/screens/TermsOfServiceScreen.tsx

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

const TermsOfServiceScreen: React.FC = () => {
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
        <Text style={styles.headerTitle}>利用規約</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.lastUpdated}>最終更新日: 2024年1月1日</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. はじめに</Text>
            <Text style={styles.sectionText}>
              本利用規約（以下「本規約」）は、TextCast（以下「当アプリ」）の利用条件を定めるものです。
              当アプリをご利用いただく前に、本規約を必ずお読みください。
              当アプリをダウンロード、インストール、または使用することにより、
              お客様は本規約に同意したものとみなされます。
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. サービスの概要</Text>
            <Text style={styles.sectionText}>
              当アプリは、テキストコンテンツを音声で読み上げるサービスを提供します。
              ユーザーは、PDF、Word文書、ウェブページなどのテキストコンテンツを
              インポートし、音声で再生することができます。
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. アカウント</Text>
            <Text style={styles.sectionText}>
              現在、当アプリはアカウント登録なしで利用できます。
              将来的にアカウント機能が追加された場合、ユーザーは正確な情報を提供し、
              アカウントのセキュリティを維持する責任があります。
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. ユーザーの責任</Text>
            <Text style={styles.sectionText}>
              ユーザーは以下を行わないものとします：{'\n'}
              {'\n'}
              • 著作権法その他の法令に違反する行為{'\n'}
              • 当アプリの正常な運営を妨害する行為{'\n'}
              • リバースエンジニアリング、逆コンパイル等{'\n'}
              • 第三者の権利を侵害する行為{'\n'}
              • 不正アクセスやハッキング
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. 著作権とコンテンツ</Text>
            <Text style={styles.sectionText}>
              ユーザーが当アプリにアップロードまたは作成したコンテンツの著作権は、
              ユーザーに帰属します。ただし、著作権法で保護されたコンテンツを
              許可なく使用することは禁止されています。{'\n'}
              {'\n'}
              当アプリ自体の著作権および知的財産権は、開発者に帰属します。
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. プレミアム会員</Text>
            <Text style={styles.sectionText}>
              プレミアム会員は、月額制のサブスクリプションサービスです。{'\n'}
              {'\n'}
              • 料金は、Apple App StoreまたはGoogle Play Storeの決済システムを通じて請求されます{'\n'}
              • 自動更新され、キャンセルするまで毎月課金されます{'\n'}
              • いつでもキャンセル可能ですが、既に支払われた料金の返金はありません{'\n'}
              • キャンセル後も、課金期間の終了まではプレミアム機能を利用できます
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. 免責事項</Text>
            <Text style={styles.sectionText}>
              当アプリは「現状有姿」で提供され、明示または黙示を問わず、
              いかなる保証も行いません。当アプリの開発者は、以下について責任を負いません：{'\n'}
              {'\n'}
              • サービスの中断、エラー、または遅延{'\n'}
              • ユーザーデータの損失{'\n'}
              • 第三者が提供するコンテンツの正確性{'\n'}
              • 当アプリの使用によって生じた損害
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. サービスの変更・終了</Text>
            <Text style={styles.sectionText}>
              当アプリは、予告なくサービスの内容を変更、一時停止、
              または終了する権利を留保します。
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. 準拠法</Text>
            <Text style={styles.sectionText}>
              本規約は日本国法に準拠し、解釈されるものとします。
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>10. 規約の変更</Text>
            <Text style={styles.sectionText}>
              当アプリは、必要に応じて本規約を更新する場合があります。
              重要な変更がある場合は、アプリ内で通知します。
              変更後も当アプリを継続して使用することにより、
              新しい規約に同意したものとみなされます。
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>11. お問い合わせ</Text>
            <Text style={styles.sectionText}>
              本規約に関するご質問は、お問い合わせページからご連絡ください。
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

export default TermsOfServiceScreen;
