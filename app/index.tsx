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

// AddTextScreen コンポーネント
interface AddTextScreenProps {
  onClose: () => void;
}

const AddTextScreen: React.FC<AddTextScreenProps> = ({ onClose }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <SafeAreaView style={[styles.addScreenContainer, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />

      <View style={styles.addScreenHeader}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons
            name="close"
            size={24}
            color={theme.colors.text}
          />
        </TouchableOpacity>
        <Text style={styles.addScreenTitle}>新規作成</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.saveButtonText}>保存</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.addScreenContent}>
        <Text style={styles.inputLabel}>タイトル</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.placeholderText}>記事タイトルを入力...</Text>
        </View>

        <Text style={styles.inputLabel}>本文</Text>
        <View style={[styles.inputContainer, styles.textAreaContainer]}>
          <Text style={styles.placeholderText}>本文を入力するか、URLやファイルから読み込み...</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// メインコンポーネント
export default function HomeScreen() {
  return <MainHomeScreen />;
}

function MainHomeScreen() {
  const { theme, themeMode, setThemeMode } = useTheme();
  const { playlist, currentItemId } = usePlayerStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [showFullScreenPlayer, setShowFullScreenPlayer] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [categories, setCategories] = useState<CategoryItem[]>(CATEGORIES);

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
    console.log('検索画面を開く');
  };

  const handleSettingsPress = (): void => {
    console.log('設定画面を開く');
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
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={handleMenuPress} style={styles.headerButton}>
              <Ionicons name="menu" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>TextCast</Text>
          </View>
          
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
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color={theme.colors.background} />
        </TouchableOpacity>


        {/* 新規作成モーダル */}
        <Modal
          visible={showAddModal}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setShowAddModal(false)}
        >
          <AddTextScreen onClose={() => setShowAddModal(false)} />
        </Modal>

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
    paddingVertical: theme.spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },

  headerTitle: {
    fontSize: theme.fontSize.l,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginLeft: theme.spacing.s,
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

  // AddScreen スタイル
  addScreenContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  addScreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },

  addScreenTitle: {
    fontSize: theme.fontSize.l,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },

  saveButtonText: {
    fontSize: theme.fontSize.m,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },

  addScreenContent: {
    padding: theme.spacing.m,
  },

  inputLabel: {
    fontSize: theme.fontSize.s,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.s,
    marginTop: theme.spacing.l,
  },

  inputContainer: {
    padding: theme.spacing.m,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    minHeight: 50,
    justifyContent: 'center',
  },

  textAreaContainer: {
    minHeight: 150,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },

  placeholderText: {
    color: theme.colors.textTertiary,
    fontSize: theme.fontSize.m,
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