// app/index.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { TextItem } from '../src/types';

// テンポラリデータ
const mockTextItems: TextItem[] = [
  {
    id: '1',
    title: 'AI技術の現状と未来',
    content: 'AI技術は急速に発展しており、様々な分野で活用が期待されています...',
    source: 'url',
    sourceUrl: 'https://example.com/ai-article',
    category: '学習',
    tags: ['AI', 'テクノロジー'],
    importance: 3,
    createdAt: new Date('2024-08-20'),
    updatedAt: new Date('2024-08-20'),
    duration: 300,
    lastPosition: 0,
    playCount: 2,
    isCompleted: false,
    bookmarks: [],
    notes: [],
    isFavorite: false,
  },
  {
    id: '2',
    title: 'React Nativeベストプラクティス',
    content: 'React Nativeでアプリ開発をする際のベストプラクティスについて...',
    source: 'file',
    fileName: 'react-native-guide.pdf',
    category: 'ビジネス',
    tags: ['React Native', 'モバイル開発'],
    importance: 2,
    createdAt: new Date('2024-08-19'),
    updatedAt: new Date('2024-08-19'),
    duration: 480,
    lastPosition: 120,
    playCount: 1,
    isCompleted: false,
    bookmarks: [],
    notes: [],
    isFavorite: true,
  },
];

const categories = ['フリー書籍', '資格勉強', '論文', '英単語暗記用'];

export default function MainScreen() {
  const [textItems, setTextItems] = useState<TextItem[]>(mockTextItems);
  const [selectedCategory, setSelectedCategory] = useState('フリー書籍');
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);

  // テーマ色（ダークテーマベース）
  const theme = {
    colors: {
      background: '#121212',
      surface: '#1E1E1E',
      primary: '#BB86FC',
      secondary: '#03DAC6',
      text: '#FFFFFF',
      textSecondary: '#B3B3B3',
      textTertiary: '#666666',
      border: '#333333',
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
    }
  };

  // 時間フォーマット関数
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 再生処理
  const handlePlay = (itemId: string) => {
    if (currentPlayingId === itemId) {
      setCurrentPlayingId(null);
    } else {
      setCurrentPlayingId(itemId);
    }
  };

  // 設定画面への遷移
  const handleSettings = () => {
    router.push('/settings');
  };

  // 検索機能（将来実装）
  const handleSearch = () => {
    Alert.alert('検索', '検索機能は今後実装予定です。');
  };

  // 素材追加画面への遷移
  const handleAddMaterial = () => {
    router.push('/add-material');
  };

  // アイテム詳細表示
  const handleItemPress = (item: TextItem) => {
    Alert.alert('詳細表示', `"${item.title}" の詳細画面は今後実装予定です。`);
  };

  // 重要度に応じた色を取得
  const getImportanceColor = (importance: 1 | 2 | 3): string => {
    switch (importance) {
      case 1: return theme.colors.textTertiary;
      case 2: return theme.colors.warning;
      case 3: return theme.colors.error;
      default: return theme.colors.textTertiary;
    }
  };

  // TextItemCard コンポーネント
  const TextItemCard: React.FC<{
    item: TextItem;
    onPlay: (id: string) => void;
    onPress: (item: TextItem) => void;
    isPlaying: boolean;
  }> = ({ item, onPlay, onPress, isPlaying }) => (
    <TouchableOpacity 
      style={styles.itemCard}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.itemHeader}>
        <View style={styles.itemTitleRow}>
          <Text style={styles.itemTitle} numberOfLines={2}>
            {item.title}
          </Text>
          {item.isFavorite && (
            <Ionicons 
              name="heart" 
              size={16} 
              color={theme.colors.error} 
              style={styles.favoriteIcon}
            />
          )}
        </View>
        
        <View style={styles.itemMeta}>
          <View style={styles.metaLeft}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
            
            <View style={[
              styles.importanceDot, 
              { backgroundColor: getImportanceColor(item.importance) }
            ]} />
            
            <Text style={styles.metaText}>
              {formatDuration(item.duration || 0)}
            </Text>
            
            <Text style={styles.metaText}>
              再生{item.playCount}回
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => onPlay(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={24}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.itemContent} numberOfLines={2}>
        {item.content}
      </Text>
      
      {/* プログレスバー */}
      {item.lastPosition && item.duration && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${(item.lastPosition / item.duration) * 100}%` }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {formatDuration(item.lastPosition)} / {formatDuration(item.duration)}
          </Text>
        </View>
      )}
      
      {/* タグ表示 */}
      {item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          {item.tags.length > 3 && (
            <Text style={styles.moreTagsText}>+{item.tags.length - 3}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  // リストアイテムの描画
  const renderItem = ({ item }: { item: TextItem }) => (
    <TextItemCard
      item={item}
      onPlay={handlePlay}
      onPress={handleItemPress}
      isPlaying={currentPlayingId === item.id}
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
        右下の + ボタンから新しいテキストを追加してみましょう
      </Text>
    </View>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    safeArea: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.surface,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    menuButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    headerActions: {
      flexDirection: 'row',
      gap: 8,
    },
    headerButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 20,
      backgroundColor: theme.colors.background,
    },
    categoryScroll: {
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    categoryContainer: {
      paddingVertical: 12,
    },
    categoryButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginHorizontal: 4,
      borderRadius: 16,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    categoryButtonSelected: {
      backgroundColor: theme.colors.primary + '20',
      borderColor: theme.colors.primary,
    },
    categoryText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    categoryTextSelected: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    content: {
      flex: 1,
    },
    listContainer: {
      padding: 16,
    },
    itemCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    itemHeader: {
      marginBottom: 8,
    },
    itemTitleRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    itemTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      flex: 1,
      marginRight: 8,
    },
    favoriteIcon: {
      marginTop: 2,
    },
    itemMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    metaLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    categoryBadge: {
      backgroundColor: theme.colors.secondary + '20',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
      marginRight: 8,
    },
    categoryText: {
      fontSize: 12,
      color: theme.colors.secondary,
      fontWeight: '500',
    },
    importanceDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginRight: 8,
    },
    metaText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginRight: 12,
    },
    playButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
    },
    itemContent: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
      marginBottom: 8,
    },
    progressContainer: {
      marginBottom: 8,
    },
    progressBar: {
      height: 3,
      backgroundColor: theme.colors.border,
      borderRadius: 1.5,
      marginBottom: 4,
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.colors.primary,
      borderRadius: 1.5,
    },
    progressText: {
      fontSize: 11,
      color: theme.colors.textTertiary,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    tag: {
      backgroundColor: theme.colors.border,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    tagText: {
      fontSize: 10,
      color: theme.colors.textSecondary,
    },
    moreTagsText: {
      fontSize: 10,
      color: theme.colors.textTertiary,
      fontStyle: 'italic',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginTop: 16,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: theme.colors.textTertiary,
      textAlign: 'center',
      lineHeight: 20,
    },
    fab: {
      position: 'absolute',
      right: 20,
      bottom: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
  });

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
        
        {/* ヘッダー */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => Alert.alert('メニュー', 'サイドメニューは今後実装予定です。')}
            >
              <Ionicons name="menu" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>TextCast</Text>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleSearch}
            >
              <Ionicons name="search-outline" size={20} color={theme.colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleSettings}
            >
              <Ionicons name="settings-outline" size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* カテゴリスクロール */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonSelected
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextSelected
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* コンテンツエリア */}
        <View style={styles.content}>
          <FlatList
            data={textItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.listContainer,
              textItems.length === 0 && { flex: 1 }
            ]}
            ListEmptyComponent={renderEmptyState}
          />
        </View>

        {/* フローティングアクションボタン */}
        <TouchableOpacity
          style={styles.fab}
          onPress={handleAddMaterial}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color={theme.colors.background} />
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}