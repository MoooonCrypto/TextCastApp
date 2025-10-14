import React, { useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Theme } from '../constants/themes';
import { usePlayerStore } from '../stores/usePlayerStore';

const { width: screenWidth } = Dimensions.get('window');

interface BottomPlayerProps {
  onExpand?: () => void;
}

const BottomPlayer: React.FC<BottomPlayerProps> = ({ onExpand }) => {
  const { theme } = useTheme();
  const {
    currentItemId,
    isPlaying,
    isLoading,
    currentPosition,
    duration,
    playbackRate,
    pause,
    resume,
    seek,
    skipForward,
    skipBackward,
    setPlaybackRate,
    getCurrentItem,
    getProgressPercentage,
  } = usePlayerStore();

  const progressRef = useRef<View>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState(0);
  const progressLayoutRef = useRef<{ x: number; y: number; width: number; height: number; pageX: number; pageY: number } | null>(null);
  const currentItem = getCurrentItem();
  const styles = createStyles(theme);

  // プログレスバーのレイアウトを初回測定
  const measureProgressBar = () => {
    if (progressRef.current) {
      progressRef.current.measure((x, y, width, height, pageX, pageY) => {
        progressLayoutRef.current = { x, y, width, height, pageX, pageY };
      });
    }
  };

  const handlePlayPause = async () => {
    if (isLoading) return;

    if (!currentItem) {
      return;
    }

    if (isPlaying) {
      await pause();
    } else {
      await resume();
    }
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (evt) => {
          if (!currentItem || duration === 0) return;

          // ドラッグ開始時にレイアウトを測定
          measureProgressBar();
          setIsDragging(true);
        },
        onPanResponderMove: (evt, gestureState) => {
          if (!progressLayoutRef.current || duration === 0 || !currentItem) return;

          const { pageX, width } = progressLayoutRef.current;
          const touchX = evt.nativeEvent.pageX - pageX;
          const percentage = Math.max(0, Math.min(1, touchX / width));
          const newDragPos = percentage * duration;

          setDragPosition(newDragPos);
        },
        onPanResponderRelease: (evt, gestureState) => {
          if (!progressLayoutRef.current || duration === 0 || !currentItem) {
            setIsDragging(false);
            return;
          }

          const { pageX, width } = progressLayoutRef.current;
          const touchX = evt.nativeEvent.pageX - pageX;
          const percentage = Math.max(0, Math.min(1, touchX / width));
          const newPosition = percentage * duration;

          // シークしてからドラッグ状態を解除
          seek(newPosition);
          setIsDragging(false);
        },
      }),
    [duration, currentItem, seek]
  );

  const handleSpeedPress = async () => {
    if (!currentItem) return;

    const speeds = [0.5, 1.0, 1.2, 1.5, 2.0];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % speeds.length;
    await setPlaybackRate(speeds[nextIndex]);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* プログレスバー */}
      <View style={styles.progressContainer}>
        <View
          ref={progressRef}
          style={styles.progressBarContainer}
          {...panResponder.panHandlers}
        >
          <View style={styles.progressBackground} />
          <View
            style={[
              styles.progressFill,
              {
                width: isDragging
                  ? `${(dragPosition / duration) * 100}%`
                  : `${currentItem ? getProgressPercentage() : 0}%`
              }
            ]}
          />
          {currentItem && (
            <View
              style={[
                styles.progressThumb,
                {
                  left: isDragging
                    ? `${(dragPosition / duration) * 100}%`
                    : `${getProgressPercentage()}%`
                }
              ]}
            />
          )}
        </View>
      </View>

      {/* メインコンテンツ */}
      <View style={styles.mainContent}>
        {/* 楽曲情報（タップで展開） */}
        <Pressable
          style={styles.trackInfo}
          onPress={onExpand}
          disabled={!currentItem}
        >
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {currentItem ? currentItem.title : 'タップして再生'}
            </Text>
            {currentItem && (
              <Ionicons
                name="chevron-up"
                size={20}
                color="#e9ecef"
              />
            )}
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>
              {currentItem ? formatTime(currentPosition) : '--:--'}
            </Text>
            <Text style={styles.timeText}>
              {currentItem ? formatTime(duration) : '--:--'}
            </Text>
          </View>
        </Pressable>

        {/* コントロールボタン */}
        <View style={styles.controls}>
          {/* 10秒戻る */}
          <Pressable
            style={[styles.controlButton, styles.skipButton]}
            onPress={() => skipBackward(10)}
            disabled={!currentItem}
          >
            <Ionicons
              name="play-back"
              size={14}
              color={currentItem ? '#ffffff' : '#adb5bd'}
            />
            <Text style={[styles.skipText, !currentItem && styles.disabledText]}>10</Text>
          </Pressable>

          {/* 再生/一時停止 */}
          <Pressable
            style={[styles.controlButton, styles.playButton]}
            onPress={handlePlayPause}
            disabled={isLoading || !currentItem}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={theme.colors.background} />
            ) : (
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={20}
                color={theme.colors.background}
              />
            )}
          </Pressable>

          {/* 10秒進む */}
          <Pressable
            style={[styles.controlButton, styles.skipButton]}
            onPress={() => skipForward(10)}
            disabled={!currentItem}
          >
            <Ionicons
              name="play-forward"
              size={14}
              color={currentItem ? '#ffffff' : '#adb5bd'}
            />
            <Text style={[styles.skipText, !currentItem && styles.disabledText]}>10</Text>
          </Pressable>

          {/* 速度調整 */}
          <Pressable
            style={[styles.controlButton, styles.speedButton]}
            onPress={handleSpeedPress}
            disabled={!currentItem}
          >
            <Text style={[styles.speedText, !currentItem && styles.disabledText]}>
              {currentItem ? `${playbackRate}x` : '1x'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 12,
    backgroundColor: '#6c757d', // 灰色背景（テーマ切り替え不要）
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 20,
  },

  progressContainer: {
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 4,
  },

  progressBarContainer: {
    height: 24,
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 8,
  },

  progressBackground: {
    height: 4,
    backgroundColor: theme.colors.progressBackground,
    borderRadius: 2,
  },

  progressFill: {
    position: 'absolute',
    height: 4,
    backgroundColor: theme.colors.progress,
    borderRadius: 2,
  },

  progressThumb: {
    position: 'absolute',
    width: 14,
    height: 14,
    backgroundColor: theme.colors.primary,
    borderRadius: 7,
    marginLeft: -7,
    marginTop: -5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },

  mainContent: {
    paddingHorizontal: 12,
    paddingVertical: 2,
  },

  trackInfo: {
    marginBottom: 6,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 2,
  },

  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff', // 灰色背景に白文字
    flex: 0,
  },

  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  timeText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#e9ecef', // 灰色背景に薄い白文字
  },

  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },

  controlButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 0,
  },

  playButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.primary,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  skipButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    position: 'relative',
  },

  skipText: {
    position: 'absolute',
    fontSize: 9,
    fontWeight: '700',
    color: '#ffffff',
    bottom: 1,
  },

  speedButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  speedText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#ffffff',
  },

  disabledText: {
    color: '#adb5bd',
  },
});

export default BottomPlayer;