import React, { useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Theme } from '../constants/themes';
import { usePlayerStore } from '../stores/usePlayerStore';

interface FullScreenPlayerProps {
  onClose: () => void;
}

const FullScreenPlayer: React.FC<FullScreenPlayerProps> = ({ onClose }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { getCurrentItem, currentPosition, duration, isPlaying } = usePlayerStore();

  const scrollViewRef = useRef<ScrollView>(null);
  const currentItem = getCurrentItem();

  if (!currentItem) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="chevron-down" size={32} color={theme.colors.text} />
          </Pressable>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>再生中のアイテムがありません</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* ヘッダー: 閉じるボタン */}
      <View style={styles.header}>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <Ionicons name="chevron-down" size={32} color={theme.colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>{currentItem.title}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* メインコンテンツ: テキスト表示エリア */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.contentContainer}
        contentContainerStyle={styles.contentInner}
        showsVerticalScrollIndicator={true}
      >
        <Text style={styles.contentText}>{currentItem.content}</Text>
      </ScrollView>

      {/* フッター: 進捗情報 */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {formatTime(currentPosition)} / {formatTime(duration)}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const createStyles = (theme: Theme) => StyleSheet.create({
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
  },

  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    flex: 1,
    fontSize: theme.fontSize.m,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    textAlign: 'center',
    marginHorizontal: theme.spacing.s,
  },

  headerSpacer: {
    width: 44,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyText: {
    fontSize: theme.fontSize.m,
    color: theme.colors.textSecondary,
  },

  contentContainer: {
    flex: 1,
  },

  contentInner: {
    padding: theme.spacing.l,
    paddingBottom: theme.spacing.xxl,
  },

  contentText: {
    fontSize: 17,
    lineHeight: 28,
    color: theme.colors.text,
    fontWeight: '400',
  },

  footer: {
    padding: theme.spacing.m,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    alignItems: 'center',
  },

  footerText: {
    fontSize: theme.fontSize.s,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
});

export default FullScreenPlayer;
