// src/components/SwipeableUnifiedPlayer.tsx
// 音楽アプリのような動的スワイプ対応プレイヤー

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
const SNAP_THRESHOLD = SCREEN_HEIGHT * 0.3; // 画面の30%をスナップ閾値に

const SwipeableUnifiedPlayer: React.FC<SwipeableUnifiedPlayerProps> = ({
  currentItem,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  visible,
}) => {
  // translateYは0（ミニプレイヤー状態）から -SCREEN_HEIGHT（フルプレイヤー状態）まで
  const translateY = useSharedValue(0);
  
  // スワイプジェスチャーハンドラー
  const gestureHandler = useAnimatedGestureHandler<
    any,
    { startY: number }
  >({
    onStart: (_event, context) => {
      context.startY = translateY.value;
    },
    
    onActive: (event, context) => {
      // 上方向（負の値）のスワイプのみ許可
      const newY = context.startY + event.translationY;
      // 0（ミニプレイヤー）から-SCREEN_HEIGHT（フルプレイヤー）の範囲でクランプ
      translateY.value = clamp(newY, -SCREEN_HEIGHT, 0);
    },
    
    onEnd: (event) => {
      const velocity = event.velocityY;
      const currentPosition = translateY.value;
      
      // 速度またはポジションに基づいてスナップ判定
      const shouldExpandToFull = 
        velocity < -500 || // 上向きの速い動き
        currentPosition < -SNAP_THRESHOLD; // 閾値を越えたドラッグ
      
      if (shouldExpandToFull) {
        // フルプレイヤーに展開
        translateY.value = withSpring(-SCREEN_HEIGHT, {
          damping: 20,
          stiffness: 200,
        });
      } else {
        // ミニプレイヤーに戻す
        translateY.value = withSpring(0, {
          damping: 20,
          stiffness: 200,
        });
      }
    },
  });

  // ミニプレイヤーをタップしてフルプレイヤーに展開
  const handleExpandToFull = useCallback(() => {
    translateY.value = withSpring(-SCREEN_HEIGHT, {
      damping: 20,
      stiffness: 200,
    });
  }, []);

  // フルプレイヤーを閉じる
  const handleCloseFullPlayer = useCallback(() => {
    translateY.value = withSpring(0, {
      damping: 20,
      stiffness: 200,
    });
  }, []);

  // 時間フォーマット
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // プログレス計算
  const getProgressPercentage = (): number => {
    if (!currentItem || !currentItem.duration) return 0;
    return ((currentItem.lastPosition || 0) / currentItem.duration) * 100;
  };

  // プレイヤー全体のアニメーションスタイル
  const playerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  // ミニプレイヤーのopacityアニメーション
  const miniPlayerOpacityStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [-SCREEN_HEIGHT * 0.5, 0],
      [0, 1],
      'clamp'
    );
    
    return {
      opacity,
    };
  });

  // フルプレイヤーのopacityアニメーション
  const fullPlayerOpacityStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [-SCREEN_HEIGHT, -SCREEN_HEIGHT * 0.5],
      [1, 0],
      'clamp'
    );
    
    return {
      opacity,
    };
  });

  // フルプレイヤーのscaleアニメーション
  const fullPlayerScaleStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      translateY.value,
      [-SCREEN_HEIGHT, -SCREEN_HEIGHT * 0.7],
      [1, 0.9],
      'clamp'
    );
    
    return {
      transform: [{ scale }],
    };
  });

  if (!currentItem || !visible) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, playerAnimatedStyle]}>
      {/* パンジェスチャーハンドラーでラップ */}
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={styles.gestureContainer}>
          
          {/* ミニプレイヤー部分 */}
          <Animated.View style={[styles.miniPlayerContainer, miniPlayerOpacityStyle]}>
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

          {/* フルプレイヤー部分 */}
          <Animated.View 
            style={[
              styles.fullPlayerContainer, 
              fullPlayerOpacityStyle,
              fullPlayerScaleStyle
            ]}
          >
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
        </Animated.View>
      </PanGestureHandler>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: -SCREEN_HEIGHT + MINI_PLAYER_HEIGHT,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    zIndex: 1000,
  },

  gestureContainer: {
    flex: 1,
  },

  // ミニプレイヤースタイル
  miniPlayerContainer: {
    position: 'absolute',
    bottom: SCREEN_HEIGHT - MINI_PLAYER_HEIGHT,
    left: 0,
    right: 0,
    height: MINI_PLAYER_HEIGHT,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
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

  // フルプレイヤースタイル
  fullPlayerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    backgroundColor: theme.colors.background,
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
    paddingTop: theme.spacing.xl,
  },

  artworkContainer: {
    width: '80%',
    aspectRatio: 1,
    maxWidth: 300,
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
    paddingTop: theme.spacing.xl,
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
    paddingBottom: theme.spacing.xl,
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