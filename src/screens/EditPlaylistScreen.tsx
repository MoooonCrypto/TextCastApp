// src/screens/EditPlaylistScreen.tsx

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { useTheme } from '../contexts/ThemeContext';
import { Theme } from '../constants/themes';
import { usePlayerStore } from '../stores/usePlayerStore';
import { TextItem, CATEGORIES } from '../types';
import { StorageService } from '../services/StorageService';

interface EditPlaylistScreenProps {
  navigation?: any;
  route?: any;
}

const EditPlaylistScreen: React.FC<EditPlaylistScreenProps> = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const selectedCategory = (params.category as string) || 'all';

  const { theme, themeMode } = useTheme();
  const { playlist, setPlaylist } = usePlayerStore();

  // カテゴリでフィルタリング
  const filteredPlaylist = useMemo(() => {
    return selectedCategory === 'all'
      ? playlist
      : playlist.filter(item => item.category === selectedCategory);
  }, [playlist, selectedCategory]);

  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [data, setData] = useState<TextItem[]>(filteredPlaylist);

  // モーダル状態
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');

  const styles = createStyles(theme);
  const categories = Object.values(CATEGORIES);

  // 選択トグル
  const toggleSelection = (itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // 全選択/全解除
  const toggleSelectAll = () => {
    if (selectedItems.size === data.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(data.map(item => item.id)));
    }
  };

  // 閉じる
  const handleClose = () => {
    // 並び順を保存（フィルタリングされたカテゴリの場合は、他のカテゴリとマージ）
    if (selectedCategory === 'all') {
      setPlaylist(data);
    } else {
      // 他のカテゴリのアイテムと、並び替え後のアイテムをマージ
      const otherItems = playlist.filter(item => item.category !== selectedCategory);
      const reorderedItems = [...data, ...otherItems];
      setPlaylist(reorderedItems);
    }
    router.back();
  };

  // 削除処理（論理削除）
  const handleDelete = async () => {
    if (selectedItems.size === 0) {
      Alert.alert('確認', '対象を選択してください');
      return;
    }

    Alert.alert(
      '削除確認',
      `${selectedItems.size}件のアイテムをゴミ箱に移動しますか？\n（30日間保管されます）`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              // 選択されたアイテムをゴミ箱に移動
              for (const itemId of Array.from(selectedItems)) {
                await StorageService.moveToTrash(itemId);
              }

              // リストから削除
              const newData = data.filter(item => !selectedItems.has(item.id));
              setData(newData);

              // プレイリストを更新
              const { refreshPlaylist } = usePlayerStore.getState();
              await refreshPlaylist();

              // 選択をクリア
              setSelectedItems(new Set());
            } catch (error) {
              console.error('削除エラー:', error);
              Alert.alert('エラー', '削除に失敗しました。');
            }
          },
        },
      ]
    );
  };

  // タイトル変更処理
  const handleRename = () => {
    if (selectedItems.size === 0) {
      Alert.alert('確認', '対象を選択してください');
      return;
    }

    if (selectedItems.size > 1) {
      Alert.alert('確認', '名前変更は1つのアイテムのみ選択してください');
      return;
    }

    const itemId = Array.from(selectedItems)[0];
    const item = data.find(i => i.id === itemId);
    if (!item) return;

    setNewTitle(item.title);
    setShowRenameModal(true);
  };

  const handleRenameConfirm = async () => {
    if (!newTitle.trim() || selectedItems.size !== 1) return;

    const itemId = Array.from(selectedItems)[0];

    try {
      // DBを更新
      await StorageService.updateItem(itemId, { title: newTitle.trim() });

      // ローカルデータを更新
      const newData = data.map(item =>
        item.id === itemId ? { ...item, title: newTitle.trim() } : item
      );
      setData(newData);

      // プレイリストを更新
      const { refreshPlaylist } = usePlayerStore.getState();
      await refreshPlaylist();

      setShowRenameModal(false);
      setSelectedItems(new Set());
      setNewTitle('');
    } catch (error) {
      console.error('タイトル変更エラー:', error);
      Alert.alert('エラー', 'タイトルの変更に失敗しました。');
    }
  };

  // カテゴリ移動処理
  const handleMove = () => {
    if (selectedItems.size === 0) {
      Alert.alert('確認', '対象を選択してください');
      return;
    }
    setShowMoveModal(true);
  };

  const handleMoveToCategory = async (category: string) => {
    if (selectedItems.size === 0) return;

    try {
      // 選択されたアイテムのカテゴリを更新
      for (const itemId of Array.from(selectedItems)) {
        await StorageService.updateItem(itemId, { category });
      }

      // ローカルデータを更新
      const newData = data.map(item =>
        selectedItems.has(item.id) ? { ...item, category } : item
      );
      setData(newData);

      // プレイリストを更新
      const { refreshPlaylist } = usePlayerStore.getState();
      await refreshPlaylist();

      setShowMoveModal(false);
      setSelectedItems(new Set());
    } catch (error) {
      console.error('移動エラー:', error);
      Alert.alert('エラー', '移動に失敗しました。');
    }
  };

  // 新規カテゴリ作成して移動
  const handleCreateNewCategory = () => {
    setShowMoveModal(false);
    setShowNewCategoryModal(true);
  };

  const handleNewCategoryConfirm = async () => {
    if (!newCategoryName.trim() || selectedItems.size === 0) return;

    const trimmedCategoryName = newCategoryName.trim();

    try {
      // 選択されたアイテムを新しいカテゴリに移動
      for (const itemId of Array.from(selectedItems)) {
        await StorageService.updateItem(itemId, { category: trimmedCategoryName });
      }

      // ローカルデータを更新
      const newData = data.map(item =>
        selectedItems.has(item.id) ? { ...item, category: trimmedCategoryName } : item
      );
      setData(newData);

      // プレイリストを更新
      const { refreshPlaylist } = usePlayerStore.getState();
      await refreshPlaylist();

      setShowNewCategoryModal(false);
      setNewCategoryName('');
      setSelectedItems(new Set());
    } catch (error) {
      console.error('カテゴリ作成エラー:', error);
      Alert.alert('エラー', 'カテゴリの作成に失敗しました。');
    }
  };

  // レンダリング
  const renderItem = ({ item, drag, isActive }: RenderItemParams<TextItem>) => {
    const isSelected = selectedItems.has(item.id);

    return (
      <ScaleDecorator>
        <TouchableOpacity
          style={[styles.itemContainer, isActive && styles.itemContainerActive]}
          onPress={() => toggleSelection(item.id)}
          onLongPress={drag}
          disabled={isActive}
          activeOpacity={0.7}
        >
          {/* チェックボックス */}
          <View style={styles.checkbox}>
            {isSelected ? (
              <Ionicons name="checkbox" size={24} color={theme.colors.primary} />
            ) : (
              <Ionicons name="square-outline" size={24} color={theme.colors.textSecondary} />
            )}
          </View>

          {/* カード内容 */}
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.itemSubtitle} numberOfLines={1}>
              {item.category || 'カテゴリなし'} • {Math.floor(item.duration / 60)}分
            </Text>
          </View>

          {/* ドラッグハンドル */}
          <TouchableOpacity
            style={styles.dragHandle}
            onPressIn={drag}
            disabled={isActive}
          >
            <Ionicons name="reorder-three" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.colors.background}
      />

      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {selectedCategory === 'all' ? 'プレイリストを編集' : `${selectedCategory}を編集`}
        </Text>
        <TouchableOpacity onPress={toggleSelectAll} style={styles.selectAllButton}>
          <Text style={styles.selectAllText}>
            {selectedItems.size === data.length ? '全解除' : '全選択'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* リスト */}
      <DraggableFlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        onDragEnd={({ data }) => setData(data)}
        containerStyle={styles.list}
        contentContainerStyle={styles.listContent}
      />

      {/* タイトル変更モーダル */}
      <Modal
        visible={showRenameModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRenameModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>タイトル変更</Text>
            <TextInput
              style={styles.modalInput}
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="新しいタイトルを入力"
              placeholderTextColor={theme.colors.textTertiary}
              maxLength={50}
              autoFocus
            />
            <Text style={styles.charCount}>{newTitle.length}/50</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowRenameModal(false);
                  setNewTitle('');
                }}
              >
                <Text style={styles.modalButtonText}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleRenameConfirm}
                disabled={!newTitle.trim()}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>
                  変更
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* カテゴリ移動モーダル */}
      <Modal
        visible={showMoveModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMoveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>カテゴリを選択</Text>
              <TouchableOpacity onPress={() => setShowMoveModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {/* 新規カテゴリ作成ボタン */}
            <TouchableOpacity
              style={styles.newCategoryButton}
              onPress={handleCreateNewCategory}
            >
              <Ionicons name="add-circle-outline" size={24} color={theme.colors.primary} />
              <Text style={styles.newCategoryButtonText}>新しいカテゴリを作成</Text>
            </TouchableOpacity>

            {/* カテゴリリスト */}
            <ScrollView style={styles.categoryList}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={styles.categoryItem}
                  onPress={() => handleMoveToCategory(category)}
                >
                  <Text style={styles.categoryItemText}>{category}</Text>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 新規カテゴリ作成モーダル */}
      <Modal
        visible={showNewCategoryModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNewCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>新しいカテゴリを作成</Text>
            <TextInput
              style={styles.modalInput}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholder="カテゴリ名を入力"
              placeholderTextColor={theme.colors.textTertiary}
              maxLength={20}
              autoFocus
            />
            <Text style={styles.charCount}>{newCategoryName.length}/20</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowNewCategoryModal(false);
                  setNewCategoryName('');
                }}
              >
                <Text style={styles.modalButtonText}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleNewCategoryConfirm}
                disabled={!newCategoryName.trim()}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextConfirm]}>
                  作成して移動
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 下部アクションバー（常時表示） */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleMove}
        >
          <Ionicons
            name="folder-outline"
            size={20}
            color={theme.colors.text}
          />
          <Text style={styles.actionButtonText}>
            移動
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleDelete}
        >
          <Ionicons
            name="trash-outline"
            size={20}
            color={theme.colors.error}
          />
          <Text style={[styles.actionButtonText, { color: theme.colors.error }]}>
            削除
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleRename}
        >
          <Ionicons
            name="pencil-outline"
            size={20}
            color={theme.colors.text}
          />
          <Text style={styles.actionButtonText}>
            名前変更
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
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
    fontSize: theme.fontSize.l,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    textAlign: 'center',
    marginHorizontal: theme.spacing.s,
  },

  selectAllButton: {
    paddingHorizontal: theme.spacing.s,
    paddingVertical: 4,
  },

  selectAllText: {
    fontSize: theme.fontSize.m,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },

  list: {
    flex: 1,
  },

  listContent: {
    paddingBottom: 100,
  },

  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
    backgroundColor: theme.colors.background,
  },

  itemContainerActive: {
    backgroundColor: theme.colors.surface,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  checkbox: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  itemContent: {
    flex: 1,
    marginHorizontal: theme.spacing.s,
  },

  itemTitle: {
    fontSize: theme.fontSize.m,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: 4,
  },

  itemSubtitle: {
    fontSize: theme.fontSize.s,
    color: theme.colors.textSecondary,
  },

  dragHandle: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.m,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },

  actionButton: {
    alignItems: 'center',
    paddingVertical: theme.spacing.s,
    paddingHorizontal: theme.spacing.m,
  },

  actionButtonText: {
    fontSize: theme.fontSize.s,
    color: theme.colors.text,
    marginTop: 4,
    fontWeight: theme.fontWeight.medium,
  },

  actionButtonTextDisabled: {
    color: theme.colors.textSecondary,
  },

  // モーダルスタイル
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.l,
  },

  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.l,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },

  modalTitle: {
    fontSize: theme.fontSize.l,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    flex: 1,
  },

  modalInput: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    fontSize: theme.fontSize.m,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },

  charCount: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textTertiary,
    textAlign: 'right',
    marginBottom: theme.spacing.m,
  },

  modalButtons: {
    flexDirection: 'row',
    gap: theme.spacing.m,
  },

  modalButton: {
    flex: 1,
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    alignItems: 'center',
  },

  modalButtonCancel: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  modalButtonConfirm: {
    backgroundColor: theme.colors.primary,
  },

  modalButtonText: {
    fontSize: theme.fontSize.m,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },

  modalButtonTextConfirm: {
    color: theme.colors.background,
  },

  newCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.l,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    marginBottom: theme.spacing.m,
    gap: theme.spacing.s,
  },

  newCategoryButtonText: {
    fontSize: theme.fontSize.m,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },

  categoryList: {
    maxHeight: 300,
  },

  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },

  categoryItemText: {
    fontSize: theme.fontSize.m,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium,
  },
});

export default EditPlaylistScreen;
