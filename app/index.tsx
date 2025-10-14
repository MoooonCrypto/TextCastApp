// app/index.tsx - TTS統合版

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Modal,
  ScrollView,
  ListRenderItem,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TextItem } from '../src/types';
import TextItemCard from '../src/components/TextItemCard';
import BottomPlayer from '../src/components/BottomPlayer';
import FullScreenPlayer from '../src/components/FullScreenPlayer';
import { usePlayerStore } from '../src/stores/usePlayerStore';
import { useTheme } from '../src/contexts/ThemeContext';
import { Theme } from '../src/constants/themes';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// カテゴリ型定義
interface CategoryItem {
  id: string;
  name: string;
  icon: string;
}

// カテゴリ定義（mockDataと一致）
const CATEGORIES: CategoryItem[] = [
  { id: 'all', name: '全て', icon: 'library-outline' },
  { id: 'プログラミング', name: 'プログラミング', icon: 'code-outline' },
  { id: 'モバイル開発', name: 'モバイル開発', icon: 'phone-portrait-outline' },
  { id: 'デザイン', name: 'デザイン', icon: 'color-palette-outline' },
  { id: 'テクノロジー', name: 'テクノロジー', icon: 'hardware-chip-outline' },
  { id: '自己啓発', name: '自己啓発', icon: 'bulb-outline' },
];

// メインコンポーネント
export default function HomeScreen() {
  return <MainHomeScreen />;
}

function MainHomeScreen() {
  const router = useRouter();
  const { theme, themeMode, setThemeMode } = useTheme();
  const { playlist, currentItemId } = usePlayerStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [showFullScreenPlayer, setShowFullScreenPlayer] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [categories, setCategories] = useState<CategoryItem[]>(CATEGORIES);

  // DB初期化 + データ読み込み（アプリ起動時に1回だけ）
  React.useEffect(() => {
    const initDB = async () => {
      const { StorageService } = await import('../src/services/StorageService');
      await StorageService.initialize();

      // 開発環境: アイテムがない場合はモックデータをシード
      if (__DEV__) {
        const items = await StorageService.getItems();
        if (items.length === 0) {
          const { DevTools } = await import('../src/utils/DevTools');
          await DevTools.seedMockData();
          console.log('✅ モックデータ追加完了');
        }
      }

      // DBからアイテムを読み込む
      const { loadItemsFromDB } = usePlayerStore.getState();
      await loadItemsFromDB();
    };
    initDB();
  }, []);

  // プレイリストが更新されたらカテゴリリストも更新
  React.useEffect(() => {
    const updateCategories = () => {
      // プレイリストから一意のカテゴリを抽出
      const uniqueCategories = Array.from(
        new Set(playlist.map(item => item.category))
      ).sort();

      // カテゴリアイテムに変換（デフォルトアイコン使用）
      const dynamicCategories: CategoryItem[] = uniqueCategories.map(cat => ({
        id: cat,
        name: cat,
        icon: 'folder-outline', // 動的カテゴリはフォルダアイコン
      }));

      // 「全て」を先頭に追加
      setCategories([
        { id: 'all', name: '全て', icon: 'library-outline' },
        ...dynamicCategories,
      ]);
    };

    updateCategories();
  }, [playlist]);

  // フィルタリングされたアイテム
  const filteredItems: TextItem[] = playlist.filter(item =>
    selectedCategory === 'all' || item.category === selectedCategory
  );

  // ストアのデータを使用（既にmockTextItemsが読み込まれている）

  // 削除（カード内で処理）

  const handleItemPress = (item: TextItem): void => {
    console.log('アイテム詳細:', item.title);
  };

  // ヘッダーボタンハンドラー
  const handleMenuPress = (): void => {
    console.log('サイドメニューを開く');
  };

  const handleSearchPress = (): void => {
    router.push('/search');
  };

  const handleSettingsPress = (): void => {
    router.push('/settings');
  };

  const handleThemeToggle = (): void => {
    const nextMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(nextMode);
  };

  const handleAddCategory = (): void => {
    if (!newCategoryName.trim()) {
      Alert.alert('エラー', 'カテゴリ名を入力してください');
      return;
    }

    const newCategory: CategoryItem = {
      id: newCategoryName.trim(),
      name: newCategoryName.trim(),
      icon: 'bookmark-outline',
    };

    setCategories([...categories, newCategory]);
    setNewCategoryName('');
    setShowCategoryModal(false);
  };

  const handleCancelCategory = (): void => {
    setNewCategoryName('');
    setShowCategoryModal(false);
  };

  // スタイル生成
  const styles = createStyles(theme);

  // レンダリング関数
  const renderItem: ListRenderItem<TextItem> = ({ item }) => (
    <TextItemCard
      item={item}
      onPress={handleItemPress}
    />
  );

  const renderCategoryItem: ListRenderItem<CategoryItem> = ({ item }) => (
      <TouchableOpacity
        style={[
          styles.categoryItem,
          selectedCategory === item.id && styles.categoryItemActive,
        ]}
        onPress={() => setSelectedCategory(item.id)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={item.icon as keyof typeof Ionicons.glyphMap}
          size={18}
          color={
            selectedCategory === item.id
              ? theme.colors.background
              : theme.colors.text
          }
          style={styles.categoryIcon}
        />
        <Text
          style={[
            styles.categoryText,
            selectedCategory === item.id && styles.categoryTextActive,
          ]}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
        
        {/* ヘッダー */}
        <View style={styles.header}>
          {/* 左側: 編集ボタン */}
          <TouchableOpacity
            onPress={() => router.push({
              pathname: '/edit-playlist',
              params: { category: selectedCategory }
            })}
            style={styles.headerButton}
          >
            <Ionicons name="create-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>

          <View style={styles.headerSpacer} />

          {/* 右側: その他のボタン */}
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={handleThemeToggle} style={styles.headerButton}>
              <Ionicons
                name={themeMode === 'light' ? 'sunny' : 'moon'}
                size={24}
                color={theme.colors.text}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSearchPress} style={styles.headerButton}>
              <Ionicons name="search" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSettingsPress} style={styles.headerButton}>
              <Ionicons name="settings" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* カテゴリフィルタ */}
        <View style={styles.categoryContainer}>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
            ListFooterComponent={
              <TouchableOpacity
                style={styles.addCategoryButton}
                onPress={() => setShowCategoryModal(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={18} color={theme.colors.primary} />
              </TouchableOpacity>
            }
          />
        </View>

        {/* アイテムリスト */}
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.listContainer}
          contentContainerStyle={{
            paddingBottom: 130 // 縮小されたミニプレイヤー + 余白
          }}
        />

        {/* FAB */}
        <TouchableOpacity
          style={[
            styles.fab,
            { bottom: 140 } // 縮小されたミニプレイヤー + 余白
          ]}
          onPress={() => router.push('/add-material')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color={theme.colors.background} />
        </TouchableOpacity>

        {/* カテゴリ追加モーダル */}
        <Modal
          visible={showCategoryModal}
          animationType="fade"
          transparent={true}
          onRequestClose={handleCancelCategory}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                新しいカテゴリを追加
              </Text>

              <TextInput
                style={[
                  styles.categoryInput,
                  {
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  }
                ]}
                placeholder="カテゴリ名を入力"
                placeholderTextColor={theme.colors.textTertiary}
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                autoFocus
                maxLength={20}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: theme.colors.surfaceSecondary }]}
                  onPress={handleCancelCategory}
                >
                  <Text style={[styles.modalButtonText, { color: theme.colors.textSecondary }]}>
                    キャンセル
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                  onPress={handleAddCategory}
                >
                  <Text style={[styles.modalButtonText, { color: theme.colors.background }]}>
                    追加
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* フルスクリーンプレイヤーモーダル */}
        <Modal
          visible={showFullScreenPlayer}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setShowFullScreenPlayer(false)}
        >
          <FullScreenPlayer onClose={() => setShowFullScreenPlayer(false)} />
        </Modal>

        {/* 固定ボトムプレイヤー */}
        <BottomPlayer onExpand={() => setShowFullScreenPlayer(true)} />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: 0,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
    height: 44,
  },

  headerSpacer: {
    flex: 1,
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 0,
  },

  categoryContainer: {
    paddingVertical: theme.spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },

  categoryList: {
    paddingHorizontal: theme.spacing.m,
  },

  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    marginRight: theme.spacing.s,
    borderRadius: theme.borderRadius.l,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    height: 40,
  },

  categoryItemActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },

  categoryIcon: {
    marginRight: theme.spacing.xs,
  },

  categoryText: {
    fontSize: theme.fontSize.s,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },

  categoryTextActive: {
    color: theme.colors.background,
  },

  listContainer: {
    flex: 1,
  },

  fab: {
    position: 'absolute',
    bottom: 20,
    right: theme.spacing.m,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },

  // カテゴリ追加ボタン
  addCategoryButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.s,
  },

  // モーダルスタイル
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContainer: {
    width: '80%',
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },

  modalTitle: {
    fontSize: theme.fontSize.l,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing.l,
    textAlign: 'center',
  },

  categoryInput: {
    borderWidth: 1,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    fontSize: theme.fontSize.m,
    marginBottom: theme.spacing.l,
  },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.m,
  },

  modalButton: {
    flex: 1,
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    alignItems: 'center',
  },

  modalButtonText: {
    fontSize: theme.fontSize.m,
    fontWeight: theme.fontWeight.semibold,
  },
});