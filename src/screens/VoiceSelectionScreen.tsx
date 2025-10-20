// src/screens/VoiceSelectionScreen.tsx
import React, { useState } from 'react';
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

      await Speech.speak(sampleText, {
        language: 'ja-JP',
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
        <View style={styles.section}>
          {DEFAULT_VOICES.map(renderVoiceItem)}
        </View>

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
  });

export default VoiceSelectionScreen;
