// src/screens/FAQScreen.tsx

import React, { useState } from 'react';
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

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    question: 'TextCastとは何ですか？',
    answer:
      'TextCastは、テキストコンテンツを音声で読み上げるアプリです。記事、PDF、Word文書などを音声で効率的に消化できます。',
  },
  {
    question: '無料版とプレミアム版の違いは何ですか？',
    answer:
      '無料版：プレイリスト20個まで、広告表示あり\nプレミアム版：プレイリスト無制限、広告なし、全機能が無制限に利用可能です。',
  },
  {
    question: 'どのようなファイル形式に対応していますか？',
    answer: 'PDF、Word（.docx）、PowerPoint（.pptx）、テキスト（.txt）、Markdown（.md）、画像（JPG/PNG、OCR対応）などに対応しています。',
  },
  {
    question: 'オフラインでも使用できますか？',
    answer: 'はい。一度保存したコンテンツは、オフラインでも音声再生が可能です。',
  },
  {
    question: '再生速度は変更できますか？',
    answer: 'はい。0.5倍から3.0倍まで、0.25倍刻みで再生速度を調整できます。',
  },
  {
    question: 'データのバックアップはできますか？',
    answer: 'プレミアム版では、iCloud（iOS）またはGoogle Drive（Android）に自動バックアップされます。',
  },
  {
    question: 'プレミアム版の解約方法は？',
    answer:
      'iOS: 設定アプリ → Apple ID → サブスクリプション\nAndroid: Google Playストア → メニュー → 定期購入\nから解約できます。',
  },
  {
    question: 'アプリが正常に動作しません',
    answer:
      '以下をお試しください：\n1. アプリの再起動\n2. デバイスの再起動\n3. アプリの最新版へのアップデート\n改善しない場合はお問い合わせください。',
  },
];

const FAQScreen: React.FC = () => {
  const router = useRouter();
  const { theme, themeMode } = useTheme();
  const styles = createStyles(theme);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleClose = () => {
    router.back();
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
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
        <Text style={styles.headerTitle}>よくある質問</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          {FAQ_DATA.map((faq, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity
                style={styles.faqItem}
                onPress={() => toggleExpand(index)}
                activeOpacity={0.7}
              >
                <View style={styles.questionContainer}>
                  <Text style={styles.questionText}>{faq.question}</Text>
                  <Ionicons
                    name={expandedIndex === index ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                </View>
                {expandedIndex === index && (
                  <View style={styles.answerContainer}>
                    <Text style={styles.answerText}>{faq.answer}</Text>
                  </View>
                )}
              </TouchableOpacity>
              {index < FAQ_DATA.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        <View style={styles.contactContainer}>
          <Text style={styles.contactText}>
            お探しの答えが見つかりませんか？
          </Text>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => router.push('/contact')}
          >
            <Text style={styles.contactButtonText}>お問い合わせ</Text>
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

    section: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: theme.spacing.m,
      marginTop: theme.spacing.l,
      borderRadius: theme.borderRadius.l,
      overflow: 'hidden',
    },

    faqItem: {
      paddingVertical: theme.spacing.m,
      paddingHorizontal: theme.spacing.m,
    },

    questionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    questionText: {
      flex: 1,
      fontSize: theme.fontSize.m,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text,
      marginRight: theme.spacing.s,
    },

    answerContainer: {
      marginTop: theme.spacing.m,
      paddingTop: theme.spacing.s,
    },

    answerText: {
      fontSize: theme.fontSize.m,
      color: theme.colors.textSecondary,
      lineHeight: 22,
    },

    divider: {
      height: 1,
      backgroundColor: theme.colors.divider,
      marginLeft: theme.spacing.m,
    },

    contactContainer: {
      marginHorizontal: theme.spacing.m,
      marginTop: theme.spacing.xl,
      padding: theme.spacing.l,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.l,
      alignItems: 'center',
    },

    contactText: {
      fontSize: theme.fontSize.m,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.m,
      textAlign: 'center',
    },

    contactButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.m,
      borderRadius: theme.borderRadius.m,
    },

    contactButtonText: {
      fontSize: theme.fontSize.m,
      fontWeight: theme.fontWeight.semibold,
      color: '#FFFFFF',
    },
  });

export default FAQScreen;
