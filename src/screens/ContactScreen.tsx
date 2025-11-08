// src/screens/ContactScreen.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { Theme } from '../constants/themes';

const ContactScreen: React.FC = () => {
  const router = useRouter();
  const { theme, themeMode } = useTheme();
  const styles = createStyles(theme);

  const handleClose = () => {
    router.back();
  };

  const handleEmailContact = () => {
    const email = 'support@textcast.app'; // TODO: 実際のサポートメールアドレスに変更
    const subject = 'TextCast お問い合わせ';
    const body = `\n\n---\nアプリバージョン: 1.0.0\nデバイス情報: ${Platform.OS}\n---`;

    Linking.openURL(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const handleTwitterContact = () => {
    Linking.openURL('https://twitter.com/textcast_app'); // TODO: 実際のTwitterアカウントに変更
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
        <Text style={styles.headerTitle}>お問い合わせ</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* お問い合わせ方法 */}
        <View style={styles.introContainer}>
          <Text style={styles.introText}>
            アプリに関するご質問、ご要望、不具合報告などがございましたら、
            以下の方法でお気軽にお問い合わせください。
          </Text>
        </View>

        {/* メールでのお問い合わせ */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.contactMethod}
            onPress={handleEmailContact}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="mail" size={32} color={theme.colors.primary} />
            </View>
            <View style={styles.methodTextContainer}>
              <Text style={styles.methodTitle}>メールでお問い合わせ</Text>
              <Text style={styles.methodDescription}>
                support@textcast.app{'\n'}
                24時間以内に返信いたします
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* SNSでのお問い合わせ */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.contactMethod}
            onPress={handleTwitterContact}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="logo-twitter" size={32} color={theme.colors.primary} />
            </View>
            <View style={styles.methodTextContainer}>
              <Text style={styles.methodTitle}>Twitterでお問い合わせ</Text>
              <Text style={styles.methodDescription}>
                @textcast_app{'\n'}
                DMでのお問い合わせも受け付けています
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* 注意事項 */}
        <View style={styles.noteContainer}>
          <Text style={styles.noteTitle}>ご注意</Text>
          <Text style={styles.noteText}>
            • お問い合わせの際は、具体的な状況をお知らせください{'\n'}
            • スクリーンショットを添付いただくと、より迅速な対応が可能です{'\n'}
            • 休日・祝日のお問い合わせは、翌営業日以降の対応となります
          </Text>
        </View>

        {/* FAQ へのリンク */}
        <View style={styles.faqLinkContainer}>
          <Text style={styles.faqLinkText}>
            お問い合わせ前に、よくある質問もご確認ください
          </Text>
          <TouchableOpacity
            style={styles.faqButton}
            onPress={() => router.push('/faq')}
          >
            <Text style={styles.faqButtonText}>FAQ を見る</Text>
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
      paddingBottom: theme.spacing.xl,
    },

    introContainer: {
      marginHorizontal: theme.spacing.m,
      marginTop: theme.spacing.l,
      padding: theme.spacing.m,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.m,
    },

    introText: {
      fontSize: theme.fontSize.m,
      color: theme.colors.textSecondary,
      lineHeight: 22,
    },

    section: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: theme.spacing.m,
      marginTop: theme.spacing.l,
      borderRadius: theme.borderRadius.l,
      overflow: 'hidden',
    },

    contactMethod: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.m,
    },

    iconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.m,
    },

    methodTextContainer: {
      flex: 1,
    },

    methodTitle: {
      fontSize: theme.fontSize.m,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text,
      marginBottom: 4,
    },

    methodDescription: {
      fontSize: theme.fontSize.s,
      color: theme.colors.textSecondary,
      lineHeight: 18,
    },

    noteContainer: {
      marginHorizontal: theme.spacing.m,
      marginTop: theme.spacing.l,
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

    faqLinkContainer: {
      marginHorizontal: theme.spacing.m,
      marginTop: theme.spacing.l,
      padding: theme.spacing.l,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.l,
      alignItems: 'center',
    },

    faqLinkText: {
      fontSize: theme.fontSize.m,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.m,
      textAlign: 'center',
    },

    faqButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.m,
      borderRadius: theme.borderRadius.m,
    },

    faqButtonText: {
      fontSize: theme.fontSize.m,
      fontWeight: theme.fontWeight.semibold,
      color: '#FFFFFF',
    },
  });

export default ContactScreen;
