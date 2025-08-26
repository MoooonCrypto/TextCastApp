// src/components/UnifiedPlayer.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
  runOnJS,
  useDerivedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface UnifiedPlayerProps {
  isVisible: boolean;
  currentTrack: {
    id: string;
    title: string;
    category: string;
    currentTime: string;
    totalTime: string;
    content?: string;
  } | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
  bottomTabHeight?: number;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MINI_PLAYER_HEIGHT = 70;
const FULL_PLAYER_TOP = 0;
const SWIPE_THRESHOLD = SCREEN_HEIGHT * 0.3;

const UnifiedPlayer: React.FC<UnifiedPlayerProps> = ({
  isVisible,
  currentTrack,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  playbackSpeed = 1.0,
  onSpeedChange,
  bottomTabHeight = 80,
}) => {
  const insets = useSafeAreaInsets();
  const [showSpeedModal, setShowSpeedModal] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'one' | 'all'>('off');
  const [shuffleMode, setShuffleMode] = useState(false);

  // アニメーション値
  const translateY = useSharedValue(SCREEN_HEIGHT - MINI_PLAYER_HEIGHT - bottomTabHeight);
  const gestureTranslateY = useSharedValue(0);
  const progressValue = useSharedValue(0);
  const lastGestureY = useSharedValue(0);
  const isExpanded = useSharedValue(false);
  const contextY = useSharedValue(0);

  // 最小・最大位置
  const COLLAPSED_Y = SCREEN_HEIGHT - MINI_PLAYER_HEIGHT - bottomTabHeight;
  const EXPANDED_Y = 0;

  // 再生進行のシミュレーション
  useEffect(() => {
    if (isPlaying && isVisible) {
      const interval = setInterval(() => {
        progressValue.value = withTiming(
          Math.min(progressValue.value + 1, 100),
          { duration: 1000 }
        );
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, isVisible]);

  // 初期表示時のアニメーション
  useEffect(() => {
    if (isVisible && currentTrack) {
      translateY.value = withSpring(COLLAPSED_Y, {
        damping: 20,
        stiffness: 90,
      });
    } else if (!isVisible) {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
    }
  }, [isVisible, currentTrack]);

  // プレイヤーの展開/折りたたみ
  const expandPlayer = useCallback(() => {
    'worklet';
    translateY.value = withSpring(EXPANDED_Y, {
      damping: 20,
      stiffness: 90,
    });
    isExpanded.value = true;
  }, []);

  const collapsePlayer = useCallback(() => {
    'worklet';
    translateY.value = withSpring(COLLAPSED_Y, {
      damping: 20,
      stiffness: 90,
    });
    isExpanded.value = false;
  }, []);

  // パンジェスチャー（ドラッグ）
  const panGesture = Gesture.Pan()
    .onStart(() => {
      contextY.value = translateY.value;
    })
    .onUpdate((event) => {
      const newY = contextY.value + event.translationY;
      // 範囲を制限
      translateY.value = Math.max(EXPANDED_Y, Math.min(COLLAPSED_Y, newY));
      gestureTranslateY.value = event.translationY;
    })
    .onEnd((event) => {
      const currentY = translateY.value;
      const velocity = event.velocityY;
      
      // 速度が大きい場合は速度に基づいて判定
      if (Math.abs(velocity) > 500) {
        if (velocity > 0) {
          // 下向きの速い動き
          if (isExpanded.value) {
            collapsePlayer();
          }
        } else {
          // 上向きの速い動き
          if (!isExpanded.value) {
            expandPlayer();
          }
        }
      } else {
        // 速度が小さい場合は位置で判定
        const middleY = (COLLAPSED_Y + EXPANDED_Y) / 2;
        if (currentY < middleY) {
          expandPlayer();
        } else {
          collapsePlayer();
        }
      }
      
      gestureTranslateY.value = withSpring(0);
    });

  // タップジェスチャー（ミニプレイヤーをタップで展開）
  const tapGesture = Gesture.Tap()
    .onEnd(() => {
      if (!isExpanded.value) {
        runOnJS(expandPlayer)();
      }
    });

  // プログレスバーのジェスチャー
  const progressGesture = Gesture.Pan()
    .onUpdate((event) => {
      const newValue = Math.max(0, Math.min(100, (event.x / SCREEN_WIDTH) * 100));
      progressValue.value = newValue;
    });

  const progressTapGesture = Gesture.Tap()
    .onEnd((event) => {
      const newValue = Math.max(0, Math.min(100, (event.x / SCREEN_WIDTH) * 100));
      progressValue.value = withTiming(newValue, { duration: 200 });
    });

  const combinedProgressGesture = Gesture.Race(progressGesture, progressTapGesture);
  const combinedMiniPlayerGesture = Gesture.Race(panGesture, tapGesture);

  // アニメーションスタイル
  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  // 展開度合い（0 = 折りたたみ, 1 = 展開）
  const expandProgress = useDerivedValue(() => {
    return interpolate(
      translateY.value,
      [COLLAPSED_Y, EXPANDED_Y],
      [0, 1],
      Extrapolate.CLAMP
    );
  });

  // ミニプレイヤーのスタイル
  const miniPlayerStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(expandProgress.value, [0, 0.8, 1], [1, 0, 0]),
      transform: [
        {
          translateY: interpolate(expandProgress.value, [0, 1], [0, -20]),
        },
      ],
    };
  });

  // フルプレイヤーのスタイル
  const fullPlayerStyle = useAnimatedStyle(() => {
    return {
      opacity: expandProgress.value,
      transform: [
        {
          scale: interpolate(expandProgress.value, [0, 1], [0.95, 1]),
        },
      ],
    };
  });

  // 背景オーバーレイのスタイル
  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: expandProgress.value * 0.5,
      pointerEvents: expandProgress.value > 0.1 ? 'auto' : 'none',
    };
  });

  // プログレスバーのスタイル
  const animatedProgressStyle = useAnimatedStyle(() => {
    return {
      width: `${progressValue.value}%`,
    };
  });

  const animatedThumbStyle = useAnimatedStyle(() => {
    return {
      left: `${progressValue.value}%`,
    };
  });

  const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

  const handleRepeatToggle = () => {
    const modes: ('off' | 'one' | 'all')[] = ['off', 'one', 'all'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeatMode(modes[nextIndex]);
  };

  if (!currentTrack || !isVisible) return null;

  return (
    <GestureHandlerRootView style={styles.gestureContainer}>
      {/* 背景オーバーレイ */}
      <Animated.View style={[styles.overlay, overlayStyle]} pointerEvents="none" />

      {/* メインコンテナ */}
      <GestureDetector gesture={combinedMiniPlayerGesture}>
        <Animated.View style={[styles.container, animatedContainerStyle]}>
          {/* ドラッグインジケーター */}
          <View style={styles.dragIndicatorContainer}>
            <View style={styles.dragIndicator} />
          </View>

          {/* ミニプレイヤー */}
          <Animated.View style={[styles.miniPlayer, miniPlayerStyle]}>
            <View style={styles.miniPlayerContent}>
              <View style={styles.miniTrackInfo}>
                <Text style={styles.miniTrackTitle} numberOfLines={1}>
                  {currentTrack.title}
                </Text>
                <Text style={styles.miniTrackCategory} numberOfLines={1}>
                  {currentTrack.category}
                </Text>
              </View>
              <View style={styles.miniControls}>
                <TouchableOpacity onPress={onPrevious} style={styles.miniControlButton}>
                  <Text style={styles.miniControlIcon}>⏮</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onPlayPause} style={styles.miniPlayButton}>
                  <Text style={styles.miniPlayIcon}>{isPlaying ? '⏸' : '▶'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onNext} style={styles.miniControlButton}>
                  <Text style={styles.miniControlIcon}>⏭</Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* ミニプログレスバー */}
            <View style={styles.miniProgressBar}>
              <Animated.View style={[styles.miniProgressFill, animatedProgressStyle]} />
            </View>
          </Animated.View>

          {/* フルプレイヤー */}
          <Animated.View style={[styles.fullPlayer, fullPlayerStyle]}>
            {/* ヘッダー */}
            <View style={styles.header}>
              <TouchableOpacity 
                onPress={() => runOnJS(collapsePlayer)()}
                style={styles.closeButton}
              >
                <Text style={styles.closeIcon}>⌄</Text>
              </TouchableOpacity>
              <View style={styles.headerCenter}>
                <Text style={styles.categoryText}>{currentTrack.category}</Text>
              </View>
              <TouchableOpacity style={styles.menuButton}>
                <Text style={styles.menuIcon}>⋮</Text>
              </TouchableOpacity>
            </View>

            {/* コンテンツエリア */}
            <ScrollView 
              style={styles.contentArea} 
              showsVerticalScrollIndicator={false}
              scrollEnabled={expandProgress.value > 0.9}
            >
              <View style={styles.trackInfoContainer}>
                <View style={styles.albumArt} />
                <Text style={styles.trackTitle}>{currentTrack.title}</Text>
                <Text style={styles.trackArtist}>{currentTrack.category}</Text>
              </View>
            </ScrollView>

            {/* プレーヤーコントロール */}
            <View style={styles.playerControls}>
              {/* プログレスバー */}
              <View style={styles.progressContainer}>
                <GestureDetector gesture={combinedProgressGesture}>
                  <View style={styles.progressTouchArea}>
                    <View style={styles.progressBarBackground}>
                      <Animated.View style={[styles.progressBarFill, animatedProgressStyle]} />
                      <Animated.View style={[styles.progressThumb, animatedThumbStyle]} />
                    </View>
                  </View>
                </GestureDetector>
                <View style={styles.timeContainer}>
                  <Text style={styles.timeText}>{currentTrack.currentTime}</Text>
                  <Text style={styles.timeText}>{currentTrack.totalTime}</Text>
                </View>
              </View>

              {/* メインコントロール */}
              <View style={styles.mainControls}>
                <TouchableOpacity 
                  onPress={() => setShuffleMode(!shuffleMode)}
                  style={[styles.sideControl, shuffleMode && styles.activeControl]}
                >
                  <Text style={[styles.sideControlIcon, shuffleMode && styles.activeControlIcon]}>
                    🔀
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={onPrevious} style={styles.mainControl}>
                  <Text style={styles.mainControlIcon}>⏮</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={onPlayPause} style={styles.playButton}>
                  <Text style={styles.playIcon}>
                    {isPlaying ? '⏸' : '▶️'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={onNext} style={styles.mainControl}>
                  <Text style={styles.mainControlIcon}>⏭</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={handleRepeatToggle}
                  style={[styles.sideControl, repeatMode !== 'off' && styles.activeControl]}
                >
                  <Text style={[styles.sideControlIcon, repeatMode !== 'off' && styles.activeControlIcon]}>
                    {repeatMode === 'one' ? '🔂' : '🔁'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 再生速度 */}
              <TouchableOpacity 
                style={styles.speedControl}
                onPress={() => setShowSpeedModal(true)}
              >
                <Text style={styles.speedLabel}>速度: {playbackSpeed}x</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </GestureDetector>

      {/* 速度選択モーダル */}
      <Modal
        visible={showSpeedModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSpeedModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSpeedModal(false)}
        >
          <View style={styles.speedModal}>
            <Text style={styles.speedModalTitle}>再生速度</Text>
            {speeds.map(speed => (
              <TouchableOpacity
                key={speed}
                style={[
                  styles.speedOption,
                  speed === playbackSpeed && styles.speedOptionActive
                ]}
                onPress={() => {
                  onSpeedChange(speed);
                  setShowSpeedModal(false);
                }}
              >
                <Text style={[
                  styles.speedOptionText,
                  speed === playbackSpeed && styles.speedOptionTextActive
                ]}>
                  {speed}x
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  gestureContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
  },
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  dragIndicatorContainer: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#CCCCCC',
    borderRadius: 2,
  },
  // ミニプレイヤーのスタイル
  miniPlayer: {
    height: MINI_PLAYER_HEIGHT,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  miniPlayerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  miniTrackInfo: {
    flex: 1,
    marginRight: 16,
  },
  miniTrackTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 2,
  },
  miniTrackCategory: {
    fontSize: 12,
    color: '#999999',
  },
  miniControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniControlButton: {
    padding: 8,
  },
  miniControlIcon: {
    fontSize: 18,
    color: '#666666',
  },
  miniPlayButton: {
    backgroundColor: '#007AFF',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 8,
  },
  miniPlayIcon: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  miniProgressBar: {
    height: 2,
    backgroundColor: '#E0E0E0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  miniProgressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  // フルプレイヤーのスタイル
  fullPlayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeButton: {
    padding: 8,
  },
  closeIcon: {
    fontSize: 24,
    color: '#333333',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 14,
    color: '#666666',
  },
  menuButton: {
    padding: 8,
  },
  menuIcon: {
    fontSize: 24,
    color: '#333333',
  },
  contentArea: {
    flex: 1,
  },
  trackInfoContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  albumArt: {
    width: SCREEN_WIDTH - 80,
    height: SCREEN_WIDTH - 80,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    marginBottom: 30,
  },
  trackTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  trackArtist: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  playerControls: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressTouchArea: {
    paddingVertical: 15,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    position: 'relative',
  },
  progressBarFill: {
    position: 'absolute',
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  progressThumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    top: -6,
    marginLeft: -8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#999999',
  },
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  sideControl: {
    padding: 12,
    borderRadius: 20,
  },
  activeControl: {
    backgroundColor: '#E8F4FF',
  },
  sideControlIcon: {
    fontSize: 20,
    color: '#666666',
  },
  activeControlIcon: {
    color: '#007AFF',
  },
  mainControl: {
    padding: 12,
    marginHorizontal: 8,
  },
  mainControlIcon: {
    fontSize: 28,
    color: '#333333',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  playIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  speedControl: {
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  speedLabel: {
    fontSize: 14,
    color: '#666666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: 200,
  },
  speedModalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  speedOption: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  speedOptionActive: {
    backgroundColor: '#E8F4FF',
    borderRadius: 8,
  },
  speedOptionText: {
    fontSize: 16,
    color: '#666666',
  },
  speedOptionTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default UnifiedPlayer;