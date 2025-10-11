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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { useTheme } from '../contexts/ThemeContext';
import { Theme } from '../constants/themes';
import { usePlayerStore } from '../stores/usePlayerStore';
import { TextItem } from '../types';

interface EditPlaylistScreenProps {
  navigation?: any;
  route?: any;
}

const EditPlaylistScreen: React.FC<EditPlaylistScreenProps> = () => {
  const router = useRouter();
  const { theme, themeMode } = useTheme();
  const { playlist, setPlaylist } = usePlayerStore();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [data, setData] = useState<TextItem[]>(playlist);

  const styles = createStyles(theme);

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
    // 並び順を保存
    setPlaylist(data);
    router.back();
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
        <Text style={styles.headerTitle}>プレイリストを編集</Text>
        <TouchableOpacity onPress={toggleSelectAll} style={styles.selectAllButton}>
          <Text style={styles.selectAllText}>
            {selectedItems.size === playlist.length ? '全解除' : '全選択'}
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

      {/* 下部アクションバー（常時表示） */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Alert.alert('移動', '移動機能は後で実装')}
          disabled={selectedItems.size === 0}
        >
          <Ionicons
            name="folder-outline"
            size={20}
            color={selectedItems.size > 0 ? theme.colors.text : theme.colors.textSecondary}
          />
          <Text
            style={[
              styles.actionButtonText,
              selectedItems.size === 0 && styles.actionButtonTextDisabled
            ]}
          >
            移動
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Alert.alert('削除', '削除機能は後で実装')}
          disabled={selectedItems.size === 0}
        >
          <Ionicons
            name="trash-outline"
            size={20}
            color={selectedItems.size > 0 ? theme.colors.error : theme.colors.textSecondary}
          />
          <Text
            style={[
              styles.actionButtonText,
              selectedItems.size > 0 ? { color: theme.colors.error } : styles.actionButtonTextDisabled
            ]}
          >
            削除
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => Alert.alert('タイトル変更', 'タイトル変更機能は後で実装')}
          disabled={selectedItems.size !== 1}
        >
          <Ionicons
            name="pencil-outline"
            size={20}
            color={selectedItems.size === 1 ? theme.colors.text : theme.colors.textSecondary}
          />
          <Text
            style={[
              styles.actionButtonText,
              selectedItems.size !== 1 && styles.actionButtonTextDisabled
            ]}
          >
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
});

export default EditPlaylistScreen;
