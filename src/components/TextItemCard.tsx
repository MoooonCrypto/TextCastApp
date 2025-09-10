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
  // 日付フォーマット
  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '今日';
    if (diffDays === 1) return '昨日';
    if (diffDays < 7) return `${diffDays}日前`;
    
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
    });
  };

  // 再生時間フォーマット
  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '--';
    const minutes = Math.floor(seconds / 60);
    return `${minutes}分`;
  };

  // 進行状況計算
  const progress = item.lastPosition && item.duration 
    ? (item.lastPosition / item.content.length) * 100 
    : 0;

  // カード全体のタップハンドラー
  const handleCardPress = () => {
    // カード自体をタップで再生開始
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
        {/* ヘッダー行 */}
        <View style={styles.header}>
          <Ionicons
            name={getSourceIcon(item.source)}
            size={16}
            color={theme.colors.textSecondary}
            style={styles.sourceIcon}
          />
          
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          
          {/* 詳細ボタン */}
          <Pressable
            style={styles.detailsButton}
            onPress={handleDetailsPress}
            hitSlop={8}
          >
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={theme.colors.textSecondary}
            />
          </Pressable>
        </View>

        {/* メタ情報行 */}
        <View style={styles.meta}>
          <Text style={styles.date}>
            {formatDate(item.createdAt)}
          </Text>
          
          <View style={styles.metaDivider} />
          
          <Text style={styles.duration}>
            {formatDuration(item.duration)}
          </Text>
          
          {item.playCount > 0 && (
            <>
              <View style={styles.metaDivider} />
              <Text style={styles.playCount}>
                {item.playCount}回再生
              </Text>
            </>
          )}
          
          {item.importance > 1 && (
            <View style={styles.importance}>
              <Ionicons
                name="star"
                size={12}
                color={getImportanceColor(item.importance)}
              />
            </View>
          )}
        </View>

        {/* 進行状況バー */}
        {progress > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(progress, 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(progress)}%
            </Text>
          </View>
        )}

        {/* カテゴリタグ */}
        {item.category && (
          <View style={styles.categoryContainer}>
            <View style={styles.categoryBadge}>
              <Text style={styles.category}>
                {item.category}
              </Text>
            </View>
          </View>
        )}

        {/* 再生中インジケーター */}
        {isPlaying && (
          <View style={styles.playingIndicator}>
            <Ionicons
              name="volume-medium"
              size={16}
              color={theme.colors.playing}
            />
            <Text style={styles.playingText}>再生中</Text>
          </View>
        )}
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
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.s, // paddingを`m`から`s`に変更して縦幅を削減
    marginVertical: theme.spacing.xs,
    marginHorizontal: theme.spacing.m,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
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
    gap: theme.spacing.xs, // gapも`s`から`xs`に変更してさらに縦幅を削減
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.s,
  },
  
  sourceIcon: {
    marginTop: 2,
  },
  
  title: {
    fontSize: theme.fontSize.m,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    lineHeight: theme.fontSize.m * 1.3, // lineHeightも少し削減
    flex: 1,
  },
  
  detailsButton: {
    padding: theme.spacing.xs,
  },
  
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: theme.spacing.l, // sourceIcon分のインデント
  },
  
  date: {
    fontSize: theme.fontSize.s,
    fontWeight: theme.fontWeight.normal,
    color: theme.colors.textSecondary,
    lineHeight: theme.fontSize.s * 1.3,
  },
  
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.textTertiary,
    marginHorizontal: theme.spacing.s,
  },
  
  duration: {
    fontSize: theme.fontSize.s,
    fontWeight: theme.fontWeight.normal,
    color: theme.colors.textSecondary,
    lineHeight: theme.fontSize.s * 1.3,
  },
  
  playCount: {
    fontSize: theme.fontSize.s,
    fontWeight: theme.fontWeight.normal,
    color: theme.colors.textSecondary,
    lineHeight: theme.fontSize.s * 1.3,
  },
  
  importance: {
    marginLeft: theme.spacing.s,
  },
  
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s,
    paddingLeft: theme.spacing.l,
  },
  
  progressBackground: {
    flex: 1,
    height: 2,
    backgroundColor: theme.colors.progressBackground,
    borderRadius: 1,
    overflow: 'hidden',
  },
  
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.progress,
  },
  
  progressText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.normal,
    color: theme.colors.textTertiary,
    lineHeight: theme.fontSize.xs * 1.3,
    minWidth: 30,
  },
  
  categoryContainer: {
    alignSelf: 'flex-start',
    paddingLeft: theme.spacing.l,
  },
  
  categoryBadge: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.s,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.s,
  },
  
  category: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.normal,
    color: theme.colors.textTertiary,
    lineHeight: theme.fontSize.xs * 1.3,
  },

  playingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: theme.spacing.l,
    gap: theme.spacing.xs,
  },

  playingText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.playing,
  },
});

export default TextItemCard;