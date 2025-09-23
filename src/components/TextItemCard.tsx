// src/components/TextItemCard.tsx
import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TextItem } from '../types';
import { theme } from '../constants/theme';

interface TextItemCardProps {
  item: TextItem;
  onPlay: (item: TextItem) => void;
  onPress: (item: TextItem) => void;
  isPlaying?: boolean;
}

const TextItemCard: React.FC<TextItemCardProps> = ({
  item,
  onPlay,
  onPress,
  isPlaying = false,
}) => {
  // カード全体のタップハンドラー
  const handleCardPress = () => {
    onPlay(item);
  };

  // 詳細ボタンのタップハンドラー（バブリング停止）
  const handleDetailsPress = (event: any) => {
    event.stopPropagation();
    onPress(item);
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        isPlaying && styles.playing,
        pressed && styles.pressed,
      ]}
      onPress={handleCardPress}
    >
      <View style={styles.content}>
        {/* シンプルなタイトル行のみ */}
        <View style={styles.header}>
          <Ionicons
            name={getSourceIcon(item.source)}
            size={14}
            color={theme.colors.textSecondary}
            style={styles.sourceIcon}
          />
          
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          
          {/* 再生中インジケーター */}
          {isPlaying && (
            <Ionicons
              name="volume-medium"
              size={16}
              color={theme.colors.playing}
            />
          )}
          
          {/* 詳細ボタン */}
          <Pressable
            style={styles.detailsButton}
            onPress={handleDetailsPress}
            hitSlop={8}
          >
            <Ionicons
              name="chevron-forward"
              size={16}
              color={theme.colors.textSecondary}
            />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
};

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

// 重要度に応じた色を取得
const getImportanceColor = (importance: number): string => {
  switch (importance) {
    case 3:
      return theme.colors.error;
    case 2:
      return theme.colors.warning;
    default:
      return theme.colors.textSecondary;
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    paddingVertical: theme.spacing.s,
    paddingHorizontal: theme.spacing.m,
    marginVertical: theme.spacing.xs,
    marginHorizontal: theme.spacing.m,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    minHeight: 52,
  },
  
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  
  playing: {
    borderWidth: 1,
    borderColor: theme.colors.playing,
    backgroundColor: theme.colors.surfaceSecondary,
  },
  
  content: {
    justifyContent: 'center',
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s,
  },
  
  sourceIcon: {
    // アイコンを中央揃えに
  },
  
  title: {
    fontSize: theme.fontSize.m,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    flex: 1,
  },
  
  detailsButton: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
});

export default TextItemCard;