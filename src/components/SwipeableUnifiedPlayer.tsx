// src/components/SwipeableUnifiedPlayer.tsx
// 構造的に正しいスワイプ実装

import React, { useCallback } from 'react';
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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  runOnJS,
  interpolate,
  withSpring,
  clamp,
  Extrapolate,
} from 'react-native-reanimated';
import {
  PanGestureHandler,
} from 'react-native-gesture-handler';

import { TextItem } from '../types';
import { theme } from '../constants/theme';

interface SwipeableUnifiedPlayerProps {
  currentItem?: TextItem;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  visible: boolean;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MINI_PLAYER_HEIGHT = 80;
const SNAP_THRESHOLD = 100;

const SwipeableUnifiedPlayer: React.FC<SwipeableUnifiedPlayerProps> = ({
  currentItem,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  visible,
}) => {
  // 0 = ミニプレイヤー, 1 = フルプレイヤー
  const progress = useSharedValue(0);
  
  // スワイプジェスチャーハンドラー
  const gestureHandler = useAnimatedGestureHandler<
    any,
    { startProgress: number }
  >({
    onStart: (_event, context) => {
      context.startProgress = progress.value;
    },
    
    onActive: (event, context) => {
      const dragProgress = -event.translationY / SCREEN_HEIGHT;
      const newProgress = context.startProgress + dragProgress;
      progress.value = clamp(newProgress, 0, 1);
    },
    
    onEnd: (event) => {
      const velocity = -event.velocityY / SCREEN_HEIGHT;
      const shouldExpand = 
        velocity > 0.5 || 
        (Math.abs(event.translationY) > SNAP_THRESHOLD && event.translationY < 0);
      
      if (shouldExpand) {
        progress.value = withSpring(1, {
          damping: 15,
          stiffness: 150,
        });
      } else {
        progress.value = withSpring(0, {
          damping: 15,
          stiffness: 150,
        });
      }
    },
  });

  const handleExpandToFull = useCallback(() => {
    progress.value = withSpring(1, {
      damping: 15,
      stiffness: 150,
    });
  }, []);

  const handleCloseFullPlayer = useCallback(() => {
    progress.value = withSpring(0, {
      damping: 15,
      stiffness: 150,
    });
  }, []);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    if (!currentItem || !currentItem.duration) return 0;
    return ((currentItem.lastPosition || 0) / currentItem.duration) * 100;
  };

  // ミニプレイヤーのスタイル
  const miniPlayerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [0, 0.7],
      [1, 0],
      Extrapolate.CLAMP
    );
    
    const translateY = interpolate(
      progress.value,
      [0, 1],
      [0, MINI_PLAYER_HEIGHT],
      Extrapolate.CLAMP
    );
    
    return {
      opacity,
      transform: [{ translateY }],
      pointerEvents: progress.value > 0.5 ? 'none' : 'auto',
    };
  });

  // フルプレイヤーのスタイル
  const fullPlayerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [0.3, 1],
      [0, 1],
      Extrapolate.CLAMP
    );
    
    const translateY = interpolate(
      progress.value,
      [0, 1],
      [SCREEN_HEIGHT, 0],
      Extrapolate.CLAMP
    );
    
    return {
      opacity,
      transform: [{ translateY }],
      pointerEvents: progress.value < 0.5 ? 'none' : 'auto',
    };
  });

  if (!currentItem || !visible) {
    return null;
  }

  return (
    <>
      {/* ミニプレイヤー - 常に画面下部に固定 */}
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.miniPlayerContainer, miniPlayerAnimatedStyle]}>
          <TouchableOpacity
            style={styles.miniPlayer}
            onPress={handleExpandToFull}
            activeOpacity={0.95}
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
        </Animated.View>
      </PanGestureHandler>

      {/* フルプレイヤー - 画面全体をオーバーレイ */}
      <Animated.View style={[styles.fullPlayerContainer, fullPlayerAnimatedStyle]}>
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View style={styles.fullPlayerContent}>
            <SafeAreaView style={styles.fullPlayerSafeArea}>
              <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
              
              {/* フルプレイヤーヘッダー */}
              <View style={styles.fullPlayerHeader}>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={handleCloseFullPlayer}
                >
                  <Ionicons 
                    name="chevron-down" 
                    size={28} 
                    color={theme.colors.text} 
                  />
                </TouchableOpacity>
                
                <View style={styles.headerInfo}>
                  <Text style={styles.headerTitle}>再生中</Text>
                  <Text style={styles.headerSubtitle}>
                    {currentItem.category}
                  </Text>
                </View>
                
                <TouchableOpacity style={styles.headerButton}>
                  <Ionicons 
                    name="ellipsis-horizontal" 
                    size={24} 
                    color={theme.colors.text} 
                  />
                </TouchableOpacity>
              </View>

              {/* アートワークセクション */}
              <View style={styles.artworkSection}>
                <View style={styles.artworkContainer}>
                  <View style={styles.artworkPlaceholder}>
                    <Ionicons 
                      name="document-text" 
                      size={80} 
                      color={theme.colors.textSecondary} 
                    />
                  </View>
                </View>
                
                <View style={styles.trackInfo}>
                  <Text style={styles.trackTitle} numberOfLines={2}>
                    {currentItem.title}
                  </Text>
                  <Text style={styles.trackArtist} numberOfLines={1}>
                    {currentItem.category}
                  </Text>
                </View>
              </View>

              {/* プログレスセクション */}
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

              {/* メインコントロール */}
              <View style={styles.controlsContainer}>
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
          </Animated.View>
        </PanGestureHandler>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  // ミニプレイヤー - 常に画面下部に固定
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
    justifyContent: 'center',
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

  // フルプレイヤー - 画面全体をオーバーレイ
  fullPlayerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.background,
    zIndex: 2000,
  },

  fullPlayerContent: {
    flex: 1,
  },

  fullPlayerSafeArea: {
    flex: 1,
  },

  fullPlayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    height: 60,
  },

  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: theme.fontSize.s,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },

  headerSubtitle: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },

  // アートワークセクション
  artworkSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.l,
  },

  artworkContainer: {
    width: '75%',
    aspectRatio: 1,
    maxWidth: 280,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },

  artworkPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },

  trackInfo: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.m,
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
    paddingTop: theme.spacing.l,
    paddingBottom: theme.spacing.l,
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
    paddingBottom: theme.spacing.l,
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

export default SwipeableUnifiedPlayer;