// src/screens/MainScreen.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import UnifiedPlayer from '../components/UnifiedPlayer';

// 型定義
interface Category {
  id: string;
  name: string;
  isActive: boolean;
}

interface AudioItem {
  id: string;
  title: string;
  duration: string;
  source: string;
  isPlaying: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MainScreen: React.FC = () => {
  // カテゴリの初期データ
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'フリー書籍', isActive: true },
    { id: '2', name: '資格勉強', isActive: false },
    { id: '3', name: '論文', isActive: false },
    { id: '4', name: '英単語暗記用', isActive: false },
  ]);

  const [selectedCategoryId, setSelectedCategoryId] = useState('1');
  
  // 音声データのサンプル
  const [audioItems, setAudioItems] = useState<AudioItem[]>([
    { id: '1', title: 'サンプル音声1', duration: '5:23', source: 'スクロール', isPlaying: false },
    { id: '2', title: 'サンプル音声2', duration: '10:45', source: '素材データ追加+', isPlaying: false },
    { id: '3', title: 'サンプル音声3', duration: '3:12', source: 'スクロール', isPlaying: false },
  ]);

  // プレーヤーの状態管理
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [currentTrack, setCurrentTrack] = useState<{
    id: string;
    title: string;
    category: string;
    currentTime: string;
    totalTime: string;
    content?: string;
  } | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);

  // カテゴリ選択ハンドラ
  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setCategories(prev =>
      prev.map(cat => ({
        ...cat,
        isActive: cat.id === categoryId
      }))
    );
  };

  // カテゴリ追加ハンドラ（後で実装）
  const handleAddCategory = () => {
    console.log('カテゴリ追加');
  };

  // 音声再生ハンドラ
  const handlePlayAudio = (itemId: string) => {
    const item = audioItems.find(audio => audio.id === itemId);
    if (!item) return;

    if (currentTrack?.id === itemId && isPlaying) {
      // 同じトラックが再生中の場合は一時停止
      setIsPlaying(false);
    } else {
      // 新しいトラックを再生または再開
      setCurrentTrack({
        id: item.id,
        title: item.title,
        category: categories.find(cat => cat.id === selectedCategoryId)?.name || '',
        currentTime: '0:00',  // 0から開始
        totalTime: item.duration,
        content: 'ここに音声コンテンツのテキストが表示されます。現在はサンプルテキストです。',
      });
      setIsPlaying(true);
      setIsPlayerVisible(true);
    }

    setAudioItems(prev =>
      prev.map(audioItem => ({
        ...audioItem,
        isPlaying: audioItem.id === itemId ? !audioItem.isPlaying : false
      }))
    );
  };

  // プレーヤーのハンドラ
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    // 次のトラックを再生
    const currentIndex = audioItems.findIndex(item => item.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % audioItems.length;
    handlePlayAudio(audioItems[nextIndex].id);
  };

  const handlePrevious = () => {
    // 前のトラックを再生
    const currentIndex = audioItems.findIndex(item => item.id === currentTrack?.id);
    const prevIndex = currentIndex === 0 ? audioItems.length - 1 : currentIndex - 1;
    handlePlayAudio(audioItems[prevIndex].id);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
  };

  // 素材追加ハンドラ（後で実装）
  const handleAddMaterial = () => {
    console.log('素材データ追加');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>サイドメニュー表示バー</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Text>検索</Text>
        </TouchableOpacity>
      </View>

      {/* カテゴリスクロール */}
      <View style={styles.categoryContainer}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryItem,
                category.isActive && styles.categoryItemActive
              ]}
              onPress={() => handleCategoryPress(category.id)}
            >
              <Text style={[
                styles.categoryText,
                category.isActive && styles.categoryTextActive
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.addCategoryButton}
            onPress={handleAddCategory}
          >
            <Text style={styles.addCategoryText}>+</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* 基本設定セクション */}
      <View style={styles.settingsSection}>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>技術記事 #1</Text>
          <Text style={styles.settingValue}>フリー書籍</Text>
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>←スクロール→</Text>
          <Text style={styles.settingValue}>資格勉強</Text>
        </View>
      </View>

      {/* 音声データリスト */}
      <View style={styles.audioListContainer}>
        <Text style={styles.audioListTitle}>音声データ一覧#2</Text>
        <FlatList
          data={audioItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.audioItem}
              onPress={() => handlePlayAudio(item.id)}
            >
              <View style={styles.audioInfo}>
                <Text style={styles.audioTitle}>{item.title}</Text>
                <Text style={styles.audioDuration}>{item.duration}</Text>
              </View>
              <View style={styles.audioControls}>
                <TouchableOpacity style={styles.playButton}>
                  <Text>{item.isPlaying ? '⏸' : '▶'}</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          ListFooterComponent={
            <TouchableOpacity
              style={styles.addMaterialButton}
              onPress={handleAddMaterial}
            >
              <Text style={styles.addMaterialText}>素材データ追加+</Text>
            </TouchableOpacity>
          }
        />
      </View>

      {/* 広告表示エリア */}
      <View style={[styles.adContainer, isPlayerVisible && styles.adContainerWithPlayer]}>
        <Text style={styles.adText}>広告表示</Text>
      </View>

      {/* 統合プレーヤー */}
      <UnifiedPlayer
        isVisible={isPlayerVisible}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrevious={handlePrevious}
        playbackSpeed={playbackSpeed}
        onSpeedChange={handleSpeedChange}
        bottomTabHeight={80}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  searchButton: {
    padding: 8,
  },
  categoryContainer: {
    height: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  categoryScrollContent: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  categoryItemActive: {
    backgroundColor: '#007AFF',
  },
  categoryText: {
    fontSize: 14,
    color: '#333333',
  },
  categoryTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  addCategoryButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  addCategoryText: {
    fontSize: 20,
    color: '#666666',
  },
  settingsSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9F9F9',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 14,
    color: '#666666',
  },
  settingValue: {
    fontSize: 14,
    color: '#333333',
  },
  audioListContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  audioListTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  audioItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  audioInfo: {
    flex: 1,
  },
  audioTitle: {
    fontSize: 15,
    color: '#333333',
    marginBottom: 4,
  },
  audioDuration: {
    fontSize: 13,
    color: '#999999',
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMaterialButton: {
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginTop: 8,
  },
  addMaterialText: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '500',
  },
  adContainer: {
    height: 60,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  adContainerWithPlayer: {
    marginBottom: 80, // ミニプレーヤーの高さ分のマージン
  },
  adText: {
    fontSize: 14,
    color: '#999999',
  },
});

export default MainScreen;