// 音声選択UI実装例
// app/settings.tsx または専用の音声設定画面で使用

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import VoiceService from '../src/services/VoiceService';
import { DeviceVoice } from '../src/types/voice';
import { usePlayerStore } from '../src/stores/usePlayerStore';
import { useTheme } from '../src/contexts/ThemeContext';

export default function VoiceSelectionScreen() {
  const { theme } = useTheme();
  const { selectedVoice, setVoice, pitch, setPitch } = usePlayerStore();

  const [voices, setVoices] = useState<DeviceVoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);

  useEffect(() => {
    loadVoices();
  }, []);

  const loadVoices = async () => {
    setLoading(true);
    try {
      // 日本語音声のみを取得
      const japaneseVoices = await VoiceService.getJapaneseVoices();
      setVoices(japaneseVoices);
    } catch (error) {
      console.error('Failed to load voices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceSelect = (voice: DeviceVoice) => {
    setVoice(voice.identifier);
  };

  const handleVoicePreview = async (voice: DeviceVoice) => {
    setPreviewingVoice(voice.identifier);
    await VoiceService.previewVoice(
      voice.identifier,
      'こんにちは。これはサンプル音声です。'
    );
    setPreviewingVoice(null);
  };

  const renderVoiceItem = ({ item }: { item: DeviceVoice }) => {
    const isSelected = selectedVoice === item.identifier;
    const isPreviewing = previewingVoice === item.identifier;

    return (
      <TouchableOpacity
        style={[
          styles.voiceItem,
          isSelected && styles.voiceItemSelected,
        ]}
        onPress={() => handleVoiceSelect(item)}
      >
        <View style={styles.voiceInfo}>
          <Text style={[styles.voiceName, isSelected && styles.selectedText]}>
            {item.name}
          </Text>
          <Text style={styles.voiceDetail}>
            {item.language} • {item.quality}
          </Text>
        </View>

        <View style={styles.voiceActions}>
          {/* プレビューボタン */}
          <TouchableOpacity
            style={styles.previewButton}
            onPress={() => handleVoicePreview(item)}
            disabled={isPreviewing}
          >
            {isPreviewing ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <Ionicons name="play-circle-outline" size={24} color={theme.colors.primary} />
            )}
          </TouchableOpacity>

          {/* 選択マーク */}
          {isSelected && (
            <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>音声を読み込み中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ピッチ調整 */}
      <View style={styles.pitchSection}>
        <Text style={styles.sectionTitle}>ピッチ調整</Text>
        <View style={styles.pitchControls}>
          <TouchableOpacity
            style={styles.pitchButton}
            onPress={() => setPitch(Math.max(0.5, pitch - 0.1))}
          >
            <Ionicons name="remove" size={20} color={theme.colors.text} />
          </TouchableOpacity>

          <Text style={styles.pitchValue}>{pitch.toFixed(1)}x</Text>

          <TouchableOpacity
            style={styles.pitchButton}
            onPress={() => setPitch(Math.min(2.0, pitch + 0.1))}
          >
            <Ionicons name="add" size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 音声リスト */}
      <Text style={styles.sectionTitle}>利用可能な音声</Text>
      {voices.length === 0 ? (
        <Text style={styles.emptyText}>利用可能な音声がありません</Text>
      ) : (
        <FlatList
          data={voices}
          renderItem={renderVoiceItem}
          keyExtractor={(item) => item.identifier}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  pitchSection: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  pitchControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  pitchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pitchValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    minWidth: 60,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  voiceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  voiceItemSelected: {
    borderColor: '#007bff',
    backgroundColor: '#e7f3ff',
  },
  voiceInfo: {
    flex: 1,
  },
  voiceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  selectedText: {
    color: '#007bff',
  },
  voiceDetail: {
    fontSize: 13,
    color: '#666',
  },
  voiceActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  previewButton: {
    padding: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 32,
    fontSize: 14,
  },
});
