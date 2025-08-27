// app/(tabs)/playlists.tsx

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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// テンポラリ型定義（後で共通types/index.tsに統合）
interface Playlist {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  itemCount: number;
  totalDuration: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  playCount: number;
  lastPlayedItemId?: string;
  shuffleMode: boolean;
  repeatMode: 'none' | 'one' | 'all';
}

// テンポラリデータ
const mockPlaylists: Playlist[] = [
  {
    id: 'default',
    title: '全ての素材',
    description: 'すべてのテキスト素材',
    itemCount: 5,
    totalDuration: 1200, // 20分
    isDefault: true,
    createdAt: new Date('2024-08-15'),
    updatedAt: new Date('2024-08-20'),
    playCount: 15,
    shuffleMode: false,
    repeatMode: 'none',
  },
  {
    id: '1',
    title: '学習資料',
    description: 'プログラミングとAI関連の記事',
    itemCount: 3,
    totalDuration: 780, // 13分
    isDefault: false,
    createdAt: new Date('2024-08-18'),
    updatedAt: new Date('2024-08-20'),
    playCount: 8,
    shuffleMode: false,
    repeatMode: 'all',
  },
  {
    id: '2',
    title: 'ニュース',
    description: '最新のテクニュース',
    itemCount: 2,
    totalDuration: 420, // 7分
    isDefault: false,
    createdAt: new Date('2024-08-19'),
    updatedAt: new Date('2024-08-19'),
    playCount: 3,
    shuffleMode: true,
    repeatMode: 'none',
  },
];

export default function PlaylistsScreen() {
  const [playlists, setPlaylists] = useState<Playlist[]>(mockPlaylists);

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
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}時間${minutes}分`;
    }
    return `${minutes}分`;
  };

  // プレイリスト再生
  const handlePlayPlaylist = (playlist: Playlist) => {
    Alert.alert('再生開始', `"${playlist.title}" を再生します。`);
    // TODO: プレイリスト再生機能を実装
  };

  // プレイリスト詳細表示
  const handlePlaylistPress = (playlist: Playlist) => {
    Alert.alert('プレイリスト詳細', `"${playlist.title}" の詳細画面は今後実装予定です。`);
    // TODO: プレイリスト詳細画面への遷移を実装
  };

  // プレイリストメニュー
  const handlePlaylistMenu = (playlist: Playlist) => {
    const menuOptions = playlist.isDefault 
      ? ['プレイリストを編集'] 
      : ['プレイリストを編集', 'プレイリストを削除'];

    Alert.alert(
      'プレイリストメニュー',
      `"${playlist.title}" のメニュー`,
      [
        { text: 'キャンセル', style: 'cancel' },
        ...menuOptions.map(option => ({
          text: option,
          onPress: () => Alert.alert('機能予定', `${option} 機能は今後実装予定です。`)
        }))
      ]
    );
  };

  // プレイリスト作成
  const handleCreatePlaylist = () => {
    Alert.alert('プレイリスト作成', '新しいプレイリスト作成画面は今後実装予定です。');
    // TODO: プレイリスト作成画面への遷移を実装
  };

  // プレイリストカードコンポーネント
  const PlaylistCard: React.FC<{
    playlist: Playlist;
    onPlay: (playlist: Playlist) => void;
    onPress: (playlist: Playlist) => void;
    onMenu: (playlist: Playlist) => void;
  }> = ({ playlist, onPlay, onPress, onMenu }) => (
    <TouchableOpacity
      style={[styles.playlistCard, playlist.isDefault && styles.defaultPlaylistCard]}
      onPress={() => onPress(playlist)}
      activeOpacity={0.7}
    >
      <View style={styles.playlistHeader}>
        <View style={styles.playlistIcon}>
          <Ionicons
            name={playlist.isDefault ? "library" : "musical-notes"}
            size={24}
            color={playlist.isDefault ? theme.colors.secondary : theme.colors.primary}
          />
        </View>
        
        <View style={styles.playlistInfo}>
          <Text style={styles.playlistTitle} numberOfLines={1}>
            {playlist.title}
          </Text>
          {playlist.description && (
            <Text style={styles.playlistDescription} numberOfLines={1}>
              {playlist.description}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => onMenu(playlist)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.playlistMeta}>
        <Text style={styles.metaText}>
          {playlist.itemCount}件 • {formatDuration(playlist.totalDuration)}
        </Text>
        <Text style={styles.metaText}>
          再生{playlist.playCount}回
        </Text>
      </View>

      <View style={styles.playlistFooter}>
        <View style={styles.playlistModes}>
          {playlist.shuffleMode && (
            <View style={styles.modeTag}>
              <Ionicons name="shuffle" size={12} color={theme.colors.secondary} />
              <Text style={styles.modeText}>シャッフル</Text>
            </View>
          )}
          {playlist.repeatMode !== 'none' && (
            <View style={styles.modeTag}>
              <Ionicons 
                name={playlist.repeatMode === 'one' ? "repeat-outline" : "repeat"} 
                size={12} 
                color={theme.colors.warning} 
              />
              <Text style={styles.modeText}>リピート</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.playButton}
          onPress={() => onPlay(playlist)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="play" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // リストアイテムの描画
  const renderPlaylist = ({ item }: { item: Playlist }) => (
    <PlaylistCard
      playlist={item}
      onPlay={handlePlayPlaylist}
      onPress={handlePlaylistPress}
      onMenu={handlePlaylistMenu}
    />
  );

  // 空の状態
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name="musical-notes-outline"
        size={64}
        color={theme.colors.textTertiary}
      />
      <Text style={styles.emptyTitle}>
        プレイリストがありません
      </Text>
      <Text style={styles.emptySubtitle}>
        右下の + ボタンから新しいプレイリストを作成しましょう
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
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    headerButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
    },
    content: {
      flex: 1,
    },
    listContainer: {
      padding: 16,
    },
    playlistCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    defaultPlaylistCard: {
      borderColor: theme.colors.secondary + '40',
      backgroundColor: theme.colors.secondary + '10',
    },
    playlistHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    playlistIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    playlistInfo: {
      flex: 1,
      marginRight: 8,
    },
    playlistTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 2,
    },
    playlistDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    menuButton: {
      padding: 4,
    },
    playlistMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    metaText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    playlistFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    playlistModes: {
      flexDirection: 'row',
      gap: 8,
    },
    modeTag: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.border,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 8,
    },
    modeText: {
      fontSize: 10,
      color: theme.colors.textSecondary,
      marginLeft: 4,
    },
    playButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.primary + '20',
      justifyContent: 'center',
      alignItems: 'center',
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
          <Text style={styles.headerTitle}>プレイリスト</Text>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleCreatePlaylist}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="search-outline"
              size={20}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        </View>

        {/* コンテンツエリア */}
        <View style={styles.content}>
          <FlatList
            data={playlists}
            renderItem={renderPlaylist}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.listContainer,
              playlists.length === 0 && { flex: 1 }
            ]}
            ListEmptyComponent={renderEmptyState}
          />
        </View>

        {/* フローティングアクションボタン */}
        <TouchableOpacity
          style={styles.fab}
          onPress={handleCreatePlaylist}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color={theme.colors.background} />
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}