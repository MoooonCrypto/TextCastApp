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

interface HomeScreenProps {
  navigation: any; // React Navigation の型定義
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [textItems, setTextItems] = useState<TextItem[]>([]);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // ダミーデータ（後でStorageServiceに置き換え）
  useEffect(() => {
    const dummyData: TextItem[] = [
      {
        id: '1',
        title: 'AIとビジネスの未来について考察した記事',
        content: '近年、人工知能（AI）技術の急速な発展により、ビジネス界においても大きな変化が起きています...',
        source: 'url',
        sourceUrl: 'https://example.com/ai-business',
        category: 'ビジネス',
        tags: ['AI', 'ビジネス', 'テクノロジー'],
        importance: 3,
        createdAt: new Date(Date.now() - 86400000), // 1日前
        updatedAt: new Date(Date.now() - 86400000),
        duration: 347, // 5分47秒
        lastPosition: 1200,
        playCount: 2,
        isCompleted: false,
        bookmarks: [],
        notes: [],
      },
      {
        id: '2',
        title: '機械学習論文の要約メモ',
        content: 'この論文では、深層学習における新しいアプローチについて説明しています...',
        source: 'file',
        fileName: 'ml_paper_summary.pdf',
        fileType: 'pdf',
        category: '学習',
        tags: ['機械学習', '論文', '研究'],
        importance: 2,
        createdAt: new Date(Date.now() - 172800000), // 2日前
        updatedAt: new Date(Date.now() - 172800000),
        duration: 720, // 12分
        lastPosition: 0,
        playCount: 0,
        isCompleted: false,
        bookmarks: [],
        notes: [],
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
      },
    ];
    setTextItems(dummyData);
  }, []);

  // 再生ハンドラー
  const handlePlay = (item: TextItem) => {
    if (currentPlayingId === item.id) {
      // 現在再生中の場合は一時停止
      setCurrentPlayingId(null);
    } else {
      // 新しいアイテムを再生
      setCurrentPlayingId(item.id);
      // 実際のTTS再生処理は後で実装
    }
  };

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

  // リストのレンダリング
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
        下のボタンから新しいテキストを追加してみましょう
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={createStyles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TextCast</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={handleSettings}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="settings-outline"
            size={24}
            color={theme.colors.text}
          />
        </TouchableOpacity>
      </View>

      {/* コンテンツエリア */}
      <View style={styles.content}>
        {/* 統計情報 */}
        <View style={styles.stats}>
          <Text style={styles.statsText}>
            {textItems.length}件のテキスト
          </Text>
          <Text style={styles.statsText}>
            未読: {textItems.filter(item => !item.isCompleted).length}件
          </Text>
        </View>

        {/* テキスト一覧 */}
        <FlatList
          data={textItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={textItems.length === 0 ? styles.emptyContainer : undefined}
          ListEmptyComponent={renderEmptyState}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
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
});

export default HomeScreen;