// src/components/SwipeableUnifiedPlayer.tsx
// 構造的に正しいスワイプ実装

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
  runOnUI,
  interpolate,
  withSpring,
  clamp,
  Extrapolate,
  cancelAnimation,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
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

// 5段階遷移の閾値定義
const TRANSITION_PHASES = {
  MINI: 0,           // 完全ミニプレイヤー
  START: 0.2,        // スワイプ開始・プリアニメーション
  PARTIAL: 0.4,      // 画面下5分の1でUI部分切り替え
  EXPANDING: 0.7,    // UI拡大・背景変化
  FULL: 1.0         // 完全フルプレイヤー
};

const SwipeableUnifiedPlayer: React.FC<SwipeableUnifiedPlayerProps> = ({
  currentItem,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  visible,
}) => {
  // SharedValueを完全にリセットするためのkey
  const [resetKey, setResetKey] = React.useState(0);
  
  // SharedValueの初期化（resetKeyで強制再作成）
  const progress = useSharedValue(0);
  const gestureStartValue = useSharedValue(0);
  const isGestureEnabled = useSharedValue(true);

  // アイテム変更時の完全リセット
  React.useEffect(() => {
    if (currentItem && visible) {
      console.log('[Effect] Complete reset for item:', currentItem.id);
      
      // SharedValueを完全にリセット
      cancelAnimation(progress);
      cancelAnimation(gestureStartValue);
      
      progress.value = 0;
      gestureStartValue.value = 0;
      isGestureEnabled.value = true;
      
      // Reactの再レンダリングも強制
      setResetKey(prev => prev + 1);
      
      console.log('[Effect] Reset complete - progress:', progress.value);
    }
  }, [currentItem?.id, visible]);

  // スワイプジェスチャー（完全新規実装）
  const panGesture = React.useMemo(() => 
    Gesture.Pan()
      .minDistance(5)
      .failOffsetX([-25, 25])
      .onBegin(() => {
        'worklet';
        console.log('[PanGesture] onBegin - enabled:', isGestureEnabled.value, 'progress:', progress.value);
        if (!isGestureEnabled.value) {
          console.log('[PanGesture] Gesture disabled');
          return;
        }
      })
      .onStart(() => {
        'worklet';
        if (!isGestureEnabled.value) return;
        
        gestureStartValue.value = progress.value;
        console.log('[PanGesture] onStart - startValue:', gestureStartValue.value);
      })
      .onUpdate((event) => {
        'worklet';
        if (!isGestureEnabled.value) return;
        
        const startValue = gestureStartValue.value;
        const dragDistance = -event.translationY;
        const dragProgress = dragDistance / (SCREEN_HEIGHT * 0.4);
        const newProgress = startValue + dragProgress;
        
        progress.value = clamp(newProgress, 0, 1);
        
        // ログ出力（間引き）
        if (Math.abs(dragDistance) % 50 < 5) {
          console.log('[PanGesture] Dragging - distance:', dragDistance, 'progress:', progress.value);
        }
      })
      .onEnd((event) => {
        'worklet';
        if (!isGestureEnabled.value) return;
        
        const velocity = -event.velocityY / SCREEN_HEIGHT;
        const currentProgress = progress.value;

        console.log('[PanGesture] onEnd - velocity:', velocity, 'progress:', currentProgress);

        const velocityThreshold = 0.3;
        const progressThreshold = 0.3;

        const shouldExpand =
          velocity > velocityThreshold ||
          (Math.abs(velocity) < velocityThreshold && currentProgress > progressThreshold);

        const targetValue = shouldExpand ? TRANSITION_PHASES.FULL : TRANSITION_PHASES.MINI;
        
        console.log('[PanGesture] Animation to:', targetValue);
        
        progress.value = withSpring(targetValue, {
          damping: 20,
          stiffness: 250,
          mass: 0.8,
        });
      })
  , [resetKey]); // resetKeyで強制再作成

  // タップハンドラー（ジェスチャーではない）
  const handleMiniPlayerTap = React.useCallback(() => {
    console.log('[Tap] Manual tap - progress:', progress.value);
    
    runOnUI(() => {
      'worklet';
      if (progress.value < 0.1) {
        console.log('[Tap] Expanding to full');
        progress.value = withSpring(TRANSITION_PHASES.FULL, {
          damping: 20,
          stiffness: 200,
          mass: 0.8,
        });
      }
    })();
  }, []);

  const handleCloseFullPlayer = React.useCallback(() => {
    console.log('[Close] Closing full player');
    runOnUI(() => {
      'worklet';
      progress.value = withSpring(TRANSITION_PHASES.MINI, {
        damping: 20,
        stiffness: 200,
        mass: 0.8,
      });
    })();
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

  // フルプレイヤーヘッダーのアニメーションスタイル
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [TRANSITION_PHASES.PARTIAL, TRANSITION_PHASES.EXPANDING],
      [0, 1],
      Extrapolate.CLAMP
    );

    const translateY = interpolate(
      progress.value,
      [TRANSITION_PHASES.PARTIAL, TRANSITION_PHASES.EXPANDING],
      [-20, 0],
      Extrapolate.CLAMP
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  // アートワークのアニメーションスタイル
  const artworkAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      progress.value,
      [TRANSITION_PHASES.START, TRANSITION_PHASES.PARTIAL, TRANSITION_PHASES.EXPANDING],
      [0.7, 0.85, 1],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      progress.value,
      [TRANSITION_PHASES.START, TRANSITION_PHASES.PARTIAL],
      [0, 1],
      Extrapolate.CLAMP
    );

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  // コントロールボタンのアニメーションスタイル
  const controlsAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [TRANSITION_PHASES.EXPANDING, TRANSITION_PHASES.FULL],
      [0, 1],
      Extrapolate.CLAMP
    );

    const translateY = interpolate(
      progress.value,
      [TRANSITION_PHASES.EXPANDING, TRANSITION_PHASES.FULL],
      [30, 0],
      Extrapolate.CLAMP
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  // プログレスセクションのアニメーションスタイル
  const progressAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [TRANSITION_PHASES.PARTIAL, TRANSITION_PHASES.EXPANDING],
      [0, 1],
      Extrapolate.CLAMP
    );

    const scale = interpolate(
      progress.value,
      [TRANSITION_PHASES.PARTIAL, TRANSITION_PHASES.EXPANDING],
      [0.9, 1],
      Extrapolate.CLAMP
    );

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  // ミニプレイヤーのスタイル（デバッグ情報付き）
  const miniPlayerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [TRANSITION_PHASES.MINI, TRANSITION_PHASES.START, TRANSITION_PHASES.PARTIAL],
      [1, 0.8, 0],
      Extrapolate.CLAMP
    );

    const translateY = interpolate(
      progress.value,
      [TRANSITION_PHASES.MINI, TRANSITION_PHASES.PARTIAL, TRANSITION_PHASES.FULL],
      [0, -MINI_PLAYER_HEIGHT * 0.3, -MINI_PLAYER_HEIGHT],
      Extrapolate.CLAMP
    );

    const scale = interpolate(
      progress.value,
      [TRANSITION_PHASES.MINI, TRANSITION_PHASES.START, TRANSITION_PHASES.PARTIAL],
      [1, 0.95, 0.9],
      Extrapolate.CLAMP
    );

    // pointerEventsを常時有効に（テスト）
    const shouldBlock = progress.value > 0.8;
    
    return {
      opacity,
      transform: [{ translateY }, { scale }],
      pointerEvents: shouldBlock ? 'none' : 'auto',
    };
  });

  // フルプレイヤーのスタイル
  const fullPlayerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [TRANSITION_PHASES.START, TRANSITION_PHASES.PARTIAL, TRANSITION_PHASES.EXPANDING],
      [0, 0.3, 1],
      Extrapolate.CLAMP
    );

    const translateY = interpolate(
      progress.value,
      [TRANSITION_PHASES.MINI, TRANSITION_PHASES.START, TRANSITION_PHASES.PARTIAL, TRANSITION_PHASES.FULL],
      [SCREEN_HEIGHT, SCREEN_HEIGHT * 0.7, SCREEN_HEIGHT * 0.2, 0],
      Extrapolate.CLAMP
    );

    const backgroundColor = interpolate(
      progress.value,
      [TRANSITION_PHASES.MINI, TRANSITION_PHASES.PARTIAL, TRANSITION_PHASES.FULL],
      [0, 0.3, 0.95],
      Extrapolate.CLAMP
    );

    return {
      opacity,
      backgroundColor: `rgba(0, 0, 0, ${backgroundColor})`,
      transform: [{ translateY }],
      pointerEvents: progress.value < 0.2 ? 'none' : 'auto',
    };
  });

  if (!currentItem || !visible) {
    return null;
  }

  return (
    <React.Fragment key={resetKey}>
      {/* ミニプレイヤー */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.miniPlayerContainer, miniPlayerAnimatedStyle]}>
          <TouchableOpacity 
            style={styles.miniPlayer}
            onPress={handleMiniPlayerTap}
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
                  onPress={(e) => {
                    e.stopPropagation();
                    onPlayPause();
                  }}
                >
                  <Ionicons
                    name={isPlaying ? 'pause' : 'play'}
                    size={20}
                    color={theme.colors.text}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.miniControlButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    onNext();
                  }}
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
      </GestureDetector>

      {/* フルプレイヤー */}
      <Animated.View style={[styles.fullPlayerContainer, fullPlayerAnimatedStyle]}>
        <GestureDetector gesture={panGesture}>
          <Animated.View style={styles.fullPlayerContent}>
            <SafeAreaView style={styles.fullPlayerSafeArea}>
              <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
              
              {/* フルプレイヤーヘッダー */}
              <Animated.View style={[styles.fullPlayerHeader, headerAnimatedStyle]}>
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
              </Animated.View>

              {/* アートワークセクション */}
              <View style={styles.artworkSection}>
                <Animated.View style={[styles.artworkContainer, artworkAnimatedStyle]}>
                  <View style={styles.artworkPlaceholder}>
                    <Ionicons 
                      name="document-text" 
                      size={80} 
                      color={theme.colors.textSecondary} 
                    />
                  </View>
                </Animated.View>

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
              <Animated.View style={[styles.progressSection, progressAnimatedStyle]}>
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
              </Animated.View>

              {/* メインコントロール */}
              <Animated.View style={[styles.controlsContainer, controlsAnimatedStyle]}>
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
              </Animated.View>

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
        </GestureDetector>
      </Animated.View>
    </React.Fragment>
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