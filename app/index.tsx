// app/index.tsx - エラー修正版

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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TextItem } from '../src/types';
import { theme } from '../src/constants/theme';
import TextItemCard from '../src/components/TextItemCard';
import UnifiedPlayer from '../src/components/UnifiedPlayer';

// カテゴリ型定義
interface CategoryItem {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
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
const AddTextScreen: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <SafeAreaView style={styles.addScreenContainer}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      <View style={styles.addScreenHeader}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.addScreenTitle}>新規作成</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.saveButtonText}>保存</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.addScreenContent}>
        <Text style={styles.inputLabel}>タイトル</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.placeholderText}>
            ここにタイトルを入力してください
          </Text>
        </View>
        
        <Text style={styles.inputLabel}>本文</Text>
        <View style={[styles.inputContainer, styles.textAreaContainer]}>
          <Text style={styles.placeholderText}>
            ここに本文を入力してください
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// メインコンポーネント
export default function HomeScreen() {
  const [textItems, setTextItems] = useState<TextItem[]>([]);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [showAddScreen, setShowAddScreen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingItem, setCurrentPlayingItem] = useState<TextItem | undefined>();
  const [playProgress, setPlayProgress] = useState(0);

  useEffect(() => {
    const dummyData: TextItem[] = [
      {
        id: '1',
        title: 'AI技術の現状と未来',
        content: 'AI技術は急速に発展しており、様々な分野で活用が期待されています。機械学習、深層学習、自然言語処理など、多岐にわたる技術が実用化されています。',
        source: 'url',
        category: 'ビジネス',
        tags: ['AI', 'ビジネス'],
        importance: 3,
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 86400000),
        duration: 347,
        lastPosition: 1200,
        playCount: 2,
        isCompleted: false,
        bookmarks: [],
        notes: [],
        isFavorite: false,
      },
      {
        id: '2',
        title: '機械学習論文の要約メモ',
        content: 'この論文では、深層学習における新しいアプローチについて説明しています。特に、注意機構を用いた新しいニューラルネットワークアーキテクチャが提案されています。',
        source: 'file',
        category: '論文',
        tags: ['機械学習', '論文'],
        importance: 2,
        createdAt: new Date(Date.now() - 172800000),
        updatedAt: new Date(Date.now() - 172800000),
        duration: 720,
        lastPosition: 0,
        playCount: 0,
        isCompleted: false,
        bookmarks: [],
        notes: [],
        isFavorite: false,
      },
      {
        id: '3',
        title: 'React Native ベストプラクティス',
        content: 'React Nativeでアプリ開発を行う際のベストプラクティスをまとめました。パフォーマンス最適化、状態管理、ナビゲーションなどについて詳しく説明します。',
        source: 'manual',
        category: 'フリー書籍',
        tags: ['React Native', 'プログラミング'],
        importance: 2,
        createdAt: new Date(Date.now() - 259200000),
        updatedAt: new Date(Date.now() - 259200000),
        duration: 480,
        lastPosition: 0,
        playCount: 1,
        isCompleted: false,
        bookmarks: [],
        notes: [],
        isFavorite: true,
      },
      {
        id: '4',
        title: 'TOEIC 英単語 - Level 1',
        content: 'TOEICで頻出される基本的な英単語をまとめました。business, company, meeting, schedule, project などの重要単語を含んでいます。',
        source: 'manual',
        category: '英単語暗記用',
        tags: ['TOEIC', '英語', '単語'],
        importance: 1,
        createdAt: new Date(Date.now() - 345600000),
        updatedAt: new Date(Date.now() - 345600000),
        duration: 300,
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

  // カテゴリでフィルタリングされたアイテム
  const filteredItems = selectedCategory === 'all' 
    ? textItems 
    : textItems.filter(item => {
        switch (selectedCategory) {
          case 'free-books': return item.category === 'フリー書籍';
          case 'study': return item.category === '資格勉強';
          case 'paper': return item.category === '論文';
          case 'vocabulary': return item.category === '英単語暗記用';
          case 'business': return item.category === 'ビジネス';
          case 'news': return item.category === 'ニュース';
          default: return true;
        }
      });

  const handlePlay = (item: TextItem) => {
    if (currentPlayingId === item.id) {
      setIsPlaying(!isPlaying);
      console.log(isPlaying ? '一時停止:' : '再生再開:', item.title);
    } else {
      setCurrentPlayingId(item.id);
      setCurrentPlayingItem(item);
      setIsPlaying(true);
      setPlayProgress(0);
      console.log('新規再生開始:', item.title);
    }
  };

  const handlePlayerPlay = () => {
    setIsPlaying(true);
  };

  const handlePlayerPause = () => {
    setIsPlaying(false);
  };

  const handlePlayerNext = () => {
    if (currentPlayingItem) {
      const currentIndex = filteredItems.findIndex(item => item.id === currentPlayingItem.id);
      const nextIndex = (currentIndex + 1) % filteredItems.length;
      const nextItem = filteredItems[nextIndex];
      setCurrentPlayingItem(nextItem);
      setCurrentPlayingId(nextItem.id);
      setPlayProgress(0);
      setIsPlaying(true);
    }
  };

  const handlePlayerPrevious = () => {
    if (currentPlayingItem) {
      const currentIndex = filteredItems.findIndex(item => item.id === currentPlayingItem.id);
      const prevIndex = currentIndex === 0 ? filteredItems.length - 1 : currentIndex - 1;
      const prevItem = filteredItems[prevIndex];
      setCurrentPlayingItem(prevItem);
      setCurrentPlayingId(prevItem.id);
      setPlayProgress(0);
      setIsPlaying(true);
    }
  };

  const handlePlayerClose = () => {
    setCurrentPlayingId(null);
    setCurrentPlayingItem(undefined);
    setIsPlaying(false);
    setPlayProgress(0);
  };

  const handleMenuPress = () => {
    console.log('メニュー開く');
    // TODO: サイドメニューの実装
  };

  const handleSearchPress = () => {
    console.log('検索画面を開く');
    // TODO: 検索画面の実装
  };

  const handleSettingsPress = () => {
    console.log('設定画面を開く');
    // TODO: 設定画面の実装
  };

  const handleItemPress = (item: TextItem) => {
    console.log('アイテム詳細:', item.title);
  };

  // プログレス更新のシミュレーション（実際のTTS統合時に置き換え）
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isPlaying && currentPlayingItem) {
      interval = setInterval(() => {
        setPlayProgress(prev => {
          if (prev >= 1) {
            // 曲終了時に次の曲へ
            handlePlayerNext();
            return 0;
          }
          return prev + 0.01; // 1%ずつ増加（実際の進捗に置き換え）
        });
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentPlayingItem]);

  const renderItem = ({ item }: { item: TextItem }) => (
    <TextItemCard
      item={item}
      onPlay={handlePlay}
      onPress={handleItemPress}
      isPlaying={currentPlayingId === item.id}
    />
  );

  // カテゴリアイテムのレンダリング
  const renderCategoryItem = ({ item }: { item: CategoryItem }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.id && styles.categoryItemActive,
      ]}
      onPress={() => setSelectedCategory(item.id)}
      activeOpacity={0.7}
    >
      <Ionicons
        name={item.icon}
        size={18}
        color={selectedCategory === item.id ? theme.colors.background : theme.colors.text}
        style={styles.categoryIcon}
      />
      <Text style={[
        styles.categoryText,
        selectedCategory === item.id && styles.categoryTextActive,
      ]}>
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
          <TouchableOpacity style={styles.headerButton} onPress={handleMenuPress}>
            <Ionicons name="menu" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>TextCast</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.headerButton} onPress={handleSearchPress}>
              <Ionicons name="search" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={handleSettingsPress}>
              <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* カテゴリ選択 - 水平スクロール */}
        <View style={styles.categoriesContainer}>
          <FlatList
            data={CATEGORIES}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContent}
          />
        </View>

        {/* 統計情報 */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {filteredItems.length}件のテキスト
          </Text>
          <Text style={styles.statsText}>
            未読: {filteredItems.filter(item => !item.isCompleted).length}件
          </Text>
        </View>

        {/* テキスト一覧 */}
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={[styles.listContainer, currentPlayingItem && { paddingBottom: 80 }]}
          showsVerticalScrollIndicator={false}
        />

        {/* FAB */}
        <TouchableOpacity
          style={[styles.fab, currentPlayingItem && { bottom: theme.spacing.xl + 80 }]}
          onPress={() => setShowAddScreen(true)}
        >
          <Ionicons name="add" size={24} color={theme.colors.background} />
        </TouchableOpacity>

        {/* UnifiedPlayer */}
        {currentPlayingItem && (
          <UnifiedPlayer
            currentItem={currentPlayingItem}
            isPlaying={isPlaying}
            onPlay={handlePlayerPlay}
            onPause={handlePlayerPause}
            onNext={handlePlayerNext}
            onPrevious={handlePlayerPrevious}
            onClose={handlePlayerClose}
            progress={playProgress}
          />
        )}

        {/* AddScreen Modal */}
        <Modal
          visible={showAddScreen}
          animationType="slide"
          presentationStyle="fullScreen"
        >
          <AddTextScreen onClose={() => setShowAddScreen(false)} />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    flex: 1,
    textAlign: 'center',
  },
  
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.s,
  },
  
  categoriesContainer: {
    paddingVertical: theme.spacing.s,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
    maxHeight: 60, // 高さを制限
  },
  
  categoriesContent: {
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
    height: 40, // 固定高さ
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
    bottom: theme.spacing.xl,
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