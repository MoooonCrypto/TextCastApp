// src/screens/SearchScreen.tsx

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  Keyboard,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../contexts/ThemeContext';
import { Theme } from '../constants/themes';
import { usePlayerStore } from '../stores/usePlayerStore';
import { TextItem } from '../types';
import TextItemCard from '../components/TextItemCard';
import BottomPlayer from '../components/BottomPlayer';
import FullScreenPlayer from '../components/FullScreenPlayer';

const SearchScreen: React.FC = () => {
  const router = useRouter();
  const { theme, themeMode } = useTheme();
  const { playlist } = usePlayerStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFullScreenPlayer, setShowFullScreenPlayer] = useState(false);

  const styles = createStyles(theme);

  // 検索結果をフィルタリング（タイトルのみ）
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    const query = searchQuery.toLowerCase();
    return playlist.filter(item =>
      item.title.toLowerCase().includes(query)
    );
  }, [searchQuery, playlist]);

  // キャンセルボタン
  const handleCancel = () => {
    Keyboard.dismiss();
    router.back();
  };

  // アイテムタップ - 検索画面上で再生（画面遷移なし）
  const handleItemPress = (item: TextItem) => {
    // キーボードを閉じる
    Keyboard.dismiss();

    // プレイヤーで再生開始（画面遷移はしない）
    const { play } = usePlayerStore.getState();
    play(item.id);
  };

  // レンダリング
  const renderItem = ({ item }: { item: TextItem }) => (
    <TextItemCard item={item} onPress={handleItemPress} />
  );

  const renderEmptyState = () => {
    if (!searchQuery.trim()) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={64} color={theme.colors.textSecondary} />
          <Text style={styles.emptyText}>
            タイトルから検索
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-text-outline" size={64} color={theme.colors.textSecondary} />
        <Text style={styles.emptyText}>
          "{searchQuery}" に一致する結果がありません
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />

      {/* 検索バー */}
      <View style={styles.searchBar}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="検索"
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={true}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>キャンセル</Text>
        </TouchableOpacity>
      </View>

      {/* 検索結果 */}
      <FlatList
        data={searchResults}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={searchResults.length === 0 ? styles.emptyListContent : styles.listContent}
        keyboardShouldPersistTaps="handled"
      />

      {/* グローバルプレイヤー */}
      <BottomPlayer onExpand={() => setShowFullScreenPlayer(true)} />

      {/* フルスクリーンプレイヤーモーダル */}
      <Modal
        visible={showFullScreenPlayer}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowFullScreenPlayer(false)}
      >
        <FullScreenPlayer onClose={() => setShowFullScreenPlayer(false)} />
      </Modal>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },

  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    paddingHorizontal: theme.spacing.s,
    height: 40,
  },

  searchIcon: {
    marginRight: theme.spacing.xs,
  },

  searchInput: {
    flex: 1,
    fontSize: theme.fontSize.m,
    color: theme.colors.text,
    padding: 0,
  },

  cancelButton: {
    marginLeft: theme.spacing.s,
    paddingHorizontal: theme.spacing.s,
    paddingVertical: theme.spacing.xs,
  },

  cancelButtonText: {
    fontSize: theme.fontSize.m,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },

  listContent: {
    paddingBottom: theme.spacing.xl,
  },

  emptyListContent: {
    flex: 1,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },

  emptyText: {
    fontSize: theme.fontSize.m,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.m,
  },
});

export default SearchScreen;
