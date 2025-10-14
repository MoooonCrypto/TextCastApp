// src/screens/VoiceTestScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { Theme } from '../constants/themes';
import * as Speech from 'expo-speech';

interface Voice {
  identifier: string;
  name: string;
  quality: string;
  language: string;
}

const VoiceTestScreen: React.FC = () => {
  const router = useRouter();
  const { theme, themeMode } = useTheme();
  const styles = createStyles(theme);

  const [voices, setVoices] = useState<Voice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  // 試し聞き用の例文（少し長め）
  const sampleText = `こんにちは。これは音声エンジンのテストです。
テキストキャストでは、様々な音声を使って、長文の記事や論文を快適に聞くことができます。
通勤時間や散歩中など、目を使わずに情報をインプットしたい時に最適です。
自然な発音と適切な速度で、あなたの学習をサポートします。`;

  useEffect(() => {
    loadAvailableVoices();
  }, []);

  const loadAvailableVoices = async () => {
    try {
      setIsLoading(true);
      const availableVoices = await Speech.getAvailableVoicesAsync();

      // 日本語の音声のみをフィルタリング & 実用的な音声のみ
      // Eloquenceシリーズは除外（アクセシビリティ用の機械的な音声）
      const japaneseVoices = availableVoices.filter(
        (voice) =>
          voice.language.startsWith('ja') &&
          voice.quality === 'Default' &&
          !voice.identifier.includes('eloquence') // Eloquence音声を除外
      );

      // 名前でソート
      const sortedVoices = japaneseVoices.sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      setVoices(sortedVoices);
      console.log(`[VoiceTest] Loaded ${sortedVoices.length} Japanese voices`);
      console.log('[VoiceTest] Voice names:', sortedVoices.map(v => v.name).join(', '));
    } catch (error) {
      console.error('[VoiceTest] Failed to load voices:', error);
      Alert.alert('エラー', '音声の読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayVoice = async (voice: Voice) => {
    try {
      // 既に再生中の場合は停止
      if (playingVoiceId === voice.identifier) {
        Speech.stop();
        setPlayingVoiceId(null);
        return;
      }

      // 他の音声が再生中の場合は停止
      if (playingVoiceId) {
        Speech.stop();
      }

      setPlayingVoiceId(voice.identifier);

      await Speech.speak(sampleText, {
        language: voice.language,
        voice: voice.identifier,
        pitch: 1.0,
        rate: 1.0,
        onDone: () => {
          setPlayingVoiceId(null);
        },
        onStopped: () => {
          setPlayingVoiceId(null);
        },
        onError: () => {
          setPlayingVoiceId(null);
          Alert.alert('エラー', '音声の再生に失敗しました');
        },
      });
    } catch (error) {
      console.error('[VoiceTest] Failed to play voice:', error);
      setPlayingVoiceId(null);
      Alert.alert('エラー', '音声の再生に失敗しました');
    }
  };

  const handleClose = () => {
    // 再生中の音声を停止
    if (playingVoiceId) {
      Speech.stop();
      setPlayingVoiceId(null);
    }
    router.back();
  };

  const renderVoiceItem = (voice: Voice) => {
    const isPlaying = playingVoiceId === voice.identifier;

    return (
      <TouchableOpacity
        key={voice.identifier}
        style={[styles.voiceItem, isPlaying && styles.voiceItemActive]}
        onPress={() => handlePlayVoice(voice)}
        activeOpacity={0.7}
      >
        <View style={styles.voiceItemLeft}>
          <Ionicons
            name={isPlaying ? 'stop-circle' : 'play-circle'}
            size={28}
            color={isPlaying ? theme.colors.primary : theme.colors.text}
          />
          <View style={styles.voiceInfo}>
            <Text style={styles.voiceName}>{voice.name}</Text>
            <View style={styles.voiceMetaRow}>
              <Text style={styles.voiceLanguage}>{voice.language}</Text>
              {voice.quality === 'Enhanced' && (
                <View style={styles.qualityBadge}>
                  <Text style={styles.qualityBadgeText}>高品質</Text>
                </View>
              )}
            </View>
          </View>
        </View>
        {isPlaying && (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        )}
      </TouchableOpacity>
    );
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
        <Text style={styles.headerTitle}>音声試聴</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* 説明文 */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionText}>
          各音声をタップして、サンプルテキストを再生できます
        </Text>
      </View>

      {/* 音声リスト */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>音声を読み込んでいます...</Text>
        </View>
      ) : voices.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="volume-mute" size={48} color={theme.colors.textSecondary} />
          <Text style={styles.emptyText}>利用可能な音声が見つかりませんでした</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.section}>
            {voices.map(renderVoiceItem)}
          </View>

          {/* サンプルテキスト表示 */}
          <View style={styles.sampleTextContainer}>
            <Text style={styles.sampleTextLabel}>サンプルテキスト:</Text>
            <Text style={styles.sampleText}>{sampleText}</Text>
          </View>
        </ScrollView>
      )}
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

    descriptionContainer: {
      paddingHorizontal: theme.spacing.m,
      paddingVertical: theme.spacing.m,
      backgroundColor: theme.colors.surface,
      marginHorizontal: theme.spacing.m,
      marginTop: theme.spacing.m,
      borderRadius: theme.borderRadius.m,
    },

    descriptionText: {
      fontSize: theme.fontSize.s,
      color: theme.colors.textSecondary,
      textAlign: 'center',
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
      marginTop: theme.spacing.m,
      borderRadius: theme.borderRadius.l,
      overflow: 'hidden',
    },

    voiceItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.m,
      paddingHorizontal: theme.spacing.m,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
    },

    voiceItemActive: {
      backgroundColor: `${theme.colors.primary}15`,
    },

    voiceItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },

    voiceInfo: {
      marginLeft: theme.spacing.m,
      flex: 1,
    },

    voiceName: {
      fontSize: theme.fontSize.m,
      fontWeight: theme.fontWeight.medium,
      color: theme.colors.text,
      marginBottom: 4,
    },

    voiceMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    voiceLanguage: {
      fontSize: theme.fontSize.s,
      color: theme.colors.textSecondary,
      marginRight: theme.spacing.s,
    },

    qualityBadge: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.s,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.s,
    },

    qualityBadgeText: {
      fontSize: theme.fontSize.xs,
      color: '#FFFFFF',
      fontWeight: theme.fontWeight.semibold,
    },

    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },

    loadingText: {
      marginTop: theme.spacing.m,
      fontSize: theme.fontSize.m,
      color: theme.colors.textSecondary,
    },

    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
    },

    emptyText: {
      marginTop: theme.spacing.m,
      fontSize: theme.fontSize.m,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },

    sampleTextContainer: {
      marginHorizontal: theme.spacing.m,
      marginTop: theme.spacing.l,
      padding: theme.spacing.m,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.m,
    },

    sampleTextLabel: {
      fontSize: theme.fontSize.s,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.s,
    },

    sampleText: {
      fontSize: theme.fontSize.m,
      color: theme.colors.text,
      lineHeight: 24,
    },
  });

export default VoiceTestScreen;
