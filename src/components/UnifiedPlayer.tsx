// src/components/UnifiedPlayer.tsx - 基本版（gesture-handler不要）

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TextItem } from '../types';
import { theme } from '../constants/theme';

interface UnifiedPlayerProps {
  currentItem?: TextItem;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onClose?: () => void;
  visible: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MINI_PLAYER_HEIGHT = 80;

const UnifiedPlayer: React.FC<UnifiedPlayerProps> = ({
  currentItem,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  visible,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // 時間フォーマット
  const formatTime = (seconds: number): string => {
    const minutes: number = Math.floor(seconds / 60);
    const remainingSeconds: number = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // プログレス計算
  const getProgressPercentage = (): number => {
    if (!currentItem || !currentItem.duration) return 0;
    return ((currentItem.lastPosition || 0) / currentItem.duration) * 100;
  };

  // フルプレイヤーを閉じる
  const handleCloseFullPlayer = (): void => {
    setIsExpanded(false);
  };

  // ミニプレイヤーをタップしてフルプレイヤーを開く
  const handleExpandPlayer = (): void => {
    setIsExpanded(true);
  };

  if (!currentItem || !visible) {
    return null;
  }

  if (isExpanded) {
    // フルプレイヤー
    return (
      <SafeAreaView style={styles.fullPlayerContainer}>
        <StatusBar 
          barStyle="light-content" 
          backgroundColor="rgba(0,0,0,0.9)" 
        />
        
        {/* フルプレイヤーヘッダー */}
        <View style={styles.fullPlayerHeader}>
          <TouchableOpacity
            style={styles.fullPlayerCloseButton}
            onPress={handleCloseFullPlayer}
          >
            <Ionicons 
              name="chevron-down" 
              size={24} 
              color={theme.colors.text} 
            />
          </TouchableOpacity>
          <Text style={styles.fullPlayerHeaderTitle}>再生中</Text>
          <TouchableOpacity style={styles.fullPlayerMenuButton}>
            <Ionicons 
              name="ellipsis-horizontal" 
              size={24} 
              color={theme.colors.text} 
            />
          </TouchableOpacity>
        </View>

        {/* アートワークエリア */}
        <View style={styles.artworkContainer}>
          <View style={styles.artwork}>
            <Ionicons 
              name="document-text" 
              size={80} 
              color={theme.colors.primary} 
            />
          </View>
        </View>

        {/* トラック情報 */}
        <View style={styles.trackInfo}>
          <Text style={styles.trackTitle} numberOfLines={2}>
            {currentItem.title}
          </Text>
          <Text style={styles.trackArtist} numberOfLines={1}>
            {currentItem.category} • {currentItem.tags.join(', ')}
          </Text>
        </View>

        {/* プログレスコントロール */}
        <View style={styles.progressSection}>
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${getProgressPercentage()}%` }
                ]} 
              />
            </View>
          </View>
          
          <View style={styles.timeLabels}>
            <Text style={styles.timeText}>
              {formatTime(currentItem.lastPosition || 0)}
            </Text>
            <Text style={styles.timeText}>
              {formatTime(currentItem.duration || 0)}
            </Text>
          </View>
        </View>

        {/* 再生コントロール */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity style={styles.controlButton}>
            <Ionicons 
              name="shuffle" 
              size={24} 
              color={theme.colors.textSecondary} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={onPrevious}
          >
            <Ionicons 
              name="play-skip-back" 
              size={32} 
              color={theme.colors.text} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.playButton}
            onPress={onPlayPause}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={32}
              color={theme.colors.background}
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={onNext}
          >
            <Ionicons 
              name="play-skip-forward" 
              size={32} 
              color={theme.colors.text} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton}>
            <Ionicons 
              name="repeat" 
              size={24} 
              color={theme.colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>

        {/* 追加コントロール */}
        <View style={styles.additionalControls}>
          <TouchableOpacity style={styles.additionalButton}>
            <Ionicons 
              name="volume-medium" 
              size={20} 
              color={theme.colors.textSecondary} 
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.additionalButton}>
            <Text style={styles.speedText}>1.0x</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.additionalButton}>
            <Ionicons 
              name="list" 
              size={20} 
              color={theme.colors.textSecondary} 
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ミニプレイヤー
  return (
    <View style={styles.miniPlayerContainer}>
      <TouchableOpacity
        style={styles.miniPlayer}
        onPress={handleExpandPlayer}
        activeOpacity={0.9}
      >
        {/* プログレスバー */}
        <View style={styles.miniProgressContainer}>
          <View style={styles.miniProgressBackground}>
            <View 
              style={[
                styles.miniProgressFill,
                { width: `${getProgressPercentage()}%` }
              ]} 
            />
          </View>
        </View>

        <View style={styles.miniPlayerContent}>
          <View style={styles.miniPlayerInfo}>
            <Text style={styles.miniPlayerTitle} numberOfLines={1}>
              {currentItem.title}
            </Text>
            <Text style={styles.miniPlayerArtist} numberOfLines={1}>
              {currentItem.category} • {formatTime(currentItem.duration || 0)}
            </Text>
          </View>

          <View style={styles.miniPlayerControls}>
            <TouchableOpacity
              style={styles.miniControlButton}
              onPress={onPlayPause}
            >
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={20}
                color={theme.colors.text}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.miniControlButton}
              onPress={onNext}
            >
              <Ionicons 
                name="play-skip-forward" 
                size={20} 
                color={theme.colors.text} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  // ミニプレイヤースタイル
  miniPlayerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: MINI_PLAYER_HEIGHT,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    zIndex: 1000,
  },

  miniPlayer: {
    flex: 1,
  },

  miniPlayerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.m,
  },

  miniPlayerInfo: {
    flex: 1,
    marginRight: theme.spacing.m,
  },

  miniPlayerTitle: {
    fontSize: theme.fontSize.m,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: 2,
  },

  miniPlayerArtist: {
    fontSize: theme.fontSize.s,
    color: theme.colors.textSecondary,
  },

  miniPlayerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  miniControlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.s,
  },

  miniProgressContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },

  miniProgressBackground: {
    flex: 1,
    backgroundColor: theme.colors.progressBackground,
  },

  miniProgressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },

  // フルプレイヤースタイル
  fullPlayerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.background,
    zIndex: 2000,
  },

  fullPlayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    height: 60,
  },

  fullPlayerCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  fullPlayerHeaderTitle: {
    fontSize: theme.fontSize.m,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },

  fullPlayerMenuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // アートワーク
  artworkContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },

  artwork: {
    width: SCREEN_WIDTH - (theme.spacing.xl * 2),
    aspectRatio: 1,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },

  // トラック情報
  trackInfo: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.l,
    alignItems: 'center',
  },

  trackTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.s,
  },

  trackArtist: {
    fontSize: theme.fontSize.m,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },

  // プログレス
  progressSection: {
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.l,
  },

  progressContainer: {
    marginBottom: theme.spacing.m,
  },

  progressBackground: {
    height: 4,
    backgroundColor: theme.colors.progressBackground,
    borderRadius: 2,
  },

  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },

  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  timeText: {
    fontSize: theme.fontSize.s,
    color: theme.colors.textSecondary,
  },

  // コントロール
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },

  controlButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: theme.spacing.m,
  },

  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: theme.spacing.l,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  // 追加コントロール
  additionalControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },

  additionalButton: {
    padding: theme.spacing.s,
  },

  speedText: {
    fontSize: theme.fontSize.s,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
});

export default UnifiedPlayer;