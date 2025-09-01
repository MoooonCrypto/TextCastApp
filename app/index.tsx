// app/index.tsx - スワイプ対応プレイヤー統合版

import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TextItem } from '../src/types';
import { theme } from '../src/constants/theme';
import TextItemCard from '../src/components/TextItemCard';
import SwipeableUnifiedPlayer from '../src/components/SwipeableUnifiedPlayer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// カテゴリ型定義
interface CategoryItem {
  id: string;
  name: string;
  icon: string;
}

// カテゴリ定義
const CATEGORIES: CategoryItem[] = [
  { id: 'all', name: '全て', icon: 'library-outline' },
  { id: 'free-books', name: 'フリー書籍', icon: 'book-outline' },
  { id: 'study', name: '資格勉強', icon: 'school-outline' },
  { id: 'paper', name: '論文', icon: 'document-text-outline' },
  { id: 'vocabulary', name: '英単語暗記用', icon: 'language-outline' },
  { id: 'business', name: 'ビジネス', icon: 'briefcase-outline' },
  { id: 'news', name: 'ニュース', icon: 'newspaper-outline' },
];

// AddTextScreen コンポーネント
interface AddTextScreenProps {
  onClose: () => void;
}

const AddTextScreen: React.FC<AddTextScreenProps> = ({ onClose }) => {
  return (
    <SafeAreaView style={styles.addScreenContainer}>
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
  const [textItems, setTextItems] = useState<TextItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // フィルタリングされたアイテム
  const filteredItems: TextItem[] = textItems.filter(item => 
    selectedCategory === 'all' || item.category === selectedCategory
  );

  // 現在再生中のアイテム
  const currentPlayingItem: TextItem | undefined = textItems.find(
    item => item.id === currentPlayingId
  );

  // ダミーデータの初期化
  useEffect(() => {
    const dummyData: TextItem[] = [
      {
        id: '1',
        title: 'React Native開発のベストプラクティス',
        content: 'React Nativeでアプリを開発する際に知っておくべきベストプラクティスについて解説します...',
        source: 'url',
        sourceUrl: 'https://example.com/react-native-best-practices',
        category: 'プログラミング',
        tags: ['React Native', '開発', 'ベストプラクティス'],
        importance: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
        duration: 480, // 8分
        lastPosition: 120, // 2分地点
        playCount: 2,
        isCompleted: false,
        bookmarks: [],
        notes: [],
        isFavorite: true,
      },
      {
        id: '2',
        title: '最新のAI技術動向について',
        content: '2024年のAI技術の最新動向と今後の展望について詳しく説明します...',
        source: 'file',
        fileName: 'ai-trends-2024.pdf',
        fileType: 'pdf',
        category: 'テクノロジー',
        tags: ['AI', 'テクノロジー', 'トレンド'],
        importance: 2,
        createdAt: new Date(Date.now() - 86400000), // 1日前
        updatedAt: new Date(Date.now() - 86400000),
        duration: 720, // 12分
        lastPosition: 0,
        playCount: 0,
        isCompleted: false,
        bookmarks: [],
        notes: [],
        isFavorite: false,
      },
      {
        id: '3',
        title: '読書メモ: デザイン思考について',
        content: 'デザイン思考は、ユーザー中心の問題解決手法として注目されています...',
        source: 'manual',
        category: '学習',
        tags: ['デザイン', '読書', 'UX'],
        importance: 1,
        createdAt: new Date(Date.now() - 259200000), // 3日前
        updatedAt: new Date(Date.now() - 259200000),
        duration: 180, // 3分
        lastPosition: 180,
        playCount: 1,
        isCompleted: true,
        bookmarks: [],
        notes: [],
        isFavorite: false,
      },
      {
        id: '4',
        title: '会議での重要ポイント',
        content: '本日の会議で話し合われた重要なポイントをまとめました...',
        source: 'camera',
        category: '個人',
        tags: ['会議', 'メモ'],
        importance: 2,
        createdAt: new Date(Date.now() - 345600000), // 4日前
        updatedAt: new Date(Date.now() - 345600000),
        duration: 120, // 2分
        lastPosition: 0,
        playCount: 0,
        isCompleted: false,
        bookmarks: [],
        notes: [],
        isFavorite: false,
      },
    ];
    setTextItems(dummyData);
  }, []);

  // 再生ハンドラー
  const handlePlay = (item: TextItem): void => {
    if (currentPlayingId === item.id && isPlaying) {
      setIsPlaying(false);
      console.log('再生停止:', item.title);
    } else {
      setCurrentPlayingId(item.id);
      setIsPlaying(true);
      console.log('新しいアイテム再生開始:', item.title);
    }
  };

  const handlePlayPause = (): void => {
    setIsPlaying(!isPlaying);
    console.log(isPlaying ? '再生停止' : '再生開始');
  };

  const handleNext = (): void => {
    const currentIndex: number = filteredItems.findIndex(
      (item: TextItem) => item.id === currentPlayingId
    );
    if (currentIndex < filteredItems.length - 1) {
      const nextItem: TextItem = filteredItems[currentIndex + 1];
      setCurrentPlayingId(nextItem.id);
      console.log('次の曲:', nextItem.title);
    }
  };

  const handlePrevious = (): void => {
    const currentIndex: number = filteredItems.findIndex(
      (item: TextItem) => item.id === currentPlayingId
    );
    if (currentIndex > 0) {
      const prevItem: TextItem = filteredItems[currentIndex - 1];
      setCurrentPlayingId(prevItem.id);
      console.log('前の曲:', prevItem.title);
    }
  };

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

  // レンダリング関数
  const renderItem: ListRenderItem<TextItem> = ({ item }) => (
    <TextItemCard
      item={item}
      onPlay={handlePlay}
      onPress={handleItemPress}
      isPlaying={currentPlayingId === item.id && isPlaying}
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
      <SafeAreaView style={styles.container}>
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
            data={CATEGORIES}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          />
        </View>

        {/* 統計情報 */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {filteredItems.length}件のアイテム
          </Text>
          <Text style={styles.statsText}>
            再生中: {currentPlayingItem?.title || 'なし'}
          </Text>
        </View>

        {/* アイテムリスト */}
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.listContainer}
          contentContainerStyle={{ paddingBottom: 100 }} // プレイヤー分のスペース
        />

        {/* FAB */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color={theme.colors.background} />
        </TouchableOpacity>

        {/* スワイプ対応プレイヤー */}
        <SwipeableUnifiedPlayer
          currentItem={currentPlayingItem}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onNext={handleNext}
          onPrevious={handlePrevious}
          visible={!!currentPlayingItem}
        />

        {/* 新規作成モーダル */}
        <Modal
          visible={showAddModal}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setShowAddModal(false)}
        >
          <AddTextScreen onClose={() => setShowAddModal(false)} />
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
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
  
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  
  statsText: {
    fontSize: theme.fontSize.s,
    color: theme.colors.textSecondary,
  },
  
  listContainer: {
    flex: 1,
  },
  
  fab: {
    position: 'absolute',
    bottom: 96, // ミニプレイヤー + 余白
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
});