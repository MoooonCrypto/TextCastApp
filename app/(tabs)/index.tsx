// app/(tabs)/index.tsx

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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// テーマ定義
const theme = {
  colors: {
    background: '#000000',
    surface: '#111111',
    surfaceSecondary: '#1a1a1a',
    text: '#ffffff',
    textSecondary: '#888888',
    textTertiary: '#555555',
    primary: '#ffffff',
    accent: '#333333',
    success: '#00ff88',
    warning: '#ffaa00',
    error: '#ff4444',
    border: '#222222',
    divider: '#1a1a1a',
    playing: '#00ff88',
    paused: '#888888',
    progress: '#ffffff',
    progressBackground: '#333333',
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    s: 4,
    m: 8,
    l: 12,
    xl: 16,
    full: 999,
  },
  fontSize: {
    xs: 12,
    s: 14,
    m: 16,
    l: 18,
    xl: 24,
    xxl: 32,
  },
  fontWeight: {
    normal: '400' as '400',
    medium: '500' as '500',
    semibold: '600' as '600',
    bold: '700' as '700',
  },
  touchTarget: {
    small: 32,
    medium: 44,
    large: 56,
  },
};

// 型定義
interface TextItem {
  id: string;
  title: string;
  content: string;
  source: 'manual' | 'file' | 'url' | 'camera';
  category: string;
  tags: string[];
  importance: 1 | 2 | 3;
  createdAt: Date;
  updatedAt: Date;
  duration?: number;
  lastPosition?: number;
  playCount: number;
  isCompleted: boolean;
  bookmarks: any[];
  notes: any[];
}

// TextItemCard コンポーネント
const TextItemCard: React.FC<{
  item: TextItem;
  onPlay: (item: TextItem) => void;
  onPress: (item: TextItem) => void;
  isPlaying?: boolean;
}> = ({ item, onPlay, onPress, isPlaying = false }) => {
  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '--:--';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '今日';
    if (diffDays === 1) return '昨日';
    if (diffDays < 7) return `${diffDays}日前`;
    
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getSourceIcon = (source: string): any => {
    switch (source) {
      case 'file': return 'document-text-outline';
      case 'url': return 'globe-outline';
      case 'camera': return 'camera-outline';
      default: return 'create-outline';
    }
  };

  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.l,
          padding: theme.spacing.m,
          marginVertical: theme.spacing.xs,
          marginHorizontal: theme.spacing.m,
        },
        isPlaying && {
          borderWidth: 1,
          borderColor: theme.colors.playing,
        },
      ]}
      onPress={() => onPress(item)}
    >
      <View style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: theme.spacing.s,
      }}>
        <View style={{ marginTop: 2, marginRight: theme.spacing.s }}>
          <Ionicons
            name={getSourceIcon(item.source)}
            size={16}
            color={theme.colors.textSecondary}
          />
        </View>
        
        <Text style={{
          fontSize: theme.fontSize.m,
          fontWeight: theme.fontWeight.medium,
          color: theme.colors.text,
          flex: 1,
          marginRight: theme.spacing.s,
        }} numberOfLines={2}>
          {item.title}
        </Text>
        
        <TouchableOpacity
          style={{
            width: theme.touchTarget.small,
            height: theme.touchTarget.small,
            borderRadius: theme.borderRadius.full,
            backgroundColor: isPlaying ? theme.colors.playing : theme.colors.accent,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => onPlay(item)}
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={16}
            color={isPlaying ? theme.colors.background : theme.colors.text}
          />
        </TouchableOpacity>
      </View>

      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: theme.spacing.l,
      }}>
        <Text style={{
          fontSize: theme.fontSize.s,
          color: theme.colors.textSecondary,
        }}>
          {formatDate(item.createdAt)}
        </Text>
        <View style={{
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: theme.colors.textTertiary,
          marginHorizontal: theme.spacing.s,
        }} />
        <Text style={{
          fontSize: theme.fontSize.s,
          color: theme.colors.textSecondary,
        }}>
          {formatDuration(item.duration)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// AddTextScreen コンポーネント
const AddTextScreen: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: theme.colors.background,
    }}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.m,
        paddingVertical: theme.spacing.s,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.divider,
      }}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={{
          fontSize: theme.fontSize.l,
          fontWeight: theme.fontWeight.semibold,
          color: theme.colors.text,
        }}>新規作成</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={{
            fontSize: theme.fontSize.m,
            fontWeight: theme.fontWeight.semibold,
            color: theme.colors.text,
          }}>保存</Text>
        </TouchableOpacity>
      </View>

      <View style={{
        padding: theme.spacing.m,
      }}>
        <Text style={{
          fontSize: theme.fontSize.s,
          color: theme.colors.textSecondary,
          marginBottom: theme.spacing.s,
          marginTop: theme.spacing.l,
        }}>タイトル</Text>
        <View style={{
          padding: theme.spacing.m,
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.m,
          minHeight: 50,
          justifyContent: 'center',
        }}>
          <Text style={{
            color: theme.colors.textTertiary,
            fontSize: theme.fontSize.m,
          }}>ここにタイトルを入力してください</Text>
        </View>
        
        <Text style={{
          fontSize: theme.fontSize.s,
          color: theme.colors.textSecondary,
          marginBottom: theme.spacing.s,
          marginTop: theme.spacing.l,
        }}>本文</Text>
        <View style={{
          padding: theme.spacing.m,
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.m,
          minHeight: 150,
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
        }}>
          <Text style={{
            color: theme.colors.textTertiary,
            fontSize: theme.fontSize.m,
          }}>ここに本文を入力してください</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

// メインコンポーネント
export default function HomeScreen() {
  const [textItems, setTextItems] = useState<TextItem[]>([]);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [showAddScreen, setShowAddScreen] = useState(false);

  useEffect(() => {
    const dummyData: TextItem[] = [
      {
        id: '1',
        title: 'AIとビジネスの未来について考察した記事',
        content: '近年、人工知能（AI）技術の急速な発展により...',
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
      },
      {
        id: '2',
        title: '機械学習論文の要約メモ',
        content: 'この論文では、深層学習における新しいアプローチ...',
        source: 'file',
        category: '学習',
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
      },
    ];
    setTextItems(dummyData);
  }, []);

  const handlePlay = (item: TextItem) => {
    if (currentPlayingId === item.id) {
      setCurrentPlayingId(null);
      console.log('再生停止:', item.title);
    } else {
      setCurrentPlayingId(item.id);
      console.log('再生開始:', item.title);
    }
  };

  const handleItemPress = (item: TextItem) => {
    console.log('アイテム詳細:', item.title);
  };

  const renderItem = ({ item }: { item: TextItem }) => (
    <TextItemCard
      item={item}
      onPlay={handlePlay}
      onPress={handleItemPress}
      isPlaying={currentPlayingId === item.id}
    />
  );

  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: theme.colors.background,
    }}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.m,
        paddingVertical: theme.spacing.s,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.divider,
      }}>
        <Text style={{
          fontSize: theme.fontSize.xl,
          fontWeight: theme.fontWeight.bold,
          color: theme.colors.text,
        }}>TextCast</Text>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.m,
        paddingVertical: theme.spacing.s,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.divider,
      }}>
        <Text style={{
          fontSize: theme.fontSize.s,
          color: theme.colors.textSecondary,
        }}>{textItems.length}件のテキスト</Text>
        <Text style={{
          fontSize: theme.fontSize.s,
          color: theme.colors.textSecondary,
        }}>未読: {textItems.filter(item => !item.isCompleted).length}件</Text>
      </View>

      <FlatList
        data={textItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={{ flex: 1 }}
      />

      <TouchableOpacity
        style={{
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
        }}
        onPress={() => setShowAddScreen(true)}
      >
        <Ionicons name="add" size={24} color={theme.colors.background} />
      </TouchableOpacity>

      <Modal
        visible={showAddScreen}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <AddTextScreen onClose={() => setShowAddScreen(false)} />
      </Modal>
    </SafeAreaView>
  );
}