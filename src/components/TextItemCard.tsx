// src/components/TextItemCard.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TextItem } from '../types';
import { theme, createStyles } from '../constants/theme';

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
  // 再生時間を分:秒形式でフォーマット
  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '--:--';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // 日付を相対表示でフォーマット
  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '今日';
    if (diffDays === 1) return '昨日';
    if (diffDays < 7) return `${diffDays}日前`;
    
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
    });
  };

  // 進行状況を計算
  const getProgress = (): number => {
    if (!item.duration || !item.lastPosition) return 0;
    return (item.lastPosition / item.content.length) * 100;
  };

  const progress = getProgress();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        isPlaying && styles.playing,
      ]}
      onPress={() => onPress(item)}
    >
      {/* メインコンテンツエリア */}
      <View style={styles.content}>
        {/* ヘッダー行 */}
        <View style={styles.header}>
          {/* ソースアイコン */}
          <View style={styles.sourceIcon}>
            <Ionicons
              name={getSourceIcon(item.source)}
              size={16}
              color={theme.colors.textSecondary}
            />
          </View>
          
          {/* タイトル */}
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          
          {/* 再生ボタン */}
          <TouchableOpacity
            style={[
              styles.playButton,
              isPlaying && styles.playButtonActive,
            ]}
            onPress={() => onPlay(item)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={16}
              color={isPlaying ? theme.colors.background : theme.colors.text}
            />
          </TouchableOpacity>
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
            <Text style={styles.category}>
              {item.category}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
};

// ソースタイプに応じたアイコンを取得
const getSourceIcon = (source: TextItem['source']): any => {
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
    padding: theme.spacing.m,
    marginVertical: theme.spacing.xs,
    marginHorizontal: theme.spacing.m,
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  } as ViewStyle,
  
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  } as ViewStyle,
  
  playing: {
    borderWidth: 1,
    borderColor: theme.colors.playing,
    backgroundColor: theme.colors.surfaceSecondary,
  } as ViewStyle,
  
  content: {
    gap: theme.spacing.s,
  } as ViewStyle,
  
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.s,
  } as ViewStyle,
  
  sourceIcon: {
    marginTop: 2,
  } as ViewStyle,
  
  title: {
    fontSize: theme.fontSize.m,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    lineHeight: theme.fontSize.m * 1.4,
    flex: 1,
  } as TextStyle,
  
  playButton: {
    width: theme.touchTarget.small,
    height: theme.touchTarget.small,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  
  playButtonActive: {
    backgroundColor: theme.colors.playing,
  } as ViewStyle,
  
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: theme.spacing.l, // sourceIcon分のインデント
  } as ViewStyle,
  
  date: {
    fontSize: theme.fontSize.s,
    fontWeight: theme.fontWeight.normal,
    color: theme.colors.textSecondary,
    lineHeight: theme.fontSize.s * 1.3,
  } as TextStyle,
  
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.textTertiary,
    marginHorizontal: theme.spacing.s,
  } as ViewStyle,
  
  duration: {
    fontSize: theme.fontSize.s,
    fontWeight: theme.fontWeight.normal,
    color: theme.colors.textSecondary,
    lineHeight: theme.fontSize.s * 1.3,
  } as TextStyle,
  
  playCount: {
    fontSize: theme.fontSize.s,
    fontWeight: theme.fontWeight.normal,
    color: theme.colors.textSecondary,
    lineHeight: theme.fontSize.s * 1.3,
  } as TextStyle,
  
  importance: {
    marginLeft: theme.spacing.s,
  } as ViewStyle,
  
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s,
    paddingLeft: theme.spacing.l,
  } as ViewStyle,
  
  progressBackground: {
    flex: 1,
    height: 2,
    backgroundColor: theme.colors.progressBackground,
    borderRadius: 1,
    overflow: 'hidden',
  } as ViewStyle,
  
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.progress,
  } as ViewStyle,
  
  progressText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.normal,
    color: theme.colors.textTertiary,
    lineHeight: theme.fontSize.xs * 1.3,
    minWidth: 30,
    textAlign: 'right',
  } as TextStyle,
  
  categoryContainer: {
    alignSelf: 'flex-start',
    paddingLeft: theme.spacing.l,
  } as ViewStyle,
  
  category: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.normal,
    color: theme.colors.textTertiary,
    lineHeight: theme.fontSize.xs * 1.3,
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.s,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.s,
    overflow: 'hidden',
  } as TextStyle,
});

export default TextItemCard;