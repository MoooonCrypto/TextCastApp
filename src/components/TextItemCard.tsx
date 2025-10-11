// src/components/TextItemCard.tsx - シンプル版（再生ボタンのみ）
import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TextItem } from '../types';
import { theme } from '../constants/theme';
import { usePlayerStore } from '../stores/usePlayerStore';

interface TextItemCardProps {
  item: TextItem;
  onPress?: (item: TextItem) => void;
}

const TextItemCard: React.FC<TextItemCardProps> = React.memo(({
  item,
  onPress,
}) => {
  const {
    currentItemId,
    isPlaying,
    isLoading,
    play,
    pause,
    resume,
  } = usePlayerStore();

  const isCurrentItem = currentItemId === item.id;
  const isCurrentlyPlaying = isCurrentItem && isPlaying;
  const isCurrentlyLoading = isCurrentItem && isLoading;


  const handleCardPress = async () => {
    // カード全体タップで再生/一時停止
    if (isCurrentlyLoading) {
      return;
    }

    if (isCurrentItem) {
      if (isPlaying) {
        await pause();
      } else {
        await resume();
      }
    } else {
      await play(item.id);
    }

    // onPressが渡されている場合は追加で実行（検索画面用など）
    if (onPress) {
      onPress(item);
    }
  };

  // 時間フォーマット関数
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}分${remainingSeconds > 0 ? `${Math.round(remainingSeconds)}秒` : ''}`;
    }
    return `${Math.round(remainingSeconds)}秒`;
  };


  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        isCurrentItem && styles.currentItem,
        pressed && styles.pressed,
      ]}
      onPress={handleCardPress}
    >
      <View style={styles.content}>
        {/* メイン情報行 */}
        <View style={styles.mainInfo}>
          <Ionicons
            name={getSourceIcon(item.source)}
            size={16}
            color={theme.colors.textSecondary}
            style={styles.sourceIcon}
          />

          <View style={styles.textContainer}>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.duration} numberOfLines={1}>
              {formatDuration(item.duration || 0)}
            </Text>
          </View>


        </View>

      </View>
    </Pressable>
  );
});

// ソースタイプに応じたアイコンを取得
const getSourceIcon = (source: TextItem['source']): keyof typeof Ionicons.glyphMap => {
  switch (source) {
    case 'file':
      return 'document-text-outline';
    case 'url':
      return 'globe-outline';
    case 'camera':
      return 'camera-outline';
    case 'manual':
    default:
      return 'create-outline';
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    marginVertical: theme.spacing.xs,
    marginHorizontal: theme.spacing.m,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },

  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },

  currentItem: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surfaceSecondary,
  },

  content: {
    padding: theme.spacing.m,
  },

  mainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s,
  },

  sourceIcon: {
    marginRight: theme.spacing.xs,
  },

  textContainer: {
    flex: 1,
  },

  title: {
    fontSize: theme.fontSize.m,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: 2,
  },

  duration: {
    fontSize: theme.fontSize.s,
    color: theme.colors.textSecondary,
  },



});

export default TextItemCard;