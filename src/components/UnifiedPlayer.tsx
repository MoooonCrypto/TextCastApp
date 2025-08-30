
// src/components/UnifiedPlayer.tsx - エラー修正版

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import { TextItem } from '../types';
import { theme } from '../constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MINI_PLAYER_HEIGHT = 80;
const FULL_PLAYER_HEIGHT = SCREEN_HEIGHT;

interface UnifiedPlayerProps {
  currentItem?: TextItem;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
  progress?: number;
}

const UnifiedPlayer: React.FC<UnifiedPlayerProps> = ({
  currentItem,
  isPlaying,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onClose,
  progress = 0,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const translateY = useSharedValue(0);

  const gestureHandler = (event: PanGestureHandlerGestureEvent) => {
    'worklet';
    const { translationY, velocityY, state } = event.nativeEvent;
    
    if (state === 2) { // ACTIVE
      const newTranslateY = translationY;
      translateY.value = Math.max(
        -FULL_PLAYER_HEIGHT + MINI_PLAYER_HEIGHT,
        Math.min(0, newTranslateY)
      );
    } else if (state === 5) { // END
      const snapThreshold = FULL_PLAYER_HEIGHT * 0.3;
      
      // 速度が大きい場合は速度で判定
      if (Math.abs(velocityY) > 500) {
        if (velocityY > 0) {
          // 下向きの速いスワイプ → ミニプレイヤーへ
          translateY.value = withSpring(0);
          runOnJS(setIsExpanded)(false);
        } else {
          // 上向きの速いスワイプ → フルプレイヤーへ
          translateY.value = withSpring(-FULL_PLAYER_HEIGHT + MINI_PLAYER_HEIGHT);
          runOnJS(setIsExpanded)(true);
        }
      } else {
        // 位置で判定
        if (Math.abs(translateY.value) > snapThreshold) {
          translateY.value = withSpring(-FULL_PLAYER_HEIGHT + MINI_PLAYER_HEIGHT);
          runOnJS(setIsExpanded)(true);
        } else {
          translateY.value = withSpring(0);
          runOnJS(setIsExpanded)(false);
        }
      }
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    const expandProgress = interpolate(
      translateY.value,
      [0, -FULL_PLAYER_HEIGHT + MINI_PLAYER_HEIGHT],
      [0, 1],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateY: translateY.value }],
      opacity: interpolate(expandProgress, [0, 0.1], [1, 1], Extrapolate.CLAMP),
    };
  });

  const miniPlayerStyle = useAnimatedStyle(() => {
    const expandProgress = interpolate(
      translateY.value,
      [0, -FULL_PLAYER_HEIGHT + MINI_PLAYER_HEIGHT],
      [0, 1],
      Extrapolate.CLAMP
    );

    return {
      opacity: interpolate(expandProgress, [0, 0.3], [1, 0], Extrapolate.CLAMP),
    };
  });

  const fullPlayerStyle = useAnimatedStyle(() => {
    const expandProgress = interpolate(
      translateY.value,
      [0, -FULL_PLAYER_HEIGHT + MINI_PLAYER_HEIGHT],
      [0, 1],
      Extrapolate.CLAMP
    );

    return {
      opacity: interpolate(expandProgress, [0.7, 1], [0, 1], Extrapolate.CLAMP),
      transform: [
        {
          translateY: interpolate(
            expandProgress,
            [0, 1],
            [50, 0],
            Extrapolate.CLAMP
          ),
        },
      ],
    };
  });

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${progress * 100}%`,
    };
  });

  if (!currentItem) {
    return null;
  }

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleCollapsePress = () => {
    translateY.value = withSpring(0);
    setIsExpanded(false);
  };

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {/* ミニプレイヤー */}
        <Animated.View style={[styles.miniPlayer, miniPlayerStyle]}>
          <View style={styles.miniPlayerContent}>
            <View style={styles.miniPlayerInfo}>
              <Text style={styles.miniPlayerTitle} numberOfLines={1}>
                {currentItem.title}
              </Text>
              <Text style={styles.miniPlayerCategory} numberOfLines={1}>
                {currentItem.category}
              </Text>
            </View>
            <View style={styles.miniPlayerControls}>
              <TouchableOpacity onPress={isPlaying ? onPause : onPlay}>
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={24}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
          <Animated.View style={[styles.progressBar, progressStyle]} />
        </Animated.View>

        {/* フルプレイヤー */}
        <Animated.View style={[styles.fullPlayer, fullPlayerStyle]}>
          <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
          
          {/* フルプレイヤーヘッダー */}
          <View style={styles.fullPlayerHeader}>
            <TouchableOpacity onPress={handleCollapsePress}>
              <Ionicons name="chevron-down" size={28} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.fullPlayerHeaderTitle}>再生中</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {/* アートワーク部分 */}
          <View style={styles.artworkContainer}>
            <View style={styles.artwork}>
              <Ionicons
                name="document-text"
                size={80}
                color={theme.colors.textTertiary}
              />
            </View>
          </View>

          {/* タイトル・カテゴリ */}
          <View style={styles.trackInfo}>
            <Text style={styles.fullPlayerTitle} numberOfLines={2}>
              {currentItem.title}
            </Text>
            <Text style={styles.fullPlayerCategory} numberOfLines={1}>
              {currentItem.category}
            </Text>
          </View>

          {/* プログレスバー */}
          <View style={styles.progressSection}>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <Animated.View style={[styles.progressBarFill, progressStyle]} />
              </View>
            </View>
            <View style={styles.timeLabels}>
              <Text style={styles.timeLabel}>
                {formatDuration(Math.floor((currentItem.duration || 0) * progress))}
              </Text>
              <Text style={styles.timeLabel}>
                {formatDuration(currentItem.duration || 0)}
              </Text>
            </View>
          </View>

          {/* 再生コントロール */}
          <View style={styles.playbackControls}>
            <TouchableOpacity onPress={onPrevious} style={styles.controlButton}>
              <Ionicons name="play-skip-back" size={32} color={theme.colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={isPlaying ? onPause : onPlay} 
              style={[styles.controlButton, styles.playButton]}
            >
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={32}
                color={theme.colors.background}
              />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={onNext} style={styles.controlButton}>
              <Ionicons name="play-skip-forward" size={32} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {/* 速度調整 */}
          <View style={styles.speedControl}>
            <Text style={styles.speedLabel}>速度: 1.0x</Text>
          </View>
        </Animated.View>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: FULL_PLAYER_HEIGHT,
    backgroundColor: theme.colors.surface,
  },
  
  // ミニプレイヤー
  miniPlayer: {
    height: MINI_PLAYER_HEIGHT,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
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
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  
  miniPlayerCategory: {
    fontSize: theme.fontSize.s,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  
  miniPlayerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  closeButton: {
    marginLeft: theme.spacing.m,
  },
  
  progressBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 2,
    backgroundColor: theme.colors.primary,
  },
  
  // フルプレイヤー
  fullPlayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: FULL_PLAYER_HEIGHT,
    backgroundColor: theme.colors.background,
    paddingTop: 50,
  },
  
  fullPlayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
  },
  
  fullPlayerHeaderTitle: {
    fontSize: theme.fontSize.m,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  
  artworkContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  
  artwork: {
    width: 280,
    height: 280,
    borderRadius: theme.borderRadius.m,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  trackInfo: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.l,
    alignItems: 'center',
  },
  
  fullPlayerTitle: {
    fontSize: theme.fontSize.l,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.s,
  },
  
  fullPlayerCategory: {
    fontSize: theme.fontSize.m,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  
  progressSection: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.l,
  },
  
  progressBarContainer: {
    marginBottom: theme.spacing.m,
  },
  
  progressBarBackground: {
    height: 4,
    backgroundColor: theme.colors.surface,
    borderRadius: 2,
  },
  
  progressBarFill: {
    height: 4,
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  timeLabel: {
    fontSize: theme.fontSize.s,
    color: theme.colors.textSecondary,
  },
  
  playbackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.l,
  },
  
  controlButton: {
    padding: theme.spacing.m,
    marginHorizontal: theme.spacing.l,
  },
  
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: theme.spacing.xl,
  },
  
  speedControl: {
    alignItems: 'center',
    paddingVertical: theme.spacing.m,
  },
  
  speedLabel: {
    fontSize: theme.fontSize.s,
    color: theme.colors.textSecondary,
  },
});

export default UnifiedPlayer;