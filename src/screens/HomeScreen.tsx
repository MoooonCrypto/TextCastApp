// src/screens/HomeScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TextItem } from '../types';
import { theme, createStyles } from '../constants/theme';
import TextItemCard from '../components/TextItemCard';
import { usePlayerStore } from '../stores/usePlayerStore';
import { useTheme } from '../contexts/ThemeContext';

interface HomeScreenProps {
  navigation: any; // React Navigation の型定義
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { playlist, setPlaylist } = usePlayerStore();
  const { theme: currentTheme, themeMode, setThemeMode } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');

  // プレイリストが空の場合は初期化
  useEffect(() => {
    if (playlist.length === 0) {
      setPlaylist([]);
    }
  }, [playlist.length, setPlaylist]);

  // ハンドラーを削除（カード内で処理）

  // アイテム詳細画面への遷移
  const handleItemPress = (item: TextItem) => {
    navigation.navigate('ItemDetail', { itemId: item.id });
  };

  // 新規作成画面への遷移
  const handleAddNew = () => {
    navigation.navigate('AddText');
  };

  // 設定画面への遷移
  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  // テーマ切り替え
  const handleThemeToggle = async () => {
    const nextTheme: 'light' | 'dark' = themeMode === 'dark' ? 'light' : 'dark';
    await setThemeMode(nextTheme);
  };

  // リストのレンダリング - シンプル化
  const renderItem = ({ item }: { item: TextItem }) => (
    <TextItemCard
      item={item}
      onPress={handleItemPress}
    />
  );

  // 空の状態
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name="document-text-outline"
        size={64}
        color={theme.colors.textTertiary}
      />
      <Text style={styles.emptyTitle}>
        まだテキストがありません
      </Text>
      <Text style={styles.emptySubtitle}>
        下のボタンから新しいテキストを追加してみましょう
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[createStyles.safeArea, { backgroundColor: currentTheme.colors.background }]}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={currentTheme.colors.background}
      />
      
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: currentTheme.colors.text }]}>TextCast</Text>
        <View style={styles.headerButtons}>
          {/* テーマ切り替えボタン */}
          <TouchableOpacity
            style={styles.themeButton}
            onPress={handleThemeToggle}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={themeMode === 'dark' ? 'sunny-outline' : 'moon-outline'}
              size={24}
              color={currentTheme.colors.text}
            />
          </TouchableOpacity>

          {/* 設定ボタン */}
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={handleSettings}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="settings-outline"
              size={24}
              color={currentTheme.colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* コンテンツエリア */}
      <View style={styles.content}>
        {/* 統計情報 */}
        <View style={styles.stats}>
          <Text style={styles.statsText}>
            {playlist.length}件のテキスト
          </Text>
          <Text style={styles.statsText}>
            未読: {playlist.filter(item => !item.isCompleted).length}件
          </Text>
        </View>

        {/* テキスト一覧 */}
        <FlatList
          data={playlist}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={playlist.length === 0 ? styles.emptyContainer : undefined}
          ListEmptyComponent={renderEmptyState}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          getItemLayout={(data, index) => (
            { length: 68, offset: 68 * index, index }
          )}
          extraData={playlist.length}
        />
      </View>

      {/* フローティングアクションボタン */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddNew}
        activeOpacity={0.8}
      >
        <Ionicons
          name="add"
          size={24}
          color={theme.colors.background}
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },

  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s,
  },

  themeButton: {
    width: theme.touchTarget.medium,
    height: theme.touchTarget.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  headerTitle: {
    ...createStyles.text.h2,
    fontWeight: theme.fontWeight.bold,
  },
  
  settingsButton: {
    width: theme.touchTarget.medium,
    height: theme.touchTarget.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  content: {
    flex: 1,
  },
  
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  
  statsText: {
    ...createStyles.text.caption,
  },
  
  emptyContainer: {
    flex: 1,
  },
  
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl * 2, // FAB分のスペース
  },
  
  emptyTitle: {
    ...createStyles.text.h3,
    marginTop: theme.spacing.m,
    textAlign: 'center',
  },
  
  emptySubtitle: {
    ...createStyles.text.caption,
    marginTop: theme.spacing.s,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  fab: {
    position: 'absolute',
    bottom: 90, // BottomPlayerの高さ（約80px）+ 余裕を持たせる
    right: theme.spacing.m,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default HomeScreen;