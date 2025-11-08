// src/screens/VoiceSelectionScreen.tsx
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { Theme } from '../constants/themes';
import * as Speech from 'expo-speech';
import { useVoiceStore, DEFAULT_VOICES, VoiceOption } from '../stores/useVoiceStore';

const VoiceSelectionScreen: React.FC = () => {
  const router = useRouter();
  const { theme, themeMode } = useTheme();
  const styles = createStyles(theme);

  const { selectedVoice, setVoice } = useVoiceStore();
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 利用可能な音声を取得
  useEffect(() => {
    const loadAvailableVoices = async () => {
      try {
        const allVoices = await Speech.getAvailableVoicesAsync();
        const voiceIdentifiers = allVoices.map((v) => v.identifier);

        // DEFAULT_VOICESの中から利用可能なもののみをフィルタ
        const available = DEFAULT_VOICES.filter((voice) =>
          voiceIdentifiers.includes(voice.identifier)
        );

        setAvailableVoices(available);
        console.log(`[VoiceSelection] Found ${available.length} available voices`);
      } catch (error) {
        console.error('[VoiceSelection] Failed to load voices:', error);
        // エラー時は全て表示
        setAvailableVoices(DEFAULT_VOICES);
      } finally {
        setIsLoading(false);
      }
    };

    loadAvailableVoices();
  }, []);

  // 試し聞き用の短い例文
  const sampleText = `こんにちは。この音声でテキストを読み上げます。`;

  const handlePlayVoice = async (voice: VoiceOption) => {
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

      // タイムアウト処理を追加（10秒でタイムアウト）
      const timeoutId = setTimeout(() => {
        console.warn('[VoiceSelection] Speech timeout, stopping...');
        Speech.stop();
        setPlayingVoiceId(null);
      }, 10000);

      Speech.speak(sampleText, {
        language: 'ja-JP',
        voice: voice.identifier,
        pitch: 1.0,
        rate: 1.0,
        onStart: () => {
          console.log(`[VoiceSelection] Started playing: ${voice.displayName}`);
        },
        onDone: () => {
          clearTimeout(timeoutId);
          setPlayingVoiceId(null);
        },
        onStopped: () => {
          clearTimeout(timeoutId);
          setPlayingVoiceId(null);
        },
        onError: (error) => {
          console.error('[VoiceSelection] Speech error:', error);
          clearTimeout(timeoutId);
          setPlayingVoiceId(null);
        },
      });
    } catch (error) {
      console.error('[VoiceSelection] Failed to play voice:', error);
      setPlayingVoiceId(null);
    }
  };

  const handleSelectVoice = async (voice: VoiceOption) => {
    // 再生中の音声を停止
    if (playingVoiceId) {
      Speech.stop();
      setPlayingVoiceId(null);
    }

    await setVoice(voice);
  };

  const handleClose = () => {
    // 再生中の音声を停止
    if (playingVoiceId) {
      Speech.stop();
      setPlayingVoiceId(null);
    }
    router.back();
  };

  const renderVoiceItem = (voice: VoiceOption) => {
    const isSelected = selectedVoice?.identifier === voice.identifier;
    const isPlaying = playingVoiceId === voice.identifier;

    return (
      <View key={voice.identifier} style={styles.voiceItemContainer}>
        <TouchableOpacity
          style={[styles.voiceItem, isSelected && styles.voiceItemSelected]}
          onPress={() => handleSelectVoice(voice)}
          activeOpacity={0.7}
        >
          <View style={styles.voiceItemLeft}>
            <View style={styles.radioButton}>
              {isSelected && <View style={styles.radioButtonInner} />}
            </View>
            <Text style={styles.voiceName}>{voice.displayName}</Text>
          </View>
          {isSelected && (
            <Ionicons name="checkmark" size={24} color={theme.colors.primary} />
          )}
        </TouchableOpacity>

        {/* 試聴ボタン */}
        <TouchableOpacity
          style={styles.playButton}
          onPress={() => handlePlayVoice(voice)}
          activeOpacity={0.7}
        >
          {isPlaying ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Ionicons
              name="play-circle-outline"
              size={28}
              color={theme.colors.primary}
            />
          )}
        </TouchableOpacity>
      </View>
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
        <Text style={styles.headerTitle}>音声選択</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* 説明文 */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionText}>
          読み上げに使用する音声を選択してください
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>音声を読み込み中...</Text>
          </View>
        ) : availableVoices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="volume-mute-outline" size={48} color={theme.colors.textSecondary} />
            <Text style={styles.emptyText}>
              利用可能な音声が見つかりませんでした。{'\n'}
              システムデフォルトの音声を使用します。
            </Text>
          </View>
        ) : (
          <View style={styles.section}>
            {availableVoices.map(renderVoiceItem)}
          </View>
        )}

        {/* サンプルテキスト表示 */}
        <View style={styles.sampleTextContainer}>
          <Text style={styles.sampleTextLabel}>試聴テキスト:</Text>
          <Text style={styles.sampleText}>{sampleText}</Text>
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

    voiceItemContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
    },

    voiceItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.m,
      paddingHorizontal: theme.spacing.m,
    },

    voiceItemSelected: {
      backgroundColor: `${theme.colors.primary}10`,
    },

    voiceItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },

    radioButton: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.m,
    },

    radioButtonInner: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: theme.colors.primary,
    },

    voiceName: {
      fontSize: theme.fontSize.m,
      fontWeight: theme.fontWeight.medium,
      color: theme.colors.text,
    },

    playButton: {
      width: 56,
      height: 56,
      justifyContent: 'center',
      alignItems: 'center',
      borderLeftWidth: 1,
      borderLeftColor: theme.colors.divider,
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

    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: theme.spacing.xxl,
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
      paddingVertical: theme.spacing.xxl,
      paddingHorizontal: theme.spacing.xl,
    },

    emptyText: {
      marginTop: theme.spacing.m,
      fontSize: theme.fontSize.m,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
  });

export default VoiceSelectionScreen;
